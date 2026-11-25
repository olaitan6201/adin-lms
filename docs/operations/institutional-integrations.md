# Configure course digital libraries

The course directory links to public HTTPS destinations approved by the institution. It does not authenticate a reader at a library. A public catalogue URL stays public; the partner enforces access to licensed material.

Set `INTEGRATIONS_LIBRARIES_JSON` in the deployment environment. The default `{}` lists nothing. Example (synthetic destination and upstream offering):

```json
{"catalogue":{"label":"University library catalogue","url":"https://library.example.test/catalogue","offerings":["DEMO-CSC101-2026-1"],"roles":["learner","instructor"]}}
```

Use a lower-case slug starting with a letter, up to 63 letters, digits or hyphens. Register the exact final HTTPS URL, including any public catalogue query. Never put credentials, signed URLs, individual identifiers or access tokens here. No wildcard offerings or roles. Have the librarian verify the destination and the registrar confirm stable external offering IDs before refreshing Laravel's configuration cache on each node. Remove a profile and refresh all nodes to retire it.

**Access:** `integrations.index` takes the bound local offering UUID; link to it from the course overview. `integrations.library` takes that offering and the profile slug. Both check current membership. A learner needs registered enrolment in a published offering; an instructor needs both allocation and an offering-scoped lecturer grant with roster-read permission. A partner gets a browser visit to the registered address, without LMS-supplied identity, course parameters or referrer. No schema change or provider writes; account linking, official registration and roster import stay with their existing owners.

**Acceptance:** using synthetic campus accounts, open the directory, verify the displayed host and final destination, withdraw the learner and retry the bookmarked **LMS link**. Confirm separate authentication and logout at any licensed library. Keep institution approval, accessibility review and licence terms with the deployment record.

**Protocol status:** library links are not LTI launches or institutional SSO. No Advantage services, OAuth token endpoint, grade passback or roster export are enabled by this module. Before enabling LTI, agree tool registration, issuer/client/deployment identifiers, exact initiation and redirect endpoints, signing-key custody and rotation, claim minimisation and partner replay tests. Before enabling SSO, obtain the institution's issuer and immutable subject mapping, reconcile with existing accounts without email matching, and verify revocation, session and MFA policy. No certification or production partner acceptance is implied.
