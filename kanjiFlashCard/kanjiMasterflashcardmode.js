
    const container = document.getElementById('flashcard-container');
    const prevBtn = document.getElementById('prev-card-btn');
    const nextBtn = document.getElementById('next-card-btn');
    const chapterSelect = document.getElementById('chapterSelect');

    let allKanji = [];
    let filteredKanji = [];
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
      if (!data) {
        container.innerHTML = '<div class="text-gray-600 text-center">No kanji found for this lesson.</div>';
        return;
      }

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
            <div class="text-xl font-semibold text-gray-700 mb-2">音読み: ${data.onyomi || '-'}</div>
            <div class="text-xl font-semibold text-gray-700 mb-4">訓読み: ${data.kunyomi || '-'}</div>
            <div class="w-full px-4 text-center">
              <p class="text-lg font-semibold text-gray-700 mb-1">Meaning</p>
              <div class="font-serif text-xl text-blue-700 mb-1">${data.meaning || '-'}</div>
              <div class="text-sm text-green-700 mb-6">${data.meaningMM || '-'}</div>
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

      // Add flip event
      document.getElementById('card').addEventListener('click', () => {
        document.getElementById('card').classList.toggle('flipped');
      });
    }

    async function loadKanji() {
      try {
        const res = await fetch('n1kanjiMaster.json');
        allKanji = await res.json();
      } catch (e) {
        console.error('Failed to load kanji JSON:', e);
        container.innerHTML = '<p class="text-center text-red-600">Failed to load kanji data.</p>';
      }
    }

    function updateFilteredKanji(chapter) {
      const chNum = Number(chapter);
      filteredKanji = allKanji.filter(k => Number(k.chapter) === chNum);
      console.log(`Filtering chapter: ${chNum}, found: ${filteredKanji.length}`, filteredKanji);
      currentIndex = 0;

      if (filteredKanji.length === 0) {
        container.innerHTML = '<p class="text-center text-gray-600">No kanji found for this chapter.</p>';
        return;
      }
      renderCard(filteredKanji[0]);
    }

    prevBtn.addEventListener('click', () => {
      if (filteredKanji.length === 0) return;
      currentIndex = (currentIndex - 1 + filteredKanji.length) % filteredKanji.length;
      renderCard(filteredKanji[currentIndex]);
    });

    nextBtn.addEventListener('click', () => {
      if (filteredKanji.length === 0) return;
      currentIndex = (currentIndex + 1) % filteredKanji.length;
      renderCard(filteredKanji[currentIndex]);
    });

    chapterSelect.addEventListener('change', (e) => {
      if (!allKanji.length) {
        alert('Data is still loading, please wait a moment and try again.');
        e.target.value = "";
        return;
      }

      if (!e.target.value) {
        container.innerHTML = '<p class="text-center text-gray-600">Please select a lesson.</p>';
        filteredKanji = [];
        return;
      }

      updateFilteredKanji(e.target.value);
    });

    loadKanji();
  