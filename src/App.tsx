import { Route, Routes } from "react-router-dom";
import { SkillListPage } from "./pages/SkillListPage";
import { SkillPage } from "./pages/SkillPage";
import { DiagnosticPage } from "./pages/DiagnosticPage";
import { DashboardPage } from "./pages/DashboardPage";
import "./App.css";

function App() {
  return (
    <Routes>
      <Route path="/" element={<SkillListPage />} />
      <Route path="/skill/:skillId" element={<SkillPage />} />
      <Route path="/diagnostic" element={<DiagnosticPage />} />
      <Route path="/dashboard" element={<DashboardPage />} />
    </Routes>
  );
}

export default App;
