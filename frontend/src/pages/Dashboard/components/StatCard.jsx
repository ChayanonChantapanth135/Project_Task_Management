import React from "react";
import { Link } from "react-router-dom";

const StatCard = ({ title, value, subtitle, link, path, bgColor, icon }) => {
  return (
    <div className={`${bgColor} rounded-lg p-4 text-white shadow-lg hover:shadow-xl transition-shadow cursor-pointer`}>
      <div className="flex justify-between items-start">
        <div>
          <p className="text-sm opacity-90">{title}</p>
          <p className="text-4xl font-bold mt-1">{value}</p>
        </div>
        <span className="text-3xl opacity-80">{icon}</span>
      </div>
      <div className="mt-4 pt-3 border-t border-white/30">
        {subtitle ? (
          <p className="text-sm opacity-90">{subtitle}</p>
        ) : (
          <Link
            to={path}
            className="text-sm opacity-90 hover:opacity-100 text-white text-decoration-none d-block"
          >
            {link}
          </Link>
        )}
      </div>
    </div>
  );
};

export default StatCard;
