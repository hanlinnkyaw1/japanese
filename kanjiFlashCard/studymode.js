let kanjiData = []; 
let chapters = {}; 
let currentChapterIndex = 0; 
let chapterKeys = [];

// Toggle mode button logic
const toggleBtn = document.getElementById('mode-toggle-btn');
const toggleCircle = document.getElementById('toggle-circle');
const modeLabel = document.getElementById('mode-label');


const studyMode = document.getElementById('study-mode');
const flashCardMode = document.getElementById('flash-mode');

toggleBtn.addEventListener('click', () => {
  const isOn = toggleBtn.getAttribute('aria-pressed') === 'true';
  const nowOn = !isOn;

  toggleBtn.setAttribute('aria-pressed', String(nowOn));

  if (nowOn) {
    // Turn ON study mode
    toggleCircle.classList.remove('translate-x-0');
    toggleCircle.classList.add('translate-x-6');
    toggleBtn.classList.remove('bg-gray-100');
    toggleBtn.classList.add('bg-blue-600');

    if(studyMode) studyMode.classList.remove('hidden');
    if(flashCardMode) flashCardMode.classList.add('hidden');

    modeLabel.textContent = 'Study Mode';
  } else {
    toggleCircle.classList.remove('translate-x-6');
    toggleCircle.classList.add('translate-x-0');
    toggleBtn.classList.remove('bg-blue-600');
    toggleBtn.classList.add('bg-gray-100');

    if(flashCardMode) flashCardMode.classList.remove('hidden');
    if(studyMode) studyMode.classList.add('hidden');

    modeLabel.textContent = 'Flashcard Mode';
  }
});

// Create kanji card HTML
function createKanjiCard(kanjiItem) {
  const examplesHTML = kanjiItem.examples.map(example => `
    <div class="example-item p-2 rounded border border-gray-100">
      <span class="kanji-font text-sm font-medium text-gray-800">${example}</span>
    </div>
  `).join('');

  return `
    <div class="kanji-card bg-white rounded-lg p-4 mb-4 shadow-sm">
      <div class="flex items-start justify-between mb-3">
        <div class="text-4xl kanji-font text-gray-800 font-medium">${kanjiItem.kanji}</div>
        <div class="flex flex-wrap gap-1">
          <span class="reading-badge text-white px-2 py-1 rounded-full text-xs font-medium">音: ${kanjiItem.onyomi}</span>
          <span class="meaning-badge text-white px-2 py-1 rounded-full text-xs font-medium">訓: ${kanjiItem.kunyomi}</span>
        </div>
      </div>

      <div class="grid md:grid-cols-2 gap-3 mb-3">
        <div>
          <h4 class="font-medium text-gray-700 mb-1 text-sm">English</h4>
          <p class="text-gray-600 bg-gray-50 p-2 rounded text-sm">${kanjiItem.meaning}</p>
        </div>
        <div>
          <h4 class="font-medium text-gray-700 mb-1 text-sm">Myanmar</h4>
          <p class="text-gray-600 bg-gray-50 p-2 rounded text-sm kanji-font">${kanjiItem.meaningMM}</p>
        </div>
      </div>

      <div>
        <h4 class="font-medium text-gray-700 mb-2 text-sm">Examples</h4>
        <div class="space-y-1">${examplesHTML}</div>
      </div>
    </div>
  `;
}

// Group kanji by chapter
function groupByChapter(kanjiArray) {
  const chapters = {};
  kanjiArray.forEach(kanji => {
    const chapter = kanji.chapter;
    if (!chapters[chapter]) {
      chapters[chapter] = [];
    }
    chapters[chapter].push(kanji);
  });
  return chapters;
}

// Create HTML for one chapter
function createChapter(chapterNumber, kanjiList) {
  const kanjiCardsHTML = kanjiList.map(kanjiItem => createKanjiCard(kanjiItem)).join('');
  return `
    <div class="mb-8">
      <div class="chapter-header rounded-lg p-4 mb-4 text-white">
        <h2 class="text-xl font-bold kanji-font">Chapter ${chapterNumber}</h2>
        <p class="text-blue-100 mt-1 text-sm">${kanjiList.length} kanji</p>
      </div>
      ${kanjiCardsHTML}
    </div>
  `;
}

// Render next chapter when scrolling
function renderNextChapter() {
  if (currentChapterIndex >= chapterKeys.length) return;

  const chapterNumber = chapterKeys[currentChapterIndex];
  const kanjiList = chapters[chapterNumber];
  const chapterHTML = createChapter(chapterNumber, kanjiList);

  const contentDiv = document.getElementById('content');
  const wrapper = document.createElement('div');
  wrapper.innerHTML = chapterHTML;
  contentDiv.appendChild(wrapper);

  currentChapterIndex++;
  updateProgressBar(); // Update progress
}

// Update progress
function updateProgressBar() {
  const totalKanji = kanjiData.length;
  const learnedKanji = Math.floor(totalKanji * 0.35); // Sample progress

  const progressBar = document.getElementById('progress-bar');
  const progressText = document.getElementById('progress-text');
  const progressDiv = document.getElementById('progress');

  progressBar.style.width = `${(learnedKanji / totalKanji) * 100}%`;
  progressText.textContent = `${learnedKanji} of ${totalKanji} kanji learned`;

  document.getElementById('loading').classList.add('hidden');
  document.getElementById('content').classList.remove('hidden');
  progressDiv.classList.remove('hidden');
}

// Lazy load trigger
window.addEventListener('scroll', () => {
  const scrollTop = window.scrollY;
  const windowHeight = window.innerHeight;
  const fullHeight = document.documentElement.scrollHeight;

  if (scrollTop + windowHeight >= fullHeight - 300) {
    renderNextChapter(); // Load one chapter at a time
  }
});

// Load kanji data
function loadKanjiData() {
  fetch('n1kanjiMaster.json')
    .then(response => response.json())
    .then(data => {
      kanjiData = data;
      chapters = groupByChapter(data);
      chapterKeys = Object.keys(chapters).sort((a, b) => parseInt(a) - parseInt(b));
      renderNextChapter(); // Start with first chapter
    })
    .catch(error => console.error('Error loading kanji data:', error));
}

// Start on DOM ready
document.addEventListener('DOMContentLoaded', function() {
  loadKanjiData();
});