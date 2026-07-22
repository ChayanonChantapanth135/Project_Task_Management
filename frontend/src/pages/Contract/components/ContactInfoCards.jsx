import React from "react";

const ContactInfoCards = ({ contactInfos, t }) => {
  return (
    <div className="lg:col-span-5 flex flex-col gap-4">
      <h2 className="text-xl font-bold text-white mb-2 flex items-center gap-2">
        <span>🏢</span> {t("contactInfoTitle")}
      </h2>
      {contactInfos.map((info, idx) => (
        <div
          key={idx}
          className={`glass-card rounded-2xl p-5 border border-white/10 bg-gradient-to-br ${info.gradient} flex items-start gap-4 hover:-translate-y-0.5 transition-all`}
        >
          <span className="text-2xl p-3 bg-slate-900/60 rounded-xl">
            {info.icon}
          </span>
          <div>
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              {t(info.titleKey)}
            </h3>
            <p className="text-sm font-semibold text-white mt-1 leading-relaxed">
              {info.valKey ? t(info.valKey) : info.val}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ContactInfoCards;
