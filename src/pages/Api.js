// Adresse de l'API — définie au moment du build via la variable d'environnement
// VITE_API_URL (à configurer dans Railway, onglet Variables du service frontend).
export const API_URL = import.meta.env.VITE_API_URL || "";

async function requete(path, options = {}) {
  if (!API_URL) {
    throw new Error("VITE_API_URL n'est pas configurée — l'application ne peut pas joindre l'API.");
  }
  const res = await fetch(`${API_URL}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  const data = await res.json().catch(() => null);
  if (!res.ok) {
    throw new Error((data && data.erreur) || `Erreur ${res.status}`);
  }
  return data;
}

export const api = {
  produits: () => requete("/api/products"),
  majProduit: (id, champs) => requete(`/api/products/${id}`, { method: "PATCH", body: JSON.stringify(champs) }),
  clients: () => requete("/api/customers"),
  client: (telephone) => requete(`/api/customers?telephone=${encodeURIComponent(telephone)}`),
  enregistrerClient: (client) => requete("/api/customers", { method: "POST", body: JSON.stringify(client) }),
  commandes: () => requete("/api/orders"),
  commande: (id) => requete(`/api/orders/${id}`),
  creerCommande: (commande) => requete("/api/orders", { method: "POST", body: JSON.stringify(commande) }),
  majCommande: (id, champs) => requete(`/api/orders/${id}`, { method: "PATCH", body: JSON.stringify(champs) }),
};
