/*
* Javascript code goes here :)
* Any libraries should be placed in directory 'src' or 'js', 
* and included in the project by adding something similar to
* the following to 'index.html': 
*/

/*
  <!-- Basic File Functionality Description -->
  <script src="path/to/source/file.js"></script>
*/

function getLevel() {
  return parseInt(document.getElementById('lvl-input').value);
}

function getThreatLimit() {
  return parseInt(document.getElementById('threats-input').value); 
}

function getFormat() {
  return document.getElementById('fmt-select').value;
}

function getWeather() {
  const weather = document.getElementById('weather-select').value;
  if (weather === 'none')
    return undefined;
  return weather;
}

function getTerrain() {
  const terrain = document.getElementById('terrain-select').value;
  if (terrain === 'none')
    return undefined;
  return terrain;
}

function getPlayerOppChoice(playerChoice, oppChoice) {
  let option = 'none';
  
  // Both options match
  if (playerChoice === oppChoice) {
    // Both are true
    if (playerChoice === true) {
      option = 'Both';
    }
  }
  else // Neither option matches
  {
    // Either case is true
    if (playerChoice === true) {
      option = 'Player';
    } else {
      option = 'Opponent';
    }
  }

  return option;
}

function getReportConfig() {

  // Team Name
  const teamName = document.getElementById('team-name').value;
  const teamAuthor = document.getElementById('team-author').value;

  // Include Table of Contents
  const includeToC = document.getElementById('include-toc').value === 'include';

  // Include Team Paste
  const includeTeamPaste = document.getElementById('include-paste').value === 'include';

  // Include Speed Tiers
  const includeSpeedTiers = document.getElementById('include-speed').value === 'include';

  // Include Damage Calcs
  const includeDamageCalcs = document.getElementById('include-damage').value === 'include';

  // Include Usage Stats
  const includeUsageStats = document.getElementById('include-usage').value === 'include';

  return {
    teamName: teamName,
    teamAuthor: teamAuthor,
    includeToC: includeToC,
    includeTeamPaste: includeTeamPaste,
    includeSpeedTiers: includeSpeedTiers,
    includeUsageStats: includeUsageStats, 
    includeDamageCalcs: includeDamageCalcs
  }
}

function setReportConfig(config) {
  // Team Name / Author
  document.getElementById('team-name').value = config.teamName;
  document.getElementById('team-author').value = config.teamAuthor;

  // True/False Inclusion Properties
  document.getElementById('include-toc').value = config.includeToC ? "include" : "exclude";
  document.getElementById('include-paste').value = config.includeTeamPaste ? "include" : "exclude";
  document.getElementById('include-speed').value = config.includeSpeedTiers ? "include" : "exclude";
  document.getElementById('include-damage').value = config.includeUsageStats ? "include" : "exclude";
  document.getElementById('include-usage').value = config.includeDamageCalcs ? "include" : "exclude";
}

function getSpeedTierConfig() {

  // Sorting Method
  const sortBy = document.getElementById('sort-speed').value;

  // Items
  const item = document.getElementById('ie-select').value;
  const ability = document.getElementById('ae-select').value;

  return {
    sort: sortBy,
    player: {
      ability: (ability == 'Player' || ability == 'Both'),
      item: (item == 'Player' || item == 'Both')
    },
    other: {
      ability: (ability == 'Opponent' || ability == 'Both'),
      item: (item == 'Opponent' || item == 'Both')
    }
  }
}

function setSpeedTierConfig (config) {
  // Sorting Method
  document.getElementById('sort-speed').value = config.sort;

  // Ability select
  const aeSelect = getPlayerOppChoice(
    config.player.ability, 
    config.other.ability
  );

  // Update the drop-down menu
  document.getElementById('ae-select').value = aeSelect;

  // Ability select
  const ieSelect = getPlayerOppChoice(
    config.player.item, 
    config.other.item
  );

  // Update the drop-down menu
  document.getElementById('ie-select').value = ieSelect;
}

function getFieldEffects() {

  // Default (Game Type)
  const fieldEffects = {
    gameType: document.getElementById('field-input').value, 
    sort: document.getElementById('sort-input').value
  };

  // Weather
  const weather = getWeather();
  if (weather) fieldEffects.weather = weather;

  // Terrain
  const terrain = getTerrain();
  if (terrain) fieldEffects.terrain = terrain;

  // Gravity
  const isGravity = (document.getElementById('gravity-select').value == 'true');
  if (isGravity) fieldEffects.isGravity = true;

  // Ruins

  // Beads of Ruin
  const isBeadsOfRuin = (document.getElementById('bor-select').value == 'true');
  if (isBeadsOfRuin) fieldEffects.isBeadsOfRuin = true;

  // Sword of Ruin
  const isSwordOfRuin = (document.getElementById('sor-select').value == 'true');
  if (isSwordOfRuin) fieldEffects.isSwordOfRuin = true;

  // Tablets of Ruin
  const isTabletsOfRuin = (document.getElementById('tor-select').value == 'true');
  if (isTabletsOfRuin) fieldEffects.isTabletsOfRuin = true;

  // Vessel of Ruin
  const isVesselOfRuin = (document.getElementById('vor-select').value == 'true');
  if (isVesselOfRuin) fieldEffects.isVesselOfRuin = true;

  return fieldEffects;
}

