import React from "react";

const AboutFeatures = ({ features, t }) => {
  return (
    <div className="mb-12">
      <h2 className="text-xl md:text-2xl font-extrabold text-white mb-6 flex items-center gap-3">
        <span>✨</span> Core Platform Features
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {features.map((f, idx) => (
          <div
            key={idx}
            className={`glass-card rounded-2xl p-6 border border-white/10 hover:border-teal-400/40 transition-all duration-300 bg-gradient-to-br ${f.gradient} group hover:-translate-y-1`}
          >
            <div className="flex items-center justify-between mb-4">
              <span className="text-3xl p-3 bg-slate-900/60 rounded-xl group-hover:scale-110 transition-transform">
                {f.icon}
              </span>
              <span className="px-3 py-1 rounded-full bg-white/10 text-slate-300 text-[11px] font-semibold">
                {f.badge}
              </span>
            </div>
            <h3 className="text-lg font-bold text-white mb-2">
              {t(f.titleKey)}
            </h3>
            <p className="text-slate-300 text-xs md:text-sm leading-relaxed">
              {t(f.descKey)}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AboutFeatures;
