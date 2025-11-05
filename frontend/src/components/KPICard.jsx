import React from "react";
import { useNavigate } from "react-router-dom";

const KPICard = ({ title, value, subtitle, icon: Icon, color, bgColor, delay = 0, path }) => {
  const navigate = useNavigate();

  const handleClick = () => {
    if (path) {
      navigate(path);
    }
  };

  return (
    <div
      onClick={handleClick}
      className={`bg-white rounded-2xl shadow-md p-6 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 border border-gray-100 group ${path ? "cursor-pointer" : ""}`}
      style={{
        animation: `fadeInUp 0.6s ease-out ${delay}s both`,
        backgroundColor: bgColor || "#FFFFFF",
      }}
    >
      <div className="flex items-start justify-between mb-4">
        <div
          className="p-3 rounded-xl transition-transform duration-300 group-hover:scale-110"
          style={{
            backgroundColor: color ? `${color}15` : "#1E3A8A15",
          }}
        >
          {Icon && <Icon className="text-2xl" style={{ color: color || "#1E3A8A" }} />}
        </div>
      </div>
      <h4 className="text-xs font-semibold text-gray-600 mb-2 uppercase tracking-wider">
        {title}
      </h4>
      <p
        className="text-2xl lg:text-3xl font-bold leading-tight mb-1"
        style={{ color: color || "#1E3A8A" }}
      >
        {value}
      </p>
      {subtitle && (
        <p className="text-sm text-gray-500 font-medium">
          {subtitle}
        </p>
      )}
    </div>
  );
};

export default KPICard;

