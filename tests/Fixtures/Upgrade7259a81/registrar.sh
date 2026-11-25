# Synthetic registrar key and private casework, confined to the disposable rehearsal.
registrar_review() {
    export UPGRADE_REVIEW_DIR="$QA_ROOT/review" UPGRADE_REGISTRAR_PUBLIC_KEY="$QA_ROOT/registrar.pub"
    mkdir -m 700 "$UPGRADE_REVIEW_DIR"
    openssl genpkey -algorithm RSA -pkeyopt rsa_keygen_bits:2048 -out "$QA_ROOT/key" 2>/dev/null
    openssl pkey -in "$QA_ROOT/key" -pubout -out "$UPGRADE_REGISTRAR_PUBLIC_KEY"
    "${cli[@]}" report > "$QA_ROOT/public"
    local report="$UPGRADE_REVIEW_DIR/review.json"
    [[ $(stat -c '%a' "$report") == 600 ]]
    refuse 'Valid registrar signature required' "apply:$plan"
    sign() { openssl dgst -sha256 -sign "$QA_ROOT/key" -out "$UPGRADE_REVIEW_DIR/review.sig" "$report"; }
    sign
    refuse 'Unresolved registrar case' "apply:$plan"
    python3 - "$report" "$QA_ROOT/plan" <<'PY'
import json,pathlib,sys
r,p=map(pathlib.Path,sys.argv[1:])
d=json.loads(r.read_text())
assert len(d['cases']) == json.loads(p.read_text())['history_exceptions'] == 1
row=d['cases'][0]
assert row['legacy_id']=='019aaa00-0000-7000-8000-000000000009' and row['candidate_id'] is None
assert set(row)=={'legacy_id','candidate_id','decision','case_ref'}
row.update(decision='accept_candidate_visibility',case_ref='PRIVATE-CASE-1')
r.write_text(json.dumps(d))
PY
    refuse 'Valid registrar signature required' "apply:$plan"
    sign
    [[ $(sql <<<'SELECT COUNT(*) FROM users') == 0 ]]
}

check_cutover() {
    mv "$UPGRADE_REVIEW_DIR/review.sig" "$QA_ROOT/saved.sig"
    refuse 'Valid registrar signature required' "cutover:$plan"
    mv "$QA_ROOT/saved.sig" "$UPGRADE_REVIEW_DIR/review.sig"
    "${cli[@]}" "cutover:$plan" > "$QA_ROOT/pass"
    python3 - "$QA_ROOT" <<'PY'
import json,pathlib,sys
r=pathlib.Path(sys.argv[1])
receipt=json.loads((r/'receipt').read_text())
gate=json.loads((r/'pass').read_text())
assert gate=={'cutover_check':receipt['committed'],'review_digest':receipt['review_digest']}
PY
    if grep -Eiq '019aaa00-|ARCHIVE-42|DEMO-TUNDE|83\.12345678|77\.12345678|PRIVATE-CASE-1|@demo\.example' \
        "$QA_ROOT"/{public,refusal,plan,receipt,pass}; then
        echo 'Sensitive sentinel reached operator output.' >&2
        return 1
    fi
    echo 'PASS: private registrar report, signed dispositions, owner history and read-only cutover gate.'
}
