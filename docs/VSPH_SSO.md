# VSPH central SSO receiver (Vercel Functions)

This branch adds the **Music application's receiving half** of the identity handoff built in VSPH Control Center PR #5. It includes Node serverless functions and a React session bootstrap. **It has not been deployed to https://vsph-music-system.vercel.app/**; the connected Vercel account did not reveal that project. Confirm which GitHub repository actually drives that deployment before using these changes.

## Deployment prerequisites

1. On the **portal** project, apply both reviewed migrations in this order:
   - `supabase/migrations/20261030_music_sso_launch_codes.sql`
   - `supabase/migrations/20261030_music_staff_musician_roles.sql` (Control Center PR #6).
2. In the Music **Vercel project** settings, set all four *server-only* environment variables:
   ```dotenv
   MUSIC_PUBLIC_ORIGIN=https://vsph-music-system.vercel.app
   VSPH_PORTAL_ORIGIN=https://YOUR_PUBLIC_VSPH_PORTAL_DOMAIN
   MUSIC_SSO_CLIENT_SECRET=<same-cryptographically-random-secret-as-the-portal>
   MUSIC_SESSION_SECRET=<a-different-cryptographically-random-secret>
   ```
   Both secrets need at least 32 characters; use high-entropy random values. Do not prefix these values with `VITE_`, expose them in client bundles or commit them to Git.
3. Optionally define `MUSIC_PERFORMER_ID_MAP` as a JSON object of `"organization-UUID:user-UUID": "existing-performer-id"` for explicitly provisioned musician identities. Avoid doing this at scale: replace with a tenant-scoped performer database mapping.
4. In **VSPH Control Center** server env, set (only after the receiver deploys successfully):
   ```dotenv
   MUSIC_SSO_START_URL=https://vsph-music-system.vercel.app/api/sso/start
   MUSIC_SSO_CALLBACK_URL=https://vsph-music-system.vercel.app/api/sso/callback
   MUSIC_SSO_CLIENT_SECRET=<same-secret-as-Music>
   ```
5. Deploy both projects, verify `GET https://vsph-music-system.vercel.app/api/sso/status` responds `{"enabled":true,...}` and **test the handshake on a staging tenant** before directing real customer users there.

`VSPH_PORTAL_ORIGIN` must be an actual reachable HTTPS origin; localhost cannot be used by a deployed Vercel Function. The portal's current `localhost:3000` environment is appropriate only for local development.

## What the APIs do

| Endpoint | Security |
| --- | --- |
| `GET /api/sso/start?organization_id=UUID` | Creates encrypted HttpOnly state/PKCE cookie. Redirects only to fixed VSPH authorize URL |
| `GET /api/sso/callback?code=...&state=...` | Verifies state, exchanges code via confidential server-to-server request, validates user/tenant/role, creates encrypted HttpOnly cookie, redirects to `/sso/welcome` |
| `GET /api/sso/session` | Verifies Music cookie and **fresh** VSPH session + role introspection. Only returns public session attributes |
| `POST /api/sso/logout` | Strict same-origin check, clears Music cookie |
| `GET /api/sso/status` | Reveals whether external SSO is configured and the public VSPH portal URL, never secrets |

Cookies use AES-256-GCM authenticated encryption, purpose-separated keys, HttpOnly, Secure, SameSite=Lax, Path=/, and a 10-minute max session. The callback clears the temporary state cookie, even after errors. The Music session cannot be replayed to the portal; a revoked or expired central session is denied at the next server introspection.

When SSO is configured, React loads identity from the protected `/api/sso/session` endpoint and **does not load or allow the browser-only demo login**. Missing SSO configuration preserves the existing demo experience, but no production account should use it.

### Product roles

- VSPH `admin`, `manager`, `staff`, or product `super_admin` map to the demo staff interface.
- VSPH `musician` requires an **explicit tenant-scoped performer ID mapping**; otherwise login is denied.
- `viewer`, `user`, and `platform_super_admin` are not implicitly promoted to staff or musician.
- The server verifies current role against VSPH on each `/api/sso/session` request. The React role guard is only a presentation safeguard, not a backend permission check.

### Important limitations

**This is an SSO receiver for a concept demonstration, not a production Music backend.** The existing guest requests, musician rosters, event enquiries and queue are stored in `localStorage`. UI routes and client-side role guards alone cannot isolate customer records or enforce server-side permissions; browser users can inspect or modify local data. Building real storage and tenant-aware APIs is separate work. Do not process real guest or customer data until that backend exists.

For a future production application, every protected API must authenticate the Music cookie server-side and check organization + role permissions per request. Guest QR pages remain public but need tenant-scoped validation and abuse controls.

## Development and verification

```bash
npm ci
npm test
npm run build
```

Local `npm run dev` serves the Vite frontend, **not** the Vercel API functions. Use a correctly configured Vercel development environment for end-to-end testing and verify that the SPA rewrite does not intercept `/api/sso/*` functions.

Suggested integration cases: valid staff login, musician with and without mapping, wrong tenant, stale portal session, incorrect PKCE, callback state mismatch, expired/replayed launch code, no/invalid client secret, portal revocation, logged-out session, browser Back after logout, and mobile navigation. Protect the deployment's SSO config until authorized for release.

The live deployment URL was provided by the project operator but **was not accessible through the connected Vercel workspace** during implementation. Verify the Git source mapping before treating these files as deployed.
