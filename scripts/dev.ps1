# Starts the API (127.0.0.1:8787) and the Vite dev server (localhost:5173) together.
$ErrorActionPreference = "Stop"
Set-Location (Join-Path $PSScriptRoot "..")
npm run dev
