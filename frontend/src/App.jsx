import { useState } from "react";
import {
  Brain,
  User,
  ShieldAlert,
  TrendingUp,
  CheckCircle,
  AlertTriangle,
  XCircle,
  Send,
} from "lucide-react";
import "./App.css";

const API_URL = "https://customer-churn-ml-1-cwrj.onrender.com";

function App() {
  const [form, setForm] = useState({
    customerID: "7590-VHVEG",
    tenure: 12,
    MonthlyCharges: 29.85,
    TotalCharges: 358.2,
    Contract: "Month-to-month",
    PaymentMethod: "Electronic check",
    InternetService: "DSL",
    OnlineSecurity: "No",
    TechSupport: "No",
    StreamingTV: "No",
    StreamingMovies: "No",
  });

  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const updateField = (field, value) => {
    setForm({
      ...form,
      [field]: value,
    });
  };

  const predictChurn = async () => {
    setLoading(true);
    setError("");

    try {
      const response = await fetch(`${API_URL}/predict`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...form,
          tenure: Number(form.tenure),
          MonthlyCharges: Number(form.MonthlyCharges),
          TotalCharges: Number(form.TotalCharges),
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.detail || "Prediction failed"
        );
      }

      const data = await response.json();

      setResult(data);
    } catch (err) {
      setError(
        err.message ||
          "Unable to connect to the prediction API."
      );
    } finally {
      setLoading(false);
    }
  };

  const getRiskClass = () => {
    if (!result) return "";

    return result.churn_risk_tier
      .toLowerCase()
      .replace(" ", "-");
  };

  const RiskIcon = () => {
    if (!result) return ShieldAlert;

    if (result.churn_risk_tier === "HIGH")
      return XCircle;

    if (result.churn_risk_tier === "MEDIUM")
      return AlertTriangle;

    return CheckCircle;
  };

  const RiskIconComponent = RiskIcon();

  return (
    <div className="app">

      {/* Sidebar */}
      <aside className="sidebar">

        <div className="brand">
          <div className="brand-icon">
            <Brain size={25} />
          </div>

          <div>
            <h2>RetentionAI</h2>
            <span>Customer Intelligence</span>
          </div>
        </div>

        <nav>
          <div className="nav-item active">
            <TrendingUp size={18} />
            Churn Prediction
          </div>

          <div className="nav-item">
            <User size={18} />
            Customer Analysis
          </div>
        </nav>

        <div className="sidebar-bottom">
          <div className="model-status">
            <span className="status-dot"></span>

            <div>
              <strong>Model Online</strong>
              <small>Logistic Regression</small>
            </div>
          </div>
        </div>

      </aside>

      {/* Main */}
      <main className="main">

        <header className="header">

          <div>
            <p className="eyebrow">
              MACHINE LEARNING PLATFORM
            </p>

            <h1>
              Customer Churn
              <span> Intelligence</span>
            </h1>

            <p className="subtitle">
              Predict customer churn risk and generate
              actionable retention strategies.
            </p>
          </div>

          <div className="api-status">
            <span></span>
            API Connected
          </div>

        </header>

        <div className="dashboard-grid">

          {/* Input Card */}
          <section className="card input-card">

            <div className="card-header">
              <div>
                <h2>Customer Profile</h2>
                <p>
                  Enter customer information to generate
                  a churn prediction.
                </p>
              </div>

              <User size={22} />
            </div>

            <div className="form-grid">

              <div className="field full">
                <label>Customer ID</label>

                <input
                  value={form.customerID}
                  onChange={(e) =>
                    updateField(
                      "customerID",
                      e.target.value
                    )
                  }
                />
              </div>

              <div className="field">
                <label>Tenure (Months)</label>

                <input
                  type="number"
                  value={form.tenure}
                  onChange={(e) =>
                    updateField(
                      "tenure",
                      e.target.value
                    )
                  }
                />
              </div>

              <div className="field">
                <label>Monthly Charges</label>

                <input
                  type="number"
                  step="0.01"
                  value={form.MonthlyCharges}
                  onChange={(e) =>
                    updateField(
                      "MonthlyCharges",
                      e.target.value
                    )
                  }
                />
              </div>

              <div className="field">
                <label>Total Charges</label>

                <input
                  type="number"
                  step="0.01"
                  value={form.TotalCharges}
                  onChange={(e) =>
                    updateField(
                      "TotalCharges",
                      e.target.value
                    )
                  }
                />
              </div>

              <div className="field">
                <label>Contract</label>

                <select
                  value={form.Contract}
                  onChange={(e) =>
                    updateField(
                      "Contract",
                      e.target.value
                    )
                  }
                >
                  <option>Month-to-month</option>
                  <option>One year</option>
                  <option>Two year</option>
                </select>
              </div>

              <div className="field">
                <label>Payment Method</label>

                <select
                  value={form.PaymentMethod}
                  onChange={(e) =>
                    updateField(
                      "PaymentMethod",
                      e.target.value
                    )
                  }
                >
                  <option>
                    Electronic check
                  </option>

                  <option>
                    Mailed check
                  </option>

                  <option>
                    Bank transfer (automatic)
                  </option>

                  <option>
                    Credit card (automatic)
                  </option>
                </select>
              </div>

              <div className="field">
                <label>Internet Service</label>

                <select
                  value={form.InternetService}
                  onChange={(e) =>
                    updateField(
                      "InternetService",
                      e.target.value
                    )
                  }
                >
                  <option>DSL</option>
                  <option>Fiber optic</option>
                  <option>No</option>
                </select>
              </div>

              <div className="field">
                <label>Online Security</label>

                <select
                  value={form.OnlineSecurity}
                  onChange={(e) =>
                    updateField(
                      "OnlineSecurity",
                      e.target.value
                    )
                  }
                >
                  <option>Yes</option>
                  <option>No</option>
                  <option>No internet service</option>
                </select>
              </div>

              <div className="field">
                <label>Tech Support</label>

                <select
                  value={form.TechSupport}
                  onChange={(e) =>
                    updateField(
                      "TechSupport",
                      e.target.value
                    )
                  }
                >
                  <option>Yes</option>
                  <option>No</option>
                  <option>No internet service</option>
                </select>
              </div>

              <div className="field">
                <label>Streaming TV</label>

                <select
                  value={form.StreamingTV}
                  onChange={(e) =>
                    updateField(
                      "StreamingTV",
                      e.target.value
                    )
                  }
                >
                  <option>Yes</option>
                  <option>No</option>
                  <option>No internet service</option>
                </select>
              </div>

              <div className="field">
                <label>Streaming Movies</label>

                <select
                  value={form.StreamingMovies}
                  onChange={(e) =>
                    updateField(
                      "StreamingMovies",
                      e.target.value
                    )
                  }
                >
                  <option>Yes</option>
                  <option>No</option>
                  <option>No internet service</option>
                </select>
              </div>

            </div>

            <button
              className="predict-button"
              onClick={predictChurn}
              disabled={loading}
            >
              {loading ? (
                "Analyzing Customer..."
              ) : (
                <>
                  <Brain size={19} />
                  Predict Churn Risk
                </>
              )}
            </button>

            {error && (
              <div className="error">
                {error}
              </div>
            )}

          </section>

          {/* Results */}
          <section className="results">

            {!result ? (

              <div className="empty-state">

                <div className="empty-icon">
                  <Brain size={40} />
                </div>

                <h2>Ready for Analysis</h2>

                <p>
                  Enter customer information and run
                  the ML model to see churn probability,
                  risk factors and retention strategy.
                </p>

              </div>

            ) : (

              <>

                {/* Probability */}
                <div className="card probability-card">

                  <div className="card-header">
                    <div>
                      <h2>Churn Risk</h2>
                      <p>
                        Customer ID:{" "}
                        <strong>
                          {result.customer_id}
                        </strong>
                      </p>
                    </div>

                    <RiskIconComponent size={25} />
                  </div>

                  <div className="probability">

                    <div className="percentage">
                      {(
                        result.churn_probability *
                        100
                      ).toFixed(2)}
                      <span>%</span>
                    </div>

                    <div
                      className={`risk-badge ${getRiskClass()}`}
                    >
                      {result.churn_risk_tier} RISK
                    </div>

                  </div>

                  <div className="progress">
                    <div
                      className={`progress-fill ${getRiskClass()}`}
                      style={{
                        width: `${
                          result.churn_probability *
                          100
                        }%`,
                      }}
                    ></div>
                  </div>

                </div>

                {/* Risk Factors */}
                <div className="card">

                  <div className="card-header">

                    <div>
                      <h2>
                        Why This Prediction?
                      </h2>

                      <p>
                        Model-generated customer-specific
                        SHAP explanations.
                      </p>
                    </div>

                    <ShieldAlert size={22} />

                  </div>

                  <div className="factors">

                    {result.top_risk_factors?.map(
                      (factor, index) => (
                        <div
                          className="factor"
                          key={index}
                        >

                          <div className="factor-number">
                            {index + 1}
                          </div>

                          <div className="factor-content">

                           <strong>
  {typeof factor === "string"
    ? factor
    : factor.feature}
</strong>

<span
  className={
    typeof factor === "string"
      ? factor.toLowerCase().includes("increases")
        ? "risk-up"
        : "risk-down"
      : String(factor.direction ?? "")
          .toLowerCase()
          .includes("increases")
        ? "risk-up"
        : "risk-down"
  }
>
  {typeof factor === "string"
    ? factor.includes("(")
      ? factor.substring(
          factor.indexOf("(") + 1,
          factor.lastIndexOf(")")
        )
      : ""
    : factor.direction}
</span>

                          </div>

                          <div className="impact">
                            {factor.impact}
                          </div>

                        </div>
                      )
                    )}

                  </div>

                </div>

                {/* Recommendation */}
                <div className="recommendation">

                  <div className="recommendation-icon">
                    <Send size={20} />
                  </div>

                  <div>

                    <span>
                      RECOMMENDED RETENTION ACTION
                    </span>

                    <p>
                      {result.retention_action}
                    </p>

                  </div>

                </div>

              </>

            )}

          </section>

        </div>

        <footer>
          <span>
            RetentionAI • Explainable Machine Learning
          </span>

          <span>
            Logistic Regression • SHAP
          </span>
        </footer>

      </main>

    </div>
  );
}

export default App;