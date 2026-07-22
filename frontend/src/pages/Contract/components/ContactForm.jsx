import React from "react";

const ContactForm = ({ formData, setFormData, handleSubmit, t }) => {
  return (
    <div className="lg:col-span-7">
      <div className="glass-panel rounded-3xl p-8 shadow-2xl">
        <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
          <span>✉️</span> {t("sendMessageTitle")}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
              {t("formFullName")} *
            </label>
            <input
              type="text"
              required
              value={formData.fullName}
              onChange={(e) =>
                setFormData({ ...formData, fullName: e.target.value })
              }
              placeholder={t("formFullNamePlaceholder")}
              className="w-full bg-slate-900/70 hover:bg-slate-900 focus:bg-slate-900 text-white rounded-xl px-4 py-3 text-sm border-0 focus:outline-none focus:ring-2 focus:ring-teal-500 transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
              {t("formEmail")} *
            </label>
            <input
              type="email"
              required
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
              placeholder={t("formEmailPlaceholder")}
              className="w-full bg-slate-900/70 hover:bg-slate-900 focus:bg-slate-900 text-white rounded-xl px-4 py-3 text-sm border-0 focus:outline-none focus:ring-2 focus:ring-teal-500 transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
              {t("formSubject")} *
            </label>
            <input
              type="text"
              required
              value={formData.subject}
              onChange={(e) =>
                setFormData({ ...formData, subject: e.target.value })
              }
              placeholder={t("formSubjectPlaceholder")}
              className="w-full bg-slate-900/70 hover:bg-slate-900 focus:bg-slate-900 text-white rounded-xl px-4 py-3 text-sm border-0 focus:outline-none focus:ring-2 focus:ring-teal-500 transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
              {t("formMessage")} *
            </label>
            <textarea
              rows={4}
              required
              value={formData.message}
              onChange={(e) =>
                setFormData({ ...formData, message: e.target.value })
              }
              placeholder={t("formMessagePlaceholder")}
              className="w-full bg-slate-900/70 hover:bg-slate-900 focus:bg-slate-900 text-white rounded-xl px-4 py-3 text-sm border-0 focus:outline-none focus:ring-2 focus:ring-teal-500 transition-all"
            ></textarea>
          </div>

          <button
            type="submit"
            className="w-full py-3.5 px-6 rounded-xl bg-gradient-to-r from-teal-500 to-indigo-600 hover:from-teal-400 hover:to-indigo-500 text-white font-bold text-sm shadow-lg shadow-teal-500/25 transition-all glow-button"
          >
            {t("sendMessageBtn")}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ContactForm;
