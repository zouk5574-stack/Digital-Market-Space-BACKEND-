import { supabase } from "../config/db.js"; // Vérifie ton chemin exact vers la config Supabase

export const getAdminStats = async (req, res) => {
  try {
    // Compter les utilisateurs
    const { count: users } = await supabase
      .from("users")
      .select("*", { count: "exact", head: true });

    // Compter les vendeurs
    const { count: sellers } = await supabase
      .from("sellers")
      .select("*", { count: "exact", head: true });

    // Compter les commandes
    const { count: orders } = await supabase
      .from("orders")
      .select("*", { count: "exact", head: true });

    // Compter les transactions
    const { count: transactions } = await supabase
      .from("transactions")
      .select("*", { count: "exact", head: true });

    // Calcul du revenu (somme des transactions validées)
    const { data: revenueData, error: revenueError } = await supabase
      .from("transactions")
      .select("amount")
      .eq("status", "completed");

    if (revenueError) throw revenueError;
    const revenue = revenueData.reduce((acc, t) => acc + (t.amount || 0), 0);

    // Construire la réponse
    res.json({
      users: users || 0,
      sellers: sellers || 0,
      orders: orders || 0,
      transactions: transactions || 0,
      revenue,
    });
  } catch (err) {
    console.error("Erreur getAdminStats:", err.message);
    res.status(500).json({ message: "Erreur serveur stats" });
  }
};
