Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

$seed = @(
  "https://registry.npmjs.org/jest/-/jest-30.2.0.tgz",
  "https://registry.npmjs.org/@types/jest/-/jest-30.0.0.tgz",
  "https://registry.npmjs.org/jest-environment-jsdom/-/jest-environment-jsdom-30.2.0.tgz",
  "https://registry.npmjs.org/@testing-library/react/-/react-16.3.1.tgz",
  "https://registry.npmjs.org/@testing-library/jest-dom/-/jest-dom-6.9.1.tgz"
)

$urls = [System.Collections.Generic.List[string]]::new()
foreach ($u in $seed) {
  if (-not $urls.Contains($u)) {
    $urls.Add($u)
  }
}

$cache = npm cache ls --silent
$maxAttempts = 120

for ($i = 1; $i -le $maxAttempts; $i++) {
  Write-Host "INFO cached-install attempt=$i urls=$($urls.Count)"

  $runOutput = (& npm install --save-dev --offline --prefer-offline --no-audit --no-fund @urls 2>&1)
  $runOutput | Out-Host
  if ($LASTEXITCODE -eq 0) {
    Write-Host "OK cached-install=success"
    exit 0
  }

  $line = $runOutput | Where-Object {
    $_ -match "request to https://registry\.npmjs\.org/.+ failed: cache mode is 'only-if-cached' but no cached response is available\."
  } | Select-Object -Last 1

  if (-not $line) {
    $runOutput | Out-Host
    throw "Failed without ENOTCACHED hint."
  }

  if ($line -match "request to https://registry\.npmjs\.org/(?<path>[^ ]+) failed") {
    $path = [System.Uri]::UnescapeDataString($matches["path"])
  } else {
    throw "Cannot parse missing package path."
  }

  $pkgPath = if ($path -like "*.tgz") {
    ($path -replace "/-/.*$", "").Trim("/")
  } else {
    $path.Trim("/")
  }

  $escapedNeedle = [regex]::Escape("registry.npmjs.org/$pkgPath/-/")
  $candidateUrls = $cache | Select-String -Pattern $escapedNeedle | ForEach-Object {
    if ($_.Line -match "https://registry\.npmjs\.org/.+\.tgz") {
      $matches[0]
    }
  } | Sort-Object -Unique

  $added = $false
  foreach ($candidate in $candidateUrls) {
    if (-not $urls.Contains($candidate)) {
      $urls.Add($candidate)
      Write-Host "INFO added=$candidate"
      $added = $true
      break
    }
  }

  if (-not $added) {
    Write-Host "ERROR missing-no-cache pkg=$pkgPath"
    throw "No cached tarball available for $pkgPath"
  }
}

throw "Max attempts reached."
