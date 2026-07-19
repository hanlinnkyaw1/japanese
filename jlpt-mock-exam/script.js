const SCORE_API = {
    ready: typeof window.calculateScores === 'function'
        && typeof window.buildMojiScoreMeta === 'function'
        && typeof window.buildReadingScoreMeta === 'function'
        && typeof window.buildListeningScoreMeta === 'function',
    calculateScores: window.calculateScores || null,
    buildMojiScoreMeta: window.buildMojiScoreMeta || null,
    buildReadingScoreMeta: window.buildReadingScoreMeta || null,
    buildListeningScoreMeta: window.buildListeningScoreMeta || null,
    parseMondaiFromTitle: window.parseMondaiFromTitle || null,
    PASS_RULES: window.PASS_RULES || { totalMin: 95, sectionMin: 19, sectionMax: 60, totalMax: 180 }
};

let level = document.getElementById('LevelConFig');
let userLevel = level?.dataset?.userLevel;

const CONFIG = { dataFolder: `./assets/data/jlpttest/${userLevel}` };

function getTestFilePaths(testNumber){
    return {
        moji: `${CONFIG.dataFolder}/${userLevel}MojiGoiTest${testNumber}.json`,
        reading: `${CONFIG.dataFolder}/${userLevel}ReadingTest${testNumber}.json`,
        listening: `${CONFIG.dataFolder}/${userLevel}ListeningTest${testNumber}.json`
    };
}

/* DOM references */
const selectionScreen = document.getElementById('selection-screen');
const quizScreen = document.getElementById('quiz-screen');
const pageTitle = document.getElementById('page-title');
const pageSubtitle = document.getElementById('page-subtitle');

const sectionNavContainer = document.getElementById('sectionNavContainer');
const mojiTabBtn = document.getElementById('mojiTabBtn');
const readingTabBtn = document.getElementById('readingTabBtn');
const listeningTabBtn = document.getElementById('listeningTabBtn');

const mojiPane = document.getElementById('mojiPane');
const readingPane = document.getElementById('readingPane');
const listeningPane = document.getElementById('listeningPane');
const mojiSections = document.getElementById('mojiSections');
const readingSections = document.getElementById('readingSections');
const listeningSections = document.getElementById('listeningSections');
const listeningJumpNav = document.getElementById('listeningJumpNav');
const nextReadingBtn = document.getElementById('nextReadingBtn');
const nextListeningBtn = document.getElementById('nextListeningBtn');

const submitAllBtn = document.getElementById('submitAllBtn');
const globalResult = document.getElementById('globalResult');
const globalMojiScore = document.getElementById('globalMojiScore');
const globalReadingScore = document.getElementById('globalReadingScore');
const globalListeningScore = document.getElementById('globalListeningScore');
const globalTotalScore = document.getElementById('globalTotalScore');
const globalTotalPct = document.getElementById('globalTotalPct');
const passFailBadge = document.getElementById('passFailBadge');
const passFailDetail = document.getElementById('passFailDetail');
const viewCertificateBtn = document.getElementById('viewCertificateBtn');
if (viewCertificateBtn) {
    viewCertificateBtn.addEventListener('click', () => {
        if (typeof window.reopenCertificate === 'function') window.reopenCertificate();
    });
}
const mojiSectionStatus = document.getElementById('mojiSectionStatus');
const readingSectionStatus = document.getElementById('readingSectionStatus');
const listeningSectionStatus = document.getElementById('listeningSectionStatus');

const mainAudio = document.getElementById('mainAudio');
const playPauseBtn = document.getElementById('playPauseBtn');
const audioTimeDisplay = document.getElementById('audioTimeDisplay');
const audioFill = document.getElementById('audioFill');
const audioDuration = document.getElementById('audioDuration');
const audioTrack = document.getElementById('audioTrack');
const volumeSlider = document.getElementById('volumeSlider');
const listeningProgFill = document.getElementById('listeningProgFill');

/* State containers */
let mojiQuestions = [];
let readingQuestions = [];
let listeningData = null;
let listeningQuestions = [];
let mojiSelections = {};    
let readingSelections = {};
let listeningSelections = {};
let mojiCorrectMap = {};    
let readingCorrectMap = {};
let listeningCorrectMap = {};
let mojiTotal = 0;
let readingTotal = 0;
let listeningTotal = 0;
let isTestSubmitted = false;
let currentTestNumber = null;

/* ===== IP Check & Warning System ===== */
function showAudioWarning() {
    // Prevent duplicate warnings
    const existingWarning = document.getElementById('audioFailWarning');
if (existingWarning) {
    existingWarning.style.display = 'block';
    return;
}
    const warningHtml = `
        <div id="audioFailWarning" style="
            position: relative; 
            z-index: 100;
            background: #fff7ed; 
            border: 1px solid #fb923c; 
            border-left: 5px solid #f97316; 
            color: #9a3412; 
            padding: 15px 20px; 
            border-radius: 8px; 
            margin: 0 20px 15px 20px; 
            text-align: center; 
            font-weight: 600; 
            font-size: 15px; 
            line-height: 1.5;
            box-shadow: 0 4px 6px rgba(0,0,0,0.1);
        ">
⚠️ မြန်မာနိုင်ငံရှိ အချို့သော Internet Provider များတွင် Listening Audio ဖွင့်မရနိုင်ပါ။<br>
            Listening Section ကို မစတင်မီ VPN ချိတ်ဆက်ထားရန် အကြံပြုပါသည်။
        </div>
    `;
    
 const container = document.querySelector('.container');
    if (container) {
        container.insertAdjacentHTML('afterbegin', warningHtml);
    }
}

async function checkUserCountry() {
    try {
        // Free IP Geolocation API (no API key required)
        const response = await fetch('https://api.country.is/');
        const data = await response.json();
        
        if (data && data.country === 'MM') {
            console.log("User is in Myanmar. Showing audio warning.");
            showAudioWarning();
        }
    } catch (err) {
        console.log("IP check failed, skipping Myanmar warning.", err);
    }
}

checkUserCountry();

/* ===== Dual Audio Source Fallback State ===== */
let audioSources = [];
let currentAudioIndex = 0;

/* ===== Timer Configuration & State ===== */
const LEVEL_TIME_LIMITS = {
    'N1': 165, 'N2': 155, 'N3': 140, 'N4': 115, 'N5': 90
};

