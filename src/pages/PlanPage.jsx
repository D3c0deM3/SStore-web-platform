import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/PlanPage.css";

const plans = [
  {
    name: "Standart Plan",
    price: "$50/month",
    features: [
      "25 Market Reports / month",
      "Advanced Data Visualization",
      "Export in PDF, Excel & PPT",
      "Industry Trends & Forecasts",
      "Priority Email Support",
    ],
  },
  {
    name: "PRO Plan",
    price: "$100/month",
    features: [
      "25 Market Reports / month",
      "Advanced Data Visualization",
      "Export in PDF, Excel & PPT",
      "Industry Trends & Forecasts",
      "Priority Email Support",
    ],
    mostPreferred: true,
  },
  {
    name: "VIP Plan",
    price: "$140/month",
    features: [
      "25 Market Reports / month",
      "Advanced Data Visualization",
      "Export in PDF, Excel & PPT",
      "Industry Trends & Forecasts",
      "Priority Email Support",
    ],
  },
];

const PlanPage = () => {
  const navigate = useNavigate();

  const handlePlanSelect = (selectedPlan) => {
    const market = JSON.parse(localStorage.getItem("market"));
    market.plan = selectedPlan;
    localStorage.setItem("market", JSON.stringify(market));
    navigate("/dashboard");
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/");
    }
  }, [navigate]);

  const highlightPlanWord = (text) => {
    const parts = text.split(" ");
    if (parts.length > 1) {
      const planWord = parts.pop();
      return (
        <>
          {parts.join(" ")} <span className="highlight-plan">{planWord}</span>
        </>
      );
    }
    return text;
  };

  return (
    <div className="plan-page">
      <h1 className="plan-title">TARIFLAR</h1>
      <div className="plan-cards">
        {plans.map((plan) => (
          <div
            key={plan.name}
            className={`plan-card ${plan.mostPreferred ? "preferred" : ""}`}
          >
            {plan.mostPreferred && (
              <div className="most-preferred">most preferred</div>
            )}
            <h2>{highlightPlanWord(plan.name)}</h2>
            <p className="price">{plan.price}</p>
            <ul>
              {plan.features.map((feature, index) => (
                <li key={index}>{feature}</li>
              ))}
            </ul>
            <button onClick={() => handlePlanSelect(plan.name)}>BUY NOW</button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PlanPage;
