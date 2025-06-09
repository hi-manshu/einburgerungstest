import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";
import "./custom.css";
import { BrowserRouter } from "react-router-dom";

const rootElement = document.getElementById("root");

if (rootElement) {
  ReactDOM.createRoot(rootElement).render(
    <React.StrictMode>
      <BrowserRouter>
        <App />
        {/* console.log("Firebase Analytics initialized:", analytics); */}
        {/* console.log("Firebase App initialized:", app); */}
      </BrowserRouter>
    </React.StrictMode>
  );
} else {
  console.error("Failed to find the root element");
}
