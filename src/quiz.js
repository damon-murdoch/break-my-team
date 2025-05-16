function setTableQuiz() {
  document.active = 3;
  
  // Selected
  document.getElementById('table-quiz-options').hidden = '';
  document.getElementById("option-quiz").className = "bg-dark";

  // Unselected
  document.getElementById('table-report-options').hidden = 'hidden';
  document.getElementById('table-damage-options').hidden = 'hidden';
  document.getElementById('table-speed-options').hidden = 'hidden';
  document.getElementById('table-usage-options').hidden = 'hidden';

  document.getElementById("option-report").className = "bg-secondary";
  document.getElementById("option-damage").className = "bg-secondary";
  document.getElementById("option-usage").className = "bg-secondary";
  document.getElementById("option-speed").className = "bg-secondary";

  update();
}

function getQuizConfig() {
  const includePlayerDmg = document.getElementById('include-player-dmg').value === 'include';
  const includeOppDmg = document.getElementById('include-opp-dmg').value === 'include';
  const includeSpeedComp = document.getElementById('include-speed-comp').value === 'include';

  return {
    includePlayerDmg: includePlayerDmg,
    includeOppDmg: includeOppDmg,
    includeSpeedComp: includeSpeedComp
  }
}

function initQuizStats() {
  document.quiz = {
    mons: null, // Mon Data
    incorrect: 0,
    correct: 0,
    streak: 0
  }
}

function getQuizStats() {
  return `
    <p>
      <p class='text-center align-middle text-warning'>
        Streak: ${document.quiz.streak}
      </p>
      <p class='text-center align-middle text-secondary'>
        <span class='text-success'>
          ${document.quiz.correct}
        </span> / 
        <span class='text-danger'>
          ${document.quiz.incorrect}
        </span>
      </p>
    </p>
  `
}

function updateQuizStats(answer = true) {
  if (answer) {
    // Correct
    document.quiz.correct++;
    document.quiz.streak++;
  } else {
    // Incorrect
    document.quiz.incorrect++;
    document.quiz.streak = 0;
  }
}

function selectTableMons(table, defending=false) {

  // Mon data
  let mons = {
    player: null,
    opponent: null
  }

  // Sample a random player mon from the table
  const playerMonName = sampleArray(Object.keys(table));
  mons.player = table[playerMonName].pokemon;

  // Get the opponents for the player Pokemon
  const opponents = table[playerMonName].opponents;
  const oppKeys = Object.keys(opponents);

  // Filter the opponent keys
  const filtered = oppKeys.filter((x) => {

    // Get the opponent for the index
    const opponent = opponents[x].at(0);
    if (opponent) {
      // Opponent attacking
      if (defending) {
        // At least one defending move
        if (opponent.defending.length > 0)
          return true;
      }
      else // Player attacking
      {
        // At least one attacking move
        if (opponent.attacking.length > 0)
          return true;
      }
    }

    // Exclude
    return false;
  });

  // Sample a random opponent mon from the table
  const oppMonName = sampleArray(filtered);
  mons.opponent = opponents[oppMonName].at(0);

  // Return mon data
  return mons
}

function selectTierMons(tiers) {

  // Dereference Min/Max. Value Constants
  const min = CONFIG.quiz.speed.min;
  const max = CONFIG.quiz.speed.max;

  // Mon data
  let mons = {
    player: null,
    opponent: null
  }

  // Player Mons (Mons with no usage)
  const playerMons = tiers.filter((x) => x.usage === null);
  mons.player = sampleArray(playerMons);

  // Opponent Mons (Mons with usage)
  const oppMons = tiers.filter((x) => {
    // Filter out player mons / mons with the same species
    if (x.usage === null || mons.player.species === x.species)
      return false;

    // Get the absolute difference between the speeds
    const diff = Math.abs(mons.player.stat - x.stat);

    // Less than min, or greater than max
    if (diff <= min || diff >= max)
      return false;

    // Valid filter
    return true;
  });

  // Sample a random mon from the remainder
  mons.opponent = sampleArray(oppMons);

  // Return mon data
  return mons
}

