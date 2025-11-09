import "@/App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import LandingPage from "@/pages/LandingPage";
import DiagnosticoPage from "@/pages/DiagnosticoPage";
import TestScoringPage from "@/pages/TestScoringPage";
import TestDuplicateMessage from "@/pages/TestDuplicateMessage";
import { Toaster } from "@/components/ui/sonner";

function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/diagnostico" element={<DiagnosticoPage />} />
          <Route path="/test-scoring" element={<TestScoringPage />} />
          <Route path="/test-duplicate" element={<TestDuplicateMessage />} />
        </Routes>
      </BrowserRouter>
      <Toaster position="top-center" richColors />
    </div>
  );
}

export default App;