import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import LandingPage from "./pages/Landingpage.jsx";
import RegistrationPage from "./pages/RegistrationPage.jsx";
import "./styles/global.css";
import PlanPage from "./pages/PlanPage.jsx";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/signin" element={<RegistrationPage />} />
        <Route path="/register" element={<RegistrationPage />} />
        <Route path="/plan" element={<PlanPage />} />
      </Routes>
    </Router>
  );
}

export default App;
