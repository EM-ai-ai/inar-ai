param(
  [string]$UserDataDir = "",
  [string]$ExecutablePath = ""
)

$ErrorActionPreference = "Stop"

$codeRoot = Split-Path -Parent $PSScriptRoot
$electron = Join-Path $codeRoot "node_modules\electron\dist\electron.exe"
$appExecutable = if ($ExecutablePath) { $ExecutablePath } else { $electron }

node --check (Join-Path $codeRoot "src\preload.js")
if ($LASTEXITCODE -ne 0) {
  throw "Controllo sintassi preload non superato."
}

Get-Process -ErrorAction SilentlyContinue |
  Where-Object {
    $_.ProcessName -eq "InAR AI" -or
    ($_.ProcessName -eq "electron" -and $_.MainWindowTitle -eq "InAR AI")
  } |
  Stop-Process

Start-Sleep -Seconds 3
$electronArguments = @("--remote-debugging-port=9223", "--remote-allow-origins=*")
if ($UserDataDir) {
  $electronArguments += "--user-data-dir=`"$UserDataDir`""
}
if (-not $ExecutablePath) {
  $electronArguments += "."
}

Start-Process -FilePath $appExecutable `
  -ArgumentList $electronArguments `
  -WorkingDirectory $codeRoot | Out-Null
Start-Sleep -Seconds 10

$targets = Invoke-RestMethod -Uri "http://127.0.0.1:9223/json"
$target = $targets | Where-Object {
  $_.type -eq "page" -and $_.url -match '^https://[^/]+/notebook/[^/]+'
} | Select-Object -First 1
if (-not $target) {
  $loadedUrls = ($targets | Where-Object { $_.type -eq "page" } | ForEach-Object { $_.url }) -join "`n"
  throw "Notebook non caricato. URL aperti:`n$loadedUrls"
}

$socket = [System.Net.WebSockets.ClientWebSocket]::new()
$socket.ConnectAsync(
  [Uri]$target.webSocketDebuggerUrl,
  [Threading.CancellationToken]::None
).GetAwaiter().GetResult()

$expression = @"
JSON.stringify({
  shellMounted: Boolean(document.getElementById('demo-ai-shell')),
  blueprintMounted: Boolean(document.querySelector('.demo-blueprint-image')),
  protectedBadge: document.querySelector('.demo-protected-badge') ? document.querySelector('.demo-protected-badge').textContent.trim() : '',
  preloadError: window.__demoPreloadError || ''
})
"@

$payload = @{
  id = 1
  method = "Runtime.evaluate"
  params = @{
    expression = $expression
    returnByValue = $true
  }
} | ConvertTo-Json -Compress -Depth 5

$bytes = [Text.Encoding]::UTF8.GetBytes($payload)
$socket.SendAsync(
  [ArraySegment[byte]]::new($bytes),
  [System.Net.WebSockets.WebSocketMessageType]::Text,
  $true,
  [Threading.CancellationToken]::None
).GetAwaiter().GetResult()

$verification = $null
while (-not $verification) {
  $buffer = New-Object byte[] 16384
  $received = $socket.ReceiveAsync(
    [ArraySegment[byte]]::new($buffer),
    [Threading.CancellationToken]::None
  ).GetAwaiter().GetResult()
  $response = [Text.Encoding]::UTF8.GetString($buffer, 0, $received.Count) | ConvertFrom-Json
  if ($response.id -eq 1) {
    $verification = $response.result.result.value | ConvertFrom-Json
  }
}

$socket.Dispose()
$window = Get-Process -ErrorAction SilentlyContinue |
  Where-Object {
    $_.MainWindowTitle -eq "InAR AI" -and
    $_.ProcessName -in @("electron", "InAR AI")
  } |
  Select-Object -First 1

$result = [PSCustomObject]@{
  ShellInAR = $verification.shellMounted
  BannerOspedale = $verification.blueprintMounted
  AreaProtetta = $verification.protectedBadge
  ErrorePreload = $verification.preloadError
  FinestraAperta = [bool]$window
  Risponde = $window.Responding
}
$result | Format-List

if (
  -not $verification.shellMounted -or
  -not $verification.blueprintMounted -or
  $verification.protectedBadge -ne "Area protetta" -or
  $verification.preloadError
) {
  throw "Verifica overlay InAR non superata."
}
