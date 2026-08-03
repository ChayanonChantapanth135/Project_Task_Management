import React from "react";
import { useLanguage } from "../../../lib/LanguageContext";

export default function ReportHeader({
  roleTitle,
  roleDesc,
  onExportExcel,
  onPrint,
  onRefresh,
}) {
  const { t } = useLanguage();

  return (
    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
      <div>
        <h1 className="text-3xl font-black text-white tracking-wide flex items-center gap-3">
          📊 {roleTitle}
        </h1>
        <p className="text-slate-400 text-sm mt-1">{roleDesc}</p>
      </div>

      <div className="flex items-center gap-3">
        <button
          onClick={onRefresh}
          className="px-4 py-2 bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-semibold rounded-xl transition-all border border-white/5 flex items-center gap-2"
        >
          <span>⭮</span> {t("refreshDataBtn")}
        </button>

        <button
          onClick={onExportExcel}
          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl transition-all shadow-lg shadow-emerald-600/20 flex items-center gap-2"
        >
          <span>📥</span> {t("exportExcel")}
        </button>

        <button
          onClick={onPrint}
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl transition-all shadow-lg shadow-indigo-600/20 flex items-center gap-2 print:hidden"
        >
          <span>🖨️</span> {t("printReport")}
        </button>
      </div>
    </div>
  );
}
