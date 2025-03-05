# Pokemon Showdown! Data Format -> JSON-Format converter

### SECTORS ###
# 0: Empty / Sector Split
# 1: Species Name
# 2: Raw Count, Avg. Weight, Viability Ceiling
# 3: Abilities
# 4: Items
# 5: Spreads
# 6: Moves
# 7: Tera Types (Gen 9+ Only)
# 8: Teammates
# 9: Checks & Counters

# Sector Names
SECTORS = [
    None, 
    "species", 
    "metadata",
    "abilities", 
    "items", 
    "spreads", 
    "moves", 
    "tera types", 
    "teammates", 
    "counters"
]

# Split between file contents (excl. whitespace/first & last char)
SECTOR_BREAK = '----------------------------------------'

def get_usage_template(option: str, usage: str): 
    return {
        'option': option, 
        'usage': float(usage[:-1])
    }

def get_data_template(species = None): 
    return {
        "species": species, 
        "metadata": {
            "count": 0, 
            "weight": 0, 
            "ceiling": 0,
        }, 
        "abilities": [],
        "items": [],
        "spreads": [],
        "moves": [],
        "tera types": [],
        "teammates": [],
        "counters": []
    }


def add_stats_to_current(line, list):
    # Line Contains Stats
    if line[-1] == '%':
        # Split, add to current list
        k,v = line.rsplit(" ", 1)
        list.append(get_usage_template(k.strip(), v))

def parse_format_data(content):

    # Current Sector
    sector = 0

    # Line Number
    lineno = 0

    # Last line was line break
    last_line_was_break = True

    # All Data
    data = []

    # Current Object
    current = None

    # Loop over the lines
    for line_raw in content:
        lineno = lineno + 1

        # Strip whitespace (and first/last char)
        line = line_raw.strip()[1:-1]

        # Line is a sector break
        if line == SECTOR_BREAK:

            # Last line was also a break
            if last_line_was_break:

                # Next line is species
                sector = 1

                # Add current to data
                if not current == None:
                    data.append(current)

                # Clear Current
                current = None
            else:
                # Increment Sector
                sector = sector + 1

            # Set line break to true
            last_line_was_break = True

        else: # No line break
            # Set line break to false
            last_line_was_break = False

            # Strip inner whitespace
            reduced = line.strip()

            match reduced:
                # Check for headings
                
                case "Abilities": 
                    sector = 3
                case "Items": 
                    sector = 4
                case "Spreads": 
                    sector = 5
                case "Moves": 
                    sector = 6
                case "Tera Types":
                    sector = 7
                case "Teammates": 
                    sector = 8
                case "Checks and Counters": 
                    sector = 9

                case _: # General case
                    match sector:
                        case 1: # Species
                            # Create new data entry for the species
                            current = get_data_template(reduced)
                        case 2: # Metadata
                            k,v = reduced.split(":")
                            match k:
                                case "Raw count": 
                                    current["metadata"]["count"] = int(v)
                                case "Avg. weight":
                                    current["metadata"]["weight"] = float(v)
                                case "Viability Ceiling": 
                                    current["metadata"]["ceiling"] = int(v)
                                case _:
                                    print(f"Unhandled metadata: {k}, {v}")
                        case _: # Default
                            # Sector is in range
                            if sector < len(SECTORS):

                                # Get the sector id
                                sector_name = SECTORS[sector]

                                # Not 'None'
                                if sector_name:
                                    
                                    # Add the usage stats to the sector data
                                    add_stats_to_current(reduced, current[sector_name])

                                # TODO: Handle 'Else'

                            # TODO: Handle 'Else'
                            
    # File has ended
    if current:
        # Add current to data
        data.append(current)

    # Return constructed data
    return data