import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./styles/index.css";

const root = document.getElementById("root");
if (!root) throw new Error("Missing #root element");

createRoot(root).render(
  <StrictMode>
    <main className="p-8 font-sans">Scaffold ready.</main>
  </StrictMode>,
);
