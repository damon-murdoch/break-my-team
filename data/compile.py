# This script is for compiling the smogon data files required for the script.
# Requires Python 3.x to run :)

# Requests Module
import requests
import argparse
import os

# Data Parser
from parser import parse_format_data as parse_data

# Allowed Rating Choices
rating_choices = ["0", "1500", "1630", "1760"]

# Create the Argument Parser Object
parser = argparse.ArgumentParser("BMT Data Compiler")
parser.add_argument(
    "--month",
    "-m",
    nargs="+",
    required=True,
    help="yyyy-mm string for the data file(s)  (e.g. '2025-01')",
)
parser.add_argument(
    "--format",
    "-f",
    nargs="+",
    required=True,
    help="format string for the data file(s)  (e.g. 'gen9vgc2025regg')",
)
parser.add_argument(
    "--rating",
    "-r",
    nargs="*",
    required=False,
    choices=rating_choices,
    default=rating_choices,
    help=f"rating string for the data file(s) (e.g. {', '.join(rating_choices)})",
)
parser.add_argument(
    "--url",
    "-u",
    required=False,
    default="https://www.smogon.com/stats/[month]/moveset",
    help="Url path to retrieve the set data from (default: Smogon (https://www.smogon.com/stats/))",
)


# Main script running directly
if __name__ == "__main__":

    # Parse the function params
    args = parser.parse_args()

    # Loop over the months
    for month in args.month:

        # Generate the url, substituting the month
        url = args.url.replace("[month]", month)

        # Loop over the formats
        for format in args.format:

            # Loop over the ratings
            for rating in args.rating:

                # Generate the filename, including format-rating
                filename = f"{format}-{rating}.txt"

                # Generate the local filename
                local = f"{month}-{filename}"

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

                # Open the local file
                with open(local, "r") as source:
                    # Read the source content
                    content = source.readlines()

                    # TODO: Uhhhh .... 

                    # Convert the data to json
                    data = parse_data(content)