function generatePlayerAttackQuestion(table) {
  // Get the main table for the pokemon
  const tbody = document.getElementById('tbody-pkmn-main');

  const mons = selectTableMons(table, false);
  
  // Update the quiz mons
  document.quiz.mons = mons;

  // Dereference the species data
  const playerSpecies = mons.player.name.name;
  const oppSpecies = mons.opponent.pokemon.name;

  // Opposing Pokemon's hp stat
  const hp = mons.opponent.pokemon.stats.hp;

  // Search for attacks which meet the damage filters
  let filteredAttacks = mons.opponent.attacking.filter((x) => {
    // Attack damage range
    const range = x.data.range;

    // Get the min/max atk damage (as %)
    const min = getDamagePercentage(range.at(0), hp);
    const max = getDamagePercentage(range.at(range.length-1), hp);

    // Include if within requirements, exclude otherwise
    return ((min >= CONFIG.quiz.damage.min) && (max <= CONFIG.quiz.damage.max));
  });

  // No matching attacks found
  if (filteredAttacks.length === 0) {
    // Include the best attack only
    filteredAttacks = [mons.opponent.attacking.at(0)];
  }

  // Sample random index from filtered attacks
  const attacking = sampleArray(filteredAttacks);
  const fullDesc = attacking.fullDesc;

  // Get the start of the desc before the actual calc
  const startDesc = fullDesc.split(':').at(0);

  // For generating possible answers
  const range = attacking.data.range;

  // Get the list of available answers
  const answers = getAttackAnswers(range, hp);

  // Question Header
  tbody.innerHTML = `
  <tr>
    <th class='text-center align-middle' colspan=3>
      Player (Attacker)
    </th>
    <th class='text-center align-middle'>
      VS.
    </th>
    <th class='text-center align-middle' colspan=3>
      Opponent (Defender)
    </th>
  </tr>
  <tr>
    <td>
      <!-- Padding -->
    </td>
    ${getSpriteString(sanitiseString(playerSpecies), null)}
    <th class='text-center' id='quiz-correct' colspan=3>
      <span classList='text-success'>${getQuizStats()}</span>
    </th>
    ${getSpriteString(sanitiseString(oppSpecies), null)}
    <td>
      <!-- Padding -->
    </td>
  </tr>
  <tr id='row-question'>
    <th class='text-center' colspan=7>
      ${startDesc}:
    </th>
  </tr>
  <tr id='row-answer' hidden>
    <th class='text-center' colspan=7>
      ${fullDesc}
    </th>
  </tr>
  <tr id='row-options'>
    <th class='text-center' colspan=3>
      ${getAttackAnswerButton(answers.at(0))}
    </th>
    <th class='text-center' colspan=1>
      ${getAttackAnswerButton(answers.at(1))}
    </th>
    <th class='text-center' colspan=3>
      ${getAttackAnswerButton(answers.at(2))}
    </th>
  </tr>
  <tr id='row-next' hidden>
    <th class='text-center align-middle' colspan=7>
      <button type="button" class="btn btn-secondary" onClick=update()>
        Next Question
      </button>
    </th>
  </tr>
  `;
}

function getDamagePercentage(damage, hp) {
  return Math.floor(((damage / hp) * 100) * 10) / 10;
}

function getAttackAnswerButton(answer) {
  // Calculate the min/max. values (as %)
  const min = getDamagePercentage(answer.range.at(0), answer.hp).toFixed(1);
  const max = getDamagePercentage(answer.range.at(1), answer.hp).toFixed(1);

  return `
    <button class='btn btn-secondary' onclick='submitDamageAnswer(${answer.correct})'>
      ${min}% - ${max}%
    </button>
  `; 
}

function getAttackAnswers(range, hp) {
  // List of possible answers
  const answers = [
    { range: range, hp: hp, correct: true }
  ];

  // Add two more options
  for (let i = 0; i < 2; i++) {
    // Randomly select where to add the new answer
    let lower = Boolean((Math.random() < 0.5));

    // Add to start
    if (lower) {
      // Dereference answer data
      const answer = answers[0];
      const range = answer.range;

      // Get the difference within the range
      const diff = range.at(1) - range.at(0);

      // Min. damage higher than 0
      if ((range.at(0) - (diff)) > 0) {
        answers.unshift({
          range: [range.at(0) - diff, range.at(0)], 
          hp: hp, correct: (diff === 0)
        });
      } 
      else // Min. damage less than 0
      {
        // Pick higher instead
        lower = false;
      }
    } 
    else // Add to end
    {
      // Dereference answer data
      const answer = answers[answers.length-1];
      const range = answer.range;

      // Get the difference within the range
      const diff = range.at(1) - range.at(0);

      answers.push({
        range: [range.at(1), range.at(1) + diff],
        hp: hp, correct: (diff === 0)
      });
    }
  }

  return answers;
}

