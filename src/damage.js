function setTableDamageCalcs() {
  document.active = 1;

  // Selected
  document.getElementById('table-damage-options').hidden = '';
  document.getElementById("option-damage").className = "bg-dark";

  // Unselected
  document.getElementById('table-report-options').hidden = 'hidden';
  document.getElementById('table-usage-options').hidden = 'hidden';
  document.getElementById('table-speed-options').hidden = 'hidden';
  document.getElementById('table-quiz-options').hidden = 'hidden';

  document.getElementById("option-report").className = "bg-secondary";
  document.getElementById("option-usage").className = "bg-secondary";
  document.getElementById("option-speed").className = "bg-secondary";
  document.getElementById("option-quiz").className = "bg-secondary";

  update();
}
function getCalcOpp(mon, spread, item) {
  return {
    "pokemon": {
      "name": mon.name,
      "tera type": mon.teraType,
      "ability": mon.ability,
      "nature": spread.nature,
      "stats": mon.stats,
      "moves": mon.moves,
      "item": item,
      "evs": spread.stats,
      "ivs": mon.ivs,
    },
    "attacking": [],
    "defending": [],
    "matchup": 0
  }
}

function getCalcTable(mon, name = null) {

  // No override
  if (name === null)
    name = mon.species;

  return {
    "pokemon": {
      name: name,
      ability: mon.ability,
      nature: mon.nature,
      stats: mon.stats,
      item: mon.item,
      ivs: mon.ivs,
      evs: mon.evs
    },
    "opponents": {}
  }
}

function getPredictedWinner(opponent) {
  // 2+ Very Favourable
  // 1 Favourable
  // 0 Neutral
  // -1 Unfavourable
  // -2 Very Unfavourable

  // Number of moves available to both
  const monMoveCount = opponent.attacking.length;
  const oppMoveCount = opponent.defending.length;

  // Both have no moves
  if (monMoveCount == 0 && oppMoveCount == 0) {
    // No winner
    return 0;
  } else if (monMoveCount == 0) {
    // Opponent wins
    return -2;
  } else if (oppMoveCount == 0) {
    // Mon wins
    return 2;
  }

  // Get best move for mon and opponent
  const monBestMove = opponent.attacking[0];
  const oppBestMove = opponent.defending[0];

  // Get the K.O. chance for both moves
  const monKoRating = monBestMove.data.kochance.n;
  const oppKoRating = oppBestMove.data.kochance.n;

  // Both have no moves
  if (monKoRating == 0 && oppKoRating == 0) {
    // No winner
    return 0;
  } else if (monKoRating == 0) {
    // Opponent wins
    return -2;
  } else if (oppKoRating == 0) {
    // Mon wins
    return 2;
  }

  // Compare damage dealt
  return oppKoRating - monKoRating;
}

function moveSortFunc(a, b) {
  return total(b.data.range) - total(a.data.range);
}

function getMonFieldEffects(mon) {
  const fieldEffects = {};
  switch (mon.ability) {
    // *** Weather ***
    // Sun
    case "Drought":
    case "Orichalcum Pulse":
      fieldEffects.weather = "Sun";
      break;
    // Harsh Sunshine
    case "Desolate Land":
      fieldEffects.weather = "Harsh Sunshine";
      break;
    // Rain
    case "Drizzle":
      fieldEffects.weather = "Rain";
      break;
    // Heavy Rain
    case "Primordial Sea":
      fieldEffects.weather = "Heavy Rain";
      break;
    // Sand
    case "Sand Stream":
    case "Sand Spit":
      fieldEffects.weather = "Sand";
      break;
    // Snow
    case "Snow Warning":
      fieldEffects.weather = "Snow";
      break;
    case "Delta Stream":
      fieldEffects.weather = "Strong Winds";
      break;
    // *** Terrain ***
    // Electric
    case "Hadron Engine":
    case "Electric Surge":
      fieldEffects.terrain = "Electric";
      break;
    // Grassy
    case "Grassy Surge":
      fieldEffects.terrain = "Grassy";
      break;
    // Misty
    case "Misty Surge":
      fieldEffects.terrain = "Misty";
      break;
    // Psychic
    case "Psychic Surge":
      fieldEffects.terrain = "Psychic";
      break;
    // *** Other Effects ***
    // Beads of Ruin
    case "Beads of Ruin":
      fieldEffects.isBeadsOfRuin = true;
      break;
    // Beads of Ruin
    case "Sword of Ruin":
      fieldEffects.isSwordOfRuin = true;
      break;
    // Beads of Ruin
    case "Tablets of Ruin":
      fieldEffects.isTabletsOfRuin = true;
      break;
    // Beads of Ruin
    case "Vessel of Ruin":
      fieldEffects.isVesselOfRuin = true;
      break;
    // Aura Break
    case "Aura Break":
      fieldEffects.isAuraBreak = true;
      break;
    // Fairy Aura
    case "Fairy Aura":
      fieldEffects.isFairyAura = true;
      break;
    // Dark Aura
    case "Dark Aura":
      fieldEffects.isDarkAura = true;
      break;
    // TODO: ???
  }
  return fieldEffects;
}

