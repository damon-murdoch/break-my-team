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

function getField() {
  return document.getElementById('field-input').value;
}

function getFormat() {
  return document.getElementById('fmt-select').value;
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
    if (substr[0] == '1') {table.gen = 1}
    else if (substr[0] == '2') {table.gen = 2}
    else if (substr[0] == '3') {table.gen = 3}
    else if (substr[0] == '4') {table.gen = 4}
    else if (substr[0] == '5') {table.gen = 5}
    else if (substr[0] == '6') {table.gen = 6}
    else if (substr[0] == '7') {table.gen = 7}
    else if (substr[0] == '8') {table.gen = 8}
    else if (substr[0] == '9') {table.gen = 9}
    // Future-proofing
    else if (substr[0] == '10') {table.gen = 10}
    else {
      throw Error(`Unhandled generation for format '${format}'!`);
    }
  }

  return table;
}

function getFormatDropdown() {
  // Get the select drop-down from the menu
  const select = document.getElementById('fmt-select');

  // Get the formats from the data set
  const formats = Object.keys(DATA);

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

function showPokemonTable(show=true) {
  const table = document.getElementById('table-pkmn');
  table.hidden = !show;
}

// Clear the table
function reset() {
  // Hide pokemon table
  // showPokemonTable(false);

  // Clear the sets
  document.sets = null;

  // Reset the headers
  const head = document.getElementById("tr-pkmn-head");
  head.innerHTML = "<th class='align-middle'>brmt :)</th>";

  // Clear the main table
  const main = document.getElementById('tbody-pkmn-main');
  main.innerHTML = "";
}

function addThreat(set, parent) {
  // Get the threat pkmn data
  const pokemon = set.pokemon;

  // Convert the item/species name to lower case
  const species = sanitiseString(pokemon.name);
  const item = itemString(pokemon.item);

  // Generate the sprite string for the species, item
  const spriteStr = getSpriteString(species, item);

  // Add sprite to row
  parent.innerHTML += spriteStr;
}

// Adds a new pokemon selection tab to the window
function addPokemon(set) {
  // Dereference the table object
  const tr = document.getElementById("tr-pkmn-head");

  // Convert the item/species name to lower case
  const species = sanitiseString(set.species);
  const item = itemString(set.item);

  // Generate the sprite string for the species, item
  const spriteStr = getSpriteString(species, item);

  // Add sprite to row
  tr.innerHTML += spriteStr;
}

// importShowdown(): void
// Imports the pokemon from the user's
// clipboard to the form
function importShowdown() {
  // Get the text from the textarea
  const content = document.getElementById("text-import").value;

  // Parse the sets from the import
  const sets = parseSets(content);

  // Reset the table
  reset();

  // Loop over the sets
  for (const set of sets) {
    // Add to the page
    addPokemon(set);
  }

  // Store sets in document
  document.sets = sets;

  // Remove the import form
  document.getElementById("table-pkmn-import").innerHTML = ``;

  // Update the table
  update();

  // Show the Pokemon table
  // showPokemonTable(true);
}

function populateTable(table) {

  // Get the main table for the pokemon
  const tbody = document.getElementById('tbody-pkmn-main');

  // Get all of the team members
  const members = Object.keys(table);

  // AT LEAST One Member
  if (members.length > 0) {

    // Get all of the threats
    const threats = Object.keys(table[members[0]].opponents);

    // Loop over the threats
    for(const threat of threats) {

      // Get the number of sets for the threat
      const sets = table[members[0]].opponents[threat];
      for(const setIndex in sets) {

        // Get the set for the threat
        const set = sets[setIndex];

        // Create the threat table rows
        const tr = document.createElement('tr');

        // Add threat sprite
        addThreat(set, tr);

        // Overall threat matchup
        let matchup = 0;

        // Loop over the members
        for(const member of members) {

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
            bottom.innerHTML = '-';
            bottom.classList.add('verybad');
          }
          td.appendChild(top);

          // Cell Bottom Half (Opponent Damage)
          const bottom = document.createElement('div');
          bottom.classList.add('bottom-half');

          console.log(setData.defending.length);

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
}

// Update the calcs page
function update(format=null) {

  // No format
  if (!format) {
    // Get the format
    format = getFormat();
  }

  // Get the format data
  const info = getFormatInfo(format);

  // Get the selected level
  const level = getLevel();

  // Get the selected field
  const field = getField();

  // Get the sets from the document
  const sets = document.sets;

  // Sets defined
  if (sets) {
    // Generate the table for the sets, format, level & field
    const table = calculateTeam(sets, DATA[format], info, level, field);

    // Populate the pkmn table
    populateTable(table);
  } 
}

// TODO: Implement calcs document export

// Import from clipboard event listener
document
  .getElementById("paste-import")
  .addEventListener("click", async (event) => {
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

getFormatDropdown();