function generateOpponentAttackQuestion(table) {
  // Get the main table for the pokemon
  const tbody = document.getElementById('tbody-pkmn-main');

  const mons = selectTableMons(table, true);

  // Update the quiz mons
  document.quiz.mons = mons;

  // Dereference the species data
  const playerSpecies = mons.player.name.name;
  const oppSpecies = mons.opponent.pokemon.name;

  // Player Pokemon's hp stat
  const hp = mons.player.stats.hp;

  // Search for attacks which meet the damage filters
  let filteredAttacks = mons.opponent.defending.filter((x) => {
    // Attack damage range
    const range = x.data.range;

    // Get the min/max atk damage (as %)
    const min = getDamagePercentage(range.at(0), hp);
    const max = getDamagePercentage(range.at(range.length-1), hp);

    // Include if within requirements, exclude otherwise
    return ((min >= CONFIG.quiz.damage.min) && (max <= CONFIG.quiz.damage.max));
  });

  // No matching attacks found
  if (filteredAttacks.length === 0) {
    // Include the best attack only
    filteredAttacks = [mons.opponent.defending.at(0)];
  }

  // Sample random index from 'defending'
  const defending = sampleArray(filteredAttacks);
  const fullDesc = defending.fullDesc;

  // Get the start of the desc before the actual calc
  const startDesc = fullDesc.split(':').at(0);

  // For generating possible answers
  const range = defending.data.range;

  // Get the list of available answers
  const answers = getAttackAnswers(range, hp);

  // Question Header
  tbody.innerHTML = `
  <tr>
    <th class='text-center align-middle' colspan=3>
      Opponent (Attacker)
    </th>
    <th class='text-center align-middle'>
      VS.
    </th>
    <th class='text-center align-middle' colspan=3>
      Player (Defender)
    </th>
  </tr>
  <tr>
    <td>
      <!-- Padding -->
    </td>
    ${getSpriteString(sanitiseString(oppSpecies), null)}
    <th class='text-center' id='quiz-correct' colspan=3>
      <span classList='text-success'>${getQuizStats()}</span>
    </th>
    ${getSpriteString(sanitiseString(playerSpecies), null)}
    <td>
      <!-- Padding -->
    </td>
  </tr>
  <tr id='row-question'>
    <th class='text-center' colspan=7>
      ${startDesc}:
    </th>
  </tr>
  <tr id='row-answer' hidden>
    <th class='text-center' colspan=7>
      ${fullDesc}
    </th>
  </tr>
  <tr id='row-options'>
    <th class='text-center' colspan=3>
      ${getAttackAnswerButton(answers.at(0))}
    </th>
    <th class='text-center'>
      ${getAttackAnswerButton(answers.at(1))}
    </th>
    <th class='text-center' colspan=3>
      ${getAttackAnswerButton(answers.at(2))}
    </th>
  </tr>
  <tr id='row-next' hidden>
    <th class='text-center align-middle' colspan=7>
      <button type="button" class="btn btn-secondary" onClick=update()>
        Next Question
      </button>
    </th>
  </tr>
  `;
}

function updateAnswerDisplay(answer) {
  // Get the options row
  const options = document.getElementById('row-options');
  // Hide the answer div
  options.hidden = true;

  // Correct / incorrect display div
  const correct = document.getElementById('quiz-correct');

  // Correct answer
  if (answer === true) {
    correct.innerHTML = `
    <span class="text-success">
      Correct!
    </span>
    `;
  } else {
    correct.innerHTML = `
    <span class="text-danger">
      Incorrect!
    </span>
    `;
  }

  // Add the quiz stats to the form
  correct.innerHTML += getQuizStats();
}

function submitDamageAnswer(answer) {
  // Update quiz stats
  updateQuizStats(answer);

  // Update answer display
  updateAnswerDisplay(answer);

  // Hide the question row, show the answer row
  const rowQuestion = document.getElementById('row-question');
  rowQuestion.hidden = true;
  const rowAnswer = document.getElementById('row-answer');
  rowAnswer.hidden = false;

  // Show the 'next question' button
  const rowNext = document.getElementById('row-next');
  rowNext.hidden = false;
}

