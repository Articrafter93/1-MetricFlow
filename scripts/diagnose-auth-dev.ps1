param(
  [int]$Port = 3000,
  [int]$StartupTimeoutSec = 30
)

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

$repoRoot = Split-Path -Parent $PSScriptRoot
$outLog = Join-Path $repoRoot ".tmp.auth-dev.out.log"
$errLog = Join-Path $repoRoot ".tmp.auth-dev.err.log"

if (Test-Path $outLog) { Remove-Item $outLog -Force }
if (Test-Path $errLog) { Remove-Item $errLog -Force }

$existing = Get-CimInstance Win32_Process -Filter "name='node.exe'" |
  Where-Object { $_.CommandLine -like "*$repoRoot*" -and ($_.CommandLine -like "*next\\dist\\bin\\next*" -or $_.CommandLine -like "*npm-cli.js*run dev*") }

if ($existing) {
  $ids = $existing.ProcessId
  Write-Host "Stopping existing dev PIDs: $($ids -join ', ')"
  Stop-Process -Id $ids -Force
  Start-Sleep -Seconds 1
}

$npmCmd = (Get-Command npm.cmd).Source
$devProc = Start-Process -FilePath $npmCmd -ArgumentList @("run", "dev") -WorkingDirectory $repoRoot -RedirectStandardOutput $outLog -RedirectStandardError $errLog -PassThru

try {
  $ready = $false
  $deadline = (Get-Date).AddSeconds($StartupTimeoutSec)
  while ((Get-Date) -lt $deadline) {
    try {
      Invoke-WebRequest "http://localhost:$Port" -TimeoutSec 2 -SkipHttpErrorCheck | Out-Null
      $ready = $true
      break
    } catch {
      Start-Sleep -Milliseconds 600
    }
  }

  if (-not $ready) {
    throw "Dev server not ready at http://localhost:$Port within $StartupTimeoutSec seconds."
  }

  foreach ($path in @("/api/auth/session", "/api/auth/providers", "/api/auth/csrf")) {
    $url = "http://localhost:$Port$path"
    $resp = Invoke-WebRequest $url -TimeoutSec 10 -SkipHttpErrorCheck
    Write-Host "ENDPOINT $path => $([int]$resp.StatusCode)"
    Write-Host $resp.Content
  }
}
finally {
  if ($devProc -and -not $devProc.HasExited) {
    Stop-Process -Id $devProc.Id -Force
    Start-Sleep -Milliseconds 600
  }

  Write-Host "--- STDERR TAIL ---"
  if (Test-Path $errLog) {
    Get-Content $errLog -Tail 200
  }
  Write-Host "--- STDOUT TAIL ---"
  if (Test-Path $outLog) {
    Get-Content $outLog -Tail 250
  }
}
