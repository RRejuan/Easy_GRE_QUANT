import { Route, Routes } from "react-router-dom";
import { Layout } from "./components/Layout";
import { DashboardPage } from "./pages/DashboardPage";
import { SkillListPage } from "./pages/SkillListPage";
import { SkillPage } from "./pages/SkillPage";
import { DiagnosticPage } from "./pages/DiagnosticPage";
import { MockTestPage } from "./pages/MockTestPage";
import "./App.css";

function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<DashboardPage />} />
        <Route path="/skills" element={<SkillListPage />} />
        <Route path="/skill/:skillId" element={<SkillPage />} />
        <Route path="/diagnostic" element={<DiagnosticPage />} />
        <Route path="/mock-test" element={<MockTestPage />} />
      </Route>
    </Routes>
  );
}

export default App;
