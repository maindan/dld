# @danlimadev/email

Transactional email, sent through [Resend](https://resend.com). Currently ships one email:
password reset.

## Contract

The shape sent to this service lives in `@danlimadev/contracts` (`src/email.ts`), not here —
callers and this service both import it so neither side drifts from the other.

## Env vars

| Var | Required | Purpose |
| --- | --- | --- |
| `RESEND_KEY` | yes | API key from https://resend.com/api-keys. Validated at module load — importing this package without it set throws immediately with an actionable error. |
| `RESEND_FROM_EMAIL` | no | Sender identity, e.g. `"danlimadev <noreply@danlimadev.app>"`. Defaults to Resend's shared sandbox sender (`onboarding@resend.dev`), which only delivers to the Resend account's own verified email. Verify a domain at https://resend.com/domains and set this before relying on password reset in production. |

## Usage

```ts
import { sendPasswordResetEmail } from "@danlimadev/email";

await sendPasswordResetEmail({
  to: "user@example.com",
  resetUrl: "https://danlimadev.app/auth/atualizar-senha?...",
});
```

`sendPasswordResetEmail` throws if Resend rejects the send (bad key, unverified sender, etc.) —
the caller decides whether to surface or swallow that.

## Tests

`pnpm --filter @danlimadev/email test`. The `resend` SDK is mocked; no network calls, no real
API key needed (a dummy `RESEND_KEY` is injected via `vitest.config.ts` purely to satisfy the
module-load check).
