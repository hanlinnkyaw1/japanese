// Global State
let selectedAnswers = {};
let correctAnswers = {};
let totalQuestions = 0;
let selectedLevel = null;
let selectedTestType = null;

// DOM Elements
const containerCho = document.querySelector('#container');
const testContainer = document.querySelector("#containerTest");
const sectionsContainer = document.getElementById('sections-container');
const resultSection = document.getElementById('results');
const submitBtn = document.getElementById('submitBtn');

// --- 1. Selection Logic ---

function selectLevel(level) {
    document.querySelectorAll('[id^="level-"]').forEach(btn => {
        btn.classList.remove('border-blue-500', 'bg-blue-50');
        btn.classList.add('border-gray-200', 'bg-white');
    });

    const button = document.getElementById(`level-${level}`);
    button.classList.remove('border-gray-200', 'bg-white');
    button.classList.add('border-blue-500', 'bg-blue-50');

    selectedLevel = level;
    updateStartButton();
}

function selectTestType(type) {
    document.querySelectorAll('[id^="test_"]').forEach(btn => {
        btn.classList.remove('border-blue-500', 'bg-blue-50');
        btn.classList.add('border-gray-200', 'bg-white');
    });

    const button = document.getElementById(`test_${type}`);
    button.classList.remove('border-gray-200', 'bg-white');
    button.classList.add('border-blue-500', 'bg-blue-50');

    selectedTestType = type;
    updateStartButton();
}

function updateStartButton() {
    const startButton = document.getElementById('start-button');
    startButton.disabled = !(selectedLevel && selectedTestType);
}

// --- 2. Start Test & File Loading ---

async function startTest() {
    if (!selectedLevel || !selectedTestType) return;

    // Reset State
    selectedAnswers = {};
    correctAnswers = {};
    totalQuestions = 0;
    sectionsContainer.innerHTML = '';
    resultSection.classList.add('hidden');
    submitBtn.disabled = false;
    submitBtn.classList.remove('opacity-50', 'cursor-not-allowed');

    // Determine File Name
    let fileName = '';
    if (selectedTestType === 'vocab_grammar') {
        fileName = `${selectedLevel}_2015_7MojiGo`;
        console.log("Loading Vocab/Grammar Test:", fileName);
    } else if (selectedTestType === 'reading') {
        fileName = `${selectedLevel}_reading`;
    }

    await loadTest(fileName);
}

async function loadTest(url) {
    try {
        const res = await fetch(`quizTest/${url}.json`);
        if (!res.ok) throw new Error(`Failed to load file: ${url}.json`);
        
        const testData = await res.json();
        renderTest(testData);
    } catch (error) {
        console.error('Error loading test:', error);
        alert(`Could not load data. Ensure quizTest/${url}.json exists.`);
    }
}

// --- 3. Main Rendering Logic (Handles custom JSON structure) ---

function renderTest(data) {
    containerCho.classList.add('hidden');
    testContainer.classList.remove('hidden');

    document.getElementById('level-badge').textContent = data.level || selectedLevel;
    document.getElementById('test-date').textContent = data.date || '';

    // Combine section1, section2, and sections into one list
    let allSections = [];
    
    // Check for your custom structure (section1 and section2)
    if (data.section1) allSections = [...allSections, ...data.section1];
    if (data.section2) allSections = [...allSections, ...data.section2];
    
    // Check for standard structure (sections)
    if (data.sections) allSections = [...allSections, ...data.sections];

    // Loop through the merged list
    allSections.forEach(section => {
        // Check for Cloze/Reading types
        if (section.type === "clozeTest" || section.type === "Reading" || section.title.includes("読解")) {
            renderReadingSection(section);
        } else {
            renderVocabGrammarSection(section);
        }
    });
}

// --- 4. Render Vocabulary / Grammar ---

