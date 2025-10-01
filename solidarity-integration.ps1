# Solidarity Integration Script

<#
.SYNOPSIS
    Master integration script for Solidarity Platform repositories
.DESCRIPTION
    Consolidates files from multiple repositories and drives into a standardized structure
    in the main Solidarity repository.
.NOTES
    Author: Scott Charles Olson
    Date: September 30, 2025
#>

# Configuration
$solidarityRoot = "C:\Users\souls\OneDrive\Documents\GitHub\Solidarity"
$coulCurveRoot = "C:\Users\souls\OneDrive\Documents\GitHub\Coul-Curve"
$soulEdXchangeRoot = "C:\Users\souls\OneDrive\Documents\GitHub\Soul.Ed.Xchange---Quantum-Core"
$stonSyncRoot = "C:\Users\souls\OneDrive\Documents\GitHub\ston-sync-tech-by-Scott-Olson--Hank-and-perplexity"
$stonSyncBeakerRoot = "C:\Users\souls\OneDrive\Documents\GitHub\stonsync-By-Scott-Olson--and-beak.er"
$eDrivePath = "E:\"

# Create directory structure
Write-Host "Creating directory structure..." -ForegroundColor Green
$directories = @(
    "$solidarityRoot\src\core",
    "$solidarityRoot\src\audio",
    "$solidarityRoot\src\finance",
    "$solidarityRoot\src\finance\coul-curve",
    "$solidarityRoot\src\mobile",
    "$solidarityRoot\src\education",
    "$solidarityRoot\src\sync",
    "$solidarityRoot\contracts\tokens",
    "$solidarityRoot\docs\archive"
)

foreach ($dir in $directories) {
    if (-not (Test-Path $dir)) {
        New-Item -Path $dir -ItemType Directory -Force
        Write-Host "Created: $dir" -ForegroundColor Cyan
    }
}

# Step 1: License synchronization
Write-Host "Synchronizing licenses across repositories..." -ForegroundColor Green
$sourceLicense = "$solidarityRoot\LICENSE.txt"
$repositories = @(
    $coulCurveRoot,
    $soulEdXchangeRoot,
    $stonSyncRoot,
    $stonSyncBeakerRoot
)

foreach ($repo in $repositories) {
    if (Test-Path $repo) {
        Copy-Item -Path $sourceLicense -Destination "$repo\LICENSE.txt" -Force
        Write-Host "License updated in $repo" -ForegroundColor Cyan
    }
    else {
        Write-Host "Repository not found: $repo" -ForegroundColor Yellow
    }
}

# Step 2: Organize Solidarity files
Write-Host "Organizing Solidarity files..." -ForegroundColor Green

# Core files
$coreFiles = @(
    "$solidarityRoot\correctedSolidaritySystem.js",
    "$solidarityRoot\comprehensive-discovery.js",
    "$solidarityRoot\EnhancedHarmonicPhraseParser.js"
)
foreach ($file in $coreFiles) {
    if (Test-Path $file) {
        $fileName = Split-Path $file -Leaf
        Copy-Item -Path $file -Destination "$solidarityRoot\src\core\$fileName" -Force
        Write-Host "Moved to core: $fileName" -ForegroundColor Cyan
    }
}

# Audio files
$audioFiles = @(
    "$solidarityRoot\src\TIMBRCompressionSystem.js",
    "$solidarityRoot\src\solidarityAudioProcessor.py"
)
foreach ($file in $audioFiles) {
    if (Test-Path $file) {
        $fileName = Split-Path $file -Leaf
        Copy-Item -Path $file -Destination "$solidarityRoot\src\audio\$fileName" -Force
        Write-Host "Moved to audio: $fileName" -ForegroundColor Cyan
    }
}

# Finance files
$financeFiles = @(
    "$solidarityRoot\src\EnergyFinancialTradingHarmonic.js",
    "$solidarityRoot\src\MarketVolatilityHarmonic.js",
    "$solidarityRoot\src\PortfolioBalanceHarmonic.js",
    "$solidarityRoot\src\FOILHarmonic.js"
)
foreach ($file in $financeFiles) {
    if (Test-Path $file) {
        $fileName = Split-Path $file -Leaf
        Copy-Item -Path $file -Destination "$solidarityRoot\src\finance\$fileName" -Force
        Write-Host "Moved to finance: $fileName" -ForegroundColor Cyan
    }
}

# Mobile files
$mobileFiles = @(
    "$solidarityRoot\src\MobileDeviceManager.js",
    "$solidarityRoot\src\MobileDeviceTester.js",
    "$solidarityRoot\mobile-sync-server.js"
)
foreach ($file in $mobileFiles) {
    if (Test-Path $file) {
        $fileName = Split-Path $file -Leaf
        Copy-Item -Path $file -Destination "$solidarityRoot\src\mobile\$fileName" -Force
        Write-Host "Moved to mobile: $fileName" -ForegroundColor Cyan
    }
}

# Step 3: Import Coul-Curve files
Write-Host "Importing Coul-Curve files..." -ForegroundColor Green
if (Test-Path $coulCurveRoot) {
    # Copy financial files
    Get-ChildItem -Path "$coulCurveRoot\*.js" -File | ForEach-Object {
        Copy-Item -Path $_.FullName -Destination "$solidarityRoot\src\finance\coul-curve\" -Force
        Write-Host "Imported from Coul-Curve: $($_.Name)" -ForegroundColor Cyan
    }
    
    # Copy contracts
    Get-ChildItem -Path "$coulCurveRoot\*.sol" -File | ForEach-Object {
        Copy-Item -Path $_.FullName -Destination "$solidarityRoot\contracts\" -Force
        Write-Host "Imported contract from Coul-Curve: $($_.Name)" -ForegroundColor Cyan
    }
}
else {
    Write-Host "Coul-Curve repository not found" -ForegroundColor Yellow
}