let timerInterval = null;
let timeRemaining = 0;

function startTimer(resume = false) {
    stopTimer();
    
    if (!resume) {
        const minutes = LEVEL_TIME_LIMITS[(userLevel || '').toUpperCase()] || 60;
        timeRemaining = minutes * 60;
    }
    
    updateTimerDisplay();
    
    timerInterval = setInterval(() => {
        timeRemaining--;
        updateTimerDisplay();
        saveProgress();
        
        if (timeRemaining <= 0) {
            stopTimer();
            alert("⏰ Time is up! Your answers will be submitted automatically.");
            if (!isTestSubmitted) {
                submitAllBtn.click();
            }
        }
    }, 1000);
}

function stopTimer() {
    if (timerInterval) {
        clearInterval(timerInterval);
        timerInterval = null;
    }
}

function updateTimerDisplay() {
    const display = document.getElementById('timerDisplay');
    if (!display) return;

    const m = Math.floor(timeRemaining / 60);
    const s = timeRemaining % 60;
    display.textContent = `⏳ ${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;

    if (timeRemaining <= 300 && timeRemaining > 0) {
        display.classList.add('warning');
    } else {
        display.classList.remove('warning');
    }
}

function showSelection() {
    selectionScreen.classList.remove('hidden');
    quizScreen.classList.add('hidden');
    stopTimer();
    sectionNavContainer.classList.add('hidden');

    pageTitle.textContent = 'Integrated Practice — MojiGoi, Reading & Listening';
    pageSubtitle.textContent = 'Select a Test to load all modules';
    
    mojiSections.innerHTML = '';
    readingSections.innerHTML = '';
    listeningSections.innerHTML = '';
    listeningJumpNav.innerHTML = '';
    if (mainAudio) { mainAudio.pause(); mainAudio.src = ''; }

    mojiQuestions = [];
    readingQuestions = [];
    listeningData = null;
    listeningQuestions = [];
    mojiSelections = {};
    readingSelections = {};
    listeningSelections = {};
    mojiCorrectMap = {};
    readingCorrectMap = {};
    listeningCorrectMap = {};
    mojiTotal = 0; 
    readingTotal = 0;
    listeningTotal = 0;
    isTestSubmitted = false;
    
    submitAllBtn.disabled = false;
    submitAllBtn.style.opacity = '1';
    submitAllBtn.textContent = 'Submit Answers (All Sections)';
    
    nextReadingBtn.classList.remove('show');
    nextListeningBtn.classList.remove('show');
    globalResult.classList.add('hidden'); 
}

async function fetchJson(url) {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Failed to fetch ${url} — status ${res.status}`);
    const text = await res.text();
    
    try {
        return JSON.parse(text);
    } catch (err) {
        console.error('❌ JSON parse error:', err);
        throw new Error('Invalid JSON in ' + url + ': ' + err.message);
    }
}

function compileMojiQuestions(rawJson) {
    const compiled = [];
    let counter = 0;
    let vocabMondaiFallback = 0;
    let grammarMondaiFallback = 0;
    const standardSections = [...(rawJson.section1 || []), ...(rawJson.section2 || [])];

    standardSections.forEach((section, sIdx) => {
        if (!section.questions) return;

        let scoreMeta = null;
        if (SCORE_API.ready) {
            scoreMeta = SCORE_API.buildMojiScoreMeta(section.type, section.title);
            if (scoreMeta.mondai == null) {
                const type = (section.type || '').toLowerCase();
                if (type === 'clozetest') {
                    scoreMeta = { ...scoreMeta, mondai: 3 };
                } else if (type === 'grammar') {
                    grammarMondaiFallback += 1;
                    scoreMeta = { ...scoreMeta, mondai: grammarMondaiFallback };
                } else {
                    vocabMondaiFallback += 1;
                    scoreMeta = { ...scoreMeta, mondai: vocabMondaiFallback };
                }
            } else if (scoreMeta.kind === 'vocab') {
                vocabMondaiFallback = Math.max(vocabMondaiFallback, scoreMeta.mondai);
            } else if (scoreMeta.kind === 'grammar') {
                grammarMondaiFallback = Math.max(grammarMondaiFallback, scoreMeta.mondai);
            }
        }

        section.questions.forEach((q, qIdx) => {
            counter++;
            const baseId = `moji-std-${sIdx}-${q.id || qIdx}-${counter}`;
            if (section.type === 'clozeTest') {
                q.blanks.forEach((blank, bIdx) => {
                    const item = {
                        type: 'cloze',
                        globalId: `${baseId}-cloze-${blank.number || bIdx}`,
                        title: section.title,
                        passage: q.passage || null,
                        questionText: `（${blank.number}）に入る最もよいものをえらびなさい。`,
                        options: blank.options || [],
                        correctAnswer: parseInt(blank.answer, 10)
                    };
                    if (scoreMeta) item.scoreMeta = scoreMeta;
                    compiled.push(item);
                });
            } else {
                const item = {
                    type: (section.type || '').toLowerCase(),
                    globalId: baseId,
                    title: section.title,
                    questionText: q.question,
                    target: q.target || null,
                    options: q.options || [],
                    correctAnswer: parseInt(q.answer, 10)
                };
                if (scoreMeta) item.scoreMeta = scoreMeta;
                compiled.push(item);
            }
        });
    });

    if (rawJson.section3) {
        rawJson.section3.forEach((section, sIdx) => {
            if (!section.questions) return;
            let scoreMeta = null;
            if (SCORE_API.ready) {
                const mondai = SCORE_API.parseMondaiFromTitle
                    ? SCORE_API.parseMondaiFromTitle(section.title)
                    : null;
                scoreMeta = (mondai && mondai >= 4)
                    ? SCORE_API.buildReadingScoreMeta(section.title)
                    : SCORE_API.buildMojiScoreMeta(section.type || 'Grammar', section.title);
            }
            section.questions.forEach((q, qIdx) => {
                counter++;
                const item = {
                    type: 'reading',
                    globalId: `moji-s3-${sIdx}-${q.id || qIdx}-${counter}`,
                    title: section.title,
                    passage: section.passage,
                    questionText: q.question,
                    options: q.options || [],
                    correctAnswer: parseInt(q.answer, 10)
                };
                if (scoreMeta) item.scoreMeta = scoreMeta;
                compiled.push(item);
            });
        });
    }
    return compiled;
}

