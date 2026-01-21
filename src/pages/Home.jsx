// FILE: src/pages/Home.jsx
import React from "react";
import Navbar from "../components/Navbar";
import { Link } from "react-router-dom";
import Footer from "../components/Footer";

export default function Home({ user, onLogout }) {
  return (
    <div className="main-content">
      <div>
        <Navbar onLogout={onLogout} />

        <div className="container-max mx-auto p-6">
          <h1 className="text-3xl font-bold mb-6 text-center">
            Benvenuto in Ceralandia – Gestione Ordini
          </h1>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

            {/* ORDINI */}
            <Link
              to="/orders"
              className="card hover:shadow-lg transition block"
            >
              <h3 className="text-xl font-semibold mb-2">
                📋 Ordini in lavorazione
              </h3>
              <p className="text-gray-600">
                Gestisci gli ordini aperti.
              </p>
            </Link>

            {/* CONSEGNATI */}
            <Link
              to="/delivered"
              className="card hover:shadow-lg transition block"
            >
              <h3 className="text-xl font-semibold mb-2">
                📦 Ordini Consegnati
              </h3>
              <p className="text-gray-600">
                Visualizza gli ordini terminati.
              </p>
            </Link>

            {/* STATISTICHE */}
            <Link
              to="/stats"
              className="card hover:shadow-lg transition block"
            >
              <h3 className="text-xl font-semibold mb-2">
                📊 Statistiche Mensili
              </h3>
              <p className="text-gray-600">
                Analisi del lavoro svolto.
              </p>
            </Link>

            {/* ✅ CATALOGO PRODOTTI */}
            <Link
              to="/products"
              className="card hover:shadow-lg transition block"
            >
              <h3 className="text-xl font-semibold mb-2">
                🛍️ Catalogo Prodotti
              </h3>
              <p className="text-gray-600">
                Consulta prezzi e varianti ingrosso.
              </p>
            </Link>

          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
