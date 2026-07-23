import { Route, Routes } from "react-router-dom";
import { Layout } from "./components/Layout";
import { DashboardPage } from "./pages/DashboardPage";
import { SkillListPage } from "./pages/SkillListPage";
import { SkillPage } from "./pages/SkillPage";
import { DiagnosticPage } from "./pages/DiagnosticPage";
import { MockTestPage } from "./pages/MockTestPage";
import { AboutGrePage } from "./pages/AboutGrePage";
import { AboutUsPage } from "./pages/AboutUsPage";
import { InboxPage } from "./pages/InboxPage";
import { VocabPage } from "./pages/VocabPage";
import { VocabLessonPage } from "./pages/VocabLessonPage";
import { VocabReviewPage } from "./pages/VocabReviewPage";
import { VerbalPage } from "./pages/VerbalPage";
import "./App.css";

function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<DashboardPage />} />
        <Route path="/skills" element={<SkillListPage />} />
        <Route path="/skill/:skillId" element={<SkillPage />} />
        <Route path="/vocab" element={<VocabPage />} />
        <Route path="/vocab/review" element={<VocabReviewPage />} />
        <Route path="/vocab/:lessonId" element={<VocabLessonPage />} />
        <Route path="/verbal" element={<VerbalPage />} />
        <Route path="/diagnostic" element={<DiagnosticPage />} />
        <Route path="/mock-test" element={<MockTestPage />} />
        <Route path="/about-gre" element={<AboutGrePage />} />
        <Route path="/about-us" element={<AboutUsPage />} />
        <Route path="/inbox" element={<InboxPage />} />
      </Route>
    </Routes>
  );
}

export default App;