function readingToAnswerNumber(answer) {
    const n = parseInt(answer, 10);
    return Number.isNaN(n) ? null : n;
}

function readingStripOptionPrefix(opt) {
    return typeof opt === 'string' ? opt.replace(/^\d+[\s\u3000]?/, '') : opt;
}

function readingBuildPassageHTML(section) {
    const passage = section.passage || '';
    if (!section.intro_text) return passage;

    return `
        <div class="intro-text" style="margin-bottom: 15px; font-weight: bold; color: #4a5568; line-height: 1.6;">
            ${section.intro_text}
        </div>
        ${passage}
    `;
}

function compileReadingQuestions(rawJson) {
    const compiled = [];
    let counter = 0;
    const standardSections = [...(rawJson.section1 || []), ...(rawJson.section2 || [])];

    standardSections.forEach((section, sIdx) => {
        if (!section.questions) return;
        const isReadingType = section.type === 'Reading' || section.type === 'reading';
        const scoreMeta = SCORE_API.ready
            ? SCORE_API.buildReadingScoreMeta(section.title)
            : null;

        section.questions.forEach((q, qIdx) => {
            counter++;
            const baseId = `read-std-${sIdx}-${q.id ?? qIdx}-${counter}`;

            if (isReadingType && q.blanks) {
                q.blanks.forEach((blank, bIdx) => {
                    const item = {
                        type: 'reading',
                        globalId: `${baseId}-blank-${blank.number ?? bIdx}`,
                        title: section.title || '読解 穴埋め',
                        passage: q.passage || '',
                        questionText: `（${blank.number}）に入る最もよいものをえらびなさい。`,
                        options: blank.options || [],
                        correctAnswer: readingToAnswerNumber(blank.answer)
                    };
                    if (scoreMeta) item.scoreMeta = scoreMeta;
                    compiled.push(item);
                });
            } else {
                const item = {
                    type: 'vocab-grammar',
                    globalId: baseId,
                    title: section.title || '問題',
                    passage: null,
                    questionText: q.question,
                    options: q.options || [],
                    correctAnswer: readingToAnswerNumber(q.answer)
                };
                if (scoreMeta) item.scoreMeta = scoreMeta;
                compiled.push(item);
            }
        });
    });

    const processPassageSection = (sectionData, sectionKey) => {
        if (!sectionData) return;

        sectionData.forEach((section, sIdx) => {
            if (!section.questions) return;

            const passageHTML = readingBuildPassageHTML(section);
            const passageClass = sectionKey === 's4' ? 'info-search-container' : 'passage-text';

            let scoreMeta = SCORE_API.ready
                ? SCORE_API.buildReadingScoreMeta(section.title)
                : null;
            if (scoreMeta && scoreMeta.mondai == null && sectionKey === 's4') {
                scoreMeta = { ...scoreMeta, mondai: 7 };
            }

            section.questions.forEach((q, qIdx) => {
                counter++;

                const cleanedOptions = (q.options || []).map(readingStripOptionPrefix);

                const item = {
                    type: 'reading',
                    globalId: `read-${sectionKey}-${sIdx}-${q.id ?? qIdx}-${counter}`,
                    title: section.title || (sectionKey === 's4' ? '情報検索' : '読解'),
                    passage: passageHTML,
                    passageClass,
                    options: cleanedOptions,
                    questionText: q.question,
                    correctAnswer: readingToAnswerNumber(q.answer)
                };
                if (scoreMeta) item.scoreMeta = scoreMeta;
                compiled.push(item);
            });
        });
    };

    processPassageSection(rawJson.section3, 's3');
    processPassageSection(rawJson.section4, 's4');

    return compiled;
}

function readingGroupByTitle(questions) {
    const order = [];
    const groups = new Map();
    questions.forEach(q => {
        if (!groups.has(q.title)) {
            groups.set(q.title, []);
            order.push(q.title);
        }
        groups.get(q.title).push(q);
    });
    return order.map(title => ({ title, items: groups.get(title) }));
}

function readingGroupByPassage(items) {
    const passageGroups = [];
    items.forEach(q => {
        let found = passageGroups.find(pg => pg.passage === q.passage);
        if (found) found.questions.push(q);
        else passageGroups.push({ passage: q.passage, passageClass: q.passageClass, questions: [q] });
    });
    return passageGroups;
}

function readingScrollToNextUnanswered(currentBlock) {
    const card = currentBlock.closest('.passage-card');
    if (!card) return;

    const blocks = Array.from(card.querySelectorAll('.question-block'));
    const currentIdx = blocks.indexOf(currentBlock);

    for (let i = currentIdx + 1; i < blocks.length; i++) {
        const key = blocks[i].getAttribute('data-key');
        if (readingSelections[key] === undefined) {
            blocks[i].scrollIntoView({ behavior: 'smooth', block: 'center' });
            return;
        }
    }
}

function createReadingOptionButton(opt, idx, q, optsDiv, qBlock) {
    const btn = document.createElement('button');
    btn.className = 'option-button';
    btn.type = 'button';
    btn.setAttribute('data-index', idx + 1);
    btn.setAttribute('aria-pressed', 'false');
    btn.innerHTML = `<span class="option-num-prefix">${idx + 1}</span> ${opt}`;

    btn.addEventListener('click', () => {
        if (isTestSubmitted) return;

        readingSelections[q.globalId] = idx + 1;

        optsDiv.querySelectorAll('.option-button').forEach(b => {
            b.classList.remove('selected');
            b.setAttribute('aria-pressed', 'false');
        });
        btn.classList.add('selected');
        btn.setAttribute('aria-pressed', 'true');

        qBlock.classList.add('answered');
        nextListeningBtn.classList.add('show');

        readingScrollToNextUnanswered(qBlock);
        saveProgress();
    });

    return btn;
}

function createReadingQuestionBlock(q, questionNumber) {
    const qBlock = document.createElement('div');
    qBlock.className = 'question-block';
    qBlock.setAttribute('data-key', q.globalId);

    const qText = document.createElement('div');
    qText.className = 'question-text';
    qText.innerHTML = `<span class="question-number">${questionNumber}.</span> ${q.questionText}`;
    qBlock.appendChild(qText);

    const optsDiv = document.createElement('div');
    optsDiv.className = 'options';
    (q.options || []).forEach((opt, idx) => {
        optsDiv.appendChild(createReadingOptionButton(opt, idx, q, optsDiv, qBlock));
    });
    qBlock.appendChild(optsDiv);

    if (q.correctAnswer != null) {
        readingCorrectMap[q.globalId] = q.correctAnswer;
    }

    return qBlock;
}

