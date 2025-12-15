// FILE: src/components/StatusLed.jsx
import React from "react";

export default function StatusLed({ status }) {
  const colors = {
    da_prendere: "bg-red-500",
    in_lavorazione: "bg-yellow-500",
    pronto: "bg-green-500",
    consegnato: "bg-blue-500",
  };

  return (
    <span
      className={`inline-block w-3 h-3 rounded-full ${colors[status] || "bg-gray-400"}`}
    ></span>
  );
}