function checkFormeChangeStrict(species) {

  // Specific species
  switch (species) {
    case "Gastrodon-East":
    case "Gastrodon-West": {
      return "Gastrodon";
    }
  }

  // As-is
  return species;
}

function checkFormeChange(species, options = {}) {

  // Default forme data
  const forme = {
    species: species,
    ability: options.ability,
    item: options.item
  };

  switch (species) {
    // Terapagos (Base Forme)
    case "Terapagos": {
      if (options.ability === 'Tera Shift') {
        forme.species = "Terapagos-Terastal";
        forme.ability = 'Tera Shell';
      }
    }
    // Flow over from 'Terapagos'
    case "Terapagos-Terastal": {
      if (options.teraType === 'Stellar') {
        forme.species = "Terapagos-Stellar";
        forme.ability = 'Teraform Zero';
      }
    };
      break;
    // TODO: Add more here maybe
    default: {
      // Item forme changes
      if (species in MEGA_STONES) {
        for (const stone of MEGA_STONES[species]) {
          if (options.item == stone.item) {
            forme.species = stone.forme;
            forme.ability = undefined;
          }
        }
      }
    };
      break;
  }

  return forme;
}

function checkMoveChange(mon, moveName) {

  // Derefernece species
  const species = mon.name;

  // Zacian, Rusted Sword, Iron Head -> Behemoth B;ade
  if (species.startsWith("Zacian") && (mon.item === "Rusted Sword") && moveName == "Iron Head") {
    return "Behemoth Blade";
  }
  // Zamazenta, Rusted Shield, Iron Head -> Behemoth Bash
  if (species.startsWith("Zamazenta") && (mon.item === "Rusted Shield") && moveName == "Iron Head") {
    return "Behemoth Bash";
  }

  // TODO: ???

  // No change
  return moveName;
}

function combineFieldEffects(atkMon, defMon, defaultField, playerEffects, playerAtk = false) {

  // Get mon field effects
  const atkEffects = getMonFieldEffects(atkMon);
  const defEffects = getMonFieldEffects(defMon);

  // Order of priority (Most -> Least)
  // 1: Default (Config Field Effects)
  // 2: Attacker Field Effects
  // 3: Defender Field Effects

  // Create main table
  const fieldEffects = {
    ...defEffects,
    ...atkEffects,
    ...defaultField
  };

  // Add player-specific effects

  // Player is attacking
  if (playerAtk === true) {
    fieldEffects.attackerSide = playerEffects.player;
    fieldEffects.defenderSide = playerEffects.opponent;
  }
  else // Player is defending
  {
    fieldEffects.attackerSide = playerEffects.opponent;
    fieldEffects.defenderSide = playerEffects.player;
  }

  return fieldEffects;
}