function createReadingPassageCard(pg, numberRef) {
    const card = document.createElement('div');
    card.className = 'passage-card';

    if (pg.passage) {
        const pDiv = document.createElement('div');
        pDiv.className = pg.passageClass || 'passage-text';
        pDiv.innerHTML = pg.passage;
        card.appendChild(pDiv);
    }

    const qArea = document.createElement('div');
    qArea.className = 'question-area';
    pg.questions.forEach(q => {
        numberRef.value++;
        qArea.appendChild(createReadingQuestionBlock(q, numberRef.value));
    });
    card.appendChild(qArea);

    return card;
}

function createReadingSectionElement(title, items, numberRef) {
    const sectionDiv = document.createElement('div');
    sectionDiv.className = 'section';

    const st = document.createElement('div');
    st.className = 'section-title';
    st.textContent = title;
    sectionDiv.appendChild(st);

    readingGroupByPassage(items).forEach(pg => {
        sectionDiv.appendChild(createReadingPassageCard(pg, numberRef));
    });

    return sectionDiv;
}

async function loadCombinedTest(testNumber) {
    selectionScreen.classList.add('hidden');
    quizScreen.classList.remove('hidden');
    const warning = document.getElementById('audioFailWarning');
    if (warning) warning.style.display = 'none';

    sectionNavContainer.classList.remove('hidden');

    currentTestNumber = testNumber;
    pageTitle.textContent = `Test ${testNumber} — MojiGoi, Reading & Listening`;
    pageSubtitle.textContent = 'Fetching all modules...';

    mojiQuestions = []; readingQuestions = []; listeningQuestions = [];
    listeningData = null;
    mojiSelections = {}; readingSelections = {}; listeningSelections = {};
    mojiCorrectMap = {}; readingCorrectMap = {}; listeningCorrectMap = {};
    mojiTotal = 0; readingTotal = 0; listeningTotal = 0;
    isTestSubmitted = false;
    
    submitAllBtn.disabled = false;
    submitAllBtn.style.opacity = '1';
    submitAllBtn.textContent = 'Submit Answers (All Sections)';
    
    mojiSections.innerHTML = `<div style="padding:20px; color:#2563eb; font-weight:700;">⏳ Loading MojiGoi...</div>`;
    readingSections.innerHTML = `<div style="padding:20px; color:#2563eb; font-weight:700;">⏳ Loading Reading...</div>`;
    listeningSections.innerHTML = `<div style="padding:20px; color:#2563eb; font-weight:700;">⏳ Loading Listening...</div>`;
    listeningJumpNav.innerHTML = '';
    globalResult.classList.add('hidden');
    nextReadingBtn.classList.remove('show');
    nextListeningBtn.classList.remove('show');

    const { moji: mojiFile, reading: readingFile, listening: listeningFile } = getTestFilePaths(testNumber);

    try {
        const [mojiRaw, readingRaw, listeningRaw] = await Promise.all([
            fetchJson(mojiFile),
            fetchJson(readingFile),
            fetchJson(listeningFile)
        ]);

        mojiQuestions = compileMojiQuestions(mojiRaw);
        readingQuestions = compileReadingQuestions(readingRaw);

        mojiTotal = mojiQuestions.length;
        readingTotal = readingQuestions.length;

        listeningData = listeningRaw;
        listeningQuestions = listeningRaw.sections.flatMap(s => s.questions.map(q => {
            const item = {
                ...q,
                mondai: s.mondai,
                mondaiTitle: s.title
            };
            if (SCORE_API.ready) {
                item.scoreMeta = SCORE_API.buildListeningScoreMeta(s.mondai);
            }
            return item;
        }));
        listeningTotal = listeningQuestions.length;
        
        // Setup audio sources (Primary and Fallback)
        setupAudioSources(listeningRaw);

        pageSubtitle.textContent = `Loaded — MojiGoi: ${mojiTotal}, Reading: ${readingTotal}, Listening: ${listeningTotal}`;

        renderMoji(mojiQuestions);
        renderReading(readingQuestions);
        renderListening(listeningRaw);
        
        activateTab('moji');
        
        // Check if there is saved data for this test
        const hasSavedData = localStorage.getItem(getStorageKey(testNumber));
        
        if (hasSavedData) {
            // If save exists, show the HTML choice modal and WAIT for user input
            showResumeModal(testNumber);
        } else {
            // No save data? Just start a fresh test immediately
            startTimer(false);
            scheduleAudioPreload();
        }

    } catch (err) {
        console.error('🚨 Combined load error:', err);
        const errHtml = `<div style="padding:18px; color:#b91c1c; background:#fff1f2; border-radius:8px; border:1px solid #fecaca;">Error: ${err.message}</div>`;
        mojiSections.innerHTML = errHtml;
        readingSections.innerHTML = errHtml;
        listeningSections.innerHTML = errHtml;
        pageSubtitle.textContent = 'Load failed';
    }
}

/* ===== Dual Audio Source Setup ===== */
function setupAudioSources(data) {
    audioSources = [];
    if (data.audio_src) audioSources.push(data.audio_src);
    if (data.audio_src_fallback) audioSources.push(data.audio_src_fallback);
    
    currentAudioIndex = 0;
    if (audioSources.length > 0) {
        mainAudio.src = audioSources[0];
        mainAudio.preload = 'metadata';
    } else {
        mainAudio.removeAttribute('src');
    }
    mainAudio.load();
}

