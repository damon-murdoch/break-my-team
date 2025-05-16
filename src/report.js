function setPageReport() {
  document.active = 2;

  // Selected
  document.getElementById('table-report-options').hidden = '';
  document.getElementById("option-report").className = "bg-dark";

  // Unselected
  document.getElementById('table-damage-options').hidden = 'hidden';
  document.getElementById('table-usage-options').hidden = 'hidden';
  document.getElementById('table-speed-options').hidden = 'hidden';
  document.getElementById('table-quiz-options').hidden = 'hidden';

  document.getElementById("option-damage").className = "bg-secondary";
  document.getElementById("option-usage").className = "bg-secondary";
  document.getElementById("option-speed").className = "bg-secondary";
  document.getElementById("option-quiz").className = "bg-secondary";

  update();
}

function getReportConfig() {

  // Team Name
  const teamName = document.getElementById('team-name').value;
  const teamAuthor = document.getElementById('team-author').value;

  // Special Fields (Multiple Options)

  // Include Damage Calcs
  const damageCalcs = document.getElementById('include-damage').value;

  // Include Usage Stats
  const usageStats = document.getElementById('include-usage').value;

  // True/False Inclusion Properties

  // Include Table of Contents
  const includeToC = document.getElementById('include-toc').value === 'include';

  // Include Team Paste
  const includeTeamPaste = document.getElementById('include-paste').value === 'include';

  // Include Speed Tiers
  const includeSpeedTiers = document.getElementById('include-speed').value === 'include';

  return {
    teamName: teamName,
    teamAuthor: teamAuthor,
    usageStats: usageStats,
    damageCalcs: damageCalcs,
    includeToC: includeToC,
    includeTeamPaste: includeTeamPaste,
    includeSpeedTiers: includeSpeedTiers,
  }
}

function setReportConfig(config) {
  // Team Name / Author
  document.getElementById('team-name').value = config.teamName;
  document.getElementById('team-author').value = config.teamAuthor;

  // Special Fields (Multiple Options)
  document.getElementById('include-usage').value = config.usageStats;
  document.getElementById('include-damage').value = config.damageCalcs;

  // True/False Inclusion Properties
  document.getElementById('include-toc').value = config.includeToC ? "include" : "exclude";
  document.getElementById('include-paste').value = config.includeTeamPaste ? "include" : "exclude";
  document.getElementById('include-speed').value = config.includeSpeedTiers ? "include" : "exclude";
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

  console.log(config);

  // Usage Stats div
  let usageStats = null;
  if (config.usageStats) {
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
  if (config.damageCalcs && members.length > 0) {

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
    if (config.damageCalcs) {

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
    if (config.usageStats) {

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
