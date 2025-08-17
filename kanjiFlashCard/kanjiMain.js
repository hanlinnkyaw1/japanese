// Synchronize all toggle buttons
function synchronizeToggleButtons(isStudyMode) {
  document.querySelectorAll('.mode-toggle-btn').forEach((toggleBtn) => {
    const toggleCircle = toggleBtn.querySelector('.toggle-circle');
    const modeLabel = toggleBtn.parentElement.querySelector('.mode-label');

    // Update the toggle button state
    toggleBtn.setAttribute('aria-pressed', String(isStudyMode));

    if (isStudyMode) {
      // Study Mode
      toggleCircle.classList.remove('translate-x-0');
      toggleCircle.classList.add('translate-x-6');
      toggleBtn.classList.remove('bg-gray-100');
      toggleBtn.classList.add('bg-blue-600');
      if (modeLabel) modeLabel.textContent = 'Flash Card Mode';
    } else {
      // Flashcard Mode
      toggleCircle.classList.remove('translate-x-6');
      toggleCircle.classList.add('translate-x-0');
      toggleBtn.classList.remove('bg-blue-600');
      toggleBtn.classList.add('bg-gray-100');
      if (modeLabel) modeLabel.textContent = 'Study Mode';
    }
  });
}

// Toggle mode button logic
document.querySelectorAll('.mode-toggle-btn').forEach((toggleBtn) => {
  toggleBtn.addEventListener('click', () => {
    const isOn = toggleBtn.getAttribute('aria-pressed') === 'true';
    const nowOn = !isOn;

    // Synchronize all toggle buttons
    synchronizeToggleButtons(nowOn);

    // Show/hide the appropriate mode
    if (nowOn) {
      // Show Study Mode, hide Flashcard Mode
      document.getElementById('study-mode').classList.remove('hidden');
      document.querySelector('.main-flash-container').style.display = 'none';
    } else {
      // Show Flashcard Mode, hide Study Mode
      document.getElementById('study-mode').classList.add('hidden');
      document.querySelector('.main-flash-container').style.display = 'flex';
    }
  });
});

   

let kanjiData = [];
let aurl

const flashcardContainer = document.getElementById("flashcard-container");
document
  .getElementById("level-buttons")
  .addEventListener("click", async (e) => {
    if (e.target.dataset.level) {
      const url = e.target.dataset.level;
      const jurl = url + ".json";
      aurl = jurl.toString();
      loadKanji(aurl);
      container.innerHTML = `
                <div class="bg-white rounded-xl p-8 shadow-sm text-center">
                    <div class="text-4xl mb-4">⏳</div>
                    <div class="text-gray-600">Loading vocabulary...</div>
                </div>
            `;
    }
  });

const choosePage = document.querySelector(".choose-page");
const mainContainer = document.querySelector(".main-flash-container");
mainContainer.style.display = "none";
const container = document.getElementById("flashcard-container");
const prevBtn = document.getElementById("prev-card-btn");
const nextBtn = document.getElementById("next-card-btn");

let currentIndex = 0;

function parseExample(example) {
  const parts = [];
  const regex = /(.*?)\s*\((.*?)\)/g;
  let match,
    lastIndex = 0;

  while ((match = regex.exec(example)) !== null) {
    if (match.index > lastIndex) {
      parts.push({
        type: "text",
        value: example.substring(lastIndex, match.index),
      });
    }
    parts.push({ type: "furigana", kanji: match[1], furigana: match[2] });
    lastIndex = regex.lastIndex;
  }

  if (lastIndex < example.length) {
    parts.push({ type: "text", value: example.substring(lastIndex) });
  }

  return parts;
}


