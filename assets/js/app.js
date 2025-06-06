// States data will be loaded by loadStates into global statesData in questions_data.js
// Questions data will be loaded by loadQuestions into global allQuestions in questions_data.js

document.addEventListener('DOMContentLoaded', async () => {
    // Load data first
    try {
        await loadQuestions();
        await loadStates();
    } catch (error) {
        console.error("Error loading initial data:", error);
        if(document.getElementById('main-content')) {
            document.getElementById('main-content').innerHTML = '<p class="text-red-500 text-center">Critical error loading application data. Please try refreshing the page.</p>';
        }
        return; // Stop execution if data loading fails
    }

    const mainContent = document.getElementById('main-content');

    // --- Animation Helper ---
    function animateContentChange(element, animationClass = 'fade-in') {
        if (element) {
            const SIBLING_ANIMATION_CLASSES = ['fade-in', 'slide-in-next', 'slide-in-prev'];
            SIBLING_ANIMATION_CLASSES.forEach(cls => element.classList.remove(cls));
            void element.offsetWidth; // Trigger reflow
            element.classList.add(animationClass);
        }
    }

    let practiceQuestionDirection = 1;
    let examQuestionDirection = 1;

    function renderHomePage() {
        let statesOptionsHtml = '<option value="">Select a State</option>';
        if (statesData && typeof statesData === 'object' && Object.keys(statesData).length > 0) {
            statesOptionsHtml += Object.entries(statesData)
                                     .map(([code, name]) => `<option value="${code}">${name}</option>`)
                                     .join('');
        } else {
            console.warn("States data not available for homepage.");
        }

        mainContent.innerHTML = `
            <div class="text-center">
                <h2 class="text-2xl font-semibold mb-6 text-gray-700">Welcome! Choose your mode:</h2>
                <div class="flex flex-col md:flex-row justify-center items-center space-y-4 md:space-y-0 md:space-x-6 mb-8">
                    <button id="practice-btn" class="bg-green-500 hover:bg-green-700 text-white font-bold py-3 px-8 rounded-lg text-lg shadow-md transform hover:scale-105 transition-transform duration-150">
                        Practice Mode
                    </button>
                    <button id="exam-btn" class="bg-red-500 hover:bg-red-700 text-white font-bold py-3 px-8 rounded-lg text-lg shadow-md transform hover:scale-105 transition-transform duration-150">
                        Exam Mode
                    </button>
                </div>
                <div class="mb-6 max-w-md mx-auto">
                    <label for="state-select" class="block text-lg font-medium text-gray-700 mb-2">Select Your State:</label>
                    <select id="state-select" class="block w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-700">
                        ${statesOptionsHtml}
                    </select>
                </div>
                 <div class="mt-8">
                    <button id="flashcard-btn" class="bg-purple-500 hover:bg-purple-700 text-white font-bold py-3 px-8 rounded-lg text-lg shadow-md transform hover:scale-105 transition-transform duration-150">
                        Flashcards
                    </button>
                </div>
            </div>
        `;
        animateContentChange(mainContent);

        if(document.getElementById('practice-btn')) document.getElementById('practice-btn').addEventListener('click', () => {
            const selectedState = document.getElementById('state-select').value;
            if (selectedState) {localStorage.setItem('selectedState', selectedState); renderPracticeMode();} else {alert('Please select a state first.');}
        });
        if(document.getElementById('exam-btn')) document.getElementById('exam-btn').addEventListener('click', () => {
            const selectedState = document.getElementById('state-select').value;
            if (selectedState) {localStorage.setItem('selectedState', selectedState); renderExamMode();} else {alert('Please select a state first.');}
        });
        if(document.getElementById('flashcard-btn')) document.getElementById('flashcard-btn').addEventListener('click', () => {
            const selectedState = document.getElementById('state-select').value;
            if (selectedState) {localStorage.setItem('selectedState', selectedState); renderFlashcardMode();} else {alert('Please select a state first.');}
        });
        const savedState = localStorage.getItem('selectedState');
        if (savedState && document.getElementById('state-select')) {document.getElementById('state-select').value = savedState;}
    }

    // --- Practice Mode ---
    let practiceQuestions = [];
    let currentQuestionIndex = 0;
    let userAnswers = {};

    function shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
    }
    function filterPracticeQuestions(selectedStateId) {
        if (!allQuestions || !Array.isArray(allQuestions)) {
            console.error("allQuestions is not available or not an array.");
            practiceQuestions = []; return;
        }
        const generalPool = allQuestions.filter(q => !q.state_id || q.state_id === "" || q.state_id === null);
        const statePool = allQuestions.filter(q => q.state_id === selectedStateId);
        let filtered = [...generalPool, ...statePool];
        const uniqueIds = new Set();
        practiceQuestions = filtered.filter(q => {
            if (q && q.id && !uniqueIds.has(q.id)) { uniqueIds.add(q.id); return true; }
            return false;
        });
        shuffleArray(practiceQuestions);
        console.log(`Practice questions filtered: ${practiceQuestions.length}`);
    }
    function renderPracticeMode() {
        const selectedState = localStorage.getItem('selectedState');
        if (!selectedState) { alert('State not selected. Returning to home.'); renderHomePage(); return; }
        filterPracticeQuestions(selectedState);
        if (practiceQuestions.length === 0) {
            mainContent.innerHTML = '<p class="text-center text-red-500">No questions for practice.</p>';
            animateContentChange(mainContent);
            if(document.getElementById('back-home-err')) document.getElementById('back-home-err').addEventListener('click', renderHomePage);
            return;
        }
        currentQuestionIndex = 0; userAnswers = {}; practiceQuestionDirection = 1;
        renderPracticeQuestion();
    }

    function renderPracticeQuestion() {
        if (currentQuestionIndex >= practiceQuestions.length) {
            const correctCount = Object.values(userAnswers).filter(ua => ua.correct).length;
            const incorrectCount = Object.values(userAnswers).filter(ua => ua.answer !== null && !ua.correct).length;
            const totalAnswered = Object.values(userAnswers).filter(ua => ua.answer !== null).length;
            mainContent.innerHTML = `
                <div class="text-center p-6 bg-white rounded-lg shadow-lg max-w-md mx-auto">
                    <h2 class="text-2xl font-bold mb-4">Practice Session Complete!</h2>
                    <p class="mb-2 text-lg">You answered ${totalAnswered} out of ${practiceQuestions.length} questions.</p>
                    <p class="mb-2 text-green-600 font-semibold">${correctCount} correct answers.</p>
                    <p class="mb-6 text-red-600 font-semibold">${incorrectCount} incorrect answers.</p>
                    <div class="flex justify-center space-x-4">
                        <button id="restart-practice-btn" class="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-6 rounded">Restart</button>
                        <button id="back-to-home-btn-end" class="bg-indigo-500 hover:bg-indigo-600 text-white font-bold py-2 px-6 rounded">Home</button>
                    </div></div>`;
            animateContentChange(mainContent);
            if(document.getElementById('restart-practice-btn')) document.getElementById('restart-practice-btn').addEventListener('click', renderPracticeMode);
            if(document.getElementById('back-to-home-btn-end')) document.getElementById('back-to-home-btn-end').addEventListener('click', renderHomePage);
            return;
        }
        const question = practiceQuestions[currentQuestionIndex];
        if (!question || !question.options) {
            mainContent.innerHTML = '<p class="text-center text-red-500">Error loading question.</p>';
            animateContentChange(mainContent);
            if(document.getElementById('back-home-err')) document.getElementById('back-home-err').addEventListener('click', renderHomePage);
            return;
        }
        if (!userAnswers[question.id]) { userAnswers[question.id] = { answer: null, correct: null, marked: false };}
        const userAnswerInfo = userAnswers[question.id];
        const userAnswer = userAnswerInfo.answer;
        const isMarked = userAnswerInfo.marked;
        mainContent.innerHTML = `
            <div class="bg-white p-4 md:p-6 rounded-lg shadow-lg max-w-2xl mx-auto">
                <div class="flex justify-between items-center mb-4">
                    <p class="text-sm text-gray-600">Q ${currentQuestionIndex + 1}/${practiceQuestions.length}</p>
                    <button id="mark-later-btn" class="px-3 py-1 text-sm rounded ${isMarked ? 'bg-yellow-400 hover:bg-yellow-500 text-white' : 'bg-gray-200 hover:bg-gray-300'}">${isMarked ? '✓ Marked' : 'Mark'}</button>
                </div>
                <h3 class="text-lg md:text-xl font-semibold mb-1">${question.question_text}</h3>
                <p class="text-md text-gray-700 mb-4 italic">${question.question_text_de}</p>
                <div class="space-y-3">
                    ${question.options.map(opt => {
                        const optionLetter = opt.id;
                        let btnClass = 'border-gray-300 hover:bg-gray-100';
                        if (userAnswer === optionLetter) btnClass = userAnswerInfo.correct ? 'bg-green-200 border-green-400 ring-2 ring-green-500' : 'bg-red-200 border-red-400 ring-2 ring-red-500';
                        else if (userAnswer !== null && optionLetter === question.correct_answer) btnClass = 'bg-green-100 border-green-300';
                        return `<button data-option="${optionLetter}" class="option-btn block w-full text-left p-3 border rounded-md transition-all ${btnClass} ${userAnswer !== null ? 'pointer-events-none opacity-80' : ''}"><span class="font-bold mr-2">${optionLetter.toUpperCase()}.</span> ${opt.text} <span class="italic text-sm">(${opt.text_de})</span></button>`;
                    }).join('')}
                </div>
                ${userAnswer !== null ? `<div class="mt-4 p-3 rounded-md ${userAnswerInfo.correct ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}">${userAnswerInfo.correct ? 'Correct!' : 'Incorrect.'} Ans: <span class="font-bold">${question.correct_answer.toUpperCase()}</span>. ${question.options.find(o => o.id === question.correct_answer)?.text_de || ''}</div>` : ''}
                <div class="mt-6 flex justify-between items-center">
                    <button id="prev-btn" class="bg-gray-500 hover:bg-gray-600 text-white py-2 px-4 rounded ${currentQuestionIndex === 0 ? 'opacity-50 k' : ''}" ${currentQuestionIndex === 0 ? 'disabled' : ''}>Prev</button>
                    <span class="text-sm text-gray-500">${userAnswer !== null ? (userAnswerInfo.correct ? 'Correct' : 'Incorrect') : 'Select...'}</span>
                    <button id="next-btn" class="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded ${userAnswer === null && currentQuestionIndex !== practiceQuestions.length -1 ? 'opacity-50 k' : ''}" ${userAnswer === null && currentQuestionIndex !== practiceQuestions.length -1 ? 'disabled' : ''}>Next</button>
                </div>
                <button id="back-to-home-btn" class="mt-6 bg-indigo-500 hover:bg-indigo-600 text-white py-2 px-4 rounded w-full">Home</button>
            </div>`;
        animateContentChange(mainContent, practiceQuestionDirection === 1 ? 'slide-in-next' : 'slide-in-prev');
        document.querySelectorAll('.option-btn').forEach(btn => btn.addEventListener('click', handleAnswerSelection));
        if(document.getElementById('prev-btn')) document.getElementById('prev-btn').addEventListener('click', navigatePracticeQuestion(-1));
        if(document.getElementById('next-btn')) document.getElementById('next-btn').addEventListener('click', navigatePracticeQuestion(1));
        if(document.getElementById('mark-later-btn')) document.getElementById('mark-later-btn').addEventListener('click', toggleMarkForLater);
        if(document.getElementById('back-to-home-btn')) document.getElementById('back-to-home-btn').addEventListener('click', () => { (Object.keys(userAnswers).length > 0 && confirm("Leave practice?")) || Object.keys(userAnswers).length === 0 ? renderHomePage() : void 0; });
    }
    function handleAnswerSelection(event) {
        const selectedOptionId = event.target.closest('.option-btn').dataset.option;
        const question = practiceQuestions[currentQuestionIndex];
        if (!userAnswers[question.id] || userAnswers[question.id].answer !== null) return;
        userAnswers[question.id] = {...userAnswers[question.id], answer: selectedOptionId, correct: selectedOptionId === question.correct_answer};
        renderPracticeQuestion();
    }
    function navigatePracticeQuestion(direction) {
        return () => { practiceQuestionDirection = direction; currentQuestionIndex += direction; renderPracticeQuestion(); };
    }
    function toggleMarkForLater() {
        const question = practiceQuestions[currentQuestionIndex];
        if (question && userAnswers[question.id]) { userAnswers[question.id].marked = !userAnswers[question.id].marked; renderPracticeQuestion(); }
    }

    // --- Exam Mode ---
    let examQuestions = []; currentExamQuestionIndex = 0; examUserAnswers = {}; examTimerInterval; examTimeRemaining = 3600;
    function filterExamQuestions(stateId) { /* ... (same as before) ... */ }
    function startExamTimer() { /* ... (same as before) ... */ }
    function renderExamMode() {
        const selectedState = localStorage.getItem('selectedState');
        if (!selectedState) { alert('State not selected.'); renderHomePage(); return; }
        filterExamQuestions(selectedState);
        if (examQuestions.length === 0) { mainContent.innerHTML = '<p class="text-red-500">No questions for exam.</p>'; animateContentChange(mainContent); return; }
        currentExamQuestionIndex = 0; examUserAnswers = {}; examQuestionDirection = 1;
        mainContent.innerHTML = `
            <div class="bg-white p-4 md:p-6 rounded-lg shadow-lg max-w-2xl mx-auto">
                <div class="flex justify-between items-center mb-4"><h2 class="text-xl md:text-2xl font-bold">Exam</h2><div id="exam-timer" class="text-lg font-semibold text-red-600">60:00</div></div>
                <div id="exam-question-area"></div>
                <div class="mt-6 flex justify-between">
                    <button id="prev-exam-btn" class="bg-gray-500 hover:bg-gray-600 text-white py-2 px-4 rounded">Prev</button>
                    <button id="next-exam-btn" class="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded">Next</button>
                </div>
                <button id="submit-exam-btn" class="mt-4 bg-green-500 hover:bg-green-600 text-white py-2 px-4 rounded w-full">Submit</button>
                <button id="cancel-exam-btn" class="mt-2 bg-red-700 hover:bg-red-800 text-white py-2 px-4 rounded w-full">Cancel</button>
            </div>`;
        animateContentChange(mainContent);
        renderExamQuestion(); startExamTimer();
        if(document.getElementById('prev-exam-btn')) document.getElementById('prev-exam-btn').addEventListener('click', navigateExamQuestion(-1));
        if(document.getElementById('next-exam-btn')) document.getElementById('next-exam-btn').addEventListener('click', navigateExamQuestion(1));
        if(document.getElementById('submit-exam-btn')) document.getElementById('submit-exam-btn').addEventListener('click', () => { if (confirm('Submit exam?')) submitExam(); });
        if(document.getElementById('cancel-exam-btn')) document.getElementById('cancel-exam-btn').addEventListener('click', () => { if (confirm('Cancel exam?')) { clearInterval(examTimerInterval); renderHomePage(); } });
    }
    function renderExamQuestion() {
        const questionArea = document.getElementById('exam-question-area');
        if (!questionArea) { mainContent.innerHTML = "<p>Error display.</p>"; return; }
        const prevBtn = document.getElementById('prev-exam-btn'); if (prevBtn) prevBtn.disabled = currentExamQuestionIndex === 0;
        const nextBtn = document.getElementById('next-exam-btn'); if (nextBtn) nextBtn.disabled = currentExamQuestionIndex === examQuestions.length - 1;
        if (currentExamQuestionIndex >= examQuestions.length || currentExamQuestionIndex < 0) { questionArea.innerHTML = "<p>Nav error.</p>"; return; }
        const question = examQuestions[currentExamQuestionIndex];
        if (!question || !question.options || !Array.isArray(question.options)) { questionArea.innerHTML = "<p>Invalid Q.</p>"; return; }
        const userAnswer = examUserAnswers[question.id];
        questionArea.innerHTML = `
            <p class="text-sm text-gray-600 mb-2">Q ${currentExamQuestionIndex + 1}/${examQuestions.length}</p>
            <h3 class="text-lg md:text-xl font-semibold mb-1">${question.question_text}</h3><p class="text-md italic mb-4">${question.question_text_de}</p>
            <div class="space-y-3">
                ${question.options.map(opt => `<label class="block p-3 border rounded-md hover:bg-gray-100 cursor-pointer ${userAnswer === opt.id ? 'bg-blue-100 ring-2 ring-blue-400' : 'border-gray-300'}"><input type="radio" name="exam_option_${question.id}" value="${opt.id}" class="mr-3" ${userAnswer === opt.id ? 'checked' : ''}><span class="font-bold">${opt.id.toUpperCase()}.</span> ${opt.text} <span class="italic text-sm">(${opt.text_de})</span></label>`).join('')}
            </div>`;
        animateContentChange(questionArea, examQuestionDirection === 1 ? 'slide-in-next' : 'slide-in-prev');
        document.querySelectorAll(`input[name="exam_option_${question.id}"]`).forEach(r => r.addEventListener('change', handleExamAnswerSelection));
    }
    function navigateExamQuestion(direction) { return () => { examQuestionDirection = direction; currentExamQuestionIndex += direction; renderExamQuestion(); }; }
    function handleExamAnswerSelection(event) { examUserAnswers[examQuestions[currentExamQuestionIndex].id] = event.target.value; }
    function submitExam() {
        clearInterval(examTimerInterval); let correctAnswers = 0;
        examQuestions.forEach(q => { if (q && q.id && examUserAnswers[q.id] === q.correct_answer) correctAnswers++; });
        const passed = correctAnswers >= 17;
        mainContent.innerHTML = `<div class="bg-white p-6 rounded-lg shadow-lg text-center"><h2 class="text-3xl font-bold mb-4 ${passed ? 'text-green-600':'text-red-600'}">${passed ? 'Passed!':'Failed'}</h2><p class="text-xl mb-6">${correctAnswers}/${examQuestions.length} correct.</p><button id="home-exam-end" class="bg-indigo-500 text-white py-3 px-6 rounded">Home</button></div>`;
        animateContentChange(mainContent);
        if(document.getElementById('home-exam-end')) document.getElementById('home-exam-end').addEventListener('click', renderHomePage);
    }

    // --- Flashcard Mode ---
    let flashcardQuestions = []; currentFlashcardIndex = 0; flashcardTimerInterval; flashcardTimeRemaining = 15; showingFlashcardAnswer = false;
    function filterFlashcardQuestions(stateId) { /* ... (same as before) ... */ }
    function startFlashcardTimer() { /* ... (same as before, ensure timerDisplay check) ... */ }
    function renderFlashcardMode() {
        const selectedState = localStorage.getItem('selectedState');
        if (!selectedState) { alert('State not selected.'); renderHomePage(); return; }
        filterFlashcardQuestions(selectedState);
        if (flashcardQuestions.length === 0) { mainContent.innerHTML = '<p class="text-red-500">No Qs for flashcards.</p>'; animateContentChange(mainContent); return; }
        currentFlashcardIndex = Math.floor(Math.random() * flashcardQuestions.length);
        renderFlashcardQuestion();
    }
    function renderFlashcardQuestion() {
        if (flashcardQuestions.length === 0) { noMoreFlashcardsScreen(); return; }
        if (currentFlashcardIndex >= flashcardQuestions.length) currentFlashcardIndex = Math.floor(Math.random() * flashcardQuestions.length);
        const question = flashcardQuestions[currentFlashcardIndex];
        if (!question || !question.options) { mainContent.innerHTML = "<p>Invalid flashcard Q.</p>"; animateContentChange(mainContent); return; }
        showingFlashcardAnswer = false;
        mainContent.innerHTML = `
            <div class="bg-white p-6 rounded-lg shadow-xl max-w-lg mx-auto text-center">
                <div class="flex justify-between items-center mb-4"><h2 class="text-2xl font-bold">Flashcard</h2><div id="flashcard-timer" class="text-xl font-semibold text-blue-600">15s</div></div>
                <div id="flashcard-content" class="mb-6 min-h-[150px]"><h3 class="text-2xl">${question.question_text}</h3><p class="italic">${question.question_text_de}</p></div>
                <div id="flashcard-options" class="space-y-3">${question.options.map(opt => `<button data-option="${opt.id}" class="flashcard-option-btn block w-full p-4 border rounded-lg hover:bg-gray-100"><span class="font-bold">${opt.id.toUpperCase()}.</span> ${opt.text} (${opt.text_de})</button>`).join('')}</div>
                <div id="flashcard-feedback" class="mt-4 min-h-[60px]"></div>
                <div id="flashcard-controls" class="mt-4"><button id="finish-flashcard-btn" class="bg-red-500 text-white py-2 px-4 rounded w-full">Finish</button></div>
            </div>`;
        animateContentChange(mainContent, 'fade-in');
        document.querySelectorAll('.flashcard-option-btn').forEach(btn => btn.addEventListener('click', handleFlashcardAnswer));
        if(document.getElementById('finish-flashcard-btn')) document.getElementById('finish-flashcard-btn').addEventListener('click', () => { clearInterval(flashcardTimerInterval); renderHomePage(); });
        startFlashcardTimer();
    }
    function handleFlashcardAnswer(event) {
        if (showingFlashcardAnswer) return; clearInterval(flashcardTimerInterval);
        const selectedOption = event.target.closest('.flashcard-option-btn').dataset.option;
        const question = flashcardQuestions[currentFlashcardIndex]; if (!question) { renderFlashcardQuestion(); return; }
        if (selectedOption === question.correct_answer) {
            const fb = document.getElementById('flashcard-feedback'); if(fb) fb.innerHTML = '<p class="text-green-600">Correct!</p>';
            flashcardQuestions.splice(currentFlashcardIndex, 1);
            setTimeout(() => { flashcardQuestions.length > 0 ? (currentFlashcardIndex = Math.floor(Math.random() * flashcardQuestions.length), renderFlashcardQuestion()) : noMoreFlashcardsScreen(); }, 1500);
        } else { revealFlashcardAnswer(true); }
    }
    function revealFlashcardAnswer(wasClickedWrong) {
        if (showingFlashcardAnswer) return; showingFlashcardAnswer = true; clearInterval(flashcardTimerInterval);
        const question = flashcardQuestions[currentFlashcardIndex]; if (!question) { noMoreFlashcardsScreen(); return; }
        const fb = document.getElementById('flashcard-feedback'); const optsArea = document.getElementById('flashcard-options'); const ctrlsArea = document.getElementById('flashcard-controls');
        if (fb) { const co = question.options.find(o => o.id === question.correct_answer); fb.innerHTML = `<p class="text-red-600">${wasClickedWrong ? 'Incorrect.' : 'Time up.'} Ans: ${question.correct_answer.toUpperCase()}. ${co?.text_de || ''}</p>`; animateContentChange(fb, 'fade-in'); }
        if (optsArea) optsArea.querySelectorAll('.flashcard-option-btn').forEach(btn => { btn.disabled = true; btn.classList.add('opacity-50'); if (btn.dataset.option === question.correct_answer) btn.classList.add('bg-green-200'); });
        if (ctrlsArea) { ctrlsArea.innerHTML = `<button id="proceed-flashcard-btn" class="bg-blue-500 text-white py-2 px-4 rounded mr-2">Next</button><button id="finish-flashcard-btn-reveal" class="bg-red-500 text-white py-2 px-4 rounded">Finish</button>`;
            if(document.getElementById('proceed-flashcard-btn')) document.getElementById('proceed-flashcard-btn').addEventListener('click', () => { flashcardQuestions.splice(currentFlashcardIndex, 1); flashcardQuestions.length > 0 ? (currentFlashcardIndex = Math.floor(Math.random() * flashcardQuestions.length), renderFlashcardQuestion()) : noMoreFlashcardsScreen(); });
            if(document.getElementById('finish-flashcard-btn-reveal')) document.getElementById('finish-flashcard-btn-reveal').addEventListener('click', renderHomePage); }
    }
    function noMoreFlashcardsScreen() {
        clearInterval(flashcardTimerInterval);
        mainContent.innerHTML = `<div class="text-center p-6 bg-white rounded-lg shadow-lg"><h2 class="text-2xl font-bold mb-4">Flashcards Done!</h2><button id="restart-flashcards-btn" class="bg-blue-500 text-white py-2 px-4 rounded mr-2">Restart</button><button id="back-to-home-flash-end-btn" class="bg-indigo-500 text-white py-2 px-4 rounded">Home</button></div>`;
        animateContentChange(mainContent);
        if(document.getElementById('restart-flashcards-btn')) document.getElementById('restart-flashcards-btn').addEventListener('click', renderFlashcardMode);
        if(document.getElementById('back-to-home-flash-end-btn')) document.getElementById('back-to-home-flash-end-btn').addEventListener('click', renderHomePage);
    }

    // Initial render:
    if (mainContent) { renderHomePage(); } else { console.error("main-content not found."); }
});