function challengeSpecies(mon, usage, options = {}) {

  // Generate the field based on the program config
  const defaultField = getFieldEffects();

  // Get player-specific field effects
  const playerEffects = getPlayerEffects();

  // Get opponent mon species
  const species = checkFormeChangeStrict(usage.species);

  // Dereference generation
  const gen = mon.gen;

  // List of opponents
  const opponents = [];

  // Counter
  let spreadCount = 0;

  // Loop over the spreads for the mon
  for (const usageSpread of usage.spreads) {

    // Spread limit exceeded
    if (spreadCount >= CONFIG.limit.spreads) {
      break;
    }

    // Counter
    let itemCount = 0;

    // Loop over the items for the mon
    for (const usageItem of usage.items) {
      // Spread limit exceeded
      if (itemCount >= CONFIG.limit.items) {
        break;
      }

      // Get the item name
      const item = usageItem.option;

      // Get the most common ability (highest usage)
      const ability = usage.abilities.at(0).option;

      // Convert string to spread
      const spread = getSpread(usageSpread.option);

      try {
        // Switch on species
        switch (species) {
          case "Aegislash":
            {
              // Use Blade Forme when Attacking
              const oppAtk = new calc.Pokemon(gen, "Aegislash-Blade", {
                level: mon.level,
                ability: ability,
                nature: spread.nature,
                item: item,
                evs: spread.stats,
              });

              // Use Shield Forme when Defending
              const oppDef = new calc.Pokemon(gen, "Aegislash-Shield", {
                level: mon.level,
                ability: ability,
                nature: spread.nature,
                item: item,
                evs: spread.stats,
              });

              // Create the calc opponent object
              const opponent = getCalcOpp(oppDef, spread, item);
              opponent.pokemon.moves = usage.moves.map((x) => x.option);
              
              // At least one tera type
              if (usage["tera types"].length) {
                // Get the first (most common) tera type
                const tera = usage["tera types"].at(0).option;
                opponent.pokemon["tera type"] = tera;
              }

              // Defend only NOT set
              if (!options.defendOnly) {

                // Combine player, opponent, default effects
                const field = new calc.Field(combineFieldEffects(
                  mon, oppDef, defaultField, playerEffects, true
                ));

                // Loop over team moves
                for (let moveName of mon.moves) {
                  // Check if move changes (e.g. Zacian-C and Iron Head)
                  moveName = checkMoveChange(mon, moveName);
                  const move = new calc.Move(gen, moveName);
                  const result = calc.calculate(gen, mon, oppDef, move, field);
                  if (result.damage != 0) {
                    opponent.attacking.push({
                      data: {
                        kochance: result.kochance(),
                        range: result.range(),
                      },
                      fullDesc: result.fullDesc(),
                      moveDesc: result.moveDesc(),
                      desc: result.desc(),
                      move: result.move.name,
                    });
                  }
                }

                // Sort the attacks from most to least effective
                opponent.attacking.sort(moveSortFunc);
              }

              // Attack only NOT set
              if (!options.attackOnly) {
                // Counter
                let moveCount = 0;

                // Combine player, opponent, default effects
                const field = new calc.Field(combineFieldEffects(
                  oppAtk, mon, defaultField, playerEffects, false
                ));

                for (const usageMove of usage.moves) {
                  // Break after limit
                  if (moveCount >= CONFIG.limit.moves)
                    break;

                  // Get the name for the move
                  let moveName = usageMove.option;

                  // Check if move changes (e.g. Zacian-C and Iron Head)
                  moveName = checkMoveChange(oppAtk, moveName);

                  const move = new calc.Move(gen, moveName);
                  const result = calc.calculate(gen, oppAtk, mon, move, field);
                  if (result.damage != 0) {
                    opponent.defending.push({
                      data: {
                        kochance: result.kochance(),
                        range: result.range(),
                      },
                      fullDesc: result.fullDesc(),
                      moveDesc: result.moveDesc(),
                      desc: result.desc(),
                      move: result.move.name,
                    });
                    moveCount++;
                  }
                }

                // Sort the attacks from most to least effective
                opponent.defending.sort(moveSortFunc);
              }

              // Calculate the matchup odds for the opponent
              opponent.matchup = getPredictedWinner(opponent);

              // Add to the opponents
              opponents.push(opponent);
            }
            break;
          default:
            {
              // Check for forme changes
              const forme = checkFormeChange(usage.species, {
                ability: ability,
                item: item
              });

              // Generate mon for the spread
              const opp = new calc.Pokemon(gen, forme.species, {
                level: mon.level,
                ability: forme.ability,
                nature: spread.nature,
                item: item,
                evs: spread.stats,
              });

              // Create the calc opponent object
              const opponent = getCalcOpp(opp, spread, item);
              opponent.pokemon.moves = usage.moves.map((x) => x.option);

              // At least one tera type
              if (usage["tera types"].length) {
                // Get the first (most common) tera type
                const tera = usage["tera types"].at(0).option;
                opponent.pokemon["tera type"] = tera;
              }

              // Defend only NOT set
              if (!options.defendOnly) {
                // Combine player, opponent, default effects
                const field = new calc.Field(combineFieldEffects(
                  mon, opp, defaultField, playerEffects, true
                ));

                // Loop over team moves
                for (let moveName of mon.moves) {
                  // Check if move changes (e.g. Zacian-C and Iron Head)
                  moveName = checkMoveChange(mon, moveName);
                  const move = new calc.Move(gen, moveName);

                  // Break Fix: Hard-Coded Ghost Type Hitting for Tera Starstorm
                  const isTeraStarstorm = mon.species.name === 'Terapagos-Stellar' && moveName === 'Tera Starstorm';
                  field.defenderSide.isForesight = isTeraStarstorm;

                  const result = calc.calculate(gen, mon, opp, move, field);
                  if (result.damage != 0) {
                    opponent.attacking.push({
                      data: {
                        kochance: result.kochance(),
                        range: result.range(),
                      },
                      fullDesc: result.fullDesc(),
                      moveDesc: result.moveDesc(),
                      desc: result.desc(),
                      move: result.move.name,
                    });
                  }
                }

                // Sort the attacks from most to least effective
                opponent.attacking.sort(moveSortFunc);
              }

              // Attack only NOT set
              if (!options.attackOnly) {
                // Counter
                let moveCount = 0;

                // Combine player, opponent, default effects
                const field = new calc.Field(combineFieldEffects(
                  opp, mon, defaultField, playerEffects, false
                ));

                // Loop over mon moves
                for (const usageMove of usage.moves) {
                  // Break after limit
                  if (moveCount >= CONFIG.limit.moves)
                    break;

                  // Get the name for the move
                  let moveName = usageMove.option;

                  // Check if move changes (e.g. Zacian-C and Iron Head)
                  moveName = checkMoveChange(opp, moveName);
                  const move = new calc.Move(gen, moveName);
                  const result = calc.calculate(gen, opp, mon, move, field);
                  if (result.damage != 0) {
                    opponent.defending.push({
                      data: {
                        kochance: result.kochance(),
                        range: result.range(),
                      },
                      fullDesc: result.fullDesc(),
                      moveDesc: result.moveDesc(),
                      desc: result.desc(),
                      move: result.move.name,
                    });
                    moveCount++;
                  }
                }

                // Sort the attacks from most to least effective
                opponent.defending.sort(moveSortFunc);

                // Calculate the matchup odds for the opponent
                opponent.matchup = getPredictedWinner(opponent);
              }

              // Add to the opponents
              opponents.push(opponent);
            }
            break;
        }
      } catch (
      e // Failed for species ...
      ) {
        console.warn(`Failed for species '${species}': ${String(e)} ...`);
      }

      itemCount++;
    }

    spreadCount++;
  }

  // Return opponents
  return opponents;
}