function renderMoji(questions) {
    mojiSections.innerHTML = '';
    let lastTitle = '';
    let lastPassage = '';

    questions.forEach((q, idx) => {
        if (q.title && q.title !== lastTitle) {
            lastTitle = q.title;
            const titleDiv = document.createElement('div');
            titleDiv.className = 'section';
            titleDiv.innerHTML = `<div class="section-title">${lastTitle}</div>`;
            mojiSections.appendChild(titleDiv);
        }

        if (q.passage && q.passage !== lastPassage) {
            lastPassage = q.passage;
            const passageDiv = document.createElement('div');
            passageDiv.className = 'passage-card';
            passageDiv.innerHTML = `<div class="passage-text">${q.passage}</div>`;
            mojiSections.appendChild(passageDiv);
        }

        const container = document.createElement('div');
        container.className = 'question-card';
        container.setAttribute('data-qid', q.globalId);

        let qText = q.questionText || '';
        if (q.target) {
            qText = qText.replace(q.target, `<span style="text-decoration:underline; font-weight:700; color:#1e40af;">${q.target}</span>`);
        }

        container.innerHTML = `
            <div class="question-text"><span class="question-number">${idx+1}.</span>${qText}</div>
            <div class="options">
                ${q.options.map((opt, i) => `<button class="option-button" data-index="${i+1}"><span class="option-num-prefix">${i+1}</span>${opt}</button>`).join('')}
            </div>
        `;

        mojiSections.appendChild(container);

        const opts = container.querySelectorAll('.option-button');
        opts.forEach(btn => {
            btn.addEventListener('click', () => {
                if (isTestSubmitted) return; 
                opts.forEach(b => b.classList.remove('selected'));
                btn.classList.add('selected');
                
                const selected = parseInt(btn.getAttribute('data-index'), 10);
                mojiSelections[q.globalId] = selected;

                if (Object.keys(mojiSelections).length > 0) {
                    nextReadingBtn.classList.add('show');
                }
                saveProgress();
            });
        });

        if (q.correctAnswer != null) {
            mojiCorrectMap[q.globalId] = q.correctAnswer;
        }
    });
}

function renderReading(questions) {
    readingSections.innerHTML = '';

    if (!Array.isArray(questions) || questions.length === 0) {
        const empty = document.createElement('div');
        empty.className = 'section';
        empty.textContent = '問題が見つかりませんでした。';
        readingSections.appendChild(empty);
        return;
    }

    const numberRef = { value: 0 };
    const fragment = document.createDocumentFragment();

    readingGroupByTitle(questions).forEach(({ title, items }) => {
        fragment.appendChild(createReadingSectionElement(title, items, numberRef));
    });

    readingSections.appendChild(fragment);
}

