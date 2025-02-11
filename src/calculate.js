function getCalcOpp(mon, spread, item) {
  return {
    "pokemon": {
      "name": mon.name,
      "ability": mon.ability,
      "nature": spread.nature,
      "stats": mon.stats,
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

function getSpread(str) {
  // Default Spread
  let spread = {
    nature: "Quirky",
    stats: statTemplate(31),
  };

  // Split the string on ':'
  const tokens = str.split(":");

  if (tokens.length >= 2) {
    // Nature = first split
    spread.nature = tokens[0];
    spread.stats = parseSimpleStats(spread.stats, tokens[1]);
  } else {
    throw Error(`Invalid number of tokens (${tokens.length}) provided!`);
  }

  // Return the spread
  return spread;
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

// Sort moves from most to least effective
function moveSortFunc(a, b) {
  return total(b.data.range) - total(a.data.range);
}

function challengeSpecies(mon, usage, options) {

  // Get the default field
  const field = new calc.Field({
    gameType: options.field,
    attackerSide: CONFIG.field.attackerSide,
    defenderSide: CONFIG.field.defenderSide,
  });

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

      // Get species for the usage
      let species = usage.species;

      // Get the most common ability (highest usage)
      let ability = usage.abilities.at(0).option;

      // Get the list of mega stones
      const megaStones = Object.keys(calc.MEGA_STONES);

      // If the item is a mega stone
      if (megaStones.includes(item)) {
        // If the mega stone matches the species
        if (species === calc.MEGA_STONES[item]) {
          // Update the species
          species = stone.forme;

          // Clear the ability
          ability = undefined;
        }
      }

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

              // Defend only NOT set
              if (!options.defendOnly) {
                // Loop over team moves
                for (const moveName of mon.moves) {
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

                for (const usageMove of usage.moves) {
                  // Break after limit
                  if (moveCount >= CONFIG.limit.moves) 
                    break;
                  
                  // Get the name for the move
                  const moveName = usageMove.option;
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
              // Generate mon for the spread
              const opp = new calc.Pokemon(gen, species, {
                level: mon.level,
                ability: ability,
                nature: spread.nature,
                item: item,
                evs: spread.stats,
              });

              // Create the calc opponent object
              const opponent = getCalcOpp(opp, spread, item);

              // Defend only NOT set
              if (!options.defendOnly) {
                // Loop over team moves
                for (const moveName of mon.moves) {
                  const move = new calc.Move(gen, moveName);
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

                // Loop over mon moves
                for (const usageMove of usage.moves) {
                  // Break after limit
                  if (moveCount >= CONFIG.limit.moves) 
                    break;
                  
                  // Get the name for the move
                  const moveName = usageMove.option;
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

function challengeAegislash(monAtk, monDef, usage, field) {
  // Attacking calcs
  const opponents = challengeSpecies(monAtk, usage, { attackOnly: true, field: field });

  // Defensive calcs
  const defending = challengeSpecies(monDef, usage, { defendOnly: true, field: field });

  // Loop over the opponents
  for (let i = 0; i < opponents.length; i++) {
    // Add defender data to the results
    opponents[i].defending = defending[i].defending;
  }

  // Return opponents
  return opponents;
}

function calculateTeam(team, usage, format, level = 50, field = 'Doubles') {

  // Get the 'Generation' object for the format
  const gen = calc.Generations.get(format.gen);

  // Calcs Table
  const totalCalcs = {};

  // Loop over the Pokemon
  for (const set of team) {
    const species = set.species;

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
          });

          const monDef = new calc.Pokemon(gen, "Aegislash-Shield", {
            level: level,
            nature: set.nature,
            evs: set.evs,
            ability: set.ability,
            moves: set.moves,
          });

          // Get calcs table (override to 'Aegislash')
          const calcsTable = getCalcTable(monAtk, "Aegislash");

          // Counter
          let monCount = 0;

          // Loop over the species
          for (const speciesUsage of usage) {
            // Break after limit
            if (monCount > CONFIG.limit.mons)
              break;

            // Get the opponent species
            const oppSpecies = speciesUsage.species;

            // Run the calcs for the mon against the target species
            const opponents = challengeAegislash(monAtk, monDef, speciesUsage, field);
            calcsTable.opponents[oppSpecies] = opponents;
            monCount++;
          }

          totalCalcs[species] = calcsTable;
        }; break;
        default: {
          // Create the calcs mon for the set
          const mon = new calc.Pokemon(gen, species, {
            level: level,
            nature: set.nature,
            evs: set.evs,
            ability: set.ability,
            moves: set.moves,
          });

          // Get calcs table
          const calcsTable = getCalcTable(mon);

          // Counter
          let monCount = 0;

          // Loop over the species
          for (const speciesUsage of usage) {
            // Break after limit
            if (monCount > CONFIG.limit.mons)
              break;

            // Get the opponent species
            const oppSpecies = speciesUsage.species;

            // Run the calcs for the mon against the target species
            const opponents = challengeSpecies(mon, speciesUsage, { field: field });
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