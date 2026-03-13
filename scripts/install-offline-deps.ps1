param(
  [string]$RepoPath = (Get-Location).Path,
  [string]$ManifestPath = "scripts/offline-deps.manifest.json",
  [string]$BundleDir = "vendor/npm-bundle",
  [switch]$DryRun,
  [switch]$RunChecks
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

function Resolve-PathOrThrow {
  param(
    [string]$RepoRoot,
    [string]$RelativeOrAbsolutePath,
    [string]$Label
  )

  $fullPath = if ([System.IO.Path]::IsPathRooted($RelativeOrAbsolutePath)) {
    $RelativeOrAbsolutePath
  } else {
    Join-Path $RepoRoot $RelativeOrAbsolutePath
  }

  if (-not (Test-Path $fullPath)) {
    throw "$Label not found: $fullPath"
  }

  return $fullPath
}

function Get-Sha512Hex {
  param([string]$FilePath)

  return (Get-FileHash -Algorithm SHA512 -Path $FilePath).Hash.ToLowerInvariant()
}

function Validate-Entry {
  param(
    [pscustomobject]$Entry,
    [string]$Bucket
  )

  if ([string]::IsNullOrWhiteSpace($Entry.name)) {
    throw "Invalid entry in ${Bucket}: missing name."
  }
  if ([string]::IsNullOrWhiteSpace($Entry.version)) {
    throw "Invalid entry in ${Bucket} for $($Entry.name): missing version."
  }
  if ([string]::IsNullOrWhiteSpace($Entry.file)) {
    throw "Invalid entry in ${Bucket} for $($Entry.name): missing file."
  }
  if ([string]::IsNullOrWhiteSpace($Entry.sha512)) {
    throw "Invalid entry in ${Bucket} for $($Entry.name): missing sha512."
  }
  if ($Entry.sha512 -match "^REPLACE_") {
    throw "Invalid entry in ${Bucket} for $($Entry.name): sha512 placeholder detected."
  }
}

function Invoke-NpmInstallFromTarballs {
  param(
    [string[]]$Specs,
    [switch]$Dev
  )

  if (-not $Specs -or $Specs.Count -eq 0) {
    return
  }

  $args = @("install", "--offline", "--prefer-offline", "--no-audit", "--no-fund")
  if ($Dev) {
    $args += "--save-dev"
  } else {
    $args += "--save"
  }
  $args += $Specs

  & npm @args | Out-Host
  if ($LASTEXITCODE -ne 0) {
    throw "Offline npm install failed."
  }
}

$repoRoot = Resolve-RepoRoot -Path $RepoPath
$manifestFile = Resolve-PathOrThrow -RepoRoot $repoRoot -RelativeOrAbsolutePath $ManifestPath -Label "Manifest"
$bundleRoot = Resolve-PathOrThrow -RepoRoot $repoRoot -RelativeOrAbsolutePath $BundleDir -Label "Bundle directory"

$manifest = Get-Content -Raw $manifestFile | ConvertFrom-Json
$deps = @($manifest.dependencies)
$devDeps = @($manifest.devDependencies)

$depSpecs = @()
$devDepSpecs = @()

foreach ($entry in $deps) {
  Validate-Entry -Entry $entry -Bucket "dependencies"
  $archivePath = Resolve-PathOrThrow -RepoRoot $bundleRoot -RelativeOrAbsolutePath $entry.file -Label "Dependency tarball"
  $actualHash = Get-Sha512Hex -FilePath $archivePath
  $expectedHash = $entry.sha512.ToLowerInvariant()
  if ($actualHash -ne $expectedHash) {
    throw "Checksum mismatch for $($entry.name): expected=$expectedHash actual=$actualHash"
  }
  $depSpecs += $archivePath
}

foreach ($entry in $devDeps) {
  Validate-Entry -Entry $entry -Bucket "devDependencies"
  $archivePath = Resolve-PathOrThrow -RepoRoot $bundleRoot -RelativeOrAbsolutePath $entry.file -Label "Dev dependency tarball"
  $actualHash = Get-Sha512Hex -FilePath $archivePath
  $expectedHash = $entry.sha512.ToLowerInvariant()
  if ($actualHash -ne $expectedHash) {
    throw "Checksum mismatch for $($entry.name): expected=$expectedHash actual=$actualHash"
  }
  $devDepSpecs += $archivePath
}

Write-Host "OK repoRoot=$repoRoot"
Write-Host "OK manifest=$manifestFile"
Write-Host "OK bundleRoot=$bundleRoot"
Write-Host "OK verifiedDependencies=$($depSpecs.Count)"
Write-Host "OK verifiedDevDependencies=$($devDepSpecs.Count)"

if ($DryRun) {
  Write-Host "OK dryRun=true"
  exit 0
}

Invoke-NpmInstallFromTarballs -Specs $depSpecs
Invoke-NpmInstallFromTarballs -Specs $devDepSpecs -Dev

if ($RunChecks) {
  & npm run build | Out-Host
  if ($LASTEXITCODE -ne 0) {
    throw "Build failed after offline install."
  }

  & npm run test | Out-Host
  if ($LASTEXITCODE -ne 0) {
    throw "Tests failed after offline install."
  }
}

Write-Host "OK action=offline-install-complete"
