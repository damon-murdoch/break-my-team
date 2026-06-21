function setTableUsage() {
  document.active = 2;

  // Selected
  document.getElementById('table-usage-options').hidden = '';
  document.getElementById("option-usage").className = "bg-dark";

  // Unselected
  document.getElementById('table-damage-options').hidden = 'hidden';
  document.getElementById('table-speed-options').hidden = 'hidden';

  document.getElementById("option-damage").className = "bg-secondary";
  document.getElementById("option-speed").className = "bg-secondary";

  update();
}

function getUsageConfig() {

  // Species Drop-Down
  const species = document.getElementById('usage-select').value; 

  return {
    search: species
  };
}

function getMetadata(metadata) {

  const count = metadata.count.toLocaleString('en');
  const weight = metadata.weight.toFixed(8);
  const ceiling = metadata.ceiling;

  return `
<th>Metadata</th>
<td class='text-left'>Raw Count: ${count}</td>
<td class='text-left'>Avg. Weight: ${weight}</td>
<td class='text-left'>Viability Ceiling: ${ceiling}</td>
`;
}

function getUsageList(name, usage) {
  let l = []; // Left-hand side
  let r = []; // Right-hand side

  let i = 0;
  // Loop over usage items
  for (const item of usage) {

    // Convert usage to fixed percentage
    const usage = `${item.usage.toFixed(1)}%`;

    // Skip if '0.0%' (trivial)
    if (usage !== '0.0%') {
      // Odd / even
      if (i % 2 === 0) {
        l.push(`<p>${(i++) + 1}. ${item.option} (${usage})</p>`);
      } else {
        r.push(`<p>${(i++) + 1}. ${item.option} (${usage})</p>`);
      }
    }
  }

  return `
<th>${name}</th>
<td class='text-left'>${l.join("")}</td>
<td class='text-left'>${r.join("")}</td>
`;
}

function populateUsageDropDown(format) {

  // Usage species drop-down
  const select = document.getElementById('usage-select');

  // Loop over all of the species
  for(const usage of format) {
    // Create the option for the species
    const option = document.createElement('option'); 

    // Set value, content to species name
    option.innerHTML = usage.species;
    option.value = usage.species;

    // Add the option to the page
    select.appendChild(option);
  }
}

function populateUsage(format) {
  // Usage config settings
  const config = getUsageConfig();

  // Get the main table for the pokemon
  const tbody = document.getElementById('tbody-pkmn-main');

  // Update species in the 'species' drop-down
  populateUsageDropDown(format); 

  // Get species to show
  let usage = null; 

  // Show selected species
  if (config.search) {
    usage = format.filter(f => f.species.toLowerCase() == (config.search.toLowerCase())).at(0);
  }
  else // No species selected
  {
    // Show highest usage mon
    usage = format.at(0);
  }

  // Usage is defined
  if (usage) {
    // Sanitise the pokemon name
    const species = sanitiseString(usage.species);

    // Get the sprite string for the species, item
    const sprite = getSpriteString(species);

    // Species Title Row
    const title = document.createElement('tr');
    title.innerHTML = `
      ${sprite}
      <th colspan="2" class='text-left align-middle'>
        ${usage.species}
      </th>
    `;

    tbody.appendChild(title);

    // Abilities
    const abilities = document.createElement('tr');
    abilities.innerHTML = getUsageList(
      'Abilities', usage.abilities
    );
    tbody.appendChild(abilities);

    // Items
    const items = document.createElement('tr');
    items.innerHTML = getUsageList(
      'Items', usage.items
    );
    tbody.appendChild(items);

    // Spreads
    const spreads = document.createElement('tr');
    spreads.innerHTML = getUsageList(
      'Spreads', usage.spreads
    );
    tbody.appendChild(spreads);

    // Moves
    const moves = document.createElement('tr');
    moves.innerHTML = getUsageList(
      'Moves', usage.moves
    );
    tbody.appendChild(moves);

    // Tera Types
    const keys = Object.keys(usage);
    if (keys.includes("tera types") && ((usage['tera types'].count) > 0)) {
      // Tera Types
      const teraTypes = document.createElement('tr');
      teraTypes.innerHTML = getUsageList(
        'Tera Types', usage["tera types"]
      );
      tbody.appendChild(teraTypes);
    }

    // Teammates
    const teammates = document.createElement('tr');
    teammates.innerHTML = getUsageList(
      'Teammates', usage.teammates
    );
    tbody.appendChild(teammates);
  }
}