import "./index.css";
import React from "react";
import ReactDOM from "react-dom/client";
import { MemoryRouter as Router, Routes, Route } from "react-router-dom";
import { HomePage } from "./client/pages/home";
import { SdkStateProvider } from "./client/components/contexts/SdkStateContext";

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <SdkStateProvider>
      <Router>
        <Routes>
          <Route path="/" element={<HomePage />} />
        </Routes>
      </Router>
    </SdkStateProvider>
  </React.StrictMode>
);