function renderVocabGrammarSection(section) {
    const sectionDiv = document.createElement('div');
    sectionDiv.className = 'section mb-10';

    const sectionTitle = document.createElement('h2');
    sectionTitle.className = 'text-xl font-bold mb-4 border-b pb-2 text-gray-800';
    sectionTitle.textContent = section.title;
    sectionDiv.appendChild(sectionTitle);

    section.questions.forEach((q) => {
        const questionKey = `q-${q.id}`;
        correctAnswers[questionKey] = q.answer; 
        totalQuestions++;

        const card = document.createElement('div');
        card.className = 'bg-white p-5 rounded-lg shadow-sm mb-4 border border-gray-100';
        card.dataset.key = questionKey;

        const qText = document.createElement('div');
        qText.className = 'font-medium mb-4 text-lg';
        
        let content = q.question;
        if (q.target) {
            content = content.replace(
                q.target,
                `<span class="text-blue-600 font-bold underline decoration-2">${q.target}</span>`
            );
        }
        
        qText.innerHTML = `<span class="inline-block bg-gray-200 text-gray-700 text-xs px-2 py-1 rounded mr-2 mb-1">${q.id}.</span><br>${content}`;
        card.appendChild(qText);

        const optionsDiv = document.createElement('div');
        optionsDiv.className = 'grid grid-cols-1 md:grid-cols-2 gap-3';

        q.options.forEach((opt, index) => {
            const btn = document.createElement('button');
            btn.className = 'option-button text-left p-3 border rounded-md hover:bg-blue-50 transition-all';
            
            // ADDED option-number class here to target the number prefix
            btn.innerHTML = `<span class="option-number font-bold text-gray-500 mr-2">${index + 1}.</span> ${opt}`;
            
            btn.onclick = () => selectOption(questionKey, index);
            optionsDiv.appendChild(btn);
        });

        card.appendChild(optionsDiv);
        sectionDiv.appendChild(card);
    });

    sectionsContainer.appendChild(sectionDiv);
}

// --- 5. Render Cloze / Reading ---

function renderReadingSection(section) {
    const sectionDiv = document.createElement('div');
    sectionDiv.className = 'section mb-10';

    const sectionTitle = document.createElement('h2');
    sectionTitle.className = 'text-xl font-bold mb-4 border-b pb-2 text-gray-800';
    sectionTitle.textContent = section.title;
    sectionDiv.appendChild(sectionTitle);

    section.questions.forEach((q) => {
        const passageCard = document.createElement('div');
        passageCard.className = 'bg-white p-6 rounded-lg shadow-md mb-8 border-l-4 border-blue-500';

        // Passage
        const passageText = document.createElement('div');
        passageText.className = 'leading-loose text-gray-700 whitespace-pre-wrap mb-6 text-lg font-serif';
        passageText.innerHTML = q.passage;
        passageCard.appendChild(passageText);

        // Blanks (Questions)
        if (q.blanks) {
            const blanksContainer = document.createElement('div');
            blanksContainer.className = 'space-y-6 mt-6 pt-6 border-t border-dashed';

            q.blanks.forEach((blank) => {
                const blankKey = `cloze-${q.id}-${blank.number}`;
                
                let correctIdx = blank.answer;
                if (correctIdx === null || correctIdx === undefined) correctIdx = -1;
                
                correctAnswers[blankKey] = correctIdx;
                totalQuestions++;

                const questionWrapper = document.createElement('div');
                questionWrapper.dataset.key = blankKey;
                
                const label = document.createElement('p');
                label.className = 'font-bold text-blue-800 mb-3';
                label.textContent = `(${blank.number})`;
                questionWrapper.appendChild(label);

                const optionsGrid = document.createElement('div');
                optionsGrid.className = 'grid grid-cols-1 md:grid-cols-2 gap-3';

                blank.options.forEach((opt, idx) => {
                    const btn = document.createElement('button');
                    btn.className = 'option-button text-left p-3 border rounded hover:bg-blue-50 transition-colors';
                    
                    // ADDED option-number class here
                    btn.innerHTML = `<span class="option-number font-bold text-gray-500 mr-2">${idx + 1}.</span> ${opt}`;
                    
                    btn.onclick = () => selectOption(blankKey, idx);
                    optionsGrid.appendChild(btn);
                });

                questionWrapper.appendChild(optionsGrid);
                blanksContainer.appendChild(questionWrapper);
            });
            passageCard.appendChild(blanksContainer);
        }

        sectionDiv.appendChild(passageCard);
    });

    sectionsContainer.appendChild(sectionDiv);
}

