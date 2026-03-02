// src/App.jsx — Root component with routing
import { Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar/Navbar";
import HomePage from "./pages/HomePage/HomePage";
import WorkPage from "./pages/WorkPage/WorkPage";
import SkillsPage from "./pages/SkillsPage/SkillsPage";
import ContactPage from "./pages/ContactPage/ContactPage";

function App() {
    return (
        <div className="page fade-in">
            <Navbar />
            <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/work" element={<WorkPage />} />
                <Route path="/skills" element={<SkillsPage />} />
                <Route path="/contact" element={<ContactPage />} />
            </Routes>
        </div>
    );
}

export default App;
