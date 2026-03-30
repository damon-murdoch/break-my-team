import json as JSON

from glob import glob

# Output Filepath template
OUTJS = "genX.js"

# Filenames per generation
GENERATIONS = {
    "6": [
        "-vgc2014-",
        "-vgc2015-",
        "-vgc2016-"
    ], 
    "7": [
        "-gen7vgc201",
    ], 
    "8": [
        "-gen8vgc202"
    ], 
    "9": [
        "-gen9vgc202"
    ]
}

def compile_per_gen():

    # Search for all jsons
    files = glob("*.json")

    # Loop over the generations
    for generation in GENERATIONS.keys():

        # Data Source
        data = {}

        # Generate outjs filename for gen
        outjs = OUTJS.replace("X", generation)

        # Loop over the files
        for file in files:

            # Default to not matching
            is_match = False

            # Check if the file matches a filter
            for filter in GENERATIONS[generation]:

                # Filename contains filter
                if filter in file:
                    # Confirm matching
                    is_match = True
                    break

            # File is matching
            if is_match:

                # Open the matching file
                with open(file, "r") as f:

                    # Remove file extension(s)
                    index = file.split(".")[0]

                    # Load the file contents
                    json = JSON.load(f)

                    # Add json to data
                    data[index] = json

                # Dump data to JSON str
                jsonstr = JSON.dumps(data)

                # Open output 'js' file
                with open(outjs, "w+") as f:
                    f.write(f"const DATA={jsonstr}")

            # Otherwise, do nothing

# Run script directly
if __name__ == '__main__':
    compile_per_gen()