# This script is for compiling all of the .json files in this folder into a single .js file.
# Requires Python 3.x to run :)

import os
import json as JSON

from glob import glob

# Output Filepaths
OUTJS = "data.js"

def compile_all(outjs=OUTJS):

    # Data Source
    data = {}

    # Search all 'json' files
    for file in glob("*.json"):
        with open(file, "r") as f:
            # Remove file extension(s)
            index = file.split('.')[0]

            # Load the file contents
            json = JSON.load(f)

            # Add json to data
            data[index] = json

    # Dump data to JSON str
    jsonstr = JSON.dumps(data)

    # Open output 'js' file
    with open(outjs, "w+") as f:
        f.write(f"const DATA={jsonstr}")

# Run script directly
if __name__ == '__main__':
    compile_all()