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
  BarChart3,
  CreditCard,
  Wifi,
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
  const [activePage, setActivePage] = useState("prediction");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const updateField = (field, value) => {
    setForm((previous) => ({
      ...previous,
      [field]: value,
    }));
  };

  /* ============================================================
     RETENTION RECOMMENDATION
     ============================================================ */

  const getRetentionRecommendation = () => {
    if (!result) return null;

    const contract = form.Contract;
    const payment = form.PaymentMethod;
    const internet = form.InternetService;

    if (result.churn_risk_tier === "HIGH") {
      return {
        title: "Immediate Retention Intervention",
        action:
          "Contact the customer proactively and provide a personalized retention offer.",
        reason: `The customer has a ${(result.churn_probability * 100).toFixed(
          1
        )}% predicted churn probability.`,
      };
    }

    if (
      contract === "Month-to-month" &&
      result.churn_risk_tier === "MEDIUM"
    ) {
      return {
        title: "Contract Upgrade Offer",
        action:
          "Offer a discounted one-year or two-year contract with a loyalty incentive.",
        reason:
          "The customer is currently on a month-to-month contract, which can increase churn risk.",
      };
    }

    if (payment === "Electronic check") {
      return {
        title: "Payment Method Optimization",
        action:
          "Encourage the customer to switch to automatic bank transfer or credit card payment.",
        reason:
          "Automatic payment methods can support stronger customer retention.",
      };
    }

    if (internet === "DSL") {
      return {
        title: "Internet Service Upgrade",
        action:
          "Offer an attractive internet-service upgrade or improved service package.",
        reason:
          "The customer currently uses DSL internet service.",
      };
    }

    return {
      title: "Customer Loyalty Engagement",
      action:
        "Continue regular engagement and provide loyalty-focused offers.",
      reason:
        "The customer does not currently show a critical retention trigger.",
    };
  };

  /* ============================================================
     PREDICTION
     ============================================================ */

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
        let errorMessage = "Prediction failed";

        try {
          const errorData = await response.json();
          errorMessage = errorData.detail || errorMessage;
        } catch {
          errorMessage = `Prediction failed with status ${response.status}`;
        }

        throw new Error(errorMessage);
      }

      const data = await response.json();

      setResult(data);
      setActivePage("prediction");
    } catch (err) {
      setError(
        err.message || "Unable to connect to the prediction API."
      );
    } finally {
      setLoading(false);
    }
  };

  /* ============================================================
     RISK CLASS
     ============================================================ */

  const getRiskClass = () => {
    if (!result) return "";

    return result.churn_risk_tier
      .toLowerCase()
      .replace(" ", "-");
  };

  /* ============================================================
     RISK ICON
     ============================================================ */

  const RiskIcon = () => {
    if (!result) return ShieldAlert;

    if (result.churn_risk_tier === "HIGH") {
      return XCircle;
    }

    if (result.churn_risk_tier === "MEDIUM") {
      return AlertTriangle;
    }

    return CheckCircle;
  };

  const RiskIconComponent = RiskIcon();

  /* ============================================================
     RISK FACTOR HELPER
     ============================================================ */

  const getFactorDetails = (factor) => {
    const text =
      typeof factor === "string"
        ? factor
        : factor?.feature || "Unknown factor";

    const direction =
      typeof factor === "string"
        ? factor.match(/\((.*?)\)/)?.[1] || ""
        : factor?.direction || "";

    return {
      text,
      direction,
      increases: direction
        .toLowerCase()
        .includes("increases"),
    };
  };

  /* ============================================================
     GRAPH VALUE HELPERS
     ============================================================ */

  const churnPercentage = result
    ? result.churn_probability * 100
    : 0;

  const tenurePercentage = Math.min(
    (Number(form.tenure) / 72) * 100,
    100
  );

  const monthlyPercentage = Math.min(
    (Number(form.MonthlyCharges) / 150) * 100,
    100
  );

  const totalPercentage = Math.min(
    (Number(form.TotalCharges) / 10000) * 100,
    100
  );

  /* ============================================================
     APP
     ============================================================ */

  return (
    <div className="app">

      {/* ======================================================
          SIDEBAR
          ====================================================== */}

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

          <div
            className={`nav-item ${
              activePage === "prediction" ? "active" : ""
            }`}
            onClick={() => setActivePage("prediction")}
          >
            <TrendingUp size={18} />
            Churn Prediction
          </div>

          <div
            className={`nav-item ${
              activePage === "analysis" ? "active" : ""
            }`}
            onClick={() => setActivePage("analysis")}
          >
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

      {/* ======================================================
          MAIN
          ====================================================== */}

      <main className="main">

        {/* HEADER */}

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

        {/* ====================================================
            CUSTOMER ANALYSIS PAGE
            ==================================================== */}

        {activePage === "analysis" && (

          <section className="analysis-page">

            {!result ? (

              <div className="empty-state">

                <div className="empty-icon">
                  <User size={40} />
                </div>

                <h2>No Customer Analysis Yet</h2>

                <p>
                  Enter customer information and run the
                  churn prediction first. Customer-specific
                  analysis and graphs will appear here.
                </p>

                <button
                  className="predict-button"
                  onClick={() =>
                    setActivePage("prediction")
                  }
                >
                  <TrendingUp size={19} />
                  Go to Churn Prediction
                </button>

              </div>

            ) : (

              <div className="analysis-grid">

                {/* ==========================================
                    CUSTOMER OVERVIEW
                    ========================================== */}

                <div className="card">

                  <div className="card-header">

                    <div>

                      <h2>Customer Overview</h2>

                      <p>
                        Profile summary for this customer.
                      </p>

                    </div>

                    <User size={22} />

                  </div>

                  <div className="analysis-details">

                    <div>
                      <span>Customer ID</span>
                      <strong>{form.customerID}</strong>
                    </div>

                    <div>
                      <span>Tenure</span>
                      <strong>
                        {form.tenure} months
                      </strong>
                    </div>

                    <div>
                      <span>Monthly Charges</span>
                      <strong>
                        ₹
                        {Number(
                          form.MonthlyCharges
                        ).toFixed(2)}
                      </strong>
                    </div>

                    <div>
                      <span>Total Charges</span>
                      <strong>
                        ₹
                        {Number(
                          form.TotalCharges
                        ).toFixed(2)}
                      </strong>
                    </div>

                    <div>
                      <span>Contract</span>
                      <strong>
                        {form.Contract}
                      </strong>
                    </div>

                    <div>
                      <span>Payment Method</span>
                      <strong>
                        {form.PaymentMethod}
                      </strong>
                    </div>

                  </div>

                </div>

                {/* ==========================================
                    RISK ASSESSMENT
                    ========================================== */}

                <div className="card">

                  <div className="card-header">

                    <div>

                      <h2>Risk Assessment</h2>

                      <p>
                        ML model assessment.
                      </p>

                    </div>

                    <ShieldAlert size={22} />

                  </div>

                  <div className="analysis-risk">

                    <div className="analysis-score">
                      {churnPercentage.toFixed(2)}%
                    </div>

                    <div
                      className={`risk-badge ${getRiskClass()}`}
                    >
                      {result.churn_risk_tier} RISK
                    </div>

                  </div>

                  <div className="progress analysis-progress">

                    <div
                      className={`progress-fill ${getRiskClass()}`}
                      style={{
                        width: `${churnPercentage}%`,
                      }}
                    ></div>

                  </div>

                  <p className="analysis-description">

                    The Logistic Regression model estimates
                    this customer's probability of churn
                    based on service usage, contract,
                    payment method, tenure and billing
                    characteristics.

                  </p>

                </div>

                {/* ==========================================
                    CUSTOMER PROFILE GRAPH
                    ========================================== */}

                <div className="card analysis-full">

                  <div className="card-header">

                    <div>

                      <h2>Customer Profile Graph</h2>

                      <p>
                        Visual overview of important
                        customer metrics.
                      </p>

                    </div>

                    <BarChart3 size={22} />

                  </div>

                  <div className="metric-graph">

                    {/* CHURN */}

                    <div className="metric-row">

                      <div className="metric-label">

                        <span>
                          Churn Probability
                        </span>

                        <strong>
                          {churnPercentage.toFixed(1)}%
                        </strong>

                      </div>

                      <div className="metric-bar">

                        <div
                          className={`metric-fill ${getRiskClass()}`}
                          style={{
                            width: `${churnPercentage}%`,
                          }}
                        />

                      </div>

                    </div>

                    {/* TENURE */}

                    <div className="metric-row">

                      <div className="metric-label">

                        <span>
                          Tenure
                        </span>

                        <strong>
                          {form.tenure} months
                        </strong>

                      </div>

                      <div className="metric-bar">

                        <div
                          className="metric-fill"
                          style={{
                            width: `${tenurePercentage}%`,
                          }}
                        />

                      </div>

                    </div>

                    {/* MONTHLY CHARGES */}

                    <div className="metric-row">

                      <div className="metric-label">

                        <span>
                          Monthly Charges
                        </span>

                        <strong>
                          ₹
                          {Number(
                            form.MonthlyCharges
                          ).toFixed(2)}
                        </strong>

                      </div>

                      <div className="metric-bar">

                        <div
                          className="metric-fill"
                          style={{
                            width: `${monthlyPercentage}%`,
                          }}
                        />

                      </div>

                    </div>

                    {/* TOTAL CHARGES */}

                    <div className="metric-row">

                      <div className="metric-label">

                        <span>
                          Total Charges
                        </span>

                        <strong>
                          ₹
                          {Number(
                            form.TotalCharges
                          ).toFixed(2)}
                        </strong>

                      </div>

                      <div className="metric-bar">

                        <div
                          className="metric-fill"
                          style={{
                            width: `${totalPercentage}%`,
                          }}
                        />

                      </div>

                    </div>

                  </div>

                </div>

                {/* ==========================================
                    SERVICE PROFILE
                    ========================================== */}

                <div className="card">

                  <div className="card-header">

                    <div>

                      <h2>Service Profile</h2>

                      <p>
                        Current services used by
                        the customer.
                      </p>

                    </div>

                    <Wifi size={22} />

                  </div>

                  <div className="service-profile">

                    <div className="service-item">

                      <span>Internet Service</span>

                      <strong>
                        {form.InternetService}
                      </strong>

                    </div>

                    <div className="service-item">

                      <span>Online Security</span>

                      <strong>
                        {form.OnlineSecurity}
                      </strong>

                    </div>

                    <div className="service-item">

                      <span>Tech Support</span>

                      <strong>
                        {form.TechSupport}
                      </strong>

                    </div>

                    <div className="service-item">

                      <span>Streaming TV</span>

                      <strong>
                        {form.StreamingTV}
                      </strong>

                    </div>

                    <div className="service-item">

                      <span>Streaming Movies</span>

                      <strong>
                        {form.StreamingMovies}
                      </strong>

                    </div>

                  </div>

                </div>

                {/* ==========================================
                    KEY CUSTOMER FACTORS
                    ========================================== */}

                <div className="card">

                  <div className="card-header">

                    <div>

                      <h2>Key Customer Factors</h2>

                      <p>
                        Factors contributing to the
                        current churn assessment.
                      </p>

                    </div>

                    <Brain size={22} />

                  </div>

                  <div className="factors">

                    {result.top_risk_factors?.map(
                      (factor, index) => {

                        const details =
                          getFactorDetails(factor);

                        return (

                          <div
                            className="factor"
                            key={index}
                          >

                            <div className="factor-number">
                              {index + 1}
                            </div>

                            <div className="factor-content">

                              <strong>
                                {details.text}
                              </strong>

                              {details.direction && (

                                <span
                                  className={
                                    details.increases
                                      ? "risk-up"
                                      : "risk-down"
                                  }
                                >
                                  {details.direction}
                                </span>

                              )}

                            </div>

                          </div>

                        );
                      }
                    )}

                  </div>

                </div>

                {/* ==========================================
                    RETENTION RECOMMENDATION
                    ========================================== */}

                {(() => {

                  const recommendation =
                    getRetentionRecommendation();

                  if (!recommendation) return null;

                  return (

                    <div className="recommendation analysis-full">

                      <div className="recommendation-icon">
                        <Send size={20} />
                      </div>

                      <div>

                        <span>
                          RECOMMENDED RETENTION ACTION
                        </span>

                        <h3>
                          {recommendation.title}
                        </h3>

                        <p>
                          {recommendation.action}
                        </p>

                        <small>
                          {recommendation.reason}
                        </small>

                      </div>

                    </div>

                  );

                })()}

              </div>

            )}

          </section>

        )}

        {/* ====================================================
            PREDICTION PAGE
            ==================================================== */}

        {activePage === "prediction" && (

          <div className="dashboard-grid">

            {/* =================================================
                INPUT CARD
                ================================================= */}

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

                {/* CUSTOMER ID */}

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

                {/* TENURE */}

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

                {/* MONTHLY CHARGES */}

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

                {/* TOTAL CHARGES */}

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

                {/* CONTRACT */}

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
                    <option>
                      Month-to-month
                    </option>

                    <option>
                      One year
                    </option>

                    <option>
                      Two year
                    </option>

                  </select>

                </div>

                {/* PAYMENT METHOD */}

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

                {/* INTERNET */}

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

                    <option>
                      Fiber optic
                    </option>

                    <option>No</option>

                  </select>

                </div>

                {/* ONLINE SECURITY */}

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

                    <option>
                      No internet service
                    </option>

                  </select>

                </div>

                {/* TECH SUPPORT */}

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

                    <option>
                      No internet service
                    </option>

                  </select>

                </div>

                {/* STREAMING TV */}

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

                    <option>
                      No internet service
                    </option>

                  </select>

                </div>

                {/* STREAMING MOVIES */}

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

                    <option>
                      No internet service
                    </option>

                  </select>

                </div>

              </div>

              {/* PREDICT BUTTON */}

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

            {/* =================================================
                RESULTS
                ================================================= */}

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

                  {/* =========================================
                      PROBABILITY
                      ========================================= */}

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

                  {/* =========================================
                      SHAP RISK FACTORS
                      ========================================= */}

                  <div className="card">

                    <div className="card-header">

                      <div>

                        <h2>
                          Why This Prediction?
                        </h2>

                        <p>
                          Model-generated
                          customer-specific SHAP
                          explanations.
                        </p>

                      </div>

                      <ShieldAlert size={22} />

                    </div>

                    <div className="factors">

                      {result.top_risk_factors?.map(
                        (factor, index) => {

                          const details =
                            getFactorDetails(factor);

                          return (

                            <div
                              className="factor"
                              key={index}
                            >

                              <div className="factor-number">
                                {index + 1}
                              </div>

                              <div className="factor-content">

                                <strong>
                                  {details.text}
                                </strong>

                                {details.direction && (

                                  <span
                                    className={
                                      details.increases
                                        ? "risk-up"
                                        : "risk-down"
                                    }
                                  >
                                    {details.direction}
                                  </span>

                                )}

                              </div>

                            </div>

                          );

                        }
                      )}

                    </div>

                  </div>

                  {/* =========================================
                      RETENTION RECOMMENDATION
                      ========================================= */}

                  {(() => {

                    const recommendation =
                      getRetentionRecommendation();

                    if (!recommendation) {
                      return null;
                    }

                    return (

                      <div className="recommendation">

                        <div className="recommendation-icon">
                          <Send size={20} />
                        </div>

                        <div>

                          <span>
                            RECOMMENDED RETENTION ACTION
                          </span>

                          <h3>
                            {recommendation.title}
                          </h3>

                          <p>
                            {recommendation.action}
                          </p>

                          <small>
                            {recommendation.reason}
                          </small>

                        </div>

                      </div>

                    );

                  })()}

                </>

              )}

            </section>

          </div>

        )}

        {/* ====================================================
            FOOTER
            ==================================================== */}

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