import { Route, Routes } from "react-router-dom";
import { SkillListPage } from "./pages/SkillListPage";
import { SkillPage } from "./pages/SkillPage";
import "./App.css";

function App() {
  return (
    <Routes>
      <Route path="/" element={<SkillListPage />} />
      <Route path="/skill/:skillId" element={<SkillPage />} />
    </Routes>
  );
}

export default App;
