# Dependency Registry Policy (Recommended Baseline)

This project should use an internal npm proxy/mirror as the default source of dependencies.

## Why this baseline

- Avoids recurring VPN/firewall blocks to `registry.npmjs.org`.
- Improves reproducibility across local machines and CI.
- Reduces supply-chain risk by centralizing allowed packages.

## Standard for this repo

1. Set an internal registry URL in environment:
```powershell
$env:NPM_REGISTRY_URL = "https://npm.company.internal/"
```

2. Bootstrap dependencies with one command:
```powershell
npm run deps:bootstrap
```

3. If Tremor is needed in a later cycle:
```powershell
npm run deps:bootstrap:tremor
```

4. If the registry is temporarily unreachable, use offline fallback:
```powershell
npm run deps:offline:check
npm run deps:offline
```

## Security controls

- Keep `strict-ssl=true`.
- Do not commit `.npmrc` with secrets.
- Use `NPM_TOKEN` via environment variable when auth is required.
- Keep lockfile changes in PR review (`npm ci` in CI).

## Network allowlist for IT/SecOps

Preferred: only allow egress to your internal npm proxy.

If temporary direct internet access is needed, minimum hosts are:
- `registry.npmjs.org`
- `github.com`
- `api.github.com`
- `codeload.github.com`
