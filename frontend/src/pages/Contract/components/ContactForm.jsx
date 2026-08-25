import React from "react";

const ContactForm = ({ formData, setFormData, handleSubmit, t }) => {
  return (
    <div className="lg:col-span-7">
      <div 
        className="rounded-3xl p-8 shadow-xl"
        style={{
          backgroundColor: "var(--bg-surface)",
          border: "1px solid var(--border-surface)",
        }}
      >
        <h2 className="text-xl font-bold mb-6 flex items-center gap-2" style={{ color: "var(--text-primary)" }}>
          <span>✉️</span> {t("sendMessageTitle")}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider mb-2" style={{ color: "var(--text-secondary)" }}>
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
              className="w-full rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 transition-all shadow-sm"
              style={{
                backgroundColor: "var(--bg-surface-hover)",
                color: "var(--text-primary)",
                border: "1px solid var(--border-surface)",
              }}
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider mb-2" style={{ color: "var(--text-secondary)" }}>
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
              className="w-full rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 transition-all shadow-sm"
              style={{
                backgroundColor: "var(--bg-surface-hover)",
                color: "var(--text-primary)",
                border: "1px solid var(--border-surface)",
              }}
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider mb-2" style={{ color: "var(--text-secondary)" }}>
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
              className="w-full rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 transition-all shadow-sm"
              style={{
                backgroundColor: "var(--bg-surface-hover)",
                color: "var(--text-primary)",
                border: "1px solid var(--border-surface)",
              }}
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider mb-2" style={{ color: "var(--text-secondary)" }}>
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
              className="w-full rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 transition-all shadow-sm resize-y"
              style={{
                backgroundColor: "var(--bg-surface-hover)",
                color: "var(--text-primary)",
                border: "1px solid var(--border-surface)",
              }}
            ></textarea>
          </div>

          <button
            type="submit"
            className="w-full py-3.5 px-6 rounded-xl text-white font-bold text-sm shadow-lg transition-all glow-button cursor-pointer hover:scale-101 active:scale-99"
            style={{
              backgroundColor: "var(--brand-color, #0d9488)",
            }}
          >
            {t("sendMessageBtn")}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ContactForm;