# Step 4: Import Soul.Ed.Xchange files
Write-Host "Importing Soul.Ed.Xchange files..." -ForegroundColor Green
if (Test-Path $soulEdXchangeRoot) {
    # Create education directory if needed
    if (-not (Test-Path "$solidarityRoot\src\education")) {
        New-Item -Path "$solidarityRoot\src\education" -ItemType Directory -Force
    }
    
    # Copy education files
    Get-ChildItem -Path "$soulEdXchangeRoot\*.js", "$soulEdXchangeRoot\*.py" -File | ForEach-Object {
        Copy-Item -Path $_.FullName -Destination "$solidarityRoot\src\education\" -Force
        Write-Host "Imported from Soul.Ed.Xchange: $($_.Name)" -ForegroundColor Cyan
    }
    
    # Copy documentation
    Get-ChildItem -Path "$soulEdXchangeRoot\*.md" -File | ForEach-Object {
        Copy-Item -Path $_.FullName -Destination "$solidarityRoot\docs\" -Force
        Write-Host "Imported documentation from Soul.Ed.Xchange: $($_.Name)" -ForegroundColor Cyan
    }
}
else {
    Write-Host "Soul.Ed.Xchange repository not found" -ForegroundColor Yellow
}

# Step 5: Import Sync Technology files
Write-Host "Importing Sync Technology files..." -ForegroundColor Green
$syncRepos = @($stonSyncRoot, $stonSyncBeakerRoot)
foreach ($repo in $syncRepos) {
    if (Test-Path $repo) {
        # Copy sync files
        Get-ChildItem -Path "$repo\*.js" -File | ForEach-Object {
            Copy-Item -Path $_.FullName -Destination "$solidarityRoot\src\sync\" -Force
            Write-Host "Imported from sync repo: $($_.Name)" -ForegroundColor Cyan
        }
    }
    else {
        Write-Host "Sync repository not found: $repo" -ForegroundColor Yellow
    }
}

# Step 6: Import E drive files
Write-Host "Importing files from E drive..." -ForegroundColor Green

# Check if E drive is accessible
if (Test-Path $eDrivePath) {
    # Import contracts
    $edriveContracts = @(
        "$eDrivePath\CONTENT\Perplexity files\New folder\color_motion_tracking.sol",
        "$eDrivePath\CONTENT\Perplexity files\New folder\habitual_offset.sol",
        "$eDrivePath\COPY OF PASSPORT\Github\assets_table_Version2_Enhanced.sol"
    )
    foreach ($contract in $edriveContracts) {
        if (Test-Path $contract) {
            $contractName = Split-Path $contract -Leaf
            Copy-Item -Path $contract -Destination "$solidarityRoot\contracts\$contractName" -Force
            Write-Host "Imported contract from E drive: $contractName" -ForegroundColor Cyan
        }
    }
    
    # Import token contracts
    $tokenContracts = @(
        "$eDrivePath\COPY OF PASSPORT\Github\HEALToken_Updated.sol",
        "$eDrivePath\COPY OF PASSPORT\Github\LUNCH_Token.sol"
    )
    foreach ($token in $tokenContracts) {
        if (Test-Path $token) {
            $tokenName = Split-Path $token -Leaf
            Copy-Item -Path $token -Destination "$solidarityRoot\contracts\tokens\$tokenName" -Force
            Write-Host "Imported token from E drive: $tokenName" -ForegroundColor Cyan
        }
    }
    
    # Import whitepaper
    $whitepaper = "$eDrivePath\CONTENT\Perplexity files\New folder\CHIPYBITES\SoulEdXchange_Whitepaper_Version2.md"
    if (Test-Path $whitepaper) {
        Copy-Item -Path $whitepaper -Destination "$solidarityRoot\docs\" -Force
        Write-Host "Imported whitepaper from E drive" -ForegroundColor Cyan
    }
    
    # Import Soul.Ed.Xchange text files
    $soulEdTexts = Get-ChildItem -Path "$eDrivePath\CONTENT\Soul.Ed.Xchange*.txt" -ErrorAction SilentlyContinue
    foreach ($text in $soulEdTexts) {
        Copy-Item -Path $text.FullName -Destination "$solidarityRoot\docs\archive\" -Force
        Write-Host "Imported Soul.Ed.Xchange text: $($text.Name)" -ForegroundColor Cyan
    }
    
    # Import additional contracts
    $additionalContractsPath = "$eDrivePath\COPY OF PASSPORT\New folder - Copy\V10.Soul.edu.Xchange\files (3)"
    if (Test-Path $additionalContractsPath) {
        Get-ChildItem -Path "$additionalContractsPath\*.sol" -File | ForEach-Object {
            Copy-Item -Path $_.FullName -Destination "$solidarityRoot\contracts\" -Force
            Write-Host "Imported additional contract: $($_.Name)" -ForegroundColor Cyan
        }
    }
}
else {
    Write-Host "E drive not accessible" -ForegroundColor Yellow
}

Write-Host "`nIntegration complete!" -ForegroundColor Green
Write-Host "All files have been consolidated into the Solidarity repository." -ForegroundColor Green
Write-Host "Please review the new structure and ensure all components work correctly." -ForegroundColor Green