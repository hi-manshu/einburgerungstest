function runAllTests() { // Encapsulate tests

describe('Data Loading and Preparation (via questions_data.js)', () => {
    it('should load questions into allQuestions global array', () => {
        assertTrue(Array.isArray(allQuestions), 'allQuestions should be an array.');
        assertTrue(allQuestions.length > 0, 'allQuestions should not be empty.');
        assertNotNull(allQuestions[0].id, 'First question should have an id.');
        assertTrue(allQuestions[0].options.length > 0, 'First question should have options.');
    });

    it('should load states into statesData global object', () => {
        assertTrue(typeof statesData === 'object' && statesData !== null, 'statesData should be an object.');
        assertTrue(Object.keys(statesData).length > 0, 'statesData should not be empty.');
        // Example check for a specific state code if known, e.g. 'BW' for Baden-Württemberg
        // This depends on the actual content of states.json
        // assertNotNull(statesData['BW'], 'Example state BW should be present in statesData.');
    });
});

describe('Shuffle Array Utility', () => {
    // shuffleArray is defined within app.js's DOMContentLoaded.
    // To make it directly testable, it would need to be global or exported.
    // For this test, we assume it's been made available for testing (e.g. by attaching to window for tests)
    // If app.js is loaded, shuffleArray *should* be in its scope.
    // The test runner loads app.js, so its functions are in the global scope of the runner.
    it('should shuffle an array and maintain its length and elements', () => {
        if (typeof shuffleArray !== 'function') {
            console.warn('Skipping shuffleArray test as it is not found in the global scope.');
            // This assertion will make the test fail if shuffleArray is not defined.
            assertTrue(typeof shuffleArray === 'function', 'shuffleArray function should be defined and accessible for testing.');
            return;
        }
        const originalArray = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
        const controlArray = [...originalArray]; // For comparison of elements
        const shuffled = [...originalArray];
        shuffleArray(shuffled);

        assertEquals(shuffled.length, originalArray.length, 'Shuffled array length should match original.');
        // Check if elements are the same (regardless of order)
        assertDeepEquals(shuffled.sort((a,b) => a-b), controlArray.sort((a,b) => a-b), 'Shuffled array should contain the same elements as the original.');
        // For a sufficiently large array, it's highly unlikely to be identical after shuffle.
        if (originalArray.length > 5) { // Avoid flaky test for very small arrays
             assertFalse(JSON.stringify(shuffled) === JSON.stringify(originalArray), 'Shuffled array should likely be different from original (for non-trivial array).');
        }
    });
});

describe('Mode-Specific Question Filtering Logic', () => {
    // These tests rely on functions defined within app.js's DOMContentLoaded scope.
    // They are made testable by being global or via a testing utility that can access app's scope.
    // The test runner loads app.js, making its global functions available.

    const testStateId = Object.keys(statesData)[0] || 'SH'; // Use first available state or a default like Schleswig-Holstein
    localStorage.setItem('selectedState', testStateId); // filter functions might use this

    it('should filter questions for Practice Mode (all general + all for selected state)', () => {
        if (typeof filterPracticeQuestions !== 'function') {
            assertTrue(false, 'filterPracticeQuestions function is not accessible for testing.'); return;
        }
        filterPracticeQuestions(testStateId); // This function sets a global `practiceQuestions` in app.js
        assertNotNull(window.practiceQuestions, "practiceQuestions global should be set by filterPracticeQuestions.");
        assertTrue(window.practiceQuestions.length > 0, 'Practice questions list should not be empty.');

        const generalCount = window.practiceQuestions.filter(q => !q.state_id || q.state_id === "").length;
        const stateCount = window.practiceQuestions.filter(q => q.state_id === testStateId).length;

        const expectedGeneral = allQuestions.filter(q => !q.state_id || q.state_id === "").length;
        const expectedStateSpecific = allQuestions.filter(q => q.state_id === testStateId).length;

        assertEquals(generalCount, expectedGeneral, 'Should include ALL general questions.');
        assertEquals(stateCount, expectedStateSpecific, 'Should include ALL questions for the selected state.');
    });

    it('should filter questions for Exam Mode (30 general, 3 state) if available', () => {
        if (typeof filterExamQuestions !== 'function') {
            assertTrue(false, 'filterExamQuestions function is not accessible for testing.'); return;
        }
        filterExamQuestions(testStateId); // This function sets a global `examQuestions` in app.js
        assertNotNull(window.examQuestions, "examQuestions global should be set by filterExamQuestions.");

        const actualGeneralCount = window.examQuestions.filter(q => !q.state_id || q.state_id === "").length;
        const actualStateCount = window.examQuestions.filter(q => q.state_id === testStateId).length;

        const maxAvailableGeneral = allQuestions.filter(q => !q.state_id || q.state_id === "").length;
        const maxAvailableState = allQuestions.filter(q => q.state_id === testStateId).length;

        const expectedGeneralInExam = Math.min(30, maxAvailableGeneral);
        const expectedStateInExam = Math.min(3, maxAvailableState);

        assertEquals(actualGeneralCount, expectedGeneralInExam, `Exam should have ${expectedGeneralInExam} general questions.`);
        assertEquals(actualStateCount, expectedStateInExam, `Exam should have ${expectedStateInExam} state questions.`);
        assertEquals(window.examQuestions.length, expectedGeneralInExam + expectedStateInExam, 'Total exam questions count should match sum of expected general and state.');
    });

    it('should filter questions for Flashcard Mode (up to 300 general, up to 10 state)', () => {
        if (typeof filterFlashcardQuestions !== 'function') {
            assertTrue(false, 'filterFlashcardQuestions function is not accessible for testing.'); return;
        }
        filterFlashcardQuestions(testStateId); // This function sets a global `flashcardQuestions` in app.js
        assertNotNull(window.flashcardQuestions, "flashcardQuestions global should be set by filterFlashcardQuestions.");

        const actualGeneralCount = window.flashcardQuestions.filter(q => !q.state_id || q.state_id === "").length;
        const actualStateCount = window.flashcardQuestions.filter(q => q.state_id === testStateId).length;

        const maxAvailableGeneral = allQuestions.filter(q => !q.state_id || q.state_id === "").length;
        const maxAvailableState = allQuestions.filter(q => q.state_id === testStateId).length;

        const expectedGeneralInFlash = Math.min(300, maxAvailableGeneral);
        const expectedStateInFlash = Math.min(10, maxAvailableState);

        assertEquals(actualGeneralCount, expectedGeneralInFlash, `Flashcards should have ${expectedGeneralInFlash} general questions.`);
        assertEquals(actualStateCount, expectedStateInFlash, `Flashcards should have ${expectedStateInFlash} state questions.`);
        assertEquals(window.flashcardQuestions.length, expectedGeneralInFlash + expectedStateInFlash, 'Total flashcard questions count should match sum of expected general and state.');
    });
});

describe('Exam Score Calculation (Conceptual)', () => {
    // submitExam is complex and UI-bound. Test its core logic if extracted.
    // For now, let's test a hypothetical score calculation part.
    // In a real scenario, `calculateScore` would be a helper function in app.js.
    const calculateExamScore = (questions, answers) => {
        let correct = 0;
        questions.forEach(q => {
            if (q && q.id && answers[q.id] === q.correct_answer) {
                correct++;
            }
        });
        return correct;
    };

    it('should correctly determine PASS result (>= 17 correct) for exam', () => {
        const mockExamQs = allQuestions.slice(0, 33).map((q, i) => ({...q, id: `q_exam_${i}`}));
        const userAns = {};
        for(let i = 0; i < 17; i++) { if(mockExamQs[i]) userAns[mockExamQs[i].id] = mockExamQs[i].correct_answer; }
        const score = calculateExamScore(mockExamQs, userAns);
        assertTrue(score >= 17, `Score of ${score} should be a PASS.`);
    });

    it('should correctly determine FAIL result (< 17 correct) for exam', () => {
        const mockExamQs = allQuestions.slice(0, 33).map((q, i) => ({...q, id: `q_exam_fail_${i}`}));
        const userAns = {};
        for(let i = 0; i < 16; i++) { if(mockExamQs[i]) userAns[mockExamQs[i].id] = mockExamQs[i].correct_answer; }
        const score = calculateExamScore(mockExamQs, userAns);
        assertFalse(score >= 17, `Score of ${score} should be a FAIL.`);
    });
});

// Note: UI interaction tests (e.g., button clicks, DOM updates) are not covered here.
// Those would typically require a more advanced testing framework like Selenium, Puppeteer, or Playwright.
// Also, functions within app.js's DOMContentLoaded are tested assuming they become globally available
// or that the test runner executes them in a context where they are defined (e.g. after app.js loads).

} // End of runAllTests