function setFieldEffects(config) {
  document.getElementById('field-input').value = config.gameType;

  // Sort method
  if (config.sort) {
    document.getElementById('sort-input').value = config.sort;
  }

  // Weather Select
  if (config.weather) {
    document.getElementById('weather-select').value = config.weather;
  }

  // Terrain Select
  if (config.terrain) {
    document.getElementById('terrain-select').value = config.terrain;
  }

  // Gravity
  if (config.gravity) {
    document.getElementById('gravity-select').value = 'true';
  }

  // Beads of Ruin
  if (config.isBeadsOfRuin) {
    document.getElementById('bor-select').value = 'true';
  }

  // Sword of Ruin
  if (config.isSwordOfRuin) {
    document.getElementById('sor-select').value = 'true';
  }

  // Tablets of Ruin
  if (config.isTabletsOfRuin) {
    document.getElementById('tor-select').value = 'true';
  }

  // Vessel of Ruin
  if (config.isVesselOfRuin) {
    document.getElementById('vor-select').value = 'true';
  }
}

function getPlayerEffects() {
  // Get the value for the screens, reflect drop-downs
  const screens = document.getElementById('screens-select').value;
  const reflect = document.getElementById('reflect-select').value;

  return {
    'player': {
      'isLightScreen': (screens == 'Player' || screens == 'Both'),
      'isReflect': (reflect == 'Player' || reflect == 'Both')
    },
    'opponent': {
      'isLightScreen': (screens == 'Opponent' || screens == 'Both'),
      'isReflect': (reflect == 'Opponent' || reflect == 'Both')
    }
  }
}

function setPlayerEffects(config) {

  // Check screens choice
  const screns = getPlayerOppChoice(
    config.player.isLightScreen, 
    config.opponent.isLightScreen
  );

  // Update the 'screens' choice
  document.getElementById('screens-select').value = screns;

  // Check reflect choice
  const reflect = getPlayerOppChoice(
    config.player.isReflect,
    config.opponent.isReflect
  );

  // Update the 'reflect' choice
  document.getElementById('reflect-select').value = reflect;
}

function getFormatInfo(format) {
  // Split format by tokens
  tokens = format.split('-');

  // Create table
  const table = {
    'year': parseInt(tokens[0]),
    'month': parseInt(tokens[1]),
    'format': tokens[2],
    'rating': parseInt(tokens[3]),
    'gen': 0 // Checked later
  }

  // Format name includes 'generation'
  if (table.format.startsWith('gen')) {
    // Get the string after the first 3 chars
    const substr = table.format.substring(3);

    // Parse Format Generation
    if (substr[0] == '1') { table.gen = 1 }
    else if (substr[0] == '2') { table.gen = 2 }
    else if (substr[0] == '3') { table.gen = 3 }
    else if (substr[0] == '4') { table.gen = 4 }
    else if (substr[0] == '5') { table.gen = 5 }
    else if (substr[0] == '6') { table.gen = 6 }
    else if (substr[0] == '7') { table.gen = 7 }
    else if (substr[0] == '8') { table.gen = 8 }
    else if (substr[0] == '9') { table.gen = 9 }
    // Future-proofing
    else if (substr[0] == '10') { table.gen = 10 }
    else {
      throw Error(`Unhandled generation for format '${format}'!`);
    }
  }
  else // Hard-coded format
  {
    // Switch on format
    switch (table.format) {
      case 'vgc2014':
      case 'vgc2015':
      case 'vgc2016':
        table.gen = 6;
        break;
      default:
        throw Error(`Unable to find generation for format '${table.format}'!`);
    }
  }

  return table;
}

function getFormatDropdown() {
  // Get the select drop-down from the menu
  const select = document.getElementById('fmt-select');

  // Get the formats from the data set
  const formats = Object.keys(DATA);

  // Sort the formats from newest to oldest
  formats.sort((a, b) => b.localeCompare(a));

  // Loop over the formats
  for (const format of formats) {
    // Create a new 'option' object
    const option = document.createElement('option');

    // Update contents
    option.id = format;
    option.innerHTML = format;

    // Add the option to the list
    select.appendChild(option);
  }
}

function showPokemonTable(show = true) {
  const table = document.getElementById('table-pkmn');
  table.hidden = !show;
}

// Clear the table
function clearTable() {
  // Clear the main table
  const main = document.getElementById('tbody-pkmn-main');
  main.innerHTML = "";
}