function challengeAegislash(monAtk, monDef, usage) {
  // Attacking calcs
  const opponents = challengeSpecies(monAtk, usage, { attackOnly: true });

  // Defensive calcs
  const defending = challengeSpecies(monDef, usage, { defendOnly: true });

  // Loop over the opponents
  for (let i = 0; i < opponents.length; i++) {
    // Add defender data to the results
    opponents[i].defending = defending[i].defending;
  }

  // Return opponents
  return opponents;
}

function calculateTeam(team, usage, format, level = 50) {

  // Get the 'Generation' object for the format
  const gen = calc.Generations.get(format.gen);

  // Get the max. number of threats
  const threatLimit = getThreatLimit();

  // Calcs Table
  const totalCalcs = {};

  // Loop over the Pokemon
  for (const index in team) {
    // Dereference set data
    const set = team[index];
    const species = checkFormeChangeStrict(set.species);

    // Check for player terastal
    const id = `mon-player-${index}`;
    const tera = document.tera[id].enabled;

    // If tera is enabled, check for tera type
    const teraType = tera ? getTeraType(set) : undefined;

    try {
      // Switch on species
      switch (species) {
        case "Aegislash": {
          // Create the calcs mon for the set

          const monAtk = new calc.Pokemon(gen, "Aegislash-Blade", {
            level: level,
            nature: set.nature,
            evs: set.evs,
            ability: set.ability,
            moves: set.moves,
            teraType: teraType
          });

          const monDef = new calc.Pokemon(gen, "Aegislash-Shield", {
            level: level,
            nature: set.nature,
            evs: set.evs,
            ability: set.ability,
            moves: set.moves,
            teraType: teraType
          });

          // Get calcs table (override to 'Aegislash')
          const calcsTable = getCalcTable(monAtk, "Aegislash");

          // Counter
          let monCount = 0;

          // Loop over the species
          for (const speciesUsage of usage) {
            // Break after limit
            if (monCount >= threatLimit)
              break;

            // Get the opponent species
            const oppSpecies = speciesUsage.species;

            // Run the calcs for the mon against the target species
            const opponents = challengeAegislash(monAtk, monDef, speciesUsage);
            calcsTable.opponents[oppSpecies] = opponents;
            monCount++;
          }

          totalCalcs[species] = calcsTable;
        }; break;
        default: {
          // Check for forme changes
          const forme = checkFormeChange(species, {
            ability: set.ability,
            item: set.item,
            teraType: teraType
          });

          // Create the calcs mon for the set
          const mon = new calc.Pokemon(gen, forme.species, {
            level: level,
            nature: set.nature,
            evs: set.evs,
            ability: forme.ability,
            moves: set.moves,
            item: set.item,
            teraType: teraType
          });

          // Get calcs table
          const calcsTable = getCalcTable(mon);

          // Counter
          let monCount = 0;

          // Loop over the species
          for (const speciesUsage of usage) {
            // Break after limit
            if (monCount >= threatLimit)
              break;

            // Get the opponent species
            const oppSpecies = checkFormeChangeStrict(speciesUsage.species);

            // Run the calcs for the mon against the target species
            const opponents = challengeSpecies(mon, speciesUsage);
            calcsTable.opponents[oppSpecies] = opponents;
            monCount++;
          }

          totalCalcs[species] = calcsTable;
        }; break;
      }
    }
    catch (e) // Failed for set
    {
      console.error(`Failed for species '${species}'! ${(e)}`)
    }
  }

  // Return all calcs
  return totalCalcs;
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
}