// --- 6. Interaction & Scoring ---

function selectOption(key, index) {
    selectedAnswers[key] = index;

    const container = document.querySelector(`[data-key="${key}"]`);
    if (!container) return;

    // Reset siblings: Remove ALL selection/highlighting styles
    const buttons = container.querySelectorAll('.option-button');
    buttons.forEach(b => {
        // Clear all previous ring and selection styles
        b.classList.remove('bg-blue-600', 'text-white', 'border-blue-600', 'ring-2', 'ring-blue-300', 'ring-offset-2');
        b.classList.add('hover:bg-blue-50'); // Re-add hover style
        
        // FIX: Reset the inner number span color
        const numberSpan = b.querySelector('.option-number');
        if(numberSpan) {
            numberSpan.classList.add('text-gray-500');
            numberSpan.classList.remove('text-white');
        }
    });

    // Highlight selected: Apply solid blue fill and the prominent ring
    const selectedBtn = buttons[index];
    if (selectedBtn) {
        selectedBtn.classList.remove('hover:bg-blue-50');
        // Apply solid selection styles to the button
        selectedBtn.classList.add('bg-blue-600', 'text-white', 'border-blue-600', 'ring-2', 'ring-blue-300', 'ring-offset-2');
        
        // FIX: Highlight the inner number span color to white
        const numberSpan = selectedBtn.querySelector('.option-number');
        if(numberSpan) {
            numberSpan.classList.remove('text-gray-500');
            numberSpan.classList.add('text-white');
        }
    }
}

submitBtn.addEventListener('click', () => {
    let score = 0;

    Object.keys(correctAnswers).forEach(key => {
        const correctIdx = correctAnswers[key];
        const selectedIdx = selectedAnswers[key];
        
        const container = document.querySelector(`[data-key="${key}"]`);
        if (!container) return;

        const buttons = container.querySelectorAll('.option-button');

        buttons.forEach((btn, idx) => {
            btn.disabled = true;
            // Remove selection ring styles before showing final score
            btn.classList.remove('hover:bg-blue-50', 'ring-2', 'ring-blue-300', 'ring-offset-2');
            
            // Get the inner number span
            const numberSpan = btn.querySelector('.option-number');

            if (idx === correctIdx) {
                // Correct: Green
                btn.classList.remove('bg-blue-600', 'border-blue-600');
                btn.classList.add('bg-green-500', 'text-white', 'border-green-600');
                if (numberSpan) numberSpan.classList.remove('text-gray-500');
            } else if (idx === selectedIdx && idx !== correctIdx) {
                // Wrong: Red
                btn.classList.remove('bg-blue-600', 'border-blue-600');
                btn.classList.add('bg-red-500', 'text-white', 'border-red-600');
                if (numberSpan) numberSpan.classList.remove('text-gray-500');
            } else {
                // Unselected: Gray out
                btn.classList.add('opacity-60');
            }
        });

        if (selectedIdx === correctIdx) score++;
    });

    const percentage = totalQuestions > 0 ? Math.round((score / totalQuestions) * 100) : 0;
    document.getElementById('score').textContent = `${score} / ${totalQuestions}`;
    document.getElementById('percentage').textContent = `${percentage}%`;
    
    resultSection.classList.remove('hidden');
    resultSection.scrollIntoView({ behavior: 'smooth' });
    
    submitBtn.disabled = true;
    submitBtn.classList.add('opacity-50', 'cursor-not-allowed');
});