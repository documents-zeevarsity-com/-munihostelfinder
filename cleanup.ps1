# This script clears the Muni Hostel Finder project directory
$targetPath = "c:\Users\cliff\Documents\GitHub_1\-munihostelfinder"

if (Test-Path $targetPath) {
    Write-Host "Wiping project folder: $targetPath" -ForegroundColor Red
    # Removes all items inside the directory but keeps the root folder itself
    Get-ChildItem -Path $targetPath | Remove-Item -Recurse -Force
    Write-Host "All project files have been removed." -ForegroundColor Green
} else {
    Write-Error "Could not find project directory at $targetPath"
}