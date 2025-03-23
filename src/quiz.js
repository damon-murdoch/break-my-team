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

function updateQuizStats(answer=true) {
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

function selectTableMons(table) {
  
  // Mon data
  let mons = {
    player: null, 
    opponent: null
  }

  // Sample a random player mon from the table
  const playerMonName = sampleArray(Object.keys(table));
  mons.player = table[playerMonName];

  // Sample a random opponent mon from the table
  const oppMonName = sampleArray(Object.keys(mons.player.opponents));
  mons.opponent = mons.player.opponents[oppMonName];

  // Return mon data
  return mons
}

function selectTierMons(tiers, min=20) {

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

function generatePlayerAttackQuestion(table, format, info, sets, level) { 
  // Get the main table for the pokemon
  const tbody = document.getElementById('tbody-pkmn-main');

  const mons = selectTableMons(table);
  console.log(mons);

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

  </tr>
  `;
}

function generateOpponentAttackQuestion(table, format, info, sets, level) { 
  // Get the main table for the pokemon
  const tbody = document.getElementById('tbody-pkmn-main');

  const mons = selectTableMons(table);
  console.log(mons);

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

  </tr>
  `;
}

function submitSpeedAnswer(answer) {

  // Update quiz stats
  updateQuizStats(answer);

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

function generateSpeedQuestion(tiers, format, info, sets, level) {
  // Get the main table for the pokemon
  const tbody = document.getElementById('tbody-pkmn-main');

  const mons = selectTierMons(tiers);

  // Update the quiz mons
  document.quiz.mons = mons;

  const playerSpecies = mons.player.species;
  const oppSpecies = mons.opponent.species;

  const playerStat = mons.player.stat;
  const oppStat = mons.opponent.stat;

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
    ${getSpriteString(sanitiseString(playerSpecies), mons.mod)}
    <th id='quiz-correct' colspan=3>
      <span classList='text-success'>${getQuizStats()}</span>
    </th>
    ${getSpriteString(sanitiseString(oppSpecies), mons.mod)}
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