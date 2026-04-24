import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

console.log("🚀 Mindhubs App: Initializing root...");
const rootElement = document.getElementById("root");

if (!rootElement) {
  console.error("❌ Mindhubs App: Root element not found!");
} else {
  console.log("✅ Mindhubs App: Root element found, rendering...");
  createRoot(rootElement).render(<App />);
}
