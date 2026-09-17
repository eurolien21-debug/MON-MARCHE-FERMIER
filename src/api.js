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
  commandeParNumero: (numero) => requete(`/api/orders?numero=${encodeURIComponent(numero)}`),
  commandesDisponibles: () => requete("/api/orders?disponibles=1"),
  commandesLivreur: (telephone) => requete(`/api/orders?livreur_telephone=${encodeURIComponent(telephone)}`),
  accepterCommande: (id, livreur_nom, livreur_telephone) => requete(`/api/orders/${id}/accepter`, { method: "PATCH", body: JSON.stringify({ livreur_nom, livreur_telephone }) }),
  majPosition: (id, position) => requete(`/api/orders/${id}/position`, { method: "PATCH", body: JSON.stringify(position) }),
  creerCommande: (commande) => requete("/api/orders", { method: "POST", body: JSON.stringify(commande) }),
  majCommande: (id, champs) => requete(`/api/orders/${id}`, { method: "PATCH", body: JSON.stringify(champs) }),
  evenementsCommande: (id) => requete(`/api/orders/${id}/evenements`),

  zones: () => requete("/api/zones"),
  creerZone: (zone) => requete("/api/zones", { method: "POST", body: JSON.stringify(zone) }),
  majZone: (id, champs) => requete(`/api/zones/${id}`, { method: "PATCH", body: JSON.stringify(champs) }),
  supprimerZone: (id) => requete(`/api/zones/${id}`, { method: "DELETE" }),

  livreurs: () => requete("/api/livreurs"),

  financeKpis: () => requete("/api/finance/kpis"),

  rapportVentesProduits: () => requete("/api/rapports/ventes-produits"),
  rapportClientsMois: () => requete("/api/rapports/clients-mois"),
  rapportPerfLivreurs: () => requete("/api/rapports/perf-livreurs"),

  staff: () => requete("/api/staff"),
  creerStaff: (u) => requete("/api/staff", { method: "POST", body: JSON.stringify(u) }),
  majStaff: (id, champs) => requete(`/api/staff/${id}`, { method: "PATCH", body: JSON.stringify(champs) }),
  supprimerStaff: (id) => requete(`/api/staff/${id}`, { method: "DELETE" }),

  bonsCommande: () => requete("/api/bons-commande"),
  bonCommande: (id) => requete(`/api/bons-commande/${id}`),
  creerBonCommande: (bc) => requete("/api/bons-commande", { method: "POST", body: JSON.stringify(bc) }),
  majBonCommande: (id, champs) => requete(`/api/bons-commande/${id}`, { method: "PATCH", body: JSON.stringify(champs) }),
};

// Calcule un vrai itinéraire routier (distance + temps estimé) entre deux points
// GPS, via le service public gratuit OSRM (pas de clé requise). Le temps est basé
// sur le réseau routier réel, mais ne tient pas compte du trafic en direct
// (ça demanderait un service payant type Google Maps).
export async function calculerItineraire(lat1, lng1, lat2, lng2) {
  const url = `https://router.project-osrm.org/route/v1/driving/${lng1},${lat1};${lng2},${lat2}?overview=false`;
  const res = await fetch(url);
  if (!res.ok) throw new Error("Itinéraire indisponible");
  const data = await res.json();
  const route = data?.routes?.[0];
  if (!route) throw new Error("Aucun itinéraire trouvé");
  return { distanceMetres: route.distance, dureeSecondes: route.duration };
}
