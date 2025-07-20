const flashcardContainer = document.getElementById('flashcard-container');
  document.getElementById('level-buttons').addEventListener('click', async (e) => {
    if (e.target.dataset.level) {
      const url = e.target.dataset.level;
      const jurl = url + ".json";
      const aurl = jurl.toString();
     loadKanji(aurl);
    }
  });

    const choosePage = document.querySelector('.choose-page');
    const mainContainer = document.querySelector('.main-flash-container');
    mainContainer.style.display = "none";
    const container = document.getElementById('flashcard-container');
    const prevBtn = document.getElementById('prev-card-btn');
    const nextBtn = document.getElementById('next-card-btn');

    let kanjiData = [];
    let currentIndex = 0;

    function parseExample(example) {
      const parts = [];
      const regex = /(.*?)\s*\((.*?)\)/g;
      let match, lastIndex = 0;

      while ((match = regex.exec(example)) !== null) {
        if (match.index > lastIndex) {
          parts.push({ type: 'text', value: example.substring(lastIndex, match.index) });
        }
        parts.push({ type: 'furigana', kanji: match[1], furigana: match[2] });
        lastIndex = regex.lastIndex;
      }

      if (lastIndex < example.length) {
        parts.push({ type: 'text', value: example.substring(lastIndex) });
      }

      return parts;
    }

    function renderCard(data) {
      mainContainer.style.display = "flex";
      const parsedExamples = data.examples.map(parseExample);


      container.innerHTML = `
        <div id="card" class="flashcard">
          <div class="card-face front">
            <div class="text-8xl font-extrabold mb-4">${data.kanji}</div>
            <p class="inline-block cursor-pointer text-lg font-semibold text-slate-400 mt-10 hover:text-teal-600 transition duration-300">
              ➤ Click to Show
            </p>
          </div>
          
          <div class="card-face back">
            <div class="text-xl font-semibold text-gray-700 mb-2">音読み: ${data.onyomi}</div>
            <div class="text-xl font-semibold text-gray-700 mb-4">訓読み: ${data.kunyomi}</div>
            
            <div class="w-full px-4 text-center">
            <p class="text-lg font-semibold text-gray-700 mb-1">Meaning</p>
            <div class="font-serif text-xl text-blue-700 mb-1">${data.meaning}</div>
            <div class="text-sm text-green-700 mb-6">${data.meaningMM}</div>
          </div>
            
            <div class="text-sm text-gray-700 w-full px-2">
              ${parsedExamples.map(parts => `
                <div class="flex justify-center flex-wrap mb-2">
                  ${parts.map(part => {
                    if (part.type === 'furigana') {
                      return `
                        <div class="furigana-group">
                          <span>${part.furigana}</span>
                          <strong>${part.kanji}</strong>
                        </div>
                      `;
                    } else {
                      return `<strong class="mx-1 text-gray-800">${part.value}</strong>`;
                    }
                  }).join('')}
                </div>
              `).join('')}
            </div>
          </div>
        </div>
      `;

      const card = document.getElementById('card');
      card.addEventListener('click', () => {
        card.classList.toggle('flipped');
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
      
      shuffleArray(kanjiData); // Shuffle the entire list
      renderCard(kanjiData[0]); // Display the first card from shuffled list
    }

    prevBtn.addEventListener('click', () => {
      if (currentIndex > 0) currentIndex--;
      else currentIndex = kanjiData.length - 1;
      renderCard(kanjiData[currentIndex]);
    });

    nextBtn.addEventListener('click', () => {
      currentIndex = (currentIndex + 1) % kanjiData.length;
      renderCard(kanjiData[currentIndex]);
    });

   // Mobile menu toggle
document.addEventListener("DOMContentLoaded", () => {
  const toggleBtn = document.getElementById("menu-toggle");
  const mobileMenu = document.getElementById("mobile-menu");

  toggleBtn.addEventListener("click", () => {
    mobileMenu.classList.toggle("hidden");
  });
});