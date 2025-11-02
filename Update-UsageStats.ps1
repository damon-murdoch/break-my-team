Param(
    # Commit message for the upstream sub-repository
    [Alias()][Parameter(Mandatory=$False)][String]$Commit, 
    # Path of the folder to remote into (default: 'usage')
    [Alias()][Parameter(Mandatory=$False)][String]$Path = "./data", 
    # Upstream branch to push changes to (default: 'dev')
    [Alias()][Parameter(Mandatory=$False)][String]$Remote = 'origin'
);

# Get current path
$Location = Get-Location;

# Move to Project Root
Set-Location $PSScriptRoot;

# Move to 'data' folder
Set-Location "$Path";

# Ensure requirements installed
& "pip" "install" "-r" "requirements.txt"

# Build vgc format data
& "python" "build_vgc.py"

# Compile to 'data.js'
& "python" "compile_js.py"

# Move back to original path
Set-Location -Path $Location;
