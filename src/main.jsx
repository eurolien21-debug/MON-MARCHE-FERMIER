import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import ClientApp from "./pages/ClientApp.jsx";
import AdminApp from "./pages/AdminApp.jsx";
import "./index.css";

function Accueil() {
  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: "1.5rem",
        backgroundColor: "#F1E4C4",
        fontFamily: "Inter, system-ui, sans-serif",
        padding: "1.5rem",
        textAlign: "center",
      }}
    >
      <h1 style={{ fontFamily: "Fraunces, serif", color: "#2B2620", fontSize: "1.75rem", margin: 0 }}>
        MON MARCHE FERMIER
      </h1>
      <p style={{ color: "#8B5E34", fontWeight: 700, margin: 0 }}>Maquettes de démonstration</p>
      <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap", justifyContent: "center" }}>
        <Link
          to="/app"
          style={{
            backgroundColor: "#2F6B4F",
            color: "#FBF3E3",
            padding: "0.9rem 1.6rem",
            borderRadius: "1rem",
            fontWeight: 900,
            textDecoration: "none",
          }}
        >
          App client
        </Link>
        <Link
          to="/admin"
          style={{
            backgroundColor: "#E8A23D",
            color: "#2B2620",
            padding: "0.9rem 1.6rem",
            borderRadius: "1rem",
            fontWeight: 900,
            textDecoration: "none",
          }}
        >
          Back-office
        </Link>
      </div>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Accueil />} />
        <Route path="/app" element={<ClientApp />} />
        <Route path="/admin" element={<AdminApp />} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
);