function submitSpeedAnswer(answer) {

  // Update quiz stats
  updateQuizStats(answer);

  // Update answer display
  updateAnswerDisplay(answer);

  // Get the current quiz mons
  const mons = document.quiz.mons;
  if (mons) {
    const playerStat = mons.player.stat;
    const oppStat = mons.opponent.stat;

    // Dereference player and opponent speed stat columns
    const playerStatCol = document.getElementById('quiz-player-speed');
    const oppStatCol = document.getElementById('quiz-opponent-speed');

    // Update the values to the raw stat
    playerStatCol.innerHTML = `${playerStat} (Base: ${mons.player.base})`;
    oppStatCol.innerHTML = `${oppStat} (Base: ${mons.opponent.base})`;

    // Player stats are higher
    if (playerStat > oppStat) {
      playerStatCol.classList.add('text-success');
      oppStatCol.classList.add('text-danger');
      // Both stats are equal
    } else if (playerStat === oppStat) {
      playerStatCol.classList.add('text-warning');
      oppStatCol.classList.add('text-warning');
      // Player stats are lower
    } else {
      playerStatCol.classList.add('text-danger');
      oppStatCol.classList.add('text-success');
    }
  }

  // Add 'next question' button
  const question = document.getElementById('quiz-question');
  question.innerHTML = '<button type="button" class="btn btn-secondary" onClick=update()>Next Question</button>';
}

function generateSpeedQuestion(tiers) {
  // Get the main table for the pokemon
  const tbody = document.getElementById('tbody-pkmn-main');

  const mons = selectTierMons(tiers);

  // Update the quiz mons
  document.quiz.mons = mons;

  const playerSpecies = mons.player.species;
  const oppSpecies = mons.opponent.species;

  const playerStat = mons.player.stat;
  const oppStat = mons.opponent.stat;

  // Player modifier
  let playerMod = null;
  if (mons.player.mod) {
    playerMod = itemString(mons.player.mod);
  }

  // Opponent modifier
  let oppMod = null;
  if (mons.opponent.mod) {
    oppMod = itemString(mons.opponent.mod);
  }

  // Question Header
  tbody.innerHTML = `
  <tr>
    <th class='text-center align-middle' colspan=3>
      Player Speed
    </th>
    <th class='text-center align-middle'>
      VS.
    </th>
    <th class='text-center align-middle' colspan=3>
      Opponent Speed
    </th>
  </tr>
  <tr>
    <td colspan>
      <!-- Padding -->
    </td>
    ${getSpriteString(sanitiseString(playerSpecies), playerMod)}
    <th id='quiz-correct' colspan=3>
      <span classList='text-success'>${getQuizStats()}</span>
    </th>
    ${getSpriteString(sanitiseString(oppSpecies), oppMod)}
    <td>
      <!-- Padding -->
    </td>
  </tr>
  <tr>
    <th id='quiz-player-speed' class='text-center align-middle' colspan=3>
      ${getSpeedStr(mons.player)}
    </th>
    <th id='quiz-question' colspan>
      Which is faster?
    </th>
    <th  id='quiz-opponent-speed' class='text-center align-middle' colspan=3>
      ${getSpeedStr(mons.opponent)} (${Math.floor(mons.opponent.usage)}%)
    </th>
  </tr>
  <tr id='row-options'>
    <th colspan=3>
      <button type='button' class="btn btn-success" onClick=submitSpeedAnswer(${playerStat > oppStat})>${playerSpecies}</button>
    </th>
    <th>
      <button type='button' class="btn btn-secondary" onClick=submitSpeedAnswer(${playerStat === oppStat})>Speed Tie</button>
    </th>
    <th colspan=3>
      <button type='button' class="btn btn-danger" onClick=submitSpeedAnswer(${playerStat < oppStat})>${oppSpecies}</button>
    </th>
  </tr>
  `;
}

function populateQuiz(table, tiers, format, info, sets, level) {

  // Get quiz config from page
  const config = getQuizConfig();

  // List of allowed questions
  const questionTypes = [];

  // Check allowed question types

  // Player Damage
  if (config.includePlayerDmg)
    questionTypes.push(0);

  // Opponent Damage
  if (config.includeOppDmg)
    questionTypes.push(1);

  // Speed Difference
  if (config.includeSpeedComp)
    questionTypes.push(2);

  // Select a random question type
  const questionType = sampleArray(questionTypes);

  // Switch on question type
  switch (questionType) {
    case 0: { // player -> opp atk dmg
      generatePlayerAttackQuestion(table, format, info, sets, level);
    }; break;
    case 1: { // opp -> player atk dmg
      generateOpponentAttackQuestion(table, format, info, sets, level);
    }; break;
    case 2: { // player speed > opp speed?
      generateSpeedQuestion(tiers);
    }; break;
  }
}