// Clear the table
function reset() {
  // Hide pokemon table
  showPokemonTable(false);

  // Clear the sets
  document.sets = null;

  // Tera type table
  document.tera = null;

  // Clear the ranking
  document.ranking = null;

  // Reset the headers
  const head = document.getElementById("tr-pkmn-head");
  head.innerHTML = "<th class='align-middle'>brmt :)</th>";

  // Clear the table
  clearTable();
}

function addTeraToggle(id, type = undefined) {

  // If not found, add the element to the table
  if (!(Object.keys(document.tera).includes(id))) {
    document.tera[id] = {
      enabled: false,
      type: type
    }
  }

  // On-Click event handler (for toggling tera type)
  document.getElementById(id).addEventListener('click', async (event) => {

    // Get the tera type for the id
    const tera = document.tera[id];
    if (tera.type) {
      // Toggle tera enabled / disabled
      tera.enabled = !tera.enabled;

      // Convert type name to lower case
      const typeName = tera.type.toLowerCase();

      // Get the actual element in the form
      const element = document.getElementById(id)

      // Tera is set to true
      if (tera.enabled) {
        // Apply tera type colour
        element.classList.add(typeName);
      }
      else // Tera set to false
      {
        // Remove tera type colour
        element.classList.remove(typeName);
      }

      // Refresh
      update();
    }

    // No tera type, do nothing
  });
}

function addThreat(set, parent) {
  // Get the threat pkmn data
  const pokemon = set.pokemon;

  // Convert the item/species name to lower case
  const species = sanitiseString(pokemon.name);
  const item = itemString(pokemon.item);

  // Generate the mon tooltip
  const tooltip = getThreatTooltip(pokemon);

  // Generate the sprite string for the species, item
  const spriteStr = getSpriteString(species, item, tooltip);

  // Add sprite to row
  parent.innerHTML += spriteStr;
}

// Adds a new pokemon selection tab to the window
function addPokemon(set, id = null) {
  // Dereference the table object
  const tr = document.getElementById("tr-pkmn-head");

  // Convert the item/species name to lower case
  const species = sanitiseString(set.species);
  const item = itemString(set.item);

  // Generate the mon tooltip
  const tooltip = getMonTooltip(set);

  // Generate the sprite string for the species, item
  const spriteStr = getSpriteString(species, item, tooltip, id);

  // Add sprite to row
  tr.innerHTML += spriteStr;
}

// importShowdown(): void
// Imports the pokemon from the user's
// clipboard to the form
function importShowdown(content = null) {

  // No team provided
  if (content === null) {
    // Get the text from the textarea
    content = document.getElementById("text-import").value;
  }

  // Save paste data
  document.paste = content;

  // Parse the sets from the import
  const sets = parseSets(content);

  // Init tera table
  document.tera = {};

  // List of ids
  const teras = [];

  // Index
  let i = 0;
  // Loop over the sets
  for (const set of sets) {
    // Generate the mon id
    const id = `mon-player-${i++}`;

    // Add to the page
    addPokemon(set, id);

    // Add mon, tera type to the list
    teras.push({ id: id, type: getTeraType(set) });
  }

  // Store sets in document
  document.sets = sets;

  // Remove the import form
  document.getElementById("table-pkmn-import").innerHTML = ``;

  // Loop over the ids
  for (const tera of teras) {
    // Add toggle for the id, type
    addTeraToggle(tera.id, tera.type);
  }

  // Update the table
  setTableDamageCalcs();

  // Show the Pokemon table
  showPokemonTable(true);
}

function rankingSortFunc(a, b) {
  // Sort method changes depending on 'method' selected
  const method = document.getElementById('sort-input').value;
  switch (method) {
    // No need to do anything
    case "usage": return 0;
    // Best MU First
    case "best": {
      if (document.ranking) {
        return document.ranking[b] - document.ranking[a];
      }
    }; break;
    // Worst MU First
    case "worst": {
      if (document.ranking) {
        return document.ranking[a] - document.ranking[b];
      }
    }; break;
  }
  // Fallback
  return 0;
}

function getMatchupRanking(table, members, threats) {

  // Matchup ranking
  let ranking = {
    // Total matchup val. for whole team
  }

  // Loop over the threats
  for (const threat of threats) {

    // Get the number of sets for the threat
    const sets = table[members[0]].opponents[threat];

    // Loop over all of the sets
    for (const setIndex in sets) {

      // Overall threat matchup
      let matchup = 0;

      // Loop over the members
      for (const member of members) {
        // Get the matchup data for the member, threat
        const setData = table[member].opponents[threat][setIndex];

        // Update the overall matchup
        matchup += setData.matchup;
      }

      // Update the ranking
      ranking[threat] = matchup;
    }
  }

  // Return ranking
  return ranking;
}

