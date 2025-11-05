import React from "react";
import { useTheme } from "../context/ThemeContext";

const CardStat = ({ title, value, color, icon, subtitle, onClick }) => {
  const { darkMode } = useTheme();
  const isClickable = !!onClick;

  return (
    <div
      className={`rounded-lg shadow-md p-6 border-l-4 transition-all duration-200 ${
        darkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"
      } ${
        isClickable ? "cursor-pointer hover:shadow-lg hover:-translate-y-1" : ""
      }`}
      style={{ borderLeftColor: color || "#2196F3", minWidth: "200px" }}
      onClick={onClick}
    >
      <div className="flex items-center justify-between mb-2">
        <h4 className={`text-sm font-medium ${darkMode ? "text-gray-300" : "text-gray-600"}`}>
          {title}
        </h4>
        {icon && <div style={{ color: color || "#2196F3" }}>{icon}</div>}
      </div>
      <p className="text-3xl font-bold mb-1" style={{ color: color || "#2196F3" }}>
        {value}
      </p>
      {subtitle && (
        <p className={`text-xs ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
          {subtitle}
        </p>
      )}
    </div>
  );
};

export default CardStat;
