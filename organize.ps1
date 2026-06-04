# Move files to organized folders
$rootPath = "c:\Users\cliff\Documents\GitHub_1\-munihostelfinder"
$cssFiles = @("admin_management.css", "backend.css", "frontend.css", "login.css")
$jsFiles = @("admin_management.js", "api-client.js", "backend.js", "currency-converter.js", "firebase-manager.js", "frontend.js", "login.js", "photo-manager.js", "security.js", "signup.js")
$imageFiles = @("logo.jpeg", "logo.png", "muni.webp")

# Move CSS files
foreach ($file in $cssFiles) {
    $source = Join-Path $rootPath $file
    $dest = Join-Path $rootPath "assets\css\$file"
    if (Test-Path $source) {
        Move-Item -Path $source -Destination $dest -Force
        Write-Host "Moved $file to assets/css"
    }
}

# Move JS files
foreach ($file in $jsFiles) {
    $source = Join-Path $rootPath $file
    $dest = Join-Path $rootPath "js\$file"
    if (Test-Path $source) {
        Move-Item -Path $source -Destination $dest -Force
        Write-Host "Moved $file to js"
    }
}

# Move image files
foreach ($file in $imageFiles) {
    $source = Join-Path $rootPath $file
    $dest = Join-Path $rootPath "assets\images\$file"
    if (Test-Path $source) {
        Move-Item -Path $source -Destination $dest -Force
        Write-Host "Moved $file to assets/images"
    }
}

Write-Host "`nOrganization complete!"