function populateTable(table) {

  // Get the main table for the pokemon
  const tbody = document.getElementById('tbody-pkmn-main');

  // Get all of the team members
  const members = Object.keys(table);

  // Element ids
  const ids = [];

  // AT LEAST One Member
  if (members.length > 0) {

    // Get all of the threats
    const threats = Object.keys(table[members[0]].opponents);

    // Get the matchup ranking table (for sorting the table)
    document.ranking = getMatchupRanking(table, members, threats);

    // Sort the threats depending on settings
    threats.sort(rankingSortFunc);

    // Loop over the threats
    for (const threat of threats) {

      // Get the number of sets for the threat
      const sets = table[members[0]].opponents[threat];
      for (const setIndex in sets) {

        // Get the set for the threat
        const set = sets[setIndex];

        // Create the threat table rows
        const tr = document.createElement('tr');

        // Add threat sprite
        addThreat(set, tr);

        // Overall threat matchup
        let matchup = 0;

        // Loop over the members
        for (const member of members) {

          // Get the matchup data for the member, threat
          const setData = table[member].opponents[threat][setIndex];

          // Cell Main Element
          const td = document.createElement('td');
          td.classList.add('damage-cell');

          // Cell Top Half (Player Damage)
          const top = document.createElement('div');
          top.classList.add('top-half');

          // Get the best attack for the player
          const pBestAttack = setData.attacking.at(0);
          if (pBestAttack) {
            // Set the cell text to the best attack dmg
            top.innerHTML = sanitiseMoveDesc(pBestAttack.moveDesc);
            top.setAttribute('data-bs-toggle', 'tooltip');
            top.setAttribute('title', pBestAttack.fullDesc);

            // Number of hits to K.O. (Ignore % Chance)
            const nHits = pBestAttack.data.kochance.n;
            top.classList.add(getDamageColour(nHits));
          }
          else // No attack
          {
            // Cannot do any damage
            top.innerHTML = '-';
            top.classList.add('verybad');
          }
          td.appendChild(top);

          // Cell Bottom Half (Opponent Damage)
          const bottom = document.createElement('div');
          bottom.classList.add('bottom-half');

          // Get the best attack for the opponent
          const oBestAttack = setData.defending.at(0);
          if (oBestAttack) {
            // Set the cell text to the best attack dmg
            bottom.innerHTML = sanitiseMoveDesc(oBestAttack.moveDesc);
            bottom.setAttribute('data-bs-toggle', 'tooltip');
            bottom.setAttribute('title', oBestAttack.fullDesc);

            // Number of hits to K.O. (Ignore % Chance)
            const nHits = oBestAttack.data.kochance.n;
            bottom.classList.add(getDamageColour(nHits, true));
          }
          else // No attack
          {
            // Cannot do any damage
            bottom.innerHTML = '-';
            bottom.classList.add('verygood');
          }
          td.appendChild(bottom);

          tr.appendChild(td);

          // Update the overall matchup
          matchup += setData.matchup;
        }

        // Set the background colour to the total rating
        tr.classList.add(getMatchupColour(matchup));

        // Add row to table
        tbody.appendChild(tr);
      }
    }
  }

  // Loop over the ids
  for (const id of ids) {
    // Add tera toggle
    addTeraToggle(id);
  }
}

function getStatsTable(mon) {
  return `
  <table>
    <tr>
      <th> Field </th>
      <th> HP </th>
      <th> Atk </th>
      <th> Def </th>
      <th> SpA </th>
      <th> SpD </th>
      <th> Spe </th>
    </tr>
    <tr>
      <th> EVs </th>
      <td> ${mon.evs['hp']} </td>
      <td> ${mon.evs['atk']} </td>
      <td> ${mon.evs['def']} </td>
      <td> ${mon.evs['spa']} </td>
      <td> ${mon.evs['spd']} </td>
      <td> ${mon.evs['spe']} </td>
    </tr>
    <tr>
      <th> IVs </th>
      <td> ${mon.ivs['hp']} </td>
      <td> ${mon.ivs['atk']} </td>
      <td> ${mon.ivs['def']} </td>
      <td> ${mon.ivs['spa']} </td>
      <td> ${mon.ivs['spd']} </td>
      <td> ${mon.ivs['spe']} </td>
    </tr>
    <tr>
      <th> Stats </th>
      <td> ${mon.stats['hp']} </td>
      <td> ${mon.stats['atk']} </td>
      <td> ${mon.stats['def']} </td>
      <td> ${mon.stats['spa']} </td>
      <td> ${mon.stats['spd']} </td>
      <td> ${mon.stats['spe']} </td>
    </tr>
  </table>
  `;
}

