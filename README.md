# Break My Team
# Team Matchup and Report Generation Tool
### Created by Damon Murdoch ([@SirScrubbington](https://twitter.com/SirScrubbington))

The Break my Team tool is a tool for testing your team's matchups to other threats in the metagame
as well as speed tiers, report generation, and more. This program supports VGC formats going all
the way back to 2014, up to the most recent formats (Currently, Regulation G). 

## Usage

You can view the live version of the tool here: 
[Break My Team](https://www.dragapult.xyz/break-my-team)

For more information, please see `USAGE.md`

## Updating Data

In order for the data in this project to remain up to date, the data sources
must be updated. New formats will be added to this project's dependent sub-repository,
[ps-usage-parser](https://github.com/damon-murdoch/ps-usage-parser), as they are made available.

In order to manually update the format data source `src/data.js`, you 
may run the `Update-UsageStats.ps1` script from the root path of the repository.

## Problems / Improvements

If you have any suggested improvements for this project or encounter any issues, please feel free to open an 
issue [here](../../issues) or send me a message on Twitter detailing the issue and how it can be replicated.

## Changelog

### v1.2.0

Major update, refactored files (all pages now have their own file), implemented 'usage' page for browsing usage stats, 
fixed several formatting issues, other improvements

### v1.1.0

Moved data parsing script to new repository [ps-usage-parser](https://github.com/damon-murdoch/ps-usage-parser), 
and added it as a sub-repository. Added build script `Update-UsageStats.ps1` that builds the showdown data and moves it to
the `src` directory. `readme.md` and `usage.md` files have been added and updated. Added link to the usage document to the 
main page.

### v1.0.0

Initial release with working damage calc, speed tiers, report and quiz pages.

## Support this Project

If you'd like to support this project and other future projects, please feel free to use the PayPal donation link below.
[https://www.paypal.com/paypalme/sirsc](https://www.paypal.com/paypalme/sirsc)
