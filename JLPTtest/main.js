let selectedAnswers = {};
let correctAnswers = {};
let totalQuestions = 0;
let selectedLevel = null;
let selectedTestType = null;

const containerCho = document.querySelector('#container');
const test = document.querySelector("#containerTest");
    test.style.display = "none";

function selectLevel(level) {
  // Reset all level buttons
  document.querySelectorAll('[id^="level-"]').forEach(btn => {
    btn.classList.remove('border-blue-500', 'bg-blue-50');
    btn.classList.add('border-gray-200', 'bg-white');
  });
  
  // Highlight selected button
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
  
  // Highlight selected button
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

async function initializeTest(url) {
  try {
    const res = await fetch(`quizTest/${url}.json`);
    
    if (!res.ok) {
      throw new Error('Failed to load test data');
    }
    
    const testData = await res.json();
    
    // Show test container
    test.style.display = "block";
    containerCho.style.display = "none" ;
    
    document.getElementById('level-badge').textContent = testData.level;
    document.getElementById('test-date').textContent = testData.date;
    
    const container = document.getElementById('sections-container');
    container.innerHTML = ''; // Clear previous sections, if any
    
    // Populate sections dynamically
    testData.sections.forEach((section) => {
      const sectionDiv = document.createElement('div');
      sectionDiv.className = 'section';
      
      const sectionTitle = document.createElement('h2');
      sectionTitle.className = 'section-title';
      sectionTitle.textContent = section.title;
      sectionDiv.appendChild(sectionTitle);
      
      section.questions.forEach((q) => {
        const questionKey = `${section.type.toLowerCase()}-${q.id}`;
        correctAnswers[questionKey] = q.answer;
        totalQuestions++;
        
        const card = document.createElement('div');
        card.className = 'question-card';
        card.dataset.key = questionKey;
        
        const qText = document.createElement('div');
        qText.className = 'question-text';
        
        const questionNumber = document.createElement('div');
        questionNumber.className = 'question-number';
        questionNumber.innerHTML = `${q.id}.`;
        qText.appendChild(questionNumber);
        
        if (q.target) {
          const replaced = q.question.replace(
            q.target,
            `<span class="target-word">${q.target}</span>`
          );
          qText.innerHTML += replaced;
        } else {
          qText.innerHTML += q.question;
        }
        
        const options = document.createElement('div');
        options.className = 'options';
        
        q.options.forEach((opt, index) => {
          const btn = document.createElement('button');
          btn.className = 'option-button';
          btn.innerHTML = `${index + 1}. ${opt}`;
          btn.onclick = () => selectOption(btn, index, questionKey);
          options.appendChild(btn);
        });
        
        card.appendChild(qText);
        card.appendChild(options);
        sectionDiv.appendChild(card);
      });
      
      container.appendChild(sectionDiv);
    });
  } catch (error) {
    console.error('Error loading test:', error);
    alert('Failed to load test data. Please try again.');
  }
}


//ClozeSection 

// async function renderClozeSection(url) {
//   const res = await fetch(`quizTest/${url}blankQuiz.json`);
//   if (!res.ok) throw new Error('Failed to load test data');
//   const data = await res.json();
  
//   test.style.display = "block";
//   containerCho.style.display = "none";
  
//   const container = document.getElementById("reading-container");
//   container.innerHTML = '';
  
//   document.getElementById('level-badge').textContent = data.level;
//   document.getElementById('test-date').textContent = data.date;
  
//   const clozeSection = data.sections.find(
//     (s) => s.title.includes("空欄補充") || s.type === "Reading"
//   );
  
//   if (!clozeSection || !Array.isArray(clozeSection.questions)) {
//     console.warn("No valid cloze questions found.");
//     return;
//   }
  
  
//   const sectionTitle = document.createElement('h2');
//   sectionTitle.className = 'section-title';
//   sectionTitle.textContent = clozeSection.title;
//   container.appendChild(sectionTitle);
  
//   clozeSection.questions.forEach((q) => {
//     const qDiv = document.createElement("div");
//     qDiv.className = "reading-card";
    
//     const questionKeyBase = `cloze-${q.id}`;
    
//     const questionNumber = document.createElement('div');
//     questionNumber.className = 'question-number';
//     questionNumber.textContent = `${q.id}.`;
//     qDiv.appendChild(questionNumber);
    
//     const passage = document.createElement("p");
//     passage.textContent = q.passage;
//     qDiv.appendChild(passage);
    
//     q.blanks.forEach((blank) => {
//       const blankKey = `cloze-${q.id}-${blank.number}`;
      
      
//       const blankDiv = document.createElement("div");
//       blankDiv.className = "question-card";
//       blankDiv.dataset.key = blankKey;
      
//       const optionsDiv = document.createElement("div");
//       optionsDiv.className = "options";
      
//       blank.options.forEach((option, idx) => {
//         const btn = document.createElement("button");
//         btn.type = "button";
//         btn.className = "option-button";
//         btn.textContent = `${idx + 1}. ${option}`;
//         btn.dataset.key = blankKey;
        
//         btn.addEventListener("click", () => selectOption(btn, idx, blankKey));
//         optionsDiv.appendChild(btn);
//       });
      
      
//       blankDiv.appendChild(optionsDiv);
//       qDiv.appendChild(blankDiv);
      
//       correctAnswers[blankKey] = blank.correctIndex ?? blank.options.indexOf(blank.answer);
//       totalQuestions++;
//     });
    
//     container.appendChild(qDiv);
//   });
  
//   window.totalQuestions = totalQuestions;
// };


  
// Paragraph 

async function renderReadingSection(url) {
  console.log(url)
  const res = await fetch(`quizTest/${url}Quiz.json`);
  
  if (!res.ok) {
    throw new Error('Failed to load test data');
  }
  const section = await res.json();
  test.style.display = "block";
  containerCho.style.display = "none";
  
  const readingContainer = document.getElementById("reading-container");
  
  section.sections[0].questions.forEach((q) => {
    const questionKey = `reading-${q.id}`;
    correctAnswers[questionKey] = q.answer;
    totalQuestions++;
    
    const card = document.createElement('div');
    card.className = 'reading-card';
    card.dataset.key = questionKey;
    
    const passage = document.createElement('div');
    passage.className = 'passage';
    passage.textContent = q.passage;
    card.appendChild(passage);
    
    const qText = document.createElement('div');
    qText.className = 'reading-question';
    qText.textContent = `${q.id}. ${q.question}`;
    card.appendChild(qText);
    
    const options = document.createElement('div');
    options.className = 'options';
    
    q.options.forEach((opt, index) => {
      const btn = document.createElement('button');
      btn.className = 'option-button';
      btn.innerHTML = `${index + 1}. ${opt}`;
      btn.dataset.key = questionKey;
      btn.addEventListener('click', () => selectOption(btn, index, questionKey));
      options.appendChild(btn);
    });
    
    card.appendChild(options);
    readingContainer.appendChild(card);
    
  });
}




function selectOption(button, index, key) {
  const card = document.querySelector(`[data-key="${key}"]`);
  if (!card) return;
  
  const all = card.querySelectorAll('.option-button');
  all.forEach((b) => b.classList.remove('selected'));
  button.classList.add('selected');
  
  selectedAnswers[key] = index;
}


document.getElementById('submitBtn').addEventListener('click', () => {
  let correct = 0;

  Object.keys(correctAnswers).forEach((key) => {
    const card = document.querySelector(`[data-key="${key}"]`);
    if (!card) return;

    const buttons = card.querySelectorAll('.option-button');
    const correctIdx = correctAnswers[key];
    const selectedIdx = selectedAnswers[key];

    // Highlight correct answer
    if (buttons[correctIdx]) {
      buttons[correctIdx].classList.add('correct');
    }

    // Highlight selected wrong answer
    if (selectedIdx !== undefined && selectedIdx !== correctIdx && buttons[selectedIdx]) {
      buttons[selectedIdx].classList.add('incorrect');
    }

    // Count correct
    if (selectedIdx === correctIdx) {
      correct++;
    }

    // Disable all buttons
    buttons.forEach((b) => (b.disabled = true));
  });

  const percent = Math.round((correct / totalQuestions) * 100);
  document.getElementById('score').textContent = `${correct}/${totalQuestions}`;
  document.getElementById('percentage').textContent = `${percent}%`;
  document.getElementById('results').classList.remove('hidden');

  document.getElementById('submitBtn').disabled = true;
});




function startTest() {
  
  if (selectedLevel && selectedTestType) {
    const testKey = `${selectedLevel}_${selectedTestType}`;
    
    if (selectedTestType === 'vocab_grammar') {
      initializeTest(testKey);
      
    } else if (selectedTestType === 'reading') {
      renderReadingSection(testKey)
      
    }
  }
}