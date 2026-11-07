# Generate a local HTTPS certificate for the Windows agent
# Run this in PowerShell as Administrator on the Windows PC

$certName = "Nexus Deck Agent"
$certPath = "C:\nexus\agent-data\nexus-agent.pem"
$keyPath  = "C:\nexus\agent-data\nexus-agent-key.pem"

New-Item -ItemType Directory -Force -Path "C:\nexus\agent-data" | Out-Null

# Generate self-signed certificate valid for 2 years using openssl
& openssl req -x509 -newkey rsa:2048 -keyout $keyPath -out $certPath -days 730 -nodes `
  -subj "/CN=nexus-deck-agent/O=Nexus Deck/C=US" `
  -addext "subjectAltName=IP:127.0.0.1,DNS:localhost"

Write-Host "Certificate generated at $certPath" -ForegroundColor Green
Write-Host "Key generated at $keyPath" -ForegroundColor Green
Write-Host ""
Write-Host "Set these environment variables before starting the agent:" -ForegroundColor Cyan
Write-Host "  $env:NEXUS_CERT_PATH=`"$certPath`"" -ForegroundColor Cyan
Write-Host "  $env:NEXUS_KEY_PATH=`"$keyPath`"" -ForegroundColor Cyan
Write-Host ""
Write-Host "Install the .pem file on your Android device so Chrome trusts the local HTTPS connection."