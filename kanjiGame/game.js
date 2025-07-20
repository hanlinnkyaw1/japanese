const kanjiDatabase = [];

const kanjiDataUrl = {
  n5: "../kanjiFlashCard/n5kanji.json",
  n4: "../kanjiFlashCard/n4kanji.json",
  n3: "../kanjiFlashCard/n3kanji.json",
  n2: "../kanjiFlashCard/n2kanji.json",
  n1: "../kanjiFlashCard/n1kanjiMaster.json"
};


let gameState = {
  score: 0,
  lives: 3,
  level: 1,
  isPlaying: false,
  currentPrompt: null,
  fallingKanji: [],
  gameSpeed: 2000,
  spawnRate: 1500,
};

let userLanguage 
let gameInterval;
let spawnInterval;


async function fetchKanjiData(url) {
  try {
    const response = await fetch(url);
    console.log("Fetching kanji data from:", url);
    if (!response.ok) { return console.error("Failed to fetch kanji data"); }
    const data = await response.json();
    const filtered = data.filter(
      (k) => k.kunyomi !== "ー"
    );
    kanjiDatabase.push(...filtered);

    // Only generate prompt after data is loaded
    generateNewPrompt(userLanguage);
  } catch (error) {
    console.error("Error fetching kanji data:", error);
  }
};


function startGame() {

  const userLevel = document.getElementById("levelSelect").value;
  const userSelecrtedUrl = kanjiDataUrl[userLevel];
  console.log("Selected URL:", userSelecrtedUrl);
   userLanguage = document.getElementById("languages").value;
  fetchKanjiData(userSelecrtedUrl);
  document.getElementById("startScreen").style.display = "none";

  gameState.isPlaying = true;
  gameState.score = 0;
  gameState.lives = 3;
  gameState.level = 1;
  gameState.fallingKanji = [];
  gameState.gameSpeed = 1800;
  gameState.spawnRate = 1500;

  updateUI();

  gameInterval = setInterval(updateGame, 50);
  spawnInterval = setInterval(spawnKanji, gameState.spawnRate);
}

function generateNewPrompt(lang) {
  const randomKanji =
    kanjiDatabase[Math.floor(Math.random() * kanjiDatabase.length)];
  const isReading = Math.random() < 0.5;
  const reading = randomKanji.kunyomi;
  const promptMeaning =
    lang !== "burmese" ? randomKanji.meaning : randomKanji.meaningMM;


  gameState.currentPrompt = {
    kanji: randomKanji.kanji,
    prompt: isReading ? reading : promptMeaning,
    type: isReading ? "reading" : "kunyomi",
  };

  document.getElementById("promptText").textContent =
    gameState.currentPrompt.prompt;
  document.getElementById(
    "promptType"
  ).textContent = `Find the ${gameState.currentPrompt.type}`;
}


function spawnKanji() {
  if (!gameState.isPlaying) return;

  const gameArea = document.getElementById("gameArea");
  const kanjiElement = document.createElement("div");
  kanjiElement.className = "kanji";


  // Mix of correct and incorrect kanji
  let kanjiData;
  if (Math.random() < 0.3) {
    // 30% chance of correct kanji
    kanjiData = kanjiDatabase.find(
      (k) => k.kanji === gameState.currentPrompt.kanji
    );
  } else {
    kanjiData = kanjiDatabase[Math.floor(Math.random() * kanjiDatabase.length)];
  }

  kanjiElement.textContent = kanjiData.kanji;
  kanjiElement.style.left = Math.random() * (gameArea.offsetWidth - 80) + "px";
  kanjiElement.style.top = "-80px";

  kanjiElement.onclick = () => handleKanjiClick(kanjiElement, kanjiData);

  gameArea.appendChild(kanjiElement);
  gameState.fallingKanji.push({
    element: kanjiElement,
    data: kanjiData,
    y: -80,
  });
}

function handleKanjiClick(element, kanjiData) {
  if (!gameState.isPlaying) return;

  const isCorrect = kanjiData.kanji === gameState.currentPrompt.kanji;

  if (isCorrect) {
    element.classList.add("correct");
    gameState.score += 10 * gameState.level;

    // Remove from falling kanji array
    gameState.fallingKanji = gameState.fallingKanji.filter(
      (k) => k.element !== element
    );

    setTimeout(() => {
      if (element.parentNode) {
        element.parentNode.removeChild(element);
      }
    }, 300);

    generateNewPrompt(userLanguage);

    // Level up every 100 points
    const newLevel = Math.floor(gameState.score / 100) + 1;
    if (newLevel > gameState.level) {
      gameState.level = newLevel;
      gameState.gameSpeed = Math.max(1000, gameState.gameSpeed - 200);
      gameState.spawnRate = Math.max(800, gameState.spawnRate - 100);

      clearInterval(spawnInterval);
      spawnInterval = setInterval(spawnKanji, gameState.spawnRate);
    }
  } else {
    element.classList.add("wrong");
    gameState.lives--;

    if (gameState.lives <= 0) {
      endGame();
      return;
    }

    setTimeout(() => {
      element.classList.remove("wrong");
    }, 500);
  }

  updateUI();
}

function updateGame() {
  if (!gameState.isPlaying) return;

  const gameArea = document.getElementById("gameArea");
  const gameAreaHeight = gameArea.offsetHeight;

  gameState.fallingKanji.forEach((kanji, index) => {
    kanji.y += 2 + gameState.level * 0.5;
    kanji.element.style.top = kanji.y + "px";

    // Check if kanji reached bottom
    if (kanji.y > gameAreaHeight) {
      // If it was the correct kanji, lose a life
      if (kanji.data.kanji === gameState.currentPrompt.kanji) {
        gameState.lives--;
        if (gameState.lives <= 0) {
          endGame();
          return;
        }
        generateNewPrompt(userLanguage);
      }

      // Remove kanji
      if (kanji.element.parentNode) {
        kanji.element.parentNode.removeChild(kanji.element);
      }
      gameState.fallingKanji.splice(index, 1);
    }
  });

  updateUI();
}

function updateUI() {
  document.getElementById("score").textContent = gameState.score;
  document.getElementById("lives").textContent = gameState.lives;
  document.getElementById("level").textContent = gameState.level;
}

function endGame() {
  gameState.isPlaying = false;
  clearInterval(gameInterval);
  clearInterval(spawnInterval);

  document.getElementById("finalScore").textContent = gameState.score;
  document.getElementById("gameOver").style.display = "block";

  // Clear all falling kanji
  gameState.fallingKanji.forEach((kanji) => {
    if (kanji.element.parentNode) {
      kanji.element.parentNode.removeChild(kanji.element);
    }
  });
  gameState.fallingKanji = [];
}

function restartGame() {
  document.getElementById("gameOver").style.display = "none";
  startGame();
}

