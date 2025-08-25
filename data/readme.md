# Usage Parser
## Showdown Usage Data Parser and Downloader
### Created by Damon Murdoch ([@SirScrubbington](https://twitter.com/SirScrubbington))

This program downloads the usage data files from `smogon.com/stats`, and converts them to `json` format.

## Installation

1. Download and open the repository
   - `git clone [repo path]`

2. Install the script requirements
   - `pip install -r requirements.txt`

## Usage

### Downloading and converting usage to .json format (build.py)
To download and convert individual usage files, the script `build.py` should be used. 

#### Script Usage
`usage: build.py [-h] --month MONTH [MONTH ...] --format FORMAT [FORMAT ...] [--rating [{0,1500,1630,1760} ...]] [--url URL] [--compile]`

#### --month MONTH [MONTH ...]
Month is the month, or list of months for which data should be retrieved - For example, "01" is January and "01" "02" would be
both January and February.

#### --format FORMAT [FORMAT ...]
Format is the format, or list of formats for which data should be
retrieved - For example, "vgc2014" is VGC 2014 and "vgc2014" "vgc2015" would retrieve data for both VGC 2014 and VGC 2015.

#### [--rating [{0,1500,1630,1760} ...]]
Rating is the rating or list of ratings for which data should be
retrieved - And accepts only 0, 1500, 1630, or 1760 as available options. 

#### [--url URL]
Url is the url which the data is downloaded from - This should 
only be changed if you are using a custom data source. The default
url is `https://www.smogon.com/stats/[month]/moveset`, where `[month]` will be replaced by the desired month at runtime. 

### Download and convert bulk VGC data (build_vgc.py)

Downloads and converts all 1760-rated vgc data from `vgc2014` to `vgc2025 regulation g`, as of February 2025.

### Convert data to bulk `.js` format (compile_js.py)

This programs compiles all of the `.json` files in the directory, 
and compiles them all into a single Javascript file named `data.js`. 

The file contains a single constant variable named DATA, 
containing the data from all of the `.json` files stored using
the names as keys.

e.g. `2014-11-vgc2014-1760`

## Changelog

Please see below for the list of any changes in the application.

### 1.0.0

Repository created, working scripts added