function populateReport(table, tiers, usage, info, sets, level) {

  // Get the report config
  const config = getReportConfig();

  // Get the max. number of mons
  const threatLimit = getThreatLimit();

  // Get all of the team members
  const members = Object.keys(table);

  // Get the main table for the pokemon
  const tbody = document.getElementById('tbody-pkmn-main');
  tbody.classList = 'text-left';

  // Dereference column width
  const colspan = sets.length + 1; // Includes first column

  // Create the table row
  const tr = document.createElement('tr');

  // Create table column, with full width
  const td = document.createElement('td');
  td.setAttribute('colspan', colspan);

  // Heading (i.e. title, etc.)
  const heading = document.createElement('div');
  heading.innerHTML = `
    <h3 id='report-title'>
      Team Report - ${config.teamName}
    </h3>
    <h4 class='text-muted'>
      Created by ${config.teamAuthor}
    </h4>
    <h5 class='text-muted'>
      Generated using <a class='text-muted' href='https://www.dragapult.xyz/break-my-team'>Break My Team</a>
    </h5>
    <h6 class='text-muted'>
      Data Set: ${getInfoStr(info)}
    </h6>
  `;

  // Team paste div
  let teamPaste = null;
  if (config.includeTeamPaste) {
    teamPaste = document.createElement('div');
    teamPaste.innerHTML = `
    <h4 id='report-team-paste'>
      Team Paste
    </h4>
    <code ><pre class='text-light'>${document.paste}</pre></code>
    `;
  }

  // Usage Stats div
  let usageStats = null;
  if (config.includeUsageStats) {
    // Usage Table
    usageStats = document.createElement('div');
    usageStats.innerHTML = `
    <h4 id='report-usage-stats'>
      Usage Stats
    </h4>
    `;

    let i = 0;
    for (const threat of usage) {
      // Break if exceeds 'limit' mons
      if (i >= threatLimit) break;

      const species = threat.species;

      // Basic usage stats
      const abilitiesStr = getUsageStr(threat.abilities, 1);
      const itemsStr = getUsageStr(threat.items, 10);
      const movesStr = getUsageStr(threat.moves, 10);
      const teraStr = getUsageStr(threat["tera types"], 10);

      // Generate threat str
      let threatStr = `<h5 id='report-usage-${species}'>${(i + 1)}. ${species}</h5>`;

      // At least one ability
      if (abilitiesStr != "") {
        threatStr += `<p><b>Abilities:</b> ${abilitiesStr}</p>`;
      }

      // At least one item
      if (itemsStr != "") {
        threatStr += `<p><b>Items:</b> ${itemsStr}</p>`;
      }

      // At least one move
      if (movesStr != "") {
        threatStr += `<p><b>Moves:</b> ${movesStr}</p>`;
      }

      // At least one tera type
      if (teraStr != "") {
        threatStr += `<p><b>Tera Types:</b> ${teraStr}</p>`;
      }

      // Add threat to stats
      usageStats.innerHTML += threatStr;

      i++;
    }
  };

  // Speed tiers div
  let speedTiers = null;
  if (config.includeSpeedTiers) {
    // Speeds Table
    speedTiers = document.createElement('div');
    speedTiers.innerHTML = `
    <h4 id='report-speed-tiers'>
      Speed Tiers
    </h4>
    `;
    const speedsTable = document.createElement('table');

    const speedsHead = document.createElement('tr');
    speedsHead.innerHTML = `
      <th class='align-middle'>Species</th>
      <th class='align-middle'>Stat</th>
      <th class='align-middle'>Modifier</th>
      <th class='align-middle'>Base</th>
      <th class='align-middle'>Spread</th>
      <th class='align-middle'>Usage</th>
    `;
    speedsTable.appendChild(speedsHead);

    // Loop over all of the tiers
    for (const tier of tiers) {
      const tr = document.createElement('tr');

      // Placeholders
      let usageStr = '-';
      let youStr = '';
      let modStr = '';

      // Usage provided
      if (tier.usage) {
        // Generate usage string (rounded)
        usageStr = `${Math.floor(tier.usage)}%`;
      } else {
        youStr = " (Your Set)";
      }

      // Ability provided
      if (tier.mod) {
        modStr = `${tier.mod}`;
      }

      tr.innerHTML = `
        <td class='align-middle'>${tier.species}</td>
        <td class='align-middle'>${tier.stat}</td>
        <td class='align-middle'>${modStr}${youStr}</td>
        <td class='align-middle'>${tier.base}</td>
        <td class='align-middle'>${getSpeedStr(tier)}</td>
        <td class='align-middle'>${usageStr}</td>
      `;

      // Add row to table
      speedsTable.appendChild(tr);
    }

    // Add table to div
    speedTiers.appendChild(speedsTable);
  }

  // Damage calcs div
  let damageCalcs = null;
  if (config.includeDamageCalcs && members.length > 0) {

    // Get the common field effects
    const fieldEffects = getFieldEffects();

    // Add the player effects to the field effects
    fieldEffects.playerEffects = getPlayerEffects();

    // Get all of the threats
    const threats = Object.keys(table[members[0]].opponents);

    // Speeds Table
    damageCalcs = document.createElement('div');
    damageCalcs.innerHTML = `
      <h4 id='report-team-matchups'>
        Team Matchups
      </h4>
      <p>
        Field Effects
      </p>
      <code>
        <pre class='text-light'>
${JSON.stringify(fieldEffects, null, 2)}
        </pre>
      </code>
    `;

    let i = 0;
    // Player team mons
    for (const member of members) {

      // Get the pokemon stats
      const mon = table[member].pokemon;

      // Species Title
      const speciesStr = `
        <h5 id='report-mon-${i}'>
          ${i + 1}. ${member}
        </h5>
        <h6 class='text-light'>
          Stats (Lv. ${level})
        </h6>
        ${getStatsTable(mon)}
        <h5>
          Threats
        </h5>
      `;

      // Add species string to report
      damageCalcs.innerHTML += speciesStr;

      let j = 1;
      // Loop over the threats
      for (const threat of threats) {
        // Add threat name, index to report
        damageCalcs.innerHTML += `<h6>${j}. ${threat}</h6>`;

        // Get the number of sets for the threat
        const sets = table[members[0]].opponents[threat];

        let k = 1;
        for (const setIndex in sets) {

          // Get the matchup data for the member, threat
          const setData = table[member].opponents[threat][setIndex];
          const setMon = setData.pokemon;

          const matchupString = getMatchupString(setData.matchup);
          const statString = getStatString(setMon.evs);
          const nature = setMon.nature;

          // Item String
          let item = "";

          // Pokemon is holding item
          if (setMon.item) {
            // Create item string
            item = `(${setMon.item})`;
          }

          // Add spread details
          damageCalcs.innerHTML += `
            <p>
              Spread ${k}: ${nature} ${item} ${statString} (${matchupString})
            </p>
          `;

          // Attacking Calcs
          const attacking = [];
          for (const attack of setData.attacking) {
            attacking.push(`<li>${attack.fullDesc}</li>`);
          }

          // Combine the attacking calcs into an unsorted list
          damageCalcs.innerHTML += `
            <p>
              Attacking
            </p>
            <ul>
              ${attacking.join('')}
            </ul>
          `;

          // Defending Calcs
          const defending = [];
          for (const attack of setData.defending) {
            defending.push(`<li>${attack.fullDesc}</li>`);
          }

          // Combine the defending calcs into an unsorted list
          damageCalcs.innerHTML += `
            <p>
              Defending
            </p>
            <ul>
              ${defending.join('')}
            </ul>
          `;

          k++;
        }

        j++;
      }

      i++;
    }
  }

  // Table of Contents
  let toc = null;
  if (config.includeToC) {

    toc = document.createElement('div');
    toc.innerHTML = `
    <h4 id='toc-title'>
      Table of Contents
    </h4>
    `

    // Create ordered list
    const ul = document.createElement('ul');
    ul.id = 'report-toc';

    // Include Team Paste in report
    if (config.includeTeamPaste) {
      ul.innerHTML += `
      <li>
        <a class='text-light' href='#report-team-paste'>
          Team Paste
        </a>
      </li>
      `;
    }

    // Include Speed Tiers in report
    if (config.includeSpeedTiers) {
      ul.innerHTML += `
      <li>
        <a class='text-light' href='#report-speed-tiers'>
          Speed Tiers
        </a>
      </li>
      `;
    }

    // Include Damage Calcs in report
    if (config.includeDamageCalcs) {

      // Inner list of mons
      const calcMons = [];

      i = 0;
      // Player team mons
      for (const set of sets) {
        calcMons.push(`
        <li>
          <a class='text-light' href='#report-mon-${i++}'>
            ${set.species}
          </a>
        </li>
        `);
      }

      // Generate list
      ul.innerHTML += `
      <li>
        <a class='text-light' href='#report-team-matchups'>
          Team Matchups
        </a>
        <ul>
          ${calcMons.join('')}
        </ul>
      </li>
      `;
    }

    // Include Usage Stats in report
    if (config.includeUsageStats) {

      // Inner list of mons
      const usageMons = [];

      i = 0;
      // Player team mons
      for (const threat of usage) {
        // Break if exceeds 'limit' mons
        if (i >= threatLimit) break;

        const species = threat.species;

        usageMons.push(`
        <li>
          <a class='text-light' href='#report-usage-${species}'>
            ${species}
          </a>
        </li>
        `);

        i++;
      }

      // Generate list
      ul.innerHTML += `
     <li>
       <a class='text-light' href='#report-usage-stats'>
         Usage Stats
       </a>
       <ul>
         ${usageMons.join('')}
       </ul>
     </li>
     `;
    }

    // Add to contents
    toc.appendChild(ul);
  }

  // Add sections to the report
  td.appendChild(heading);

  // Add ToC
  if (toc) {
    td.appendChild(toc);
  }

  // Add Team Paste
  if (teamPaste) {
    td.appendChild(teamPaste);
  }

  // Add Speed Tiers
  if (speedTiers) {
    td.appendChild(speedTiers);
  }

  // Add Damage Calcs
  if (damageCalcs) {
    td.appendChild(damageCalcs);
  }

  // Add Usage Stats
  if (usageStats) {
    td.appendChild(usageStats);
  }

  // td.appendChild(notes);

  // Add row to table
  tr.appendChild(td);
  tbody.appendChild(tr);
}

