import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import LandingPage from "./pages/Landingpage.jsx";
import RegistrationPage from "./pages/RegistrationPage.jsx";
import "./styles/global.css";
import PlanPage from "./pages/PlanPage.jsx";
import DashboardLayout from "./components/DashboardLayout.jsx";
import PrivateRoute from "./components/PrivateRoute.jsx";
import Dashboardpage from "./pages/DashboardPage.jsx";
import ProductsPage from "./pages/ProductsPage.jsx";
import SellPage from "./pages/SellPage.jsx";
import QarzlarPage from "./pages/QarzlarPage.jsx";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/signin" element={<RegistrationPage />} />
        <Route path="/register" element={<RegistrationPage />} />
        <Route path="/plan" element={<PlanPage />} />
        <Route
          path="/"
          element={
            <PrivateRoute>
              <DashboardLayout />
            </PrivateRoute>
          }
        >
          <Route path="dashboard" element={<Dashboardpage />} />
          <Route path="mahsulotlar" element={<ProductsPage />} />
          <Route path="qarzlar" element={<QarzlarPage />} />
          <Route path="sotish" element={<SellPage />} />
          {/* Add other dashboard-related routes here */}
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
