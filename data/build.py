# This script is for building the smogon data files required for the script.
# Requires Python 3.x to run :)

# Requests Module
import requests
import argparse
import os

# JSON Module
import json as JSON

# Data Parser
from parser import parse_format_data as parse_data

# Data Compiler
from compile import compile_all

# Allowed Rating Choices
rating_choices = ["0", "1500", "1630", "1760"]

# Create the Argument Parser Object
parser = argparse.ArgumentParser("BMT Data Compiler")
parser.add_argument(
    "--month",
    "-m",
    nargs="+",
    required=True,
    help="YYYY-MM string for the data file(s)  (e.g. '2025-01')",
)
parser.add_argument(
    "--format",
    "-f",
    nargs="+",
    required=True,
    help="Format string for the data file(s)  (e.g. 'gen9vgc2025regg')",
)
parser.add_argument(
    "--rating",
    "-r",
    nargs="*",
    required=False,
    choices=rating_choices,
    default=rating_choices,
    help=f"Rating string for the data file(s) (e.g. {', '.join(rating_choices)})",
)
parser.add_argument(
    "--url",
    "-u",
    required=False,
    default="https://www.smogon.com/stats/[month]/moveset",
    help="Url path to retrieve the set data from (default: Smogon (https://www.smogon.com/stats/))",
)
parser.add_argument(
    "--compile", 
    "-c", 
    action="store_true", 
    help=f"If set, automatically rebuilds the data.js and data.json files with the new data."
)


# Main script running directly
if __name__ == "__main__":

    # Parse the function params
    args = parser.parse_args()

    print("Building .json files ...")

    # Loop over the months
    for month in args.month:

        # Generate the url, substituting the month
        url = args.url.replace("[month]", month)

        # Loop over the formats
        for format in args.format:

            # Loop over the ratings
            for rating in args.rating:

                # Placeholder
                data = None

                # Generate the filename, including format-rating
                filename = f"{format}-{rating}.txt"

                # Generate the local filename
                local = f"{month}-{filename}"

                # Generate the json filename
                json = local.replace(".txt", ".json")

                # Local file DOES NOT exist
                if not os.path.exists(local):

                    # Generate the url path
                    urlpath = f"{url}/{filename}"
                
                    print(f"Downloading file '{urlpath}' ...")

                    # Get the contents from the file
                    response = requests.get(urlpath)

                    # Get the response content
                    content = str(response.text)

                    # Write the contents to the file
                    with open(local, "w+") as f:
                        f.write(content)

                print(f"Building file {json} ...")

                # Open the local file
                with open(local, "r") as source:

                    # Read the source content
                    content = source.readlines()

                    # Convert the data to json
                    data = parse_data(content)

                # Not 'None'
                if data:
                    # Save the json file
                    with open(json, "w+") as f:
                        JSON.dump(data, f)
                else: # Failed to read data
                    raise Exception(f"Failed to read data from file '{local}'!")
                
    # Compile data files
    if args.compile:
        print("Compiling data files ...")
        compile_all()

    print("Done.")