function renderCard(data) {
  mainContainer.style.display = "flex";
  const parsedExamples = data.examples.map(parseExample);

  container.innerHTML = `
        <div id="card" class="flashcard"  id="flash-mode">
          <div class="card-face front">
            <div class="text-8xl font-extrabold mb-4">${data.kanji}</div>
            <p class="inline-block cursor-pointer text-lg font-semibold text-slate-400 mt-10 hover:text-teal-600 transition duration-300">
              ➤ Click to Show
            </p>
          </div>
          
          <div class="card-face back">
            <div class="text-xl font-semibold text-gray-700 mb-2">音読み: ${
              data.onyomi
            }</div>
            <div class="text-xl font-semibold text-gray-700 mb-4">訓読み: ${
              data.kunyomi
            }</div>
            
            <div class="w-full px-4 text-center">
            <p class="text-lg font-semibold text-gray-700 mb-1">Meaning</p>
            <div class="font-serif text-xl text-blue-700 mb-1">${
              data.meaning
            }</div>
            <div class="text-sm text-green-700 mb-6">${data.meaningMM}</div>
          </div>
            
            <div class="text-sm text-gray-700 w-full px-2">
              ${parsedExamples
                .map(
                  (parts) => `
                <div class="flex justify-center flex-wrap mb-2">
                  ${parts
                    .map((part) => {
                      if (part.type === "furigana") {
                        return `
                        <div class="furigana-group">
                          <span>${part.furigana}</span>
                          <strong>${part.kanji}</strong>
                        </div>
                      `;
                      } else {
                        return `<strong class="mx-1 text-gray-800">${part.value}</strong>`;
                      }
                    })
                    .join("")}
                </div>
              `
                )
                .join("")}
            </div>
          </div>
        </div>
      `;

  const card = document.getElementById("card");
  card.addEventListener("click", () => {
    card.classList.toggle("flipped");
  });
}

function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
}

async function loadKanji(e) {
  mainContainer.style.display = "flex"; // Show the container
  choosePage.style.display = "none"; // Hide the choose page
  const res = await fetch(e);
  kanjiData = await res.json();
  renderKanjiCards(kanjiData);
  
  shuffleArray(kanjiData); // Shuffle the entire list
  renderCard(kanjiData[0]); // Display the first card from shuffled list
}

prevBtn.addEventListener("click", () => {
  if (currentIndex > 0) currentIndex--;
  else currentIndex = kanjiData.length - 1;
  renderCard(kanjiData[currentIndex]);
});

nextBtn.addEventListener("click", () => {
  currentIndex = (currentIndex + 1) % kanjiData.length;
  renderCard(kanjiData[currentIndex]);
});

//Study mode
function createKanjiCard({ kanji, onyomi, kunyomi, meaning, meaningMM, examples = [] }) {
const examplesHTML = examples.map(ex => `
<div class="example-item p-2 rounded border border-gray-100">
  <span class="kanji-font text-sm font-medium text-gray-800">${ex}</span>
</div>
`).join('');

return `
<div class="kanji-card bg-white rounded-lg p-4 mb-4 shadow-sm">
  <header class="flex items-start justify-between mb-3">
    <div class="text-4xl kanji-font text-gray-800 font-medium">${kanji}</div>
    <div class="flex flex-wrap gap-1">
      <span class="reading-badge bg-blue-500 text-white px-2 py-1 rounded-full text-xs font-medium">音: ${onyomi}</span>
      <span class="meaning-badge bg-green-500 text-white px-2 py-1 rounded-full text-xs font-medium">訓: ${kunyomi}</span>
    </div>
  </header>
  
  <section class="grid md:grid-cols-2 gap-3 mb-3">
    <div>
      <h4 class="font-medium text-gray-700 mb-1 text-sm">English</h4>
      <p class="text-gray-600 bg-gray-50 p-2 rounded text-sm">${meaning}</p>
    </div>
    <div>
      <h4 class="font-medium text-gray-700 mb-1 text-sm">Myanmar</h4>
      <p class="text-gray-600 bg-gray-50 p-2 rounded text-sm kanji-font">${meaningMM}</p>
    </div>
  </section>
  
  <section>
    <h4 class="font-medium text-gray-700 mb-2 text-sm">Examples</h4>
    <div class="space-y-1">${examplesHTML}</div>
  </section>
</div>
`;
}

function renderKanjiCards(data) {
const container = document.getElementById("contentStudy");
data.forEach(item => container.innerHTML += createKanjiCard(item));
}

// Mobile menu toggle
document.addEventListener("DOMContentLoaded", () => {
  const toggleBtn = document.getElementById("menu-toggle");
  const mobileMenu = document.getElementById("mobile-menu");

  toggleBtn.addEventListener("click", () => {
    mobileMenu.classList.toggle("hidden");
  });
});
