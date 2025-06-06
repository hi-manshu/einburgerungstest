// This file will be populated with questions data
let allQuestions = [];
let statesData = {};

async function loadQuestions() {
    try {
        const response = await fetch('../data/question.json');
        allQuestions = await response.json();
        console.log('Questions loaded:', allQuestions.length);
    } catch (error) {
        console.error('Error loading questions.json:', error);
        document.getElementById('main-content').innerHTML = '<p class="text-red-500 text-center">Error loading questions. Please try again later.</p>';
    }
}

async function loadStates() {
    try {
        const response = await fetch('../data/states.json');
        // The states.json is an array of objects, but the original app.js used it as an object (key-value pair).
        // For consistency with how it was used in renderHomePage (Object.entries(statesData)...),
        // let's transform it into an object where keys are state codes.
        const statesArray = await response.json();
        statesData = statesArray.reduce((obj, state) => {
            obj[state.code] = state.name; // Or use state.name for display and map to code if needed
            return obj;
        }, {});
        console.log('States loaded:', Object.keys(statesData).length);
    } catch (error) {
        console.error('Error loading states.json:', error);
    }
}
