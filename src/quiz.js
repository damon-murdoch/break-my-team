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
      <p class='text-warning'>
        Streak: ${document.quiz.streak}
      </p>
      <p class='text-secondary'>
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

  // Placeholder
  let filtered = null;
  if (defending) {
    filtered = oppKeys.filter(x => {
      return (
        opponents[x].at(0) !== undefined && 
        opponents[x].at(0).defending.length > 0
      )
    });
  } else {
    filtered = oppKeys.filter(x => {
      return (
        opponents[x].at(0) !== undefined && 
        opponents[x].at(0).attacking.length > 0
      )
    });
  }

  // Sample a random opponent mon from the table
  const oppMonName = sampleArray(filtered);
  mons.opponent = opponents[oppMonName].at(0);

  // Return mon data
  return mons
}

function selectTierMons(tiers, min = 20) {

  // Mon data
  let mons = {
    player: null,
    opponent: null
  }

  // Player Mons (Mons with no usage)
  const playerMons = tiers.filter((x) => x.usage === null);
  mons.player = sampleArray(playerMons);

  // Opponent Mons (Mons with usage)
  const oppMons = tiers.filter((x) => x.usage !== null && (
    // Exclude mons which have a greater than 'min' stat difference on either side
    (mons.player.species !== x.species) && ((mons.player.stat + min) >= x.stat) && ((mons.player.stat - min) <= x.stat)
  ));
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

  // Sample random index from 'attacking'
  const attacking = sampleArray(mons.opponent.attacking);
  const fullDesc = attacking.fullDesc;

  // Get the start of the desc before the actual calc
  const startDesc = fullDesc.split(':').at(0);

  // For generating possible answers
  const range = attacking.data.range;
  const hp = mons.opponent.pokemon.stats.hp;

  // Get the list of available answers
  const answers = getAttackAnswers(range, hp);

  // Question Header
  tbody.innerHTML = `
  <tr>
    <th class='align-middle' colspan=3>
      Player (Attacker)
    </th>
    <th class='align-middle'>
      VS.
    </th>
    <th class='align-middle' colspan=3>
      Opponent (Defender)
    </th>
  </tr>
  <tr>
    <th>
    </th>
    ${getSpriteString(sanitiseString(playerSpecies), null)}
    <th id='quiz-correct' colspan=3>
      <span classList='text-success'>${getQuizStats()}</span>
    </th>
    ${getSpriteString(sanitiseString(oppSpecies), null)}
    <th>
    </th>
  </tr>
  <tr id='row-question'>
    <th colspan=7>
      ${startDesc}:
    </th>
  </tr>
  <tr id='row-answer' hidden>
    <th colspan=7>
      ${fullDesc}
    </th>
  </tr>
  <tr id='row-options'>
    <th colspan=3>
      ${getAttackAnswerButton(answers.at(0))}
    </th>
    <th>
      ${getAttackAnswerButton(answers.at(1))}
    </th>
    <th colspan=3>
      ${getAttackAnswerButton(answers.at(2))}
    </th>
  </tr>
  <tr id='row-next' hidden>
    <th class='align-middle' colspan=7>
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

  // Sample random index from 'defending'
  const defending = sampleArray(mons.opponent.defending);
  const fullDesc = defending.fullDesc;

  // Get the start of the desc before the actual calc
  const startDesc = fullDesc.split(':').at(0);

  // For generating possible answers
  const range = defending.data.range;
  const hp = mons.player.stats.hp;

  // Get the list of available answers
  const answers = getAttackAnswers(range, hp);

  // Question Header
  tbody.innerHTML = `
  <tr>
    <th class='align-middle' colspan=3>
      Opponent (Attacker)
    </th>
    <th class='align-middle'>
      VS.
    </th>
    <th class='align-middle' colspan=3>
      Player (Defender)
    </th>
  </tr>
  <tr>
    <th>
    </th>
    ${getSpriteString(sanitiseString(oppSpecies), null)}
    <th id='quiz-correct' colspan=3>
      <span classList='text-success'>${getQuizStats()}</span>
    </th>
    ${getSpriteString(sanitiseString(playerSpecies), null)}
    <th>
    </th>
  </tr>
  <tr id='row-question'>
    <th colspan=7>
      ${startDesc}:
    </th>
  </tr>
  <tr id='row-answer' hidden>
    <th colspan=7>
      ${fullDesc}
    </th>
  </tr>
  <tr id='row-options'>
    <th colspan=3>
      ${getAttackAnswerButton(answers.at(0))}
    </th>
    <th>
      ${getAttackAnswerButton(answers.at(1))}
    </th>
    <th colspan=3>
      ${getAttackAnswerButton(answers.at(2))}
    </th>
  </tr>
  <tr id='row-next' hidden>
    <th class='align-middle' colspan=7>
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
    <th class='align-middle' colspan=3>
      Player Speed
    </th>
    <th class='align-middle'>
      VS.
    </th>
    <th class='align-middle' colspan=3>
      Opponent Speed
    </th>
  </tr>
  <tr>
    <th>
    </th>
    ${getSpriteString(sanitiseString(playerSpecies), playerMod)}
    <th id='quiz-correct' colspan=3>
      <span classList='text-success'>${getQuizStats()}</span>
    </th>
    ${getSpriteString(sanitiseString(oppSpecies), oppMod)}
    <th>
    </th>
  </tr>
  <tr>
    <th id='quiz-player-speed' class='align-middle' colspan=3>
      ${getSpeedStr(mons.player)}
    </th>
    <th id='quiz-question'>
      Which is faster?
    </th>
    <th  id='quiz-opponent-speed' class='align-middle' colspan=3>
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