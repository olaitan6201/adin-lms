# Configure institutional course partners and sign-in

## Digital library links

The course directory links to public HTTPS destinations approved by the institution. It does not authenticate a reader at a library. A public catalogue URL stays public; the partner enforces access to licensed material.

Set `INTEGRATIONS_LIBRARIES_JSON` in the deployment environment. The default `{}` lists nothing. Example (synthetic destination and upstream offering):

```json
{"catalogue":{"label":"University library catalogue","url":"https://library.example.test/catalogue","offerings":["DEMO-CSC101-2026-1"],"roles":["learner","instructor"]}}
```

Use a lower-case slug starting with a letter, up to 63 letters, digits or hyphens. Register the exact final HTTPS URL, including any public catalogue query. Never put credentials, signed URLs, individual identifiers or access tokens here. No wildcard offerings or roles. Have the librarian verify the destination and the registrar confirm stable external offering IDs before refreshing Laravel's configuration cache on each node. Remove a profile and refresh all nodes to retire it.

**Access:** `integrations.index` takes the bound local offering UUID; link to it from the course overview. `integrations.library` takes that offering and the profile slug. Both check current membership. A learner needs registered enrolment in a published offering; an instructor needs both allocation and an offering-scoped lecturer grant with roster-read permission. A partner gets a browser visit to the registered address, without LMS-supplied identity, course parameters or referrer. No schema change or provider writes; account linking, official registration and roster import stay with their existing owners.

**Acceptance:** using synthetic campus accounts, open the directory, verify the displayed host and final destination, withdraw the learner and retry the bookmarked **LMS link**. Confirm separate authentication and logout at any licensed library. Keep institution approval, accessibility review and licence terms with the deployment record.

## LTI 1.3: platform-initiated resource links

Set `LTI_PLATFORM_ISSUER` to the exact registered HTTPS issuer, `LTI_KEY_ID` to a stable unique key ID, and `LTI_PRIVATE_KEY_FILE` to an absolute local path outside the web root containing a secret-mounted RSA private key (2048 bits or stronger). Do not put private keys in JSON or Git. Register `GET /integrations/lti/keys` as the public JWKS and `GET /integrations/lti/authorize` as the authorization endpoint at the canonical platform origin. Configure `INTEGRATIONS_TOOLS_JSON`:

```json
{"reader":{"label":"Course reader","login":"https://tool.example.test/login","url":"https://tool.example.test/read","redirect":"https://tool.example.test/launch","client":"reader-client","deployment":"campus-deployment","offerings":["DEMO-CSC101-2026-1"],"roles":["learner","instructor"]}}
```

The signed-in user selects a tool in **Course partners**. The tool receives an opaque login hint and initiates a top-level authorization request for `scope=openid`, `response_type=id_token`, `response_mode=form_post`, `prompt=none`, its exact client and redirect URI, fresh state and nonce. The LMS rechecks membership and registration, then the user posts the signed resource link to the tool. The tool must verify issuer, audience, signature, expiry, deployment, browser state and one-use nonce before accepting it. LMS identifiers for user, resource and context are per client, derived using the application key; coordinate any application-key rotation as an identity migration. No name, email, roster or grades are released. No iframe flow, dynamic registration, Advantage service credentials, deep linking, grade passback or roster export.

## Institutional OIDC: one statically registered provider

Publish the **Institutional sign-in** link using `integrations.oidc.login` only when configured. Register the exact HTTPS callback `/integrations/oidc/callback` and confidential authorization-code flow with S256 PKCE and `client_secret_basic`. Set `INSTITUTION_OIDC_SECRET` in the secret store. Set `INSTITUTION_OIDC_JSON` to an object with these fields:

| Field | Value |
|---|---|
| `issuer`, `authorization`, `token`, `callback` | Exact HTTPS URLs without query or fragment. Token endpoint must be the institution-approved server destination. |
| `client` | Client ID assigned by the IdP. |
| `jwks.keys` | Pinned public RSA signing JWKs (`kid`, `kty`, `n`, `e`; RS256 only). Obtain and verify over a trusted administrative channel. |
| `mappings` | Array of `{"issuer":"https://id.example.test","subject":"opaque-123","user_id":"<existing local user UUID>"}`. Each issuer/subject pair must identify exactly one existing active account. |

Registrar or identity-office approval is required for **each** mapping. Do not use email, accept IdP-supplied roles, provision new accounts, or infer a match. An accepted code starts the normal revocable web session and retains local MFA requirements. The LMS does not retain provider access/refresh tokens or perform provider logout. One issuer and single-audience tokens only; no discovery or automatic key retrieval.

## Deployment and partner gates

* Use a shared cache with atomic locks and atomic `add` (database or Redis) and shared web sessions. Configure HTTPS and same-site cookies compatible with top-level cross-site GETs. Keep node clocks synchronized. Redact query strings, form contents, token exchanges and secrets from proxy and application tracing. Protect cached Laravel configuration.
* Stage IdP signing-key rotation by installing both trusted public keys before cutover. LTI publishes one current signing key: coordinate key switch and JWKS refresh with each tool; suspend launches if the tool cannot refresh. To disable a partner, remove its registration, refresh cached configuration on **all** nodes and revoke local sessions as appropriate. Removing an SSO mapping stops future logins, not already-established sessions.
* Test the actual partner with synthetic identities: authorized instructor and learner, wrong offering, withdrawal mid-launch, denied claims or replay, unpublished course, unmapped and disabled accounts, staff MFA, removal and key rotation. Confirm tool state validation, PII handling, access logs, licensing and accessibility with the institution. Automated fixtures exercise the application contract, not vendor certification or live acceptance. No database migration is needed.
