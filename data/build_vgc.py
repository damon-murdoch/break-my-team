# JSON Builder
from build import build_json

# 'xx' will be auto-converted to 01, 02, ... 12 later
# 'n1..n2' will be converted to n1, .. , n2 later
FORMATS = {
    "vgc2014": ["2014-11..12"],
    "vgc2015": ["2015-xx"],
    "vgc2016": ["2016-xx"],
    "gen7vgc2017": ["2017-xx"],
    "gen7vgc2018": ["2018-xx"],
    "gen7vgc2019sunseries": ["2018-08..12"],
    "gen7vgc2019moonseries": ["2019-01..04"],
    "gen7vgc2019ultraseries": ["2019-05..12"],
    "gen8vgc2020": ["2020-01..10"],
    "gen8vgc2021": ["2020-11..12", "2021-01..04"],
    "gen8vgc2021series9": ["2021-04..08"],
    "gen8vgc2021series10": ["2021-09..11"],
    "gen8vgc2021series11": ["2021-11..12", "2022-02"],
    "gen8vgc2022": ["2022-01..10"],
    "gen9vgc2023series1": ["2022-12", "2023-01..02"],
    "gen9vgc2023series2": ["2023-02..04"],
    "gen9vgc2023regulationc": ["2023-03..07"],
    "gen9vgc2023regulationd": ["2023-06..10"],
    "gen9vgc2023regulatione": ["2023-09..12"],
    "gen9vgc2023regulationebo3": ["2023-10..12"],
    "gen9vgc2024regf": ["2023-12", "2024-01..04"],
    "gen9vgc2024regfbo3": ["2023-12", "2024-01..05"],
    "gen9vgc2024regg": ["2024-04..09"],
    "gen9vgc2024reggbo3": ["2024-04..09"],
    "gen9vgc2024regh": ["2024-08..12"],
    "gen9vgc2024reghbo3": ["2024-08..12"],
    "gen9vgc2025regg": ["2025-01..03"],
    "gen9vgc2025reggbo3": ["2025-01..03"],
    "gen9vgc2025regi": ["2025-04..07"],
    "gen9vgc2025regibo3": ["2025-04..07"],
    "gen9vgc2025regh": ["2025-08..11"],
    "gen9vgc2025reghbo3": ["2025-08..11"],
}

RATINGS = {"1760"}


def expand_months(months):
    expanded = []

    # Loop over the months
    for month in months:
        # Split the format from the month
        format_str, month_str = month.split("-")

        # Expansion function
        if month_str == "xx":
            # Add all months
            for i in range(1, 13):
                expanded.append(f"{format_str}-{str(i).zfill(2)}")
        # Range (e.g. 2014-11..12)
        elif ".." in month_str:
            month_range = month_str.split("..")
            for i in range(int(month_range[0]), int(month_range[1]) + 1):
                expanded.append(f"{format_str}-{str(i).zfill(2)}")
        else:
            # Add unchanged
            expanded.append(month)

    return expanded


if __name__ == "__main__":
    # Loop over the formats
    for format in FORMATS:
        try:
            # Months to retrieve the data
            months = expand_months(FORMATS[format])

            # Build json data for the format, months
            build_json(months, [format], RATINGS)
        except Exception as e:
            print(f"Failed for format '{format}': {str(e)}")
