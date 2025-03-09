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

function getTeraType(set) {
  const other = Object.keys(set.other);
  if (other.includes('tera type')) {
    return set.other['tera type'];
  }
  return undefined;
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

// mon, oppDef, defaultField, playerEffects

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

function getSpeedStr(tier) {

  // Get the nature data for the spread
  nature = calc.NATURES[tier.nature];

  // Empty suffix
  let suffix = '';

  // Non-neutral nature
  if (nature[0] !== nature[1]) {
    if (nature[0] === 'spe')
      suffix = '+'; // Positive
    else if (nature[1] === 'spe')
      suffix = '-'; // Negative
  }

  // Empty iv string
  let ivStr = '';
  if (tier.iv !== 31)
    ivStr = `${tier.iv}/`;

  // Return the spread string
  return `${ivStr}${tier.ev}${suffix}`;
}

function getUsageSpreadIVs(evs) {
  // Get the nature data for the spread
  const nature = calc.NATURES[evs.nature];

  // Assume 31 ivs by default
  const ivs = statTemplate(31);

  // Reduced nature
  if (nature[1] == 'spe') {
    // Use 0spe
    ivs.spe = 0;
  }

  return ivs;
}

function checkProtoSpeedBoost(rawStats) {
  return (rawStats.spe > rawStats.atk) && (rawStats.spe > rawStats.def) && (rawStats.spe > rawStats.spa) && (rawStats.spe > rawStats.spd);
}

function applyStageMultiplier(stat, stage) {
  // Lowered
  if (stage < 0)
    stat = stat * (2 / (2 + stage));

  // Raised
  if (stage > 0)
    stat = stat * ((2 + stage) / 2);

  // Return w/o decimals
  return Math.floor(stat);
}

function checkSpeedTierItem(template) {
  // Default
  const copies = [];

  // Loop over the items
  for (const item of template.item) {
    // Boost stage
    let stage = 0;

    // Switch on the item
    switch (item) {
      case 'Booster Energy': {
        // Proto speed boost
        if (template.proto)
          stage += 1;
      }; break;
      case 'Choice Scarf': {
        if (template.ev > CONFIG.scarf)
          stage += 1;
      }; break;
      default: {
        // Do nothing
      }; break;
    }

    // Stage modified
    if (stage != 0) {
      // Create a deep copy of the template
      copy = JSON.parse(JSON.stringify(template));

      // Apply the stat change
      copy.stat = applyStageMultiplier(copy.stat, stage);

      // Update other fields
      copy.mod = item;
      copy.stage = stage;

      // Add to the copies
      copies.push(copy);
    }
  }

  // Return copies
  return copies;
}

function checkSpeedTierAbility(template) {
  // Default
  const copies = [];

  // Loop over the abilities
  for (const ability of template.ability) {

    // Boost stage
    let stage = 0;

    switch (ability) {
      case 'Protosynthesis':
      case 'Quark Drive': {
        // Check to see if the Pokemon is holding booster energy or not
        const hasBoosterEnergy = template.item.includes('Booster Energy');
        // Proto speed boost
        if (template.proto && !hasBoosterEnergy)
          stage += 1;
      }; break;
      // Weather Boost
      case 'Swift Swim':
      case 'Chlorophyll':
      case 'Sand Rush':
      case 'Slush Rush':
      // Other Boost
      case 'Unburden': {
        // 2 more stages 
        stage += 2;
      }; break;
    }

    // Stage modified
    if (stage != 0) {
      // Create a deep copy of the template
      copy = JSON.parse(JSON.stringify(template));

      // Apply the stat change
      copy.stat = applyStageMultiplier(copy.stat, stage);

      // Update other fields
      copy.mod = ability;
      copy.stage = stage;

      // Add to the copies
      copies.push(copy);
    }
  }

  // Return copies
  return copies;
}

function applySpeedTierModifiers(tiers, config) {
  let tierCount = tiers.length;
  for (let i = 0; i < tierCount; i++) {
    const template = tiers[i];

    // Ability effects enabled
    if (config.ability) {
      const copies = checkSpeedTierAbility(template);
      tiers = tiers.concat(copies);
    }

    // Item effects enabled
    if (config.item) {
      const copies = checkSpeedTierItem(template);
      tiers = tiers.concat(copies);
    }
  }
  return tiers;
}

function getPlayerMonSpeedTiers(mon) {

  // Speed tier data
  return [{
    level: mon.level,
    species: mon.species.name,
    stat: mon.rawStats.spe,
    base: mon.species.baseStats.spe,
    iv: mon.ivs.spe,
    ev: mon.evs.spe,
    stage: 0, // Neutral
    nature: mon.nature,
    ability: [mon.ability],
    proto: checkProtoSpeedBoost(mon.rawStats),
    usage: null,
    item: [mon.item],
    mod: null,
  }];
}

function getUsageMonSpeedTiers(gen, usage, level) {

  // Indexed on stat
  const tiers = {};

  // Dereference species data
  let species = checkFormeChangeStrict(usage.species);

  // Failsafe (Speed Tiers only)
  if (species === "Aegislash") {
    species = "Aegislash-Shield";
  }

  // Filter the available items & abilities for the Pokemon
  const ability = usage.abilities.filter(x => x.usage > CONFIG.usage.ability).map(x => x.option);
  const item = usage.items.filter(x => x.usage > CONFIG.usage.item).map(x => x.option);

  // Loop over the spreads
  for (const spread of usage.spreads) {
    if (spread.option != 'Other') {

      // Dereference ivs/evs
      const evs = getSpread(spread.option);
      const ivs = getUsageSpreadIVs(evs);

      // Generate mon for the spread
      const mon = new calc.Pokemon(gen, species, {
        level: level,
        nature: evs.nature,
        evs: evs.stats,
        ivs: ivs
      });

      // Convert speed stat to raw string
      const speed = mon.rawStats.spe;
      const speedStr = `${speed}`;

      // List already contains speed stat
      if (Object.keys(tiers).includes(speedStr)) {
        // Update speed usage
        tiers[speed].usage += spread.usage;

        // If at least one set gets the proto boost, set proto to true
        if (tiers[speed].proto === false && checkProtoSpeedBoost(mon.rawStats))
          tiers[speed].proto = true;
      }
      else // Speed stat not in list
      {
        tiers[speed] = {
          level: level,
          species: species,
          stat: speed,
          base: mon.species.baseStats.spe,
          iv: ivs['spe'],
          ev: evs.stats['spe'],
          nature: evs.nature,
          ability: ability,
          proto: checkProtoSpeedBoost(mon.rawStats),
          usage: spread.usage,
          item: item,
          mod: null,
        }
      }
    }
  }

  // Return tiers without keys
  return Object.values(tiers);
}

function calculateSpeedTiers(team, usage, format, level = 50) {

  // Get speed tier display config
  const config = getSpeedTierConfig();

  // Get the max. number of threats
  const threatLimit = getThreatLimit();

  // Get the 'Generation' object for the format
  const gen = calc.Generations.get(format.gen);

  // Total speed calcs
  const speedTiers = [];

  // Loop over the Pokemon
  for (const set of team) {

    // Dereference species
    let species = checkFormeChangeStrict(set.species);

    // Failsafe (Speed Tiers only)
    if (species === "Aegislash") {
      species = "Aegislash-Shield";
    }

    // Create the Pokemon object for the set
    const mon = new calc.Pokemon(gen, species, {
      level: level,
      nature: set.nature,
      evs: set.evs,
      ability: set.ability,
      moves: set.moves,
      item: set.item
    });

    // Get the speed tier object
    let tiers = applySpeedTierModifiers(
      getPlayerMonSpeedTiers(mon),
      config.player
    );

    // Check for forme changes for the species
    const forme = checkFormeChange(species, {
      ability: set.ability,
      item: set.item
    });

    // Forme change is different
    if (forme.species !== species) {
      // Create a new Pokemon for the set
      const formeMon = new calc.Pokemon(gen, forme.species, {
        level: level,
        nature: set.nature,
        evs: set.evs,
        ability: forme.ability,
        moves: set.moves,
        item: set.item
      });

      // Add new forme to the tiers list
      tiers = tiers.concat(applySpeedTierModifiers(
        getPlayerMonSpeedTiers(formeMon),
        config.player
      ));
    }

    // Add to the speeds
    for (const tier of tiers) {
      speedTiers.push(tier);
    }
  }

  let monCount = 0;
  // Loop over usage mons
  for (const set of usage) {

    // Break after limit
    if (monCount >= threatLimit)
      break;

    const tiers = applySpeedTierModifiers(
      getUsageMonSpeedTiers(gen, set, level),
      config.other
    );

    // Add to the speeds
    for (const tier of tiers) {
      speedTiers.push(tier);
    }

    monCount++;
  }

  // Sort table via speed stat
  speedTiers.sort((a, b) => {
    switch (config.sort) {
      default: // Fallback
      case 'fast': // Fast first
        return b.stat - a.stat;
      case 'slow': // Slow first
        return a.stat - b.stat;
    }
  });

  return speedTiers;
}