/**
 * =============================
 *    PAYMENT HELPERS
 * =============================
 */

/**
 * Convertir un montant (string ou number) en centimes.
 * Exemple : 12.34 → 1234
 */
export function toCents(amount) {
  if (amount === null || amount === undefined || amount === "") {
    throw new Error("Montant invalide");
  }

  const num = Number(amount);

  if (isNaN(num)) {
    throw new Error("Le montant doit être un nombre");
  }

  return Math.round(num * 100);
}

/**
 * Convertir des centimes en affichage lisible (string formaté)
 * Exemple : 1234 → "12.34"
 */
export function centsToDisplay(cents) {
  if (cents === null || cents === undefined || cents === "") {
    return "0.00";
  }

  const num = Number(cents);

  if (isNaN(num)) {
    throw new Error("Le montant en centimes doit être un nombre");
  }

  return (num / 100).toFixed(2);
}

/**
 * =============================
 *    CATEGORY HELPERS
 * =============================
 */

/**
 * Détecter une catégorie automatiquement à partir du mimetype d'un fichier
 */
export function detectCategory(file) {
  if (!file || !file.mimetype) return "Autres";

  if (file.mimetype.startsWith("image/")) return "Images";
  if (file.mimetype.startsWith("video/")) return "Vidéos";
  if (file.mimetype.startsWith("audio/")) return "Audios";
  if (file.mimetype === "application/pdf") return "Documents";
  if (
    file.mimetype ===
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
    file.mimetype === "application/msword"
  ) {
    return "Documents";
  }

  return "Autres";
}
