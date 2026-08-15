# Customer Churn Prediction & Retention Intelligence Platform

An end-to-end machine learning application that predicts customer churn risk, explains individual predictions using SHAP, and generates actionable customer retention recommendations through an interactive web dashboard.

## 🚀 Live Demo

**Live Application:**  
https://customer-churn-ml-2.onrender.com

**Backend API:**  
https://customer-churn-ml-1-cwrj.onrender.com

---

## 📌 Project Overview

Customer churn is a major business challenge for subscription-based companies. Identifying customers who are likely to leave allows businesses to take preventive retention actions.

This project combines **Machine Learning, Explainable AI, REST APIs, React, Docker, CI/CD and Cloud Deployment** to create a complete customer churn intelligence platform.

The application allows a user to enter customer information and receive:

- Churn probability
- Churn risk level
- Customer-specific SHAP explanations
- Customer analysis
- Visual customer metrics
- Personalized retention recommendations

---

## 🎯 Business Problem

Businesses often know which customers have already left, but identifying customers who are **likely to churn before they leave** is more valuable.

The goal of this project is to:

1. Predict the probability that a customer will churn.
2. Identify the most important factors influencing the prediction.
3. Categorize the customer based on churn risk.
4. Recommend an appropriate retention strategy.

---

## 💡 Solution

The platform follows this workflow:

```text
Customer Information
        ↓
Feature Engineering
        ↓
Preprocessing Pipeline
        ↓
Logistic Regression Model
        ↓
Churn Probability
        ↓
Risk Classification
        ↓
SHAP Explainability
        ↓
Customer Analysis
        ↓
Retention Recommendation