function populateSpeedTiers(tiers, sets) {
  // Get the main table for the pokemon
  const tbody = document.getElementById('tbody-pkmn-main');

  // Dereference column width
  const colspan = sets.length - 4;

  // Create table header
  const trhead = document.createElement('tr');

  // Create table contents
  trhead.innerHTML = `
  <th class='align-middle'>Species</th>
  <th class='align-middle'>Stat</th>
  <th class='align-middle' colspan=${colspan}>Modifier</th>
  <th class='align-middle'>Base</th>
  <th class='align-middle'>Spread</th>
  <th class='align-middle'>Usage</th>
  `;

  // Add row to table
  tbody.appendChild(trhead);

  // Loop over all of the tiers
  for (const tier of tiers) {
    // Create the threat table rows
    const tr = document.createElement('tr');

    let usageStr = '-';
    let youStr = '';
    let modStr = '';

    // Usage provided
    if (tier.usage) {
      // Generate usage string (rounded)
      usageStr = `${Math.floor(tier.usage)}%`;
    } else {
      youStr = " (Your Set)";
    }

    // Ability provided
    if (tier.mod) {
      modStr = `${tier.mod}`;
    }

    // Get item sprite
    let item = null;
    if (tier.item.includes(tier.mod)) {
      item = itemString(tier.mod);
    }

    // Sanitise the pokemon name
    const species = sanitiseString(tier.species);

    // Get the sprite string for the species, item
    const sprite = getSpriteString(species, item);

    // Create table contents
    tr.innerHTML = `
    ${sprite}
    <td class='align-middle' width='16.6%'>${tier.stat}</td>
    <td class='align-middle' width='33.2%' colspan=${colspan}>${modStr}${youStr}</td>
    <td class='align-middle' width='16.6%'>${tier.base}</td>
    <td class='align-middle' width='16.6%'>${getSpeedStr(tier)}</td>
    <td class='align-middle' width='16.6%'>${usageStr}</td>
    `;

    // No usage stats (player mon)
    if (tier.usage === null) {
      // Green bg for player mons
      tr.classList.add('verygood');
    }

    // Add row to table
    tbody.appendChild(tr);
  }
}