function renderListening(data) {
    // Use the centralized audio setup function
    setupAudioSources(data);
    
    mainAudio.dataset.startTime = data.starting_time || 0;

    listeningSections.innerHTML = '';
    listeningJumpNav.innerHTML = '';

    data.sections.forEach(sec => {
        const sectionDiv = document.createElement('div');
        sectionDiv.className = 'mondai-section';
        sectionDiv.id = `mondai-${sec.mondai}`;

        sectionDiv.innerHTML = `
            <div class="mondai-header">
                <div class="mondai-tag">Mondai ${sec.mondai}</div>
                <div class="mondai-title-jp">${sec.title}</div>
                <div class="mondai-instruction">${sec.instruction}</div>
            </div>
        `;

        if (sec.memo_only) {
            const memo = document.createElement('div');
            memo.className = 'memo-box';
            memo.textContent = '📝 この問題は問題用紙に印刷されていません。音声だけを聞いて答えてください。';
            sectionDiv.appendChild(memo);
        }

        sec.questions.forEach(q => {
            const card = document.createElement('div');
            card.className = 'q-card';
            card.id = `qcard-${q.id}`;
            card.setAttribute('data-qid', q.id);

            const top = document.createElement('div');
            top.className = 'q-top';
            top.innerHTML = `
                <div class="q-num">${q.id}</div>
                <div class="q-label">${q.label}</div>
                ${q.note ? `<div class="q-note">${q.note}</div>` : ''}
            `;
            card.appendChild(top);

            if (q.type === 'image' && q.image) {
                const imgWrap = document.createElement('div');
                imgWrap.className = 'q-image-wrap';
                imgWrap.innerHTML = `<img src="${q.image}" class="q-image" alt="問題${q.id}の図">`;
                card.appendChild(imgWrap);
            }

            const maxOpts = q.type === 'audio_only_3' ? 3 : 4;
            const isLong = q.options.some(o => o.length > 22);
            const optsGrid = document.createElement('div');
            optsGrid.className = `options-grid ${isLong ? 'single' : ''}`;

            q.options.slice(0, maxOpts).forEach((opt, i) => {
                const num = i + 1;
                const btn = document.createElement('button');
                btn.type = 'button';
                btn.className = 'opt-btn';
                btn.innerHTML = `<span class="opt-circle">${num}</span>${opt}`;
                btn.addEventListener('click', () => selectListeningAnswer(q.id, num, btn));
                optsGrid.appendChild(btn);
            });

            card.appendChild(optsGrid);
            sectionDiv.appendChild(card);

            const listenAns = parseInt(q.answer, 10);
            if (q.answer != null) {
                listeningCorrectMap[q.id] = parseInt(q.answer, 10);
            }
        });

        listeningSections.appendChild(sectionDiv);

        const dot = document.createElement('div');
        dot.className = 'jump-dot';
        dot.id = `jumpdot-${sec.mondai}`;
        dot.textContent = sec.mondai;
        dot.addEventListener('click', () => {
            document.getElementById(`mondai-${sec.mondai}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        });
        listeningJumpNav.appendChild(dot);
    });

    updateListeningProgress();
}

function selectListeningAnswer(qid, opt, btn) {
    if (isTestSubmitted) return;
    listeningSelections[qid] = opt;
    const card = document.getElementById(`qcard-${qid}`);
    if (card) {
        card.classList.add('answered-q');
        card.querySelectorAll('.opt-btn').forEach(b => b.classList.remove('selected'));
        btn.classList.add('selected');
    }
    updateListeningProgress();
    updateListeningJumpNav();
    saveProgress();
}

function updateListeningProgress() {
    const total = listeningQuestions.length;
    const done = Object.keys(listeningSelections).length;
    if (listeningProgFill) {
        listeningProgFill.style.width = total ? `${(done / total) * 100}%` : '0%';
    }
}

function updateListeningJumpNav() {
    if (!listeningData) return;
    listeningData.sections.forEach(sec => {
        const allDone = sec.questions.every(q => listeningSelections[q.id] !== undefined);
        const dot = document.getElementById(`jumpdot-${sec.mondai}`);
        if (dot) dot.classList.toggle('complete', allDone);
    });
}

function fmtTime(s) {
    const m = Math.floor(s / 60);
    const sec = Math.floor(s % 60);
    return `${m}:${String(sec).padStart(2, '0')}`;
}

function toggleAudioPlay() {
    if (!mainAudio.src) return;
    mainAudio.paused ? mainAudio.play() : mainAudio.pause();
}

function skipAudio(seconds) {
    mainAudio.currentTime = Math.max(0, mainAudio.currentTime + seconds);
}

function seekAudio(e) {
    const rect = e.currentTarget.getBoundingClientRect();
    const pct = (e.clientX - rect.left) / rect.width;
    if (mainAudio.duration) mainAudio.currentTime = pct * mainAudio.duration;
}

let preloadTimeoutId = null;

function scheduleAudioPreload() {
    if (preloadTimeoutId) {
        clearTimeout(preloadTimeoutId);
    }

    const thirty_Seconds_MS = 30 *  1000;
    
    preloadTimeoutId = setTimeout(() => {
        if (mainAudio.src) {
            mainAudio.preload = 'auto';
            mainAudio.load();
            
            mainAudio.addEventListener('loadedmetadata', function restoreTime() {
                if (mainAudio.dataset.startTime) {
                    mainAudio.currentTime = parseFloat(mainAudio.dataset.startTime);
                }
                mainAudio.removeEventListener('loadedmetadata', restoreTime);
            });

            console.log("10 minutes elapsed: Audio background loading triggered.");
        }
    }, thirty_Seconds_MS);
}

mainAudio.addEventListener('timeupdate', () => {
    const t = mainAudio.currentTime;
    const d = mainAudio.duration || 0;
    audioTimeDisplay.textContent = fmtTime(t);
    audioFill.style.width = (d ? (t / d) * 100 : 0) + '%';
});

mainAudio.addEventListener('loadedmetadata', () => {
    audioDuration.textContent = fmtTime(mainAudio.duration);
    
    if (mainAudio.dataset.startTime) {
        const startSeconds = parseFloat(mainAudio.dataset.startTime);
        mainAudio.currentTime = Math.min(startSeconds, mainAudio.duration || 0);
    }
});

mainAudio.addEventListener('play', () => { playPauseBtn.textContent = '⏸'; });
mainAudio.addEventListener('pause', () => { playPauseBtn.textContent = '▶'; });

/* ===== Automatic Fallback Error Listener ===== */
mainAudio.addEventListener('error', () => {
    console.error(`🚨 Audio Error: Failed to load source ${currentAudioIndex + 1} (${audioSources[currentAudioIndex] || 'Unknown'})`);
    
    // Check if we have a fallback link available
    currentAudioIndex++;
    if (currentAudioIndex < audioSources.length) {
        console.log(`⏳ Trying fallback source ${currentAudioIndex + 1}: ${audioSources[currentAudioIndex]}`);
        mainAudio.src = audioSources[currentAudioIndex];
        mainAudio.load();
        
        // If the user had clicked play, attempt to resume playback automatically
        if (playPauseBtn.textContent === '⏸') {
            mainAudio.play().catch(e => console.error("Fallback play failed:", e));
        }
    } else {
        console.error("❌ All audio sources failed.");
        playPauseBtn.textContent = '⚠️';
        playPauseBtn.disabled = true;
        
        // Show the styled warning message
        showAudioWarning();
    }
});

playPauseBtn.addEventListener('click', toggleAudioPlay);
document.getElementById('skipBackBtn').addEventListener('click', () => skipAudio(-5));
document.getElementById('skipFwdBtn').addEventListener('click', () => skipAudio(5));
audioTrack.addEventListener('click', seekAudio);
volumeSlider.addEventListener('input', (e) => { mainAudio.volume = e.target.value; });

function activateTab(tab) {
    mojiPane.style.display = tab === 'moji' ? 'block' : 'none';
    readingPane.style.display = tab === 'reading' ? 'block' : 'none';
    listeningPane.style.display = tab === 'listening' ? 'block' : 'none';

    mojiTabBtn.classList.toggle('active', tab === 'moji');
    readingTabBtn.classList.toggle('active', tab === 'reading');
    listeningTabBtn.classList.toggle('active', tab === 'listening');

    if (listeningJumpNav) {
        listeningJumpNav.style.display = tab === 'listening' ? 'flex' : 'none';
    }

    if (tab !== 'listening' && mainAudio && !mainAudio.paused) {
        mainAudio.pause();
    }

    window.scrollTo({ top: 0, behavior: 'smooth' });
}

mojiTabBtn.addEventListener('click', () => activateTab('moji'));
readingTabBtn.addEventListener('click', () => activateTab('reading'));
listeningTabBtn.addEventListener('click', () => activateTab('listening'));
nextReadingBtn.addEventListener('click', () => activateTab('reading'));
nextListeningBtn.addEventListener('click', () => activateTab('listening'));

function markOptionButtons(container, selector, correct, selected, getIndex) {
    if (!container) return;

    const wasMissed = (selected === null || selected === undefined);

    if (wasMissed) {
        container.classList.add('missed-question');
    }

    container.querySelectorAll(selector).forEach(btn => {
        const idx = getIndex(btn);
        btn.disabled = true;
        btn.classList.remove('selected');
        if (idx === correct) {
            btn.classList.add('correct');
        } else if (!wasMissed && idx === selected) {
            btn.classList.add('incorrect');
        } else {
            btn.style.opacity = '0.5';
        }
    });
}

function formatSectionStatus(passed) {
    return passed ? '✓ ≥19' : '✗ <19';
}

function applyOfficialScoreResults(results) {
    const rules = SCORE_API.PASS_RULES;
    const vgMax = results.vocabGrammar.max || rules.sectionMax;
    const rMax = results.reading.max || rules.sectionMax;
    const lMax = results.listening.max || rules.sectionMax;
    const tMax = results.total.max || rules.totalMax;

    if (globalMojiScore) globalMojiScore.textContent = `${results.vocabGrammar.score} / ${vgMax}`;
    if (globalReadingScore) globalReadingScore.textContent = `${results.reading.score} / ${rMax}`;
    if (globalListeningScore) globalListeningScore.textContent = `${results.listening.score} / ${lMax}`;
    if (globalTotalScore) globalTotalScore.textContent = `${results.total.score} / ${tMax}`;

    if (mojiSectionStatus) {
        mojiSectionStatus.textContent = formatSectionStatus(results.vocabGrammar.passed);
        mojiSectionStatus.className = `n3-section-status ${results.vocabGrammar.passed ? 'ok' : 'fail'}`;
    }
    if (readingSectionStatus) {
        readingSectionStatus.textContent = formatSectionStatus(results.reading.passed);
        readingSectionStatus.className = `n3-section-status ${results.reading.passed ? 'ok' : 'fail'}`;
    }
    if (listeningSectionStatus) {
        listeningSectionStatus.textContent = formatSectionStatus(results.listening.passed);
        listeningSectionStatus.className = `n3-section-status ${results.listening.passed ? 'ok' : 'fail'}`;
    }

    const accuracyPct = results.total.total
        ? Math.round((results.total.correct / results.total.total) * 1000) / 10
        : 0;
    if (globalTotalPct) {
        globalTotalPct.textContent = `${results.total.correct}/${results.total.total} correct (${accuracyPct}%)`;
    }

    if (passFailBadge) {
        passFailBadge.textContent = results.passed ? 'PASS' : 'FAIL';
        passFailBadge.className = `pass-fail-badge ${results.passed ? 'pass' : 'fail'}`;
    }
    if (globalResult) {
        globalResult.classList.toggle('is-pass', results.passed);
        globalResult.classList.toggle('is-fail', !results.passed);
    }
    if (passFailDetail) {
        passFailDetail.textContent = results.passed
            ? `Passed: total ≥ ${rules.totalMin} and each section ≥ ${rules.sectionMin}.`
            : `Did not pass. ${results.failReasons.join(' · ')}`;
    }

    if (typeof window.renderCertificate === 'function') {
        window.renderCertificate(results);
    }
}

function applySimpleCountResults(mojiScoreVal, mojiTotalQ, readingScoreVal, readingTotalQ, listeningScoreVal, listeningTotalQ) {
    const absoluteTotal = mojiTotalQ + readingTotalQ + listeningTotalQ;
    const absoluteCorrect = mojiScoreVal + readingScoreVal + listeningScoreVal;
    const accuracyPct = absoluteTotal ? Math.round((absoluteCorrect / absoluteTotal) * 1000) / 10 : 0;

    if (globalMojiScore) globalMojiScore.textContent = `${mojiScoreVal} / ${mojiTotalQ}`;
    if (globalReadingScore) globalReadingScore.textContent = `${readingScoreVal} / ${readingTotalQ}`;
    if (globalListeningScore) globalListeningScore.textContent = `${listeningScoreVal} / ${listeningTotalQ}`;
    if (globalTotalScore) globalTotalScore.textContent = `${absoluteCorrect} / ${absoluteTotal}`;
    if (globalTotalPct) globalTotalPct.textContent = `${accuracyPct}%`;
}

submitAllBtn.addEventListener('click', () => {
    if (isTestSubmitted) return;
    isTestSubmitted = true;
    stopTimer();
    clearSavedProgress();

    submitAllBtn.disabled = true;
    submitAllBtn.style.opacity = '0.6';
    submitAllBtn.textContent = 'Answers Evaluated';

    mojiQuestions.forEach(q => {
        const correct = mojiCorrectMap[q.globalId];
        const selected = mojiSelections[q.globalId] ?? null;
        const qContainer = mojiSections.querySelector(`[data-qid="${q.globalId}"]`);
        markOptionButtons(qContainer, '.option-button', correct, selected, btn =>
            parseInt(btn.getAttribute('data-index'), 10)
        );
    });

    readingQuestions.forEach(q => {
        const correct = readingCorrectMap[q.globalId];
        const selected = readingSelections[q.globalId] ?? null;
        const block = readingSections.querySelector(`[data-key="${q.globalId}"]`);
        markOptionButtons(block, '.option-button', correct, selected, btn =>
            parseInt(btn.getAttribute('data-index'), 10)
        );
    });

    listeningQuestions.forEach(q => {
        const correct = listeningCorrectMap[q.id];
        const selected = listeningSelections[q.id] ?? null;
        const card = listeningSections.querySelector(`[data-qid="${q.id}"]`);
        markOptionButtons(card, '.opt-btn', correct, selected, btn => {
            const circle = btn.querySelector('.opt-circle');
            return circle ? parseInt(circle.textContent, 10) : null;
        });
    });

    const missedCount =
        mojiQuestions.filter(q => (mojiSelections[q.globalId] ?? null) === null).length +
        readingQuestions.filter(q => (readingSelections[q.globalId] ?? null) === null).length +
        listeningQuestions.filter(q => (listeningSelections[q.id] ?? null) === null).length;

    if (globalTotalPct) {
        const existing = globalTotalPct.textContent;
        globalTotalPct.textContent = `${existing}  ·  ⚠ Missed: ${missedCount}`;
    }

    if (SCORE_API.ready) {
        const scoreItems = [
            ...mojiQuestions.map(q => ({
                qid: q.globalId,
                correct: q.correctAnswer,
                selected: mojiSelections[q.globalId],
                scoreMeta: q.scoreMeta
            })),
            ...readingQuestions.map(q => ({
                qid: q.globalId,
                correct: q.correctAnswer,
                selected: readingSelections[q.globalId],
                scoreMeta: q.scoreMeta
            })),
            ...listeningQuestions.map(q => ({
                qid: q.id,
                correct: q.answer,
                selected: listeningSelections[q.id],
                scoreMeta: q.scoreMeta
            }))
        ];
        applyOfficialScoreResults(SCORE_API.calculateScores(scoreItems));
    } else {
        const mojiIds = Object.keys(mojiCorrectMap);
        const readingIds = Object.keys(readingCorrectMap);
        const listeningIds = Object.keys(listeningCorrectMap);
        const mojiScoreVal = mojiIds.filter(id => mojiSelections[id] === mojiCorrectMap[id]).length;
        const readingScoreVal = readingIds.filter(id => readingSelections[id] === readingCorrectMap[id]).length;
        const listeningScoreVal = listeningIds.filter(id => listeningSelections[id] === listeningCorrectMap[id]).length;
        applySimpleCountResults(
            mojiScoreVal, mojiIds.length,
            readingScoreVal, readingIds.length,
            listeningScoreVal, listeningIds.length
        );
    }

    if (globalResult) globalResult.classList.remove('hidden');
});

/* ===== Resume / Retake Choice Modal ===== */
function showResumeModal(testNumber) {
    // Prevent duplicate modals
    if (document.getElementById('resumeModalOverlay')) return;
    
    const modalHtml = `
        <div id="resumeModalOverlay" style="
            position: fixed; 
            top: 0; left: 0; width: 100%; height: 100%; 
            background: rgba(0,0,0,0.6); 
            z-index: 2000; 
            display: flex; align-items: center; justify-content: center;
            animation: fadeIn 0.2s ease;
        ">
            <div style="
                background: #ffffff; 
                padding: 30px; 
                border-radius: 12px; 
                max-width: 420px; 
                width: 90%; 
                text-align: center; 
                box-shadow: 0 10px 25px rgba(0,0,0,0.3);
                font-family: sans-serif;
            ">
                <div style="font-size: 40px; margin-bottom: 10px;">⏳</div>
                <h3 style="margin: 0 0 15px 0; color: #1e293b; font-size: 22px;">Test ${testNumber} In Progress</h3>
                <p style="margin: 0 0 25px 0; color: #64748b; font-size: 15px; line-height: 1.5;">
                    You have a previous attempt saved for this test. Do you want to continue where you left off, or start a new attempt?
                </p>
                <div style="display: flex; flex-direction: column; gap: 10px;">
                    <button id="resumeTestBtn" style="
                        background: #2563eb; color: white; border: none; 
                        padding: 12px; border-radius: 8px; font-weight: 700; 
                        font-size: 15px; cursor: pointer; transition: background 0.2s;
                    ">Continue Previous Test</button>
                    <button id="newTestBtn" style="
                        background: #f1f5f9; color: #334155; border: 1px solid #cbd5e1; 
                        padding: 12px; border-radius: 8px; font-weight: 700; 
                        font-size: 15px; cursor: pointer; transition: background 0.2s;
                    ">Start New Test</button>
                </div>
            </div>
        </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', modalHtml);
    
    // Handle "Continue" button click
    document.getElementById('resumeTestBtn').addEventListener('click', () => {
        document.getElementById('resumeModalOverlay').remove();
        restoreProgress(testNumber);
        startTimer(true); // true = resume countdown
        scheduleAudioPreload();
    });
    
    // Handle "New Test" button click
    document.getElementById('newTestBtn').addEventListener('click', () => {
        document.getElementById('resumeModalOverlay').remove();
        clearSavedProgress(testNumber); // Delete old save
        startTimer(false); // false = fresh countdown
        scheduleAudioPreload();
    });
}

/* ===== Local Storage Save/Resume System ===== */

function getStorageKey(testNum) {
    return `jlpt_progress_${userLevel}_Test${testNum}`;
}

function saveProgress() {
    if (!currentTestNumber || isTestSubmitted) return;
    
    const progress = {
        moji: mojiSelections,
        reading: readingSelections,
        listening: listeningSelections,
        timeRemaining: timeRemaining
    };
    
    try {
        localStorage.setItem(getStorageKey(currentTestNumber), JSON.stringify(progress));
    } catch (e) {
        console.warn("Could not save progress to localStorage:", e);
    }
}

function clearSavedProgress(testNum) {
    localStorage.removeItem(getStorageKey(testNum || currentTestNumber));
}

function restoreProgress(testNum) {
    const savedData = localStorage.getItem(getStorageKey(testNum));
    if (!savedData) return false;

    try {
        const data = JSON.parse(savedData);
        
        mojiSelections = data.moji || {};
        readingSelections = data.reading || {};
        listeningSelections = data.listening || {};
        timeRemaining = data.timeRemaining || 0;

        Object.entries(mojiSelections).forEach(([qid, idx]) => {
            const card = mojiSections.querySelector(`[data-qid="${qid}"]`);
            const btn = card?.querySelector(`.option-button[data-index="${idx}"]`);
            if (btn) btn.classList.add('selected');
        });

        Object.entries(readingSelections).forEach(([qid, idx]) => {
            const block = readingSections.querySelector(`[data-key="${qid}"]`);
            const btn = block?.querySelector(`.option-button[data-index="${idx}"]`);
            if (btn) {
                btn.classList.add('selected');
                btn.setAttribute('aria-pressed', 'true');
                block.classList.add('answered');
            }
        });

        Object.entries(listeningSelections).forEach(([qid, idx]) => {
            const card = listeningSections.querySelector(`[data-qid="${qid}"]`);
            const btns = card?.querySelectorAll('.opt-btn');
            if (btns && btns[idx - 1]) {
                btns[idx - 1].classList.add('selected');
                card.classList.add('answered-q');
            }
        });

        if (Object.keys(mojiSelections).length > 0) nextReadingBtn.classList.add('show');
        if (Object.keys(readingSelections).length > 0) nextListeningBtn.classList.add('show');
        updateListeningProgress();
        updateListeningJumpNav();

        return true;
    } catch (e) {
        console.error("Error restoring progress:", e);
        return false;
    }
}

window.loadCombinedTest = loadCombinedTest;
window.showSelection = showSelection;

/* ===== Prevent Accidental Tab Closing / Refresh ===== */
window.addEventListener('beforeunload', function (e) {
    if (currentTestNumber && !isTestSubmitted && !quizScreen.classList.contains('hidden')) {
        e.preventDefault();
        e.returnValue = '';
        return '';
    }
});

/* ===== Network Reconnect: Auto-fetch Listening Audio ===== */
window.addEventListener('online', () => {
    if (currentTestNumber && !isTestSubmitted && audioSources.length > 0) {
        console.log("🌐 Network reconnected. Reloading listening audio...");
        
        // 1. Reset the audio index to your primary R2 link
        currentAudioIndex = 0;
        
        // 2. Forcefully clear the audio element to remove the error state
        mainAudio.pause();
        mainAudio.removeAttribute('src');
        mainAudio.load(); // Flushes the old error
        
        // 3. Re-apply the primary source
        mainAudio.src = audioSources[0];
        mainAudio.preload = 'auto';
        mainAudio.load(); // Forces a fresh network fetch
        
        // 4. Reset the play button (removes the ⚠️ icon)
        playPauseBtn.textContent = '▶';
        playPauseBtn.disabled = false;
        
        // 5. Hide the orange warning box if it was visible
        const warningBox = document.getElementById('audioFailWarning');
        if (warningBox) {
            warningBox.style.display = 'none';
        }
        
        // 6. If they are on the listening tab, let them know it's fixed
        if (listeningPane.style.display === 'block') {
            alert("✅ Network reconnected! Listening audio has been reloaded. You can press play.");
        }
    }
});
