# Get current path
$Location = Get-Location;

# Move to Project Root
Set-Location $PSScriptRoot;

# Move to 'data' folder
Set-Location "data";

# Build vgc format data
& "python" "build_vgc.py"

# Compile to 'data.js'
& "python" "compile_js.py"

# Move back to root
Set-Location "..";

# Move 'data/data.js' to 'src/data.js' (overwrite)
Move-Item "data/data.js" "src/data.js" -Force;

# Move back to original path
Set-Location -Path $Location;
