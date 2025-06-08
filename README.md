# Einbürgerungstest Practice Application

## Einbürgerungstest – German Naturalization Test
Einbürgerungstest is the official naturalization (citizenship) test in Germany. It consists of 33 multiple-choice questions covering German history, politics, society, and values. To pass, you must answer at least 17 questions correctly within a set time limit.

## Why this is useful
This project is helpful for:

*   Preparing for German citizenship: It helps applicants practice and get familiar with the actual test format.
*   Learning about Germany: Even if you're not applying for citizenship, it’s a great way to learn about the country’s culture, laws, and democratic system.
*   Improving German skills: Since the test is in German, practicing it can also improve your language comprehension.

## ✨ TypeScript Migration

This project has been fully migrated to **TypeScript**. This enhances the development process by providing static typing, which helps catch errors early, improve code quality, and make the codebase more maintainable and understandable.

## 🚀 Features

*   **Practice Mode:** Answer questions from the general catalog or specific to a selected German state. Get immediate feedback on your answers and explanations.
*   **Exam Mode:** Simulate the real exam with a timed session of 33 questions (including state-specific ones if a state is selected).
*   **Flashcard Mode:** Review questions and answers quickly to reinforce learning.
*   **State Selection:** Practice questions relevant to a specific German federal state.
*   **Multilingual Support:** View question translations in multiple languages during practice and flashcard modes to aid understanding (Exam mode is in German only).
*   **Responsive Design:** Accessible on various devices.

## 🛠️ Tech Stack

*   **React:** For building the user interface.
*   **Vite:** As the build tool and development server.
*   **TypeScript:** For static typing and improved code quality.
*   **Tailwind CSS:** For styling the application.
*   **React Router:** For client-side routing.

## 🏁 Getting Started

These instructions will get you a copy of the project up and running on your local machine for development and testing purposes.

### Prerequisites

*   Node.js (v18.x or later recommended)
*   npm (comes with Node.js)

### Development Instructions

1.  **Clone the repository (if you haven't already):**
    ```bash
    git clone <repository-url>
    cd <repository-directory>
    ```

2.  **Install dependencies:**
    Open your terminal in the project root directory and run:
    ```bash
    npm install
    ```

3.  **Run the development server:**
    To start the Vite development server with Hot Module Replacement (HMR):
    ```bash
    npm run dev
    ```
    This will typically open the application in your default web browser at `http://localhost:5173` (or another port if 5173 is busy).

4.  **Type Checking:**
    To check for TypeScript errors without running a build:
    ```bash
    npx tsc
    ```
    Alternatively, you can add a script to your `package.json` like `"typecheck": "tsc --noEmit"` and run `npm run typecheck`.

5.  **Linting:**
    To run ESLint for code style and error checking:
    ```bash
    npm run lint
    ```

6.  **Build for production:**
    To create a production build of the application:
    ```bash
    npm run build
    ```
    The production files will be placed in the `dist` directory. You can then serve this directory with a static file server.

## 📄 Data Files

The application uses JSON files for questions and state information, located in the `public/data/` directory.
*   `question.json`: Contains the general and state-specific questions.
*   `states.json`: Contains the list of German federal states.

## Contributing

Contributions are welcome! If you have suggestions for improvements or find any issues, please feel free to open an issue or submit a pull request.

---

This README provides a more comprehensive overview of the project and up-to-date development instructions.
