param(
  [string]$Target = "production",
  [switch]$ApplyFromProcessEnv
)

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

$required = @(
  "DATABASE_URL",
  "NEXTAUTH_SECRET",
  "NEXTAUTH_URL",
  "SMTP_HOST",
  "SMTP_PORT",
  "SMTP_USER",
  "SMTP_PASS",
  "MAIL_FROM"
)

function Get-ConfiguredEnvNames {
  param([string]$EnvironmentTarget)

  $output = & npx vercel env ls $EnvironmentTarget 2>&1
  if ($LASTEXITCODE -ne 0) {
    throw "No se pudo listar variables de Vercel para '$EnvironmentTarget'. Output: $($output -join [Environment]::NewLine)"
  }

  $names = @()
  foreach ($line in $output) {
    $trimmed = "$line".Trim()
    if (-not $trimmed) { continue }
    if ($trimmed -match "^Vercel CLI") { continue }
    if ($trimmed -match "^Retrieving project") { continue }
    if ($trimmed -match "^> Environment Variables found") { continue }
    if ($trimmed -match "^name\s+value") { continue }
    if ($trimmed -match "^[-]+$") { continue }

    $parts = ($trimmed -split "\s+")
    if ($parts.Count -gt 0 -and $parts[0] -match "^[A-Z0-9_]+$") {
      $names += $parts[0]
    }
  }

  return $names | Select-Object -Unique
}

function Set-VercelEnvFromProcess {
  param(
    [string]$Name,
    [string]$EnvironmentTarget
  )

  $value = [Environment]::GetEnvironmentVariable($Name, "Process")
  if ([string]::IsNullOrWhiteSpace($value)) {
    throw "Variable $Name no existe en entorno de proceso. Define `$env:${Name}` y reintenta."
  }

  & npx vercel env rm $Name $EnvironmentTarget --yes 2>$null | Out-Null

  $value | & npx vercel env add $Name $EnvironmentTarget | Out-Null
  if ($LASTEXITCODE -ne 0) {
    throw "No se pudo configurar $Name en Vercel ($EnvironmentTarget)."
  }
}

$configured = Get-ConfiguredEnvNames -EnvironmentTarget $Target
$missing = @($required | Where-Object { $_ -notin $configured })

Write-Host "OK target=$Target"
Write-Host "OK configured=$($configured.Count)"
Write-Host "OK required=$($required.Count)"

if ($missing.Count -eq 0) {
  Write-Host "OK missing=0"
  exit 0
}

Write-Host "WARN missing=$($missing -join ',')"

if (-not $ApplyFromProcessEnv) {
  Write-Host "INFO action=none (usa -ApplyFromProcessEnv para intentar configurar desde variables de proceso)"
  exit 1
}

foreach ($name in $missing) {
  Set-VercelEnvFromProcess -Name $name -EnvironmentTarget $Target
  Write-Host "OK applied=$name"
}

$configuredAfter = Get-ConfiguredEnvNames -EnvironmentTarget $Target
$stillMissing = @($required | Where-Object { $_ -notin $configuredAfter })
if ($stillMissing.Count -gt 0) {
  throw "Aun faltan variables: $($stillMissing -join ',')"
}

Write-Host "OK action=vercel-env-complete"
