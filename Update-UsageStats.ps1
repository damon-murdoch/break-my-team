Param(
    # Commit message for the upstream sub-repository
    [Alias()][Parameter(Mandatory=$False)][String]$Commit, 
    # Path of the folder to remote into (default: 'usage')
    [Alias()][Parameter(Mandatory=$False)][String]$Path = "./usage", 
    # Upstream branch to push changes to (default: 'dev')
    [Alias()][Parameter(Mandatory=$False)][String]$Remote = 'origin', 
    # Branch to check out & push changes to (default: 'dev')
    [Alias()][Parameter(Mandatory=$False)][String]$Branch = 'dev'
);

# Get current path
$Location = Get-Location;

# Move to Project Root
Set-Location $PSScriptRoot;

# Move to 'data' folder
Set-Location "$Path";

# Ensure on dev branch
& "git" "checkout" "$Branch"

# Build vgc format data
& "python" "build_vgc.py"

# Compile to 'data.js'
& "python" "compile_js.py"

# Commit switch set
If ($Commit) {
    # Add files to repo
    & "git" "add" "."

    # Commit changes
    & "git" "commit" "-m" "$Commit";

    # Push changes
    & "git" "push" "$Remote" "$Branch";
}

# Move back to root
Set-Location "..";

# Move 'data/data.js' to 'src/data.js' (overwrite)
Move-Item "$Path/data.js" "src/data.js" -Force;

# Move back to original path
Set-Location -Path $Location;
