# Einbürgerungstest Practice App

This is a web application to practice for the German citizenship test (Einbürgerungstest).

## Features

*   **Practice Mode**: Answer general and state-specific questions at your own pace. Mark questions for later review.
*   **Exam Mode**: Simulate the real exam with 33 questions (30 general, 3 state-specific) under a 60-minute timer. Results show pass/fail status.
*   **Flashcard Mode**: Quickly review questions with a 15-second timer per card.
*   **State Selection**: Choose your federal state to include relevant questions.
*   **Responsive Design**: Mobile and tablet friendly.
*   **Styled with Tailwind CSS**: Modern and clean interface.

## Development

This project is built with HTML, CSS (Tailwind CSS and custom styles), and vanilla JavaScript.

### Data Files
*   `data/question.json`: Contains all questions, options, and answers.
*   `data/states.json`: Contains the mapping of state IDs to state names.

### Main Scripts
*   `assets/js/questions_data.js`: Handles loading of question and state data.
*   `assets/js/app.js`: Contains the core application logic for different modes and UI rendering.

## Deployment

This application is designed to be deployed on GitHub Pages.

**To Deploy:**

1.  **Push to GitHub:** Ensure all your code (HTML, CSS, JS, data files) is pushed to a GitHub repository (e.g., named `einburgerungstest-practise`).
2.  **Enable GitHub Pages:**
    *   Go to your repository settings on GitHub.
    *   Navigate to the "Pages" section in the sidebar.
    *   Under "Build and deployment", choose your source:
        *   **Deploy from a branch**: Select your main branch (e.g., `main` or `master`).
        *   Choose the folder: Select `/(root)` if your `index.html` is in the root of the branch. If you move all files into a `/docs` folder, select that.
    *   Click "Save".
3.  **Access Your Site:** Your site should be available at `https://<your-username>.github.io/einburgerungstest-practise/` (if the repository is named `einburgerungstest-practise`).

## Running Tests

To run the unit tests:
1. Open the `tests/test-runner.html` file in your web browser.
2. Open the browser's developer console (usually by pressing F12) to see detailed test output.
