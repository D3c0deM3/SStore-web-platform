import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import LandingPage from "./pages/Landingpage.jsx";
import RegistrationPage from "./pages/RegistrationPage.jsx";
import "./styles/global.css";
import PlanPage from "./pages/PlanPage.jsx";
import Dashboardpage from "./pages/DashboardPage.jsx";
import PrivateRoute from "./components/PrivateRoute.jsx";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/signin" element={<RegistrationPage />} />
        <Route path="/register" element={<RegistrationPage />} />
        <Route path="/plan" element={<PlanPage />} />
        <Route
          path="/dashboard"
          element={
            <PrivateRoute>
              <Dashboardpage />
            </PrivateRoute>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
