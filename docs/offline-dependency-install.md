# Offline Dependency Install (Secure)

Use this flow when outbound access to `registry.npmjs.org` is blocked and you must keep security controls.

## Security guarantees

- No direct internet download in the target environment.
- All tarballs are validated with SHA-512 before install.
- Install runs with `npm --offline --prefer-offline`.
- No secrets are stored in the manifest or scripts.

## 1) Prepare bundle on a connected machine

Create a trusted folder with tarballs:

```powershell
mkdir vendor/npm-bundle
npm pack framer-motion@12.35.2
npm pack pino@9.9.5
npm pack @tremor/react@3.18.7
npm pack jest@30.2.0
npm pack @testing-library/react@16.3.1
npm pack @testing-library/jest-dom@6.9.1
npm pack jest-environment-jsdom@30.2.0
npm pack @types/jest@30.0.0
```

Move generated `.tgz` files into `vendor/npm-bundle/`.

Compute SHA-512 and update `scripts/offline-deps.manifest.json`:

```powershell
Get-FileHash -Algorithm SHA512 vendor/npm-bundle/*.tgz
```

Replace each `REPLACE_WITH_SHA512_HEX` with the actual hash.

## 2) Install securely on blocked environment

```powershell
pwsh -NoProfile -ExecutionPolicy Bypass -File scripts/install-offline-deps.ps1 -DryRun
pwsh -NoProfile -ExecutionPolicy Bypass -File scripts/install-offline-deps.ps1 -RunChecks
```

`-DryRun` verifies manifest + checksums without changing dependencies.

## 3) Optional network diagnostics

```powershell
pwsh -NoProfile -ExecutionPolicy Bypass -File C:/Users/g-cub/.codex/skills/safe-regularization/scripts/regularize-blockers.ps1
```