// Update the calcs page
function update(format = null) {

  // No format
  if (!format) {
    // Get the format
    format = getFormat();
  }

  // Get the format data
  const info = getFormatInfo(format);

  // Get the selected level
  const level = getLevel();

  // Get the sets from the document
  const sets = document.sets;

  // Sets defined
  if (sets) {
    // Clear the table
    clearTable();

    switch (document.active) {
      case 0: // Speed Tiers
        {
          // Generate the speed tiers table
          const tiers = calculateSpeedTiers(sets, DATA[format], info, level);

          // Populate speed tiers
          populateSpeedTiers(tiers, sets);
        }; break;
      case 1: // Damage Calcs
        {
          // Generate the table for the sets, format, level & field
          const table = calculateTeam(sets, DATA[format], info, level);

          // Populate the pkmn table
          populateTable(table);
        }; break;
      case 2: // Report
        {
          // Generate both speed tiers, damage calcs table
          const tiers = calculateSpeedTiers(sets, DATA[format], info, level);
          const table = calculateTeam(sets, DATA[format], info, level);

          // Populate the report
          populateReport(table, tiers, DATA[format], info, sets, level);
        };
        break;

      default: // Unhandled
        {
          console.error(`Active page is unhandled: ${document.active}`);
        }
    }
  }
}

function setPageReport() {
  document.active = 2;

  // Show the damage options menu, hide the speed options menu
  document.getElementById('table-report-options').hidden = '';
  document.getElementById('table-damage-options').hidden = 'hidden';
  document.getElementById('table-speed-options').hidden = 'hidden';

  // Lighten the defensive tab, to show that it is hidden
  document.getElementById("option-damage").className = "bg-secondary";
  document.getElementById("option-speed").className = "bg-secondary";

  // Darken the offensive tab, to show that it is active
  document.getElementById("option-report").className = "bg-dark";

  // Update the form
  update();
}

function setTableDamageCalcs() {
  document.active = 1;

  // Show the damage options menu, hide the speed options menu
  document.getElementById('table-report-options').hidden = 'hidden';
  document.getElementById('table-damage-options').hidden = '';
  document.getElementById('table-speed-options').hidden = 'hidden';

  // Lighten the defensive tab, to show that it is hidden
  document.getElementById("option-report").className = "bg-secondary";
  document.getElementById("option-speed").className = "bg-secondary";

  // Darken the offensive tab, to show that it is active
  document.getElementById("option-damage").className = "bg-dark";

  // Update the form
  update();
}

