function sampleIndex(arr) {
  // Get a random index within the bounds
  return Math.floor(Math.random() * arr.length);
}

function sampleArray(arr) {
  // Sample a random index
  const index = sampleIndex(arr);

  // Return the element
  return arr.at(index);
}

// toCapitalCase(str: string)
// Returns the provided string
// with the first letter of each
// word capitalised.
function toCapitalCase(str) {
  // Split the string on the spaces
  let spl = str.split(" ");

  // Loop over the string splits
  for (let i = 0; i < spl.length; i++) {
    // If the string is greater
    // than one character
    if (spl[i].length > 1) {
      // Capitalise the first letter, add the rest as lowercase
      spl[i] = spl[i].charAt(0).toUpperCase() + spl[i].slice(1).toLowerCase();
    } // String is one or less characters
    else {
      // Convert the string to upper case
      spl[i] = spl[i].toUpperCase();
    }
  }

  // Join the split string on spaces
  return spl.join(` `);
}

function sanitiseMoveDesc(str) {
  return str.split('(')[0];
}

function sanitiseString(str) {
  return str.toLowerCase().replace(" ", "-");
}

function itemString(str) {
  // Sanitise the item string
  let itemStr = sanitiseString(str);

  // Remove missing sprite suffixes
  itemStr = itemStr.replace('-berry', '');
  itemStr = itemStr.replace('-plate', '');
  itemStr = itemStr.replace('-ball', '');

  return itemStr;
}

function getDamageColour(n, incoming = false) {
  switch (n) {
    case 1: return incoming ? 'verybad' : 'verygood';
    case 2: return incoming ? 'bad' : 'good';
    case 3: return 'neutral';
    case 4: return incoming ? 'good' : 'bad';
    case 0: // Cannot KO, Flow over
    default:
      return incoming ? 'verygood' : 'verybad';
  }
}

function getMatchupColour(n) {
  switch (n) {
    case 1: return 'good';
    case 0: return 'neutral';
    case -1: return 'bad';
    default: {
      if (n > 1) return 'verygood';
      else return 'verybad';
    }
  }
}

function getThreatTooltip(mon) {

  // Tooltip Text (e.g. Urshifu @ Focus Sash)
  let tooltip = `${mon.name} @ ${mon.item}\n`;

  // Add EVs (If provided)
  const evs = getStatString(mon.evs);
  if (evs) {
    tooltip += `EVs: ${evs}\n`;
  }

  // Add IVs (If provided)
  const ivs = getStatString(mon.ivs, 31);
  if (ivs) {
    tooltip += `IVs: ${ivs}\n`;
  }

  // Ability
  if (mon.ability) {
    tooltip += `Ability: ${mon.ability}\n`;
  }

  // Tera type
  if (mon["tera type"]) {
    tooltip += `Tera Type: ${mon["tera type"]}\n`;
  }

  // Add nature
  if (mon.nature) {
    tooltip += `${mon.nature} nature\n`;
  }

  // Add moves
  let n = 0;
  for (const move of mon.moves) {
    if (n < 4) {
      tooltip += `- ${move}\n`;
    } else {
      tooltip += `(+${mon.moves.length - n} more)\n`;
      break;
    }
    n++;
  }

  return tooltip;
}

function getMonTooltip(set) {
  // Tooltip Text (e.g. Urshifu @ Focus Sash)
  let tooltip = `${set.species} @ ${set.item}\n`;

  // Add ability (if provided)
  const ability = set.ability;
  if (ability) {
    tooltip += `Ability: ${ability}\n`;
  }

  // Add EVs (If provided)
  const evs = getStatString(set.evs);
  if (evs) {
    tooltip += `EVs: ${evs}\n`;
  }

  // Add IVs (If provided)
  const ivs = getStatString(set.ivs, 31);
  if (ivs) {
    tooltip += `IVs: ${ivs}\n`;
  }

  // Other properties
  for (const other in set.other) {

    // Create the k/v pair
    const k = toCapitalCase(other);
    const v = set.other[other];

    // Add other properties to tooltip
    tooltip += `${k}: ${v}\n`;
  }

  // Add nature
  if (set.nature) {
    tooltip += `${set.nature} nature\n`;
  }

  // Add moves
  for (const move of set.moves) {
    tooltip += `- ${move}\n`;
  }

  return tooltip;
}

function getSpriteString(species, item = null, tooltip = null, id = null) {

  // Tool tip html code
  let tooltipHtml = "";
  if (tooltip !== null) {
    // Generate the html code for the tool-tip to display
    tooltipHtml = ` data-bs-toggle="tooltip" title="${tooltip}"`;
  }

  // Item html code
  let itemHtml = "";
  if (item !== null) {
    itemHtml = `<img src="img/item/${item}.png" style="position: absolute; bottom: 0; right: 0; width: 25%; height: auto;">`;
  }

  // Element id code
  let idHtml = "";
  if (id !== null) {
    idHtml = `id='${id}'`;
  }

  return `
  <th ${idHtml} style="position: relative;"${tooltipHtml}>
    <img src="img/box/${species}.png" style="width: 100%; height: auto;">
    ${itemHtml}
  </th>`;
}

// Month Names (For generating Info String)
const monthNames = [
  "January", "February", "March",
  "April", "May", "June",
  "July", "August", "September",
  "October", "November", "December"
];

function getInfoStr(info) {
  // Get the month name for the info
  const month = monthNames[info.month - 1];

  // Generate info string
  return `${month} ${info.year}, ${info.format} (${info.rating})`;
}

function getUsageStr(usage, min = 1) {
  let str = [];
  for (const u of usage) {
    // Not 'other', and greater than min. usage
    if ((u.option != "Other") && (u.usage > min)) {
      // Round to 2 decimal places
      const usage = u.usage.toFixed(1);

      // Add option (usage) to list
      str.push(`${u.option} (${usage}%)`);
    }
  }

  // Join string using ,
  return str.join(", ")
}

function getMatchupString(matchup) {
  switch (matchup) {
    case 1:
      return "Favourable";
    case -1:
      return "Unfavourable";
    default:
      if (matchup > 1) {
        return "Very Favourable";
      } else if (matchup < -1) {
        return "Very Unfavourable";
      } else {
        return "Neutral";
      }
  }
}

function getStatString(stat, expected = 0) {
  let spread = [];

  // Check stats, add to string if not expected
  if (stat.hp != expected) {
    spread.push(`${stat.hp} HP`);
  }
  if (stat.atk != expected) {
    spread.push(`${stat.atk} Atk`);
  }
  if (stat.def != expected) {
    spread.push(`${stat.def} Def`);
  }
  if (stat.spa != expected) {
    spread.push(`${stat.spa} SpA`);
  }
  if (stat.spd != expected) {
    spread.push(`${stat.spd} SpD`);
  }
  if (stat.spe != expected) {
    spread.push(`${stat.spe} Spe`);
  }

  return spread.join(" / ");
}

function total(array) {
  let n = 0;
  for (const a of array) {
    n += a;
  }
  return n;
}

// Get the average array value
function average(array) {
  let n = total(array);
  return n / array.length;
}