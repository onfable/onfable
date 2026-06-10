# onfable installer — Windows
# Usage: irm onfable.xyz/install.ps1 | iex
$ErrorActionPreference = "Stop"

Write-Host ""
Write-Host "  * onfable" -ForegroundColor White
Write-Host "  the agent that lives in your terminal" -ForegroundColor DarkGray
Write-Host ""

$NodeMin = 20

# --- 1. Check Node.js >= 20 --------------------------------------------------
$node = Get-Command node -ErrorAction SilentlyContinue
if (-not $node) {
    Write-Host "! Node.js is not installed (onfable needs Node $NodeMin+)." -ForegroundColor Yellow
    Write-Host "  Install it with winget, then re-run this script:" -ForegroundColor DarkGray
    Write-Host "    winget install OpenJS.NodeJS.LTS" -ForegroundColor DarkGray
    Write-Host "  (or download from https://nodejs.org)" -ForegroundColor DarkGray
    exit 1
}

$nodeVersion = (node -v).TrimStart("v")
$nodeMajor = [int]($nodeVersion.Split(".")[0])
if ($nodeMajor -lt $NodeMin) {
    Write-Host "x Node.js $NodeMin+ required (found v$nodeVersion). Please upgrade and re-run." -ForegroundColor Red
    exit 1
}
Write-Host "+ Node v$nodeVersion detected" -ForegroundColor Green

# --- 2. Install the package ----------------------------------------------------
Write-Host "  Installing onfable via npm..." -ForegroundColor DarkGray
npm install -g onfable
if ($LASTEXITCODE -ne 0) {
    Write-Host "x npm install failed. Try running this terminal as Administrator, or check your npm setup." -ForegroundColor Red
    exit 1
}
Write-Host "+ onfable installed" -ForegroundColor Green

# --- 3. Verify ----------------------------------------------------------------
$onfable = Get-Command onfable -ErrorAction SilentlyContinue
if ($onfable) {
    $version = onfable --version
    Write-Host "+ onfable $version is on your PATH" -ForegroundColor Green
} else {
    Write-Host "! Installed, but 'onfable' isn't on your PATH yet." -ForegroundColor Yellow
    Write-Host "  Close and reopen your terminal, then try again." -ForegroundColor DarkGray
}

Write-Host ""
Write-Host "  Next: run " -NoNewline
Write-Host "onfable setup" -ForegroundColor Green -NoNewline
Write-Host " to pick a provider and add your API key."
Write-Host "  Docs: https://onfable.xyz" -ForegroundColor DarkGray
Write-Host ""