function setTableSpeedTiers() {
  document.active = 0;

  // Hide the damage options menu, show the speed options menu
  document.getElementById('table-report-options').hidden = 'hidden';
  document.getElementById('table-damage-options').hidden = 'hidden';
  document.getElementById('table-speed-options').hidden = '';

  // Lighten the defensive tab, to show that it is hidden
  document.getElementById("option-report").className = "bg-secondary";
  document.getElementById("option-damage").className = "bg-secondary";

  // Darken the offensive tab, to show that it is active
  document.getElementById("option-speed").className = "bg-dark";

  // Update the form
  update();
}

function copyReport() {
  // Report highlighted
  if (document.active == 2) {

    // Get the table contents for the body
    const body = document.getElementById('tbody-pkmn-main');

    let range = undefined;
    if (document.selection) {
      // Create text range for the whole document
      range = document.body.createTextRange();

      // Highlight report area
      range.moveToElementText(body);
      range.select().createTextRange();
    } else if (window.getSelection) {
      // Create text range for the whole document
      range = document.createRange();

      // Highlight report area
      range.selectNode(body);
      window.getSelection().addRange(range);
    }
    else // No supported selection method
    {
      throw Error("Unable to highlight report area!");
    }

    // Depreciated - May be removed later
    document.execCommand("copy");

    alert("Team report copied to clipboard!");
  }

  // Else, do nothing
}

// Copy link
function copyLink() {
  const url = new URL(CONFIG.url);

  // Active Page
  url.searchParams.append('active', document.active);

  // Format Selected
  url.searchParams.append('format', getFormat());
  
  // Level Selected
  url.searchParams.append('level', getLevel());
  
  // Threats Selected
  url.searchParams.append('threats', getThreatLimit());

  // Field Effects
  const fieldEffects = btoa(JSON.stringify(getFieldEffects()));
  url.searchParams.append('field', fieldEffects);

  // Player Effects
  const playerEffects = btoa(JSON.stringify(getPlayerEffects()));
  url.searchParams.append('player', playerEffects);
  
  // Speed Tier Config
  const speedTierConfig = btoa(JSON.stringify(getSpeedTierConfig()));
  url.searchParams.append('speed', speedTierConfig);

  // Report Config
  const reportConfig = btoa(JSON.stringify(getReportConfig()));
  url.searchParams.append('report', reportConfig);

  // Convert the team to a base64-encoded string
  const team = btoa(document.paste);

  // Team Data
  url.searchParams.append('team', team);

  // Convert url to string and copy
  navigator.clipboard.writeText(url.toString());

  alert("Page link copied to clipboard!");
}

function loadSearchParams() {
  // Parse the params from the query
  const query = window.location.search;
  const params = new URLSearchParams(query);

  // Order-of-operations:
  // 1. load level, threats, type, format (independent of team)
  // 2. load team
  // 3. load field, player, speed & report configs
  // 4. profit?????

  // Has 'level' input
  if (params.has('level')) {
    document.getElementById('lvl-input').value = parseInt(params.get('level'));
  }

  // Has 'threats' input
  if (params.has('threats')) {
    document.getElementById('threats-input').value = parseInt(params.get('threats'));
  }

  // Has 'format' input
  if (params.has('format')) {
    document.getElementById('fmt-select').value = params.get('format');
  }

  // Has 'team' input
  if (params.has('team')) {
    // Parse the team from base64
    const team = atob(params.get('team'));

    // Import the team
    importShowdown(team);

    // Only check these if team is provided
    
    // Worker functions for config

    // Field Effects
    if (params.has('field')) {
      // Parse the json-encoded config from the params
      const config = JSON.parse(atob(params.get('field')));
      setFieldEffects(config);
    }

    // Player Effects
    if (params.has('player')) {
      const config = JSON.parse(atob(params.get('player')));
      setPlayerEffects(config)
    }

    // Speed Tier Config
    if (params.has('speed')) {
      const config = JSON.parse(atob(params.get('speed')));
      setSpeedTierConfig(config);
    }

    // Report Config
    if (params.has('report')) {
      const config = JSON.parse(atob(params.get('report')));
      setReportConfig(config);
    }
  }
  // Update the form
  update();
}

function resetPage() {
  window.location.replace(CONFIG.url);
}

// Import from clipboard event listener
document
  .getElementById("paste-import")
  .addEventListener("click", async (event) => {

    // Reset the table
    reset();

    // Add 'import team' form
    document.getElementById("table-pkmn-import").innerHTML = `
  <tr>
    <td colspan>
      <textarea id='text-import' class='form-control' placeholder='Paste your team here...'></textarea>
    </td>
  </tr>
  <tr>
    <td>
      <button id='btn-import' type='button' class='btn btn-primary' onClick='importShowdown()'>
        Submit
      </button>
    </td>
  </tr>
  `;
  });

// Populate Formats
getFormatDropdown();

// Load from Params
loadSearchParams();