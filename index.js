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

function getFieldEffects() {

  // Default (Game Type)
  const fieldEffects = {
    gameType: document.getElementById('field-input').value
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
  head.innerHTML = "<th class='align-middle' style='width: 68px'>brmt :)</th>";

  // Clear the table
  clearTable();
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

    // Only works on damage calc page
    if (document.active === 1) {

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
    }
  });
}

function showPokemonTable(show = true) {
  // Pokemon Table
  const table = document.getElementById('table-pkmn');
  table.hidden = !show;

  // Common Options
  const options = document.getElementById('table-common-options');
  options.hidden = !show;
}

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

  // Clear the table
  clearTable();

  // Sets defined
  if (sets) {
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
      case 2: // Usage
        {
          // Populate the usage stats information table
          populateUsage(DATA[format], sets.length);
        }; break;
      default: // Unhandled
        {
          console.error(`Active page is unhandled: ${document.active}`);
        }; break;
    }
  }
  else // No sets
  {
    // Populate usage, 
    populateUsage(DATA[format]);
  }
}

function loadSearchParams() {
  const query = window.location.search;

  // Query provided
  if (query) {

    // Parse the params from the query
    const params = new URLSearchParams(query);

    // Order-of-operations:
    // 1. load level, threats, type, format (independent of team)
    // 2. load team
    // 3. profit?????

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
    }

    // Update the form
    update();
  } 
  else // No query
  {
    // Load usage table
    setTableUsage();
  }
}

function resetPage() {
  window.location.replace(CONFIG.url);
}

function copyLink() {
  const url = new URL(CONFIG.url);

  // Get the active team
  const paste = document.paste;

  // Active team set
  if (paste) {
    // Active Page
    url.searchParams.append('active', document.active);

    // Format Selected
    url.searchParams.append('format', getFormat());

    // Level Selected
    url.searchParams.append('level', getLevel());

    // Threats Selected
    url.searchParams.append('threats', getThreatLimit());

    // Convert the team to a base64-encoded string
    const team = btoa(paste);

    // Team Data
    url.searchParams.append('team', team);

    // Convert url to string and copy
    navigator.clipboard.writeText(url.toString());

    alert("Page link copied to clipboard!");
  }
  else // No team loaded
  {
    alert("Please load a team first!");
  }
}

// Import from clipboard event listener
document.getElementById("paste-import").addEventListener("click", async (event) => {
  // Reset the table
  reset();

  // Add 'import team' form
  document.getElementById("table-pkmn-import").innerHTML = `
  <tr>
    <td>
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
