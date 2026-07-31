/**
 * Utility functions for date and time formatting
 */

export const formatDate = (dateVal, language = "en") => {
  if (!dateVal || dateVal === "-") return "-";
  
  // If the dateVal is a YYYY-MM-DD string, parse it manually to avoid timezone shift
  if (typeof dateVal === "string" && /^\d{4}-\d{2}-\d{2}$/.test(dateVal)) {
    const [y, m, dStr] = dateVal.split("-");
    const day = dStr.padStart(2, '0');
    const month = m.padStart(2, '0');
    let year = parseInt(y, 10);
    if (language === "th") {
      year += 543;
    }
    return `${day}/${month}/${year}`;
  }

  const d = new Date(dateVal);
  if (isNaN(d.getTime())) return dateVal;
  
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  let year = d.getFullYear();
  if (language === "th") {
    year += 543;
  }
  return `${day}/${month}/${year}`;
};

export const formatDateTime = (dateVal, language = "en") => {
  if (!dateVal || dateVal === "-") return "-";
  const d = new Date(dateVal);
  if (isNaN(d.getTime())) return dateVal;
  
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  let year = d.getFullYear();
  if (language === "th") {
    year += 543;
  }
  const hours = String(d.getHours()).padStart(2, '0');
  const minutes = String(d.getMinutes()).padStart(2, '0');
  const seconds = String(d.getSeconds()).padStart(2, '0');
  
  return `${day}/${month}/${year} ${hours}:${minutes}:${seconds}`;
};
