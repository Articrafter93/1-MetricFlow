param(
  [string]$RepoPath = (Get-Location).Path,
  [string]$RegistryUrl,
  [string]$Scope,
  [switch]$IncludeTremor,
  [switch]$SkipInstall,
  [switch]$UseOfflineFallback
)

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

function Get-GitOutput {
  param(
    [string[]]$GitArgs,
    [switch]$AllowFailure
  )

  $out = & git @GitArgs 2>$null
  $code = $LASTEXITCODE
  if (-not $AllowFailure -and $code -ne 0) {
    throw "Git command failed: git $($GitArgs -join ' ')"
  }
  return $out
}

function Resolve-RepoRoot {
  param([string]$Path)

  $root = Get-GitOutput -GitArgs @("-C", $Path, "rev-parse", "--show-toplevel")
  if (-not $root) {
    throw "Current path is not inside a git repository."
  }

  return $root.Trim()
}

function Write-ProjectNpmrc {
  param(
    [string]$RepoRoot,
    [string]$Registry,
    [string]$ScopeValue
  )

  $trimmed = $Registry.Trim()
  $lines = @(
    "registry=$trimmed",
    "strict-ssl=true",
    "fetch-retries=2",
    "fetch-retry-mintimeout=10000",
    "fetch-retry-maxtimeout=60000"
  )

  if (-not [string]::IsNullOrWhiteSpace($ScopeValue)) {
    $lines += "$ScopeValue:registry=$trimmed"
  }

  $registryHost = ([System.Uri]$trimmed).Host
  $lines += "//$registryHost/:_authToken=`${NPM_TOKEN}"

  $npmrcPath = Join-Path $RepoRoot ".npmrc"
  [System.IO.File]::WriteAllLines($npmrcPath, $lines, [System.Text.Encoding]::ASCII)
  return $npmrcPath
}

function Test-RegistryAccess {
  param([string]$Registry)

  $uri = [System.Uri]$Registry
  $registryHost = $uri.Host
  $port = if ($uri.Port -gt 0) { $uri.Port } else { 443 }
  $tcp = Test-NetConnection -ComputerName $registryHost -Port $port -WarningAction SilentlyContinue

  $pingOk = $false
  & npm ping 2>$null | Out-Null
  if ($LASTEXITCODE -eq 0) {
    $pingOk = $true
  }

  return @{
    Host = $registryHost
    Port = $port
    TcpOk = [bool]$tcp.TcpTestSucceeded
    NpmPingOk = $pingOk
  }
}

function Install-Dependencies {
  param([switch]$EnableTremor)

  $prod = @(
    "framer-motion@^12.35.2",
    "pino@^9.9.5"
  )

  if ($EnableTremor) {
    $prod += "@tremor/react@^3.18.7"
  }

  $dev = @(
    "jest@^30.2.0",
    "@types/jest@^30.0.0",
    "jest-environment-jsdom@^30.2.0",
    "@testing-library/react@^16.3.1",
    "@testing-library/jest-dom@^6.9.1"
  )

  & npm install --save --no-audit --no-fund @prod | Out-Host
  if ($LASTEXITCODE -ne 0) {
    throw "Failed installing production dependencies."
  }

  & npm install --save-dev --no-audit --no-fund @dev | Out-Host
  if ($LASTEXITCODE -ne 0) {
    throw "Failed installing development dependencies."
  }
}

$repoRoot = Resolve-RepoRoot -Path $RepoPath
$effectiveRegistry = $null

if (-not [string]::IsNullOrWhiteSpace($RegistryUrl)) {
  $effectiveRegistry = $RegistryUrl
} else {
  $npmRegistry = (& npm config get registry).Trim()
  if (-not [string]::IsNullOrWhiteSpace($npmRegistry) -and $npmRegistry -ne "undefined" -and $npmRegistry -ne "null") {
    $effectiveRegistry = $npmRegistry
  }
}

if ([string]::IsNullOrWhiteSpace($effectiveRegistry)) {
  throw "No registry configured. Pass -RegistryUrl or configure npm registry first."
}

$npmrcPath = Write-ProjectNpmrc -RepoRoot $repoRoot -Registry $effectiveRegistry -ScopeValue $Scope
$access = Test-RegistryAccess -Registry $effectiveRegistry

Write-Host "OK repoRoot=$repoRoot"
Write-Host "OK npmrc=$npmrcPath"
Write-Host "OK registry=$effectiveRegistry"
Write-Host "OK registryHost=$($access.Host)"
Write-Host "OK tcp443=$($access.TcpOk)"
Write-Host "OK npmPing=$($access.NpmPingOk)"

if ($SkipInstall) {
  Write-Host "OK install=skipped"
  exit 0
}

if (-not $access.NpmPingOk) {
  if ($UseOfflineFallback -and (Test-Path (Join-Path $repoRoot "scripts/install-offline-deps.ps1"))) {
    Write-Host "WARN registry-unreachable=true"
    Write-Host "WARN action=trying-offline-fallback"
    & pwsh -NoProfile -ExecutionPolicy Bypass -File (Join-Path $repoRoot "scripts/install-offline-deps.ps1") -RepoPath $repoRoot -DryRun | Out-Host
    if ($LASTEXITCODE -ne 0) {
      throw "Registry unreachable and offline fallback is not ready. Complete offline bundle first."
    }
    Write-Host "WARN offline-fallback=ready-but-not-executed"
    exit 1
  }

  throw "Registry unreachable. Resolve network/VPN policy or run with -UseOfflineFallback and prepared bundle."
}

Install-Dependencies -EnableTremor:$IncludeTremor

& npm run build | Out-Host
if ($LASTEXITCODE -ne 0) {
  throw "Build failed after dependency install."
}

& npm run test | Out-Host
if ($LASTEXITCODE -ne 0) {
  throw "Tests failed after dependency install."
}

Write-Host "OK action=registry-bootstrap-complete"
