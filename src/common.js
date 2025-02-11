function sanitiseMoveDesc(str) {
  return str.split('(')[0];
}

function sanitiseString(str) {
  return str.toLowerCase().replace(" ", "-");
}

function itemString (str) {
  // Sanitise the item string
  let itemStr = sanitiseString(str);
  
  // Remove missing sprite suffixes
  itemStr = itemStr.replace('-berry', '');
  itemStr = itemStr.replace('-ball', '');

  return itemStr;
}

function getDamageColour(n, incoming=false) {
  switch(n) {
    case 0: // Cannot KO, Flow over
    case 1: return incoming ? 'verybad': 'verygood'; 
    case 2: return incoming ? 'bad' : 'good'; 
    case 3: return 'neutral';
    case 4: return incoming ? 'good' : 'bad'; 
    default: return incoming ? 'verygood' : 'verybad'; 
  }
}

function getMatchupColour(n) {
  switch(n) {
    case 1: return 'good';
    case 0: return 'neutral';
    case -1: return 'bad';
    default: {
      if (n > 1) return 'verygood';
      else return 'verybad';
    }
  }
}

function getSpriteString(species, item) {
  return `
  <th style="position: relative;">
    <img src="img/box/${species}.png" style="width: 100%; height: auto;">
    <img src="img/item/${item}.png" style="
      position: absolute;
      bottom: 0;
      right: 0;
      width: 25%; /* Adjust size as needed */
      height: auto;
    ">
  </th>`;
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