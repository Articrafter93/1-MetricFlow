## Summary
- Describe the change and its impact.

## Security Checklist
- [ ] No secrets, tokens, or private keys in code, logs, or artifacts.
- [ ] No dynamic shell execution (`Invoke-Expression`, `iex`, `bash -c`, `sh -c`).
- [ ] No unsafe command changes to CI/deploy without human review.

## Quality Gate
- [ ] `npm run check` passed.
- [ ] `npm run test` passed.
- [ ] `npm run test:smoke` passed.
- [ ] `npm run build` passed (required).

## Governance
- [ ] Branch target is `main`.
- [ ] Risk level documented (`low` / `medium` / `high`).
- [ ] If deploy-sensitive: explicit GATE humano approved.
