import React, { useState, useEffect } from "react";
import {
  LayoutDashboard,
  ShoppingBag,
  Package,
  Users,
  Truck,
  Wallet,
  BarChart3,
  UserCog,
  ShieldCheck,
  Search,
  ChevronDown,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  MoreHorizontal,
  MapPin,
  CheckCircle2,
  Clock,
  XCircle,
  Bike,
  Phone,
  Plus,
  PenLine,
  Ban,
  RefreshCcw,
  ArrowRightLeft,
  Receipt,
  PiggyBank,
  CircleDollarSign,
} from "lucide-react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  BarChart,
  Bar,
  CartesianGrid,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { api } from "../api.js";

// Icônes Leaflet par défaut (le bundler casse les chemins d'images par défaut)
const iconLivreur = new L.DivIcon({
  html: '<div style="font-size:22px;line-height:1;filter:drop-shadow(0 1px 2px rgba(0,0,0,.4))">🏍️</div>',
  className: "",
  iconSize: [24, 24],
  iconAnchor: [12, 12],
});
const iconClient = new L.DivIcon({
  html: '<div style="font-size:20px;line-height:1;filter:drop-shadow(0 1px 2px rgba(0,0,0,.4))">📍</div>',
  className: "",
  iconSize: [20, 20],
  iconAnchor: [10, 20],
});

// ---- Tokens (identiques à l'app client, pour la cohérence de marque) ----
const INK = "#2B2620";
const CREAM = "#FBF3E3";
const SAND = "#F1E4C4";
const LINE = "#E7DCC0";
const GREEN = "#2F6B4F";
const GOLD = "#E8A23D";
const OCHRE = "#8B5E34";
const RED = "#C1443B";
const MUTED = "#9C8F72";

const VENTES_7J = [
  { jour: "Lun", ca: 1240000 },
  { jour: "Mar", ca: 1380000 },
  { jour: "Mer", ca: 990000 },
  { jour: "Jeu", ca: 1510000 },
  { jour: "Ven", ca: 1870000 },
  { jour: "Sam", ca: 2100000 },
  { jour: "Dim", ca: 1640000 },
];

const STATUT_STYLE = {
  "En attente": { bg: "#F1E4C4", color: OCHRE, icon: Clock },
  "En préparation": { bg: "#FBEBD1", color: GOLD, icon: Clock },
  "Livreur affecté": { bg: "#FBEBD1", color: GOLD, icon: Truck },
  "Livreur en route": { bg: "#E4EEE8", color: GREEN, icon: Truck },
  "Livrée": { bg: "#E4EEE8", color: GREEN, icon: CheckCircle2 },
  "Annulée": { bg: "#F7E4E2", color: RED, icon: XCircle },
};

const SEGMENT_STYLE = {
  Bronze: "#B08D57",
  Silver: "#9AA1A9",
  Gold: "#D9A441",
  VIP: "#6B4F9E",
};

// ---- Livraisons ----
// (zones et livreurs sont maintenant chargés depuis l'API, voir LivraisonsPage)

// ---- Finance ----
const TRX_STATUT_STYLE = {
  "Payé": { bg: "#E4EEE8", color: "#2F6B4F" },
  "En attente": { bg: "#F1E4C4", color: "#8B5E34" },
  "Remboursé": { bg: "#F7E4E2", color: "#C1443B" },
};

// ---- Rapports ----
// (ventes, clients et performance livreurs sont maintenant chargés depuis l'API)

// ---- Utilisateurs & Rôles ----
// (le répertoire de l'équipe est maintenant chargé depuis l'API, voir UtilisateursPage)
const ROLE_STYLE = {
  "Super Admin": "#6B4F9E",
  "Admin": "#8B5E34",
  "Manager": "#2F6B4F",
  "Commercial": "#D9A441",
  "Caissier": "#3E7CB1",
  "Stock": "#B08D57",
  "Service client": "#C1443B",
};

// ---- Suivi live : positions GPS et preuves de paiement ----
// (chargées depuis l'API désormais, voir SuiviLivePage)

const AUDIT = [
  { qui: "Awa Bamba", quoi: "Modification du prix — Poulet de chair", quand: "Aujourd'hui, 10:32", avant: "3 400 F", apres: "3 500 F" },
  { qui: "Dan Eurolien", quoi: "Annulation commande CMD-1038", quand: "Hier, 14:02", avant: "Confirmée", apres: "Annulée" },
  { qui: "Mariam Cissé", quoi: "Remboursement TRX-8838", quand: "Hier, 14:05", avant: "512 000 F débité", apres: "512 000 F remboursé" },
  { qui: "Koffi N'Guessan", quoi: "Modification plafond crédit — Superette Diallo", quand: "28 août, 09:14", avant: "300 000 F", apres: "400 000 F" },
  { qui: "Bakary Sanogo", quoi: "Ajustement stock — Œufs", quand: "27 août, 16:40", avant: "32 plateaux", apres: "12 plateaux" },
];

function fmt(n) {
  return n.toLocaleString("fr-FR") + " F";
}

// Charge des données réelles depuis l'API et gère chargement/erreur.
function useApiData(fetcher, deps = []) {
  const [data, setData] = useState(null);
  const [erreur, setErreur] = useState(null);
  const [chargement, setChargement] = useState(true);

  useEffect(() => {
    let annule = false;
    setChargement(true);
    setErreur(null);
    fetcher()
      .then((d) => { if (!annule) setData(d); })
      .catch((e) => { if (!annule) setErreur(e.message); })
      .finally(() => { if (!annule) setChargement(false); });
    return () => { annule = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  return { data, erreur, chargement };
}

function EtatChargement({ erreur, chargement }) {
  if (chargement) {
    return <p className="py-10 text-center text-sm font-bold" style={{ color: MUTED }}>Chargement des données réelles...</p>;
  }
  if (erreur) {
    return (
      <div className="rounded-2xl border px-4 py-4 text-sm font-bold" style={{ borderColor: "#F0C2BC", backgroundColor: "#F7E4E2", color: RED }}>
        Impossible de charger les données : {erreur}
      </div>
    );
  }
  return null;
}

function Sidebar({ page, setPage }) {
  const items = [
    { key: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { key: "commandes", label: "Commandes", icon: ShoppingBag },
    { key: "stock", label: "Produits & Stock", icon: Package },
    { key: "clients", label: "Clients", icon: Users },
    { key: "livraisons", label: "Livraisons", icon: Truck },
    { key: "suivi-live", label: "Suivi & Paiements", icon: MapPin },
    { key: "finance", label: "Finance", icon: Wallet },
    { key: "rapports", label: "Rapports", icon: BarChart3 },
    { key: "utilisateurs", label: "Utilisateurs & Rôles", icon: UserCog },
    { key: "audit", label: "Audit", icon: ShieldCheck },
  ];
  return (
    <div className="flex h-full w-64 flex-shrink-0 flex-col border-r" style={{ borderColor: LINE, backgroundColor: "#FFFFFF" }}>
      <div className="flex items-center gap-2 px-5 py-5">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl text-lg" style={{ backgroundColor: GREEN }}>
          🐔
        </div>
        <div>
          <p className="text-sm font-black leading-none" style={{ color: INK }}>MON MARCHE FERMIER</p>
          <p className="text-[10px] font-bold uppercase tracking-wider" style={{ color: MUTED }}>Back-office</p>
        </div>
      </div>
      <nav className="flex-1 overflow-y-auto px-3 py-2">
        {items.map((it) => (
          <button
            key={it.key}
            onClick={() => setPage(it.key)}
            className="mb-1 flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-bold transition-colors"
            style={{
              backgroundColor: page === it.key ? SAND : "transparent",
              color: page === it.key ? INK : MUTED,
            }}
          >
            <it.icon size={18} strokeWidth={2.3} />
            {it.label}
          </button>
        ))}
      </nav>
      <div className="flex items-center gap-2 border-t px-4 py-4" style={{ borderColor: LINE }}>
        <div className="flex h-8 w-8 items-center justify-center rounded-full text-xs font-black text-white" style={{ backgroundColor: OCHRE }}>
          DE
        </div>
        <div>
          <p className="text-xs font-black" style={{ color: INK }}>Dan Eurolien</p>
          <p className="text-[10px] font-bold" style={{ color: MUTED }}>Super Admin</p>
        </div>
      </div>
    </div>
  );
}

function TopBar({ title, subtitle }) {
  return (
    <div className="flex items-center justify-between border-b px-8 py-5" style={{ borderColor: LINE }}>
      <div>
        <h1 className="text-xl font-black" style={{ color: INK }}>{title}</h1>
        {subtitle && <p className="text-xs font-bold" style={{ color: MUTED }}>{subtitle}</p>}
      </div>
      <div className="flex items-center gap-2 rounded-full border px-3 py-2" style={{ borderColor: LINE }}>
        <Search size={16} style={{ color: MUTED }} />
        <input placeholder="Rechercher..." className="w-48 border-none text-sm font-semibold outline-none" style={{ color: INK }} />
      </div>
    </div>
  );
}

function KpiCard({ label, value, delta, positive = true, icon: Icon, accent }) {
  return (
    <div className="flex-1 rounded-2xl border bg-white p-4" style={{ borderColor: LINE }}>
      <div className="mb-3 flex items-center justify-between">
        <span className="text-xs font-black uppercase tracking-wide" style={{ color: MUTED }}>{label}</span>
        <div className="flex h-8 w-8 items-center justify-center rounded-full" style={{ backgroundColor: `${accent}22` }}>
          <Icon size={16} style={{ color: accent }} />
        </div>
      </div>
      <p className="text-2xl font-black" style={{ color: INK }}>{value}</p>
      {delta && (
        <p className="mt-1 text-xs font-bold" style={{ color: positive ? GREEN : RED }}>
          {positive ? "▲" : "▼"} {delta} vs hier
        </p>
      )}
    </div>
  );
}

function StatutBadge({ statut }) {
  const s = STATUT_STYLE[statut] || { bg: SAND, color: OCHRE, icon: Clock };
  const Icon = s.icon;
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-black"
      style={{ backgroundColor: s.bg, color: s.color }}
    >
      <Icon size={12} />
      {statut}
    </span>
  );
}

function DashboardPage() {
  const { data: produits } = useApiData(() => api.produits(), []);
  const { data: commandes } = useApiData(() => api.commandes(), []);
  const alertes = (produits || []).filter((s) => s.stock <= s.seuil_alerte);
  const dernieres = (commandes || []).slice(0, 4);

  return (
    <div className="flex-1 overflow-y-auto px-8 py-6">
      <div className="mb-2 rounded-xl px-4 py-2 text-xs font-bold" style={{ backgroundColor: "#FBEBD1", color: OCHRE }}>
        Les cartes KPI et le graphique de CA restent illustratifs pour l'instant — ils demandent un endpoint d'agrégation dédié, pas encore construit. Le stock, les commandes et leur historique, eux, sont déjà réels.
      </div>
      <div className="mb-5 flex gap-4">
        <KpiCard label="Ventes du jour" value={fmt(1640000)} delta="12%" icon={TrendingUp} accent={GREEN} />
        <KpiCard label="Commandes" value={commandes ? String(commandes.length) : "—"} icon={ShoppingBag} accent={GOLD} />
        <KpiCard label="Encaissé" value={fmt(1310000)} delta="9%" icon={Wallet} accent={GREEN} />
        <KpiCard label="En attente" value={fmt(330000)} delta="3%" positive={false} icon={Clock} accent={RED} />
        <KpiCard label="Marge estimée" value={fmt(410000)} delta="7%" icon={BarChart3} accent={OCHRE} />
      </div>

      <div className="mb-5 grid grid-cols-3 gap-4">
        <div className="col-span-2 rounded-2xl border bg-white p-5" style={{ borderColor: LINE }}>
          <p className="mb-4 text-sm font-black" style={{ color: INK }}>Chiffre d'affaires — 7 derniers jours</p>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={VENTES_7J}>
              <defs>
                <linearGradient id="ca" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={GREEN} stopOpacity={0.35} />
                  <stop offset="100%" stopColor={GREEN} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid vertical={false} stroke={LINE} />
              <XAxis dataKey="jour" tick={{ fontSize: 12, fill: MUTED, fontWeight: 700 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: MUTED }} axisLine={false} tickLine={false} tickFormatter={(v) => `${v / 1000000}M`} />
              <Tooltip formatter={(v) => fmt(v)} contentStyle={{ borderRadius: 12, borderColor: LINE }} />
              <Area type="monotone" dataKey="ca" stroke={GREEN} strokeWidth={3} fill="url(#ca)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="rounded-2xl border bg-white p-5" style={{ borderColor: LINE }}>
          <p className="mb-3 flex items-center gap-2 text-sm font-black" style={{ color: INK }}>
            <AlertTriangle size={16} style={{ color: RED }} /> Alertes stock
          </p>
          <div className="flex flex-col gap-3">
            {alertes.map((s) => (
              <div key={s.id} className="flex items-center gap-3 rounded-xl px-3 py-2" style={{ backgroundColor: "#F7E4E2" }}>
                <span className="text-xl">{s.emoji}</span>
                <div>
                  <p className="text-xs font-black" style={{ color: INK }}>{s.nom}</p>
                  <p className="text-[11px] font-bold" style={{ color: RED }}>
                    {s.stock} {s.unite} restants — seuil {s.seuil_alerte}
                  </p>
                </div>
              </div>
            ))}
            {alertes.length === 0 && (
              <p className="text-xs font-bold" style={{ color: MUTED }}>Aucune alerte en cours</p>
            )}
          </div>
        </div>
      </div>

      <div className="rounded-2xl border bg-white p-5" style={{ borderColor: LINE }}>
        <div className="mb-3 flex items-center justify-between">
          <p className="text-sm font-black" style={{ color: INK }}>Dernières commandes</p>
        </div>
        <table className="w-full text-left text-sm">
          <thead>
            <tr style={{ color: MUTED }} className="text-xs font-black uppercase">
              <th className="pb-2">Commande</th>
              <th className="pb-2">Client</th>
              <th className="pb-2">Zone</th>
              <th className="pb-2">Montant</th>
              <th className="pb-2">Statut</th>
            </tr>
          </thead>
          <tbody>
            {dernieres.length === 0 && (
              <tr><td colSpan={5} className="py-4 text-center font-bold" style={{ color: MUTED }}>Aucune commande pour le moment</td></tr>
            )}
            {dernieres.map((c) => (
              <tr key={c.id} className="border-t" style={{ borderColor: LINE }}>
                <td className="py-2.5 font-black" style={{ color: INK }}>{c.numero}</td>
                <td className="py-2.5 font-semibold" style={{ color: INK }}>{c.client_nom || c.client_telephone}</td>
                <td className="py-2.5 font-semibold" style={{ color: MUTED }}>{c.zone || "—"}</td>
                <td className="py-2.5 font-black" style={{ color: INK }}>{fmt(c.total)}</td>
                <td className="py-2.5"><StatutBadge statut={c.statut} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function HistoriqueCommandeModal({ commande, onClose }) {
  const { data: evenements, erreur, chargement } = useApiData(() => api.evenementsCommande(commande.id), [commande.id]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-6"
      style={{ backgroundColor: "rgba(43,38,32,0.5)" }}
      onClick={onClose}
    >
      <div className="max-h-[85vh] w-full max-w-md overflow-y-auto rounded-2xl bg-white p-6" onClick={(e) => e.stopPropagation()}>
        <div className="mb-1 flex items-center justify-between">
          <p className="text-lg font-black" style={{ color: INK }}>{commande.numero}</p>
          <button onClick={onClose} className="text-xs font-black" style={{ color: MUTED }}>Fermer ✕</button>
        </div>
        <p className="mb-1 text-xs font-bold" style={{ color: OCHRE }}>{commande.client_nom || commande.client_telephone}</p>
        {commande.livreur_nom && (
          <p className="mb-4 text-xs font-bold" style={{ color: MUTED }}>Livreur : {commande.livreur_nom}{commande.livreur_telephone ? ` — ${commande.livreur_telephone}` : ""}</p>
        )}

        <EtatChargement erreur={erreur} chargement={chargement} />

        {!chargement && !erreur && (
          <div className="flex flex-col gap-3">
            {(evenements || []).length === 0 && (
              <p className="text-sm font-bold" style={{ color: MUTED }}>Aucun événement enregistré pour cette commande.</p>
            )}
            {(evenements || []).map((e, idx) => (
              <div key={e.id} className="flex gap-3">
                <div className="flex flex-col items-center">
                  <div className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: GREEN }} />
                  {idx < evenements.length - 1 && <div className="w-px flex-1" style={{ backgroundColor: LINE }} />}
                </div>
                <div className="pb-3">
                  <p className="text-sm font-black" style={{ color: INK }}>{e.evenement}</p>
                  {e.details && <p className="text-xs font-semibold" style={{ color: MUTED }}>{e.details}</p>}
                  <p className="text-[11px] font-bold" style={{ color: OCHRE }}>
                    {new Date(e.cree_a).toLocaleString("fr-FR")}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function CommandesPage() {
  const [filtre, setFiltre] = useState("Toutes");
  const [version, setVersion] = useState(0);
  const [historiqueOuvert, setHistoriqueOuvert] = useState(null);
  const { data: commandes, erreur, chargement } = useApiData(() => api.commandes(), [version]);
  const statuts = ["Toutes", "En attente", "En préparation", "Livreur affecté", "Livreur en route", "Livrée", "Annulée"];
  const visibles = !commandes ? [] : filtre === "Toutes" ? commandes : commandes.filter((c) => c.statut === filtre);

  const changerStatut = async (id, statut) => {
    try {
      await api.majCommande(id, { statut });
      setVersion((v) => v + 1);
    } catch (e) {
      alert("Erreur : " + e.message);
    }
  };

  return (
    <div className="flex-1 overflow-y-auto px-8 py-6">
      <div className="mb-4 flex flex-wrap gap-2">
        {statuts.map((s) => (
          <button
            key={s}
            onClick={() => setFiltre(s)}
            className="rounded-full px-3.5 py-1.5 text-xs font-black"
            style={{
              backgroundColor: filtre === s ? GREEN : "#FFFFFF",
              color: filtre === s ? CREAM : MUTED,
              border: `1px solid ${filtre === s ? GREEN : LINE}`,
            }}
          >
            {s}
          </button>
        ))}
      </div>

      <EtatChargement erreur={erreur} chargement={chargement} />

      {!chargement && !erreur && (
        <div className="overflow-hidden rounded-2xl border bg-white" style={{ borderColor: LINE }}>
          <table className="w-full text-left text-sm">
            <thead>
              <tr style={{ color: MUTED, backgroundColor: SAND }} className="text-xs font-black uppercase">
                <th className="px-4 py-3">Commande</th>
                <th className="px-4 py-3">Client</th>
                <th className="px-4 py-3">Zone</th>
                <th className="px-4 py-3">Livreur</th>
                <th className="px-4 py-3">Paiement</th>
                <th className="px-4 py-3">Montant</th>
                <th className="px-4 py-3">Statut</th>
                <th className="px-4 py-3">Changer</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {visibles.length === 0 && (
                <tr><td colSpan={9} className="px-4 py-6 text-center font-bold" style={{ color: MUTED }}>Aucune commande pour le moment</td></tr>
              )}
              {visibles.map((c) => (
                <tr key={c.id} className="border-t" style={{ borderColor: LINE }}>
                  <td className="px-4 py-3 font-black" style={{ color: INK }}>{c.numero}</td>
                  <td className="px-4 py-3 font-semibold" style={{ color: INK }}>{c.client_nom || c.client_telephone}</td>
                  <td className="px-4 py-3 font-semibold" style={{ color: MUTED }}>
                    <span className="inline-flex items-center gap-1"><MapPin size={13} />{c.zone || "—"}</span>
                  </td>
                  <td className="px-4 py-3 font-semibold" style={{ color: MUTED }}>{c.livreur_nom || "—"}</td>
                  <td className="px-4 py-3 font-semibold" style={{ color: MUTED }}>{c.moyen_paiement || "—"}</td>
                  <td className="px-4 py-3 font-black" style={{ color: INK }}>{fmt(c.total)}</td>
                  <td className="px-4 py-3"><StatutBadge statut={c.statut} /></td>
                  <td className="px-4 py-3">
                    <select
                      value={c.statut}
                      onChange={(e) => changerStatut(c.id, e.target.value)}
                      className="rounded-full border px-2 py-1 text-xs font-bold"
                      style={{ borderColor: LINE, color: INK }}
                    >
                      {statuts.slice(1).map((s) => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => setHistoriqueOuvert(c)}
                      className="rounded-full px-3 py-1 text-xs font-black"
                      style={{ backgroundColor: SAND, color: OCHRE }}
                    >
                      Historique
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {historiqueOuvert && (
        <HistoriqueCommandeModal commande={historiqueOuvert} onClose={() => setHistoriqueOuvert(null)} />
      )}
    </div>
  );
}

function DetailBonCommandeModal({ bonId, onClose }) {
  const { data: bc, erreur, chargement } = useApiData(() => api.bonCommande(bonId), [bonId]);
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-6" style={{ backgroundColor: "rgba(43,38,32,0.5)" }} onClick={onClose}>
      <div className="w-full max-w-md rounded-2xl bg-white p-6" onClick={(e) => e.stopPropagation()}>
        <div className="mb-1 flex items-center justify-between">
          <p className="text-lg font-black" style={{ color: INK }}>{bc?.numero || "..."}</p>
          <button onClick={onClose} className="text-xs font-black" style={{ color: MUTED }}>Fermer ✕</button>
        </div>
        <EtatChargement erreur={erreur} chargement={chargement} />
        {!chargement && !erreur && bc && (
          <>
            <p className="mb-1 text-xs font-bold" style={{ color: OCHRE }}>Fournisseur : {bc.fournisseur || "—"}</p>
            <p className="mb-3 text-xs font-bold" style={{ color: MUTED }}>Statut : {bc.statut}{bc.recu_a ? ` — reçu le ${new Date(bc.recu_a).toLocaleDateString("fr-FR")}` : ""}</p>
            <div className="mb-2 flex flex-col gap-1.5">
              {bc.items.map((it) => (
                <div key={it.id} className="flex justify-between text-sm font-semibold" style={{ color: INK }}>
                  <span>{it.quantite} × {it.nom}</span>
                  {it.prix_unitaire != null && <span>{fmt(it.quantite * it.prix_unitaire)}</span>}
                </div>
              ))}
            </div>
            {bc.notes && <p className="mt-2 text-xs font-semibold" style={{ color: MUTED }}>Note : {bc.notes}</p>}
          </>
        )}
      </div>
    </div>
  );
}

function BonsCommandePanel({ produits }) {
  const [version, setVersion] = useState(0);
  const { data: bons, erreur, chargement } = useApiData(() => api.bonsCommande(), [version]);
  const [fournisseur, setFournisseur] = useState("");
  const [quantites, setQuantites] = useState({});
  const [creationEnCours, setCreationEnCours] = useState(false);
  const [detailOuvert, setDetailOuvert] = useState(null);

  const statuts = ["En attente", "Commandé", "Reçu", "Annulé"];
  const styleStatut = {
    "En attente": { bg: SAND, color: OCHRE },
    "Commandé": { bg: "#FBEBD1", color: GOLD },
    "Reçu": { bg: "#E4EEE8", color: GREEN },
    "Annulé": { bg: "#F7E4E2", color: RED },
  };

  const creerBon = async () => {
    const items = Object.entries(quantites)
      .filter(([, q]) => Number(q) > 0)
      .map(([product_id, q]) => ({ product_id: Number(product_id), quantite: Number(q) }));
    if (items.length === 0) return;
    setCreationEnCours(true);
    try {
      await api.creerBonCommande({ fournisseur: fournisseur || null, items });
      setFournisseur("");
      setQuantites({});
      setVersion((v) => v + 1);
    } catch (e) {
      alert("Erreur : " + e.message);
    } finally {
      setCreationEnCours(false);
    }
  };

  const changerStatut = async (id, statut) => {
    try {
      await api.majBonCommande(id, { statut });
      setVersion((v) => v + 1);
    } catch (e) {
      alert("Erreur : " + e.message);
    }
  };

  return (
    <div>
      <SectionTitle>Nouveau bon de commande</SectionTitle>
      <div className="mb-6 rounded-2xl border bg-white p-4" style={{ borderColor: LINE }}>
        <input
          value={fournisseur}
          onChange={(e) => setFournisseur(e.target.value)}
          placeholder="Fournisseur (facultatif)"
          className="mb-3 w-full max-w-sm rounded-xl border px-3 py-2 text-sm font-semibold"
          style={{ borderColor: LINE, color: INK }}
        />
        <div className="mb-3 grid grid-cols-3 gap-3">
          {produits.map((p) => (
            <div key={p.id} className="flex items-center gap-2 rounded-xl border px-3 py-2" style={{ borderColor: LINE }}>
              <span className="text-lg">{p.emoji}</span>
              <span className="flex-1 text-xs font-bold" style={{ color: INK }}>{p.nom}</span>
              <input
                type="number"
                min="0"
                value={quantites[p.id] || ""}
                onChange={(e) => setQuantites({ ...quantites, [p.id]: e.target.value })}
                placeholder="0"
                className="w-16 rounded-lg border px-2 py-1 text-sm font-bold"
                style={{ borderColor: LINE, color: INK }}
              />
            </div>
          ))}
        </div>
        <button onClick={creerBon} disabled={creationEnCours} className="flex items-center gap-1.5 rounded-full px-3 py-2 text-xs font-black text-white" style={{ backgroundColor: GREEN, opacity: creationEnCours ? 0.6 : 1 }}>
          <Plus size={14} /> Créer le bon de commande
        </button>
      </div>

      <SectionTitle>Historique des bons de commande</SectionTitle>
      <EtatChargement erreur={erreur} chargement={chargement} />
      {!chargement && !erreur && (
        <div className="overflow-hidden rounded-2xl border bg-white" style={{ borderColor: LINE }}>
          <table className="w-full text-left text-sm">
            <thead>
              <tr style={{ color: MUTED, backgroundColor: SAND }} className="text-xs font-black uppercase">
                <th className="px-4 py-3">Bon</th>
                <th className="px-4 py-3">Fournisseur</th>
                <th className="px-4 py-3">Articles</th>
                <th className="px-4 py-3">Montant</th>
                <th className="px-4 py-3">Statut</th>
                <th className="px-4 py-3">Changer</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {(bons || []).length === 0 && (
                <tr><td colSpan={7} className="px-4 py-6 text-center font-bold" style={{ color: MUTED }}>Aucun bon de commande pour le moment</td></tr>
              )}
              {(bons || []).map((b) => {
                const s = styleStatut[b.statut] || styleStatut["En attente"];
                return (
                  <tr key={b.id} className="border-t" style={{ borderColor: LINE }}>
                    <td className="px-4 py-3 font-black" style={{ color: INK }}>{b.numero}</td>
                    <td className="px-4 py-3 font-semibold" style={{ color: MUTED }}>{b.fournisseur || "—"}</td>
                    <td className="px-4 py-3 font-semibold" style={{ color: MUTED }}>{b.nb_articles}</td>
                    <td className="px-4 py-3 font-black" style={{ color: INK }}>{Number(b.montant_total) > 0 ? fmt(Number(b.montant_total)) : "—"}</td>
                    <td className="px-4 py-3">
                      <span className="rounded-full px-2.5 py-1 text-xs font-black" style={{ backgroundColor: s.bg, color: s.color }}>{b.statut}</span>
                    </td>
                    <td className="px-4 py-3">
                      <select
                        value={b.statut}
                        onChange={(e) => changerStatut(b.id, e.target.value)}
                        className="rounded-full border px-2 py-1 text-xs font-bold"
                        style={{ borderColor: LINE, color: INK }}
                      >
                        {statuts.map((s2) => <option key={s2} value={s2}>{s2}</option>)}
                      </select>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button onClick={() => setDetailOuvert(b.id)} className="rounded-full px-3 py-1 text-xs font-black" style={{ backgroundColor: SAND, color: OCHRE }}>Détails</button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {detailOuvert && <DetailBonCommandeModal bonId={detailOuvert} onClose={() => setDetailOuvert(null)} />}
    </div>
  );
}

function StockPage() {
  const [onglet, setOnglet] = useState("stock");
  const { data: produits, erreur, chargement } = useApiData(() => api.produits(), []);

  if (chargement || erreur) {
    return (
      <div className="flex-1 overflow-y-auto px-8 py-6">
        <EtatChargement erreur={erreur} chargement={chargement} />
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto px-8 py-6">
      <div className="mb-4 flex gap-2">
        <button
          onClick={() => setOnglet("stock")}
          className="rounded-full px-4 py-2 text-xs font-black"
          style={{ backgroundColor: onglet === "stock" ? GREEN : "#FFFFFF", color: onglet === "stock" ? CREAM : MUTED, border: `1px solid ${onglet === "stock" ? GREEN : LINE}` }}
        >
          Stock
        </button>
        <button
          onClick={() => setOnglet("bons")}
          className="rounded-full px-4 py-2 text-xs font-black"
          style={{ backgroundColor: onglet === "bons" ? GREEN : "#FFFFFF", color: onglet === "bons" ? CREAM : MUTED, border: `1px solid ${onglet === "bons" ? GREEN : LINE}` }}
        >
          Bons de commande
        </button>
      </div>

      {onglet === "stock" && (
        <div className="overflow-hidden rounded-2xl border bg-white" style={{ borderColor: LINE }}>
          <table className="w-full text-left text-sm">
            <thead>
              <tr style={{ color: MUTED, backgroundColor: SAND }} className="text-xs font-black uppercase">
                <th className="px-4 py-3">Produit</th>
                <th className="px-4 py-3">Stock disponible</th>
                <th className="px-4 py-3">Niveau</th>
                <th className="px-4 py-3">Statut</th>
              </tr>
            </thead>
            <tbody>
              {produits.map((s) => {
                const alerte = s.stock <= s.seuil_alerte;
                const pct = Math.min(100, (s.stock / (s.seuil_alerte * 3)) * 100);
                return (
                  <tr key={s.id} className="border-t" style={{ borderColor: LINE }}>
                    <td className="px-4 py-3">
                      <span className="mr-2 text-lg">{s.emoji}</span>
                      <span className="font-black" style={{ color: INK }}>{s.nom}</span>
                    </td>
                    <td className="px-4 py-3 font-bold" style={{ color: INK }}>{s.stock} {s.unite}</td>
                    <td className="px-4 py-3">
                      <div className="h-2 w-40 overflow-hidden rounded-full" style={{ backgroundColor: SAND }}>
                        <div
                          className="h-full rounded-full"
                          style={{ width: `${pct}%`, backgroundColor: alerte ? RED : GREEN }}
                        />
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      {alerte ? (
                        <span className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-black" style={{ backgroundColor: "#F7E4E2", color: RED }}>
                          <AlertTriangle size={12} /> Stock faible
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-black" style={{ backgroundColor: "#E4EEE8", color: GREEN }}>
                          <CheckCircle2 size={12} /> Suffisant
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {onglet === "bons" && <BonsCommandePanel produits={produits} />}
    </div>
  );
}

function ClientsPage() {
  const { data: clients, erreur, chargement } = useApiData(() => api.clients(), []);

  if (chargement || erreur) {
    return (
      <div className="flex-1 overflow-y-auto px-8 py-6">
        <EtatChargement erreur={erreur} chargement={chargement} />
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto px-8 py-6">
      <div className="overflow-hidden rounded-2xl border bg-white" style={{ borderColor: LINE }}>
        <table className="w-full text-left text-sm">
          <thead>
            <tr style={{ color: MUTED, backgroundColor: SAND }} className="text-xs font-black uppercase">
              <th className="px-4 py-3">Client</th>
              <th className="px-4 py-3">Téléphone</th>
              <th className="px-4 py-3">Type d'activité</th>
              <th className="px-4 py-3">Segment</th>
              <th className="px-4 py-3">Crédit utilisé / plafond</th>
            </tr>
          </thead>
          <tbody>
            {clients.length === 0 && (
              <tr><td colSpan={5} className="px-4 py-6 text-center font-bold" style={{ color: MUTED }}>Aucun client pour le moment</td></tr>
            )}
            {clients.map((c) => (
              <tr key={c.id} className="border-t" style={{ borderColor: LINE }}>
                <td className="px-4 py-3 font-black" style={{ color: INK }}>{c.commerce || "—"}</td>
                <td className="px-4 py-3 font-semibold" style={{ color: MUTED }}>{c.telephone}</td>
                <td className="px-4 py-3 font-semibold" style={{ color: MUTED }}>{c.type_activite || "—"}</td>
                <td className="px-4 py-3">
                  <span
                    className="rounded-full px-2.5 py-1 text-xs font-black text-white"
                    style={{ backgroundColor: SEGMENT_STYLE[c.segment] || MUTED }}
                  >
                    {c.segment}
                  </span>
                </td>
                <td className="px-4 py-3 font-semibold" style={{ color: MUTED }}>
                  {c.credit_plafond > 0 ? `${fmt(c.credit_utilise)} / ${fmt(c.credit_plafond)}` : "—"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function PageAVenir({ nom }) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-2 px-8 py-6">
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl" style={{ backgroundColor: SAND }}>
        <BarChart3 size={24} style={{ color: OCHRE }} />
      </div>
      <p className="font-black" style={{ color: INK }}>{nom}</p>
      <p className="text-sm font-semibold" style={{ color: MUTED }}>Module à construire dans une prochaine étape</p>
    </div>
  );
}

function SectionTitle({ children }) {
  return (
    <p className="mb-3 text-sm font-black" style={{ color: INK }}>{children}</p>
  );
}

function LivraisonsPage() {
  const [version, setVersion] = useState(0);
  const { data: zones, erreur: erreurZones, chargement: chargementZones } = useApiData(() => api.zones(), [version]);
  const { data: livreurs, erreur: erreurLivreurs, chargement: chargementLivreurs } = useApiData(() => api.livreurs(), [version]);
  const [nouvelleZone, setNouvelleZone] = useState({ zone: "", prix: "" });
  const [ajoutEnCours, setAjoutEnCours] = useState(false);

  const ajouterZone = async () => {
    if (!nouvelleZone.zone || !nouvelleZone.prix) return;
    setAjoutEnCours(true);
    try {
      await api.creerZone({ zone: nouvelleZone.zone, prix: Number(nouvelleZone.prix) });
      setNouvelleZone({ zone: "", prix: "" });
      setVersion((v) => v + 1);
    } catch (e) {
      alert("Erreur : " + e.message);
    } finally {
      setAjoutEnCours(false);
    }
  };

  const supprimerZone = async (id) => {
    try {
      await api.supprimerZone(id);
      setVersion((v) => v + 1);
    } catch (e) {
      alert("Erreur : " + e.message);
    }
  };

  return (
    <div className="flex-1 overflow-y-auto px-8 py-6">
      <div className="mb-4 flex items-center justify-between">
        <SectionTitle>Zones de livraison</SectionTitle>
      </div>
      <div className="mb-3 flex items-end gap-2">
        <input
          value={nouvelleZone.zone}
          onChange={(e) => setNouvelleZone({ ...nouvelleZone, zone: e.target.value })}
          placeholder="Nom de la zone"
          className="rounded-xl border px-3 py-2 text-sm font-semibold"
          style={{ borderColor: LINE, color: INK }}
        />
        <input
          value={nouvelleZone.prix}
          onChange={(e) => setNouvelleZone({ ...nouvelleZone, prix: e.target.value })}
          placeholder="Frais (F)"
          type="number"
          className="w-32 rounded-xl border px-3 py-2 text-sm font-semibold"
          style={{ borderColor: LINE, color: INK }}
        />
        <button onClick={ajouterZone} disabled={ajoutEnCours} className="flex items-center gap-1.5 rounded-full px-3 py-2 text-xs font-black text-white" style={{ backgroundColor: GREEN, opacity: ajoutEnCours ? 0.6 : 1 }}>
          <Plus size={14} /> Ajouter
        </button>
      </div>

      <EtatChargement erreur={erreurZones} chargement={chargementZones} />
      {!chargementZones && !erreurZones && (
        <div className="mb-6 overflow-hidden rounded-2xl border bg-white" style={{ borderColor: LINE }}>
          <table className="w-full text-left text-sm">
            <thead>
              <tr style={{ color: MUTED, backgroundColor: SAND }} className="text-xs font-black uppercase">
                <th className="px-4 py-3">Zone</th>
                <th className="px-4 py-3">Frais de livraison</th>
                <th className="px-4 py-3">Distance</th>
                <th className="px-4 py-3">Temps estimé</th>
                <th className="px-4 py-3">Livraison gratuite dès</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {zones.length === 0 && (
                <tr><td colSpan={6} className="px-4 py-6 text-center font-bold" style={{ color: MUTED }}>Aucune zone pour le moment</td></tr>
              )}
              {zones.map((z) => (
                <tr key={z.id} className="border-t" style={{ borderColor: LINE }}>
                  <td className="px-4 py-3 font-black" style={{ color: INK }}>
                    <span className="inline-flex items-center gap-1.5"><MapPin size={14} style={{ color: OCHRE }} />{z.zone}</span>
                  </td>
                  <td className="px-4 py-3 font-bold" style={{ color: INK }}>{fmt(z.prix)}</td>
                  <td className="px-4 py-3 font-semibold" style={{ color: MUTED }}>{z.distance || "—"}</td>
                  <td className="px-4 py-3 font-semibold" style={{ color: MUTED }}>{z.temps_estime || "—"}</td>
                  <td className="px-4 py-3 font-semibold" style={{ color: MUTED }}>{z.livraison_gratuite_des ? fmt(z.livraison_gratuite_des) : "—"}</td>
                  <td className="px-4 py-3 text-right">
                    <button onClick={() => supprimerZone(z.id)} className="text-xs font-black" style={{ color: RED }}>Supprimer</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <SectionTitle>Livreurs</SectionTitle>
      <EtatChargement erreur={erreurLivreurs} chargement={chargementLivreurs} />
      {!chargementLivreurs && !erreurLivreurs && (
        <div className="grid grid-cols-2 gap-3">
          {(livreurs || []).length === 0 && (
            <p className="text-sm font-bold" style={{ color: MUTED }}>Aucun livreur n'a encore accepté de commande.</p>
          )}
          {(livreurs || []).map((l) => (
            <div key={l.livreur_telephone} className="flex items-center gap-3 rounded-2xl border bg-white p-4" style={{ borderColor: LINE }}>
              <div className="flex h-11 w-11 items-center justify-center rounded-full" style={{ backgroundColor: SAND }}>
                <Bike size={20} style={{ color: OCHRE }} />
              </div>
              <div className="flex-1">
                <p className="font-black" style={{ color: INK }}>{l.livreur_nom}</p>
                <p className="text-xs font-semibold" style={{ color: MUTED }}>{l.livreur_telephone}{l.en_livraison ? ` · ${l.derniere_commande_numero}` : ""}</p>
              </div>
              <div className="flex flex-col items-end gap-1">
                <span
                  className="rounded-full px-2.5 py-1 text-[10px] font-black"
                  style={l.en_livraison ? { backgroundColor: "#FBEBD1", color: GOLD } : { backgroundColor: "#E4EEE8", color: GREEN }}
                >
                  {l.en_livraison ? "En livraison" : "Disponible"}
                </span>
                <span className="text-[10px] font-bold" style={{ color: MUTED }}>{l.livraisons_jour} livraisons aujourd'hui</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function FinancePage() {
  const [version, setVersion] = useState(0);
  const { data: kpis, erreur: erreurKpis, chargement: chargementKpis } = useApiData(() => api.financeKpis(), [version]);
  const { data: commandes, erreur: erreurCommandes, chargement: chargementCommandes } = useApiData(() => api.commandes(), [version]);

  const styleStatutPaiement = {
    "Payé": { bg: "#E4EEE8", color: GREEN },
    "En attente": { bg: "#F1E4C4", color: OCHRE },
    "Remboursé": { bg: "#F7E4E2", color: RED },
  };

  const changerStatutPaiement = async (id, statut_paiement) => {
    try {
      await api.majCommande(id, { statut_paiement });
      setVersion((v) => v + 1);
    } catch (e) {
      alert("Erreur : " + e.message);
    }
  };

  return (
    <div className="flex-1 overflow-y-auto px-8 py-6">
      <div className="mb-2 rounded-xl px-4 py-2 text-xs font-bold" style={{ backgroundColor: "#FBEBD1", color: OCHRE }}>
        "Encaissé" et "Remboursé" dépendent du statut de paiement que vous cochez vous-même ci-dessous (il n'y a pas encore de confirmation automatique par les opérateurs Mobile Money).
      </div>
      <EtatChargement erreur={erreurKpis} chargement={chargementKpis} />
      {!chargementKpis && !erreurKpis && kpis && (
        <div className="mb-5 flex gap-4">
          <KpiCard label="Chiffre d'affaires" value={fmt(Number(kpis.chiffre_affaires))} icon={TrendingUp} accent={GREEN} />
          <KpiCard label="Encaissé" value={fmt(Number(kpis.encaisse))} icon={CircleDollarSign} accent={GREEN} />
          <KpiCard label="Remboursements" value={fmt(Number(kpis.rembourse))} positive={false} icon={TrendingDown} accent={RED} />
          <KpiCard label="Frais de livraison" value={fmt(Number(kpis.frais_livraison))} icon={Truck} accent={OCHRE} />
          <KpiCard label="Commandes livrées" value={String(kpis.commandes_livrees)} icon={CheckCircle2} accent={OCHRE} />
        </div>
      )}

      <SectionTitle>Commandes & paiements</SectionTitle>
      <EtatChargement erreur={erreurCommandes} chargement={chargementCommandes} />
      {!chargementCommandes && !erreurCommandes && (
        <div className="mb-6 overflow-hidden rounded-2xl border bg-white" style={{ borderColor: LINE }}>
          <table className="w-full text-left text-sm">
            <thead>
              <tr style={{ color: MUTED, backgroundColor: SAND }} className="text-xs font-black uppercase">
                <th className="px-4 py-3">Commande</th>
                <th className="px-4 py-3">Client</th>
                <th className="px-4 py-3">Moyen</th>
                <th className="px-4 py-3">Montant</th>
                <th className="px-4 py-3">Statut commande</th>
                <th className="px-4 py-3">Statut paiement</th>
              </tr>
            </thead>
            <tbody>
              {(commandes || []).length === 0 && (
                <tr><td colSpan={6} className="px-4 py-6 text-center font-bold" style={{ color: MUTED }}>Aucune commande pour le moment</td></tr>
              )}
              {(commandes || []).map((c) => {
                const s = styleStatutPaiement[c.statut_paiement] || styleStatutPaiement["En attente"];
                return (
                  <tr key={c.id} className="border-t" style={{ borderColor: LINE }}>
                    <td className="px-4 py-3 font-black" style={{ color: INK }}>
                      <span className="inline-flex items-center gap-1.5"><ArrowRightLeft size={13} style={{ color: OCHRE }} />{c.numero}</span>
                    </td>
                    <td className="px-4 py-3 font-semibold" style={{ color: INK }}>{c.client_nom || c.client_telephone}</td>
                    <td className="px-4 py-3 font-semibold" style={{ color: MUTED }}>{c.moyen_paiement || "—"}</td>
                    <td className="px-4 py-3 font-black" style={{ color: INK }}>{fmt(c.total)}</td>
                    <td className="px-4 py-3"><StatutBadge statut={c.statut} /></td>
                    <td className="px-4 py-3">
                      <select
                        value={c.statut_paiement}
                        onChange={(e) => changerStatutPaiement(c.id, e.target.value)}
                        className="rounded-full border px-2 py-1 text-xs font-bold"
                        style={{ borderColor: LINE, backgroundColor: s.bg, color: s.color }}
                      >
                        <option value="En attente">En attente</option>
                        <option value="Payé">Payé</option>
                        <option value="Remboursé">Remboursé</option>
                      </select>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function RapportsPage() {
  const [onglet, setOnglet] = useState("ventes");
  const onglets = [
    { key: "ventes", label: "Ventes" },
    { key: "clients", label: "Clients" },
    { key: "livraison", label: "Livraison" },
  ];
  const { data: ventesProduits, erreur: erreurVentes, chargement: chargementVentes } = useApiData(() => api.rapportVentesProduits(), []);
  const { data: clientsMois, erreur: erreurClients, chargement: chargementClients } = useApiData(() => api.rapportClientsMois(), []);
  const { data: perfLivreurs, erreur: erreurPerf, chargement: chargementPerf } = useApiData(() => api.rapportPerfLivreurs(), []);

  return (
    <div className="flex-1 overflow-y-auto px-8 py-6">
      <div className="mb-5 flex gap-2">
        {onglets.map((o) => (
          <button
            key={o.key}
            onClick={() => setOnglet(o.key)}
            className="rounded-full px-4 py-2 text-xs font-black"
            style={{
              backgroundColor: onglet === o.key ? GREEN : "#FFFFFF",
              color: onglet === o.key ? CREAM : MUTED,
              border: `1px solid ${onglet === o.key ? GREEN : LINE}`,
            }}
          >
            {o.label}
          </button>
        ))}
      </div>

      {onglet === "ventes" && (
        <div className="rounded-2xl border bg-white p-5" style={{ borderColor: LINE }}>
          <p className="mb-4 text-sm font-black" style={{ color: INK }}>Ventes par produit (toutes les commandes réelles)</p>
          <EtatChargement erreur={erreurVentes} chargement={chargementVentes} />
          {!chargementVentes && !erreurVentes && (ventesProduits || []).length === 0 && (
            <p className="text-sm font-bold" style={{ color: MUTED }}>Pas encore de vente enregistrée.</p>
          )}
          {!chargementVentes && !erreurVentes && (ventesProduits || []).length > 0 && (
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={ventesProduits.map((v) => ({ ...v, ventes: Number(v.ventes) }))}>
                <CartesianGrid vertical={false} stroke={LINE} />
                <XAxis dataKey="produit" tick={{ fontSize: 12, fill: MUTED, fontWeight: 700 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: MUTED }} axisLine={false} tickLine={false} />
                <Tooltip formatter={(v) => fmt(v)} contentStyle={{ borderRadius: 12, borderColor: LINE }} />
                <Bar dataKey="ventes" fill={GREEN} radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      )}

      {onglet === "clients" && (
        <div className="rounded-2xl border bg-white p-5" style={{ borderColor: LINE }}>
          <p className="mb-4 text-sm font-black" style={{ color: INK }}>Nouveaux clients par mois (inscriptions réelles)</p>
          <EtatChargement erreur={erreurClients} chargement={chargementClients} />
          {!chargementClients && !erreurClients && (clientsMois || []).length === 0 && (
            <p className="text-sm font-bold" style={{ color: MUTED }}>Pas encore de client inscrit.</p>
          )}
          {!chargementClients && !erreurClients && (clientsMois || []).length > 0 && (
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={clientsMois.map((c) => ({ ...c, nouveaux: Number(c.nouveaux) }))}>
                <CartesianGrid vertical={false} stroke={LINE} />
                <XAxis dataKey="mois" tick={{ fontSize: 12, fill: MUTED, fontWeight: 700 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: MUTED }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ borderRadius: 12, borderColor: LINE }} />
                <Line type="monotone" dataKey="nouveaux" stroke={GOLD} strokeWidth={3} dot={{ r: 4 }} name="Nouveaux clients" />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>
      )}

      {onglet === "livraison" && (
        <>
          <EtatChargement erreur={erreurPerf} chargement={chargementPerf} />
          {!chargementPerf && !erreurPerf && (
            <div className="overflow-hidden rounded-2xl border bg-white" style={{ borderColor: LINE }}>
              <table className="w-full text-left text-sm">
                <thead>
                  <tr style={{ color: MUTED, backgroundColor: SAND }} className="text-xs font-black uppercase">
                    <th className="px-4 py-3">Livreur</th>
                    <th className="px-4 py-3">Livraisons</th>
                    <th className="px-4 py-3">Temps moyen</th>
                  </tr>
                </thead>
                <tbody>
                  {(perfLivreurs || []).length === 0 && (
                    <tr><td colSpan={3} className="px-4 py-6 text-center font-bold" style={{ color: MUTED }}>Pas encore de livraison enregistrée</td></tr>
                  )}
                  {(perfLivreurs || []).map((p) => (
                    <tr key={p.livreur_nom} className="border-t" style={{ borderColor: LINE }}>
                      <td className="px-4 py-3 font-black" style={{ color: INK }}>{p.livreur_nom}</td>
                      <td className="px-4 py-3 font-bold" style={{ color: INK }}>{p.livraisons}</td>
                      <td className="px-4 py-3 font-semibold" style={{ color: MUTED }}>{p.temps_moyen_minutes != null ? `${p.temps_moyen_minutes} min` : "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </div>
  );
}

function UtilisateursPage() {
  const [version, setVersion] = useState(0);
  const { data: staff, erreur, chargement } = useApiData(() => api.staff(), [version]);
  const [nouveau, setNouveau] = useState({ nom: "", email: "", role: "Commercial" });
  const [ajoutEnCours, setAjoutEnCours] = useState(false);
  const roles = Object.keys(ROLE_STYLE);

  const ajouter = async () => {
    if (!nouveau.nom || !nouveau.email) return;
    setAjoutEnCours(true);
    try {
      await api.creerStaff(nouveau);
      setNouveau({ nom: "", email: "", role: "Commercial" });
      setVersion((v) => v + 1);
    } catch (e) {
      alert("Erreur : " + e.message);
    } finally {
      setAjoutEnCours(false);
    }
  };

  const basculerActif = async (u) => {
    try {
      await api.majStaff(u.id, { actif: !u.actif });
      setVersion((v) => v + 1);
    } catch (e) {
      alert("Erreur : " + e.message);
    }
  };

  const supprimer = async (id) => {
    try {
      await api.supprimerStaff(id);
      setVersion((v) => v + 1);
    } catch (e) {
      alert("Erreur : " + e.message);
    }
  };

  return (
    <div className="flex-1 overflow-y-auto px-8 py-6">
      <div className="mb-2 rounded-xl px-4 py-2 text-xs font-bold" style={{ backgroundColor: "#FBEBD1", color: OCHRE }}>
        Ceci est le vrai répertoire de votre équipe. L'accès au back-office reste pour l'instant par mot de passe unique partagé — une connexion individuelle par personne est un chantier séparé.
      </div>
      <div className="mb-4 flex items-end gap-2">
        <input value={nouveau.nom} onChange={(e) => setNouveau({ ...nouveau, nom: e.target.value })} placeholder="Nom" className="rounded-xl border px-3 py-2 text-sm font-semibold" style={{ borderColor: LINE, color: INK }} />
        <input value={nouveau.email} onChange={(e) => setNouveau({ ...nouveau, email: e.target.value })} placeholder="Email" className="rounded-xl border px-3 py-2 text-sm font-semibold" style={{ borderColor: LINE, color: INK }} />
        <select value={nouveau.role} onChange={(e) => setNouveau({ ...nouveau, role: e.target.value })} className="rounded-xl border px-3 py-2 text-sm font-semibold" style={{ borderColor: LINE, color: INK }}>
          {roles.map((r) => <option key={r} value={r}>{r}</option>)}
        </select>
        <button onClick={ajouter} disabled={ajoutEnCours} className="flex items-center gap-1.5 rounded-full px-3 py-2 text-xs font-black text-white" style={{ backgroundColor: GREEN, opacity: ajoutEnCours ? 0.6 : 1 }}>
          <Plus size={14} /> Ajouter
        </button>
      </div>

      <EtatChargement erreur={erreur} chargement={chargement} />
      {!chargement && !erreur && (
        <div className="overflow-hidden rounded-2xl border bg-white" style={{ borderColor: LINE }}>
          <table className="w-full text-left text-sm">
            <thead>
              <tr style={{ color: MUTED, backgroundColor: SAND }} className="text-xs font-black uppercase">
                <th className="px-4 py-3">Utilisateur</th>
                <th className="px-4 py-3">Rôle</th>
                <th className="px-4 py-3">Email</th>
                <th className="px-4 py-3">Statut</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {(staff || []).length === 0 && (
                <tr><td colSpan={5} className="px-4 py-6 text-center font-bold" style={{ color: MUTED }}>Aucun utilisateur pour le moment</td></tr>
              )}
              {(staff || []).map((u) => (
                <tr key={u.id} className="border-t" style={{ borderColor: LINE }}>
                  <td className="px-4 py-3 font-black" style={{ color: INK }}>{u.nom}</td>
                  <td className="px-4 py-3">
                    <span className="rounded-full px-2.5 py-1 text-xs font-black text-white" style={{ backgroundColor: ROLE_STYLE[u.role] || MUTED }}>
                      {u.role}
                    </span>
                  </td>
                  <td className="px-4 py-3 font-semibold" style={{ color: MUTED }}>{u.email}</td>
                  <td className="px-4 py-3">
                    <button onClick={() => basculerActif(u)}>
                      {u.actif ? (
                        <span className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-black" style={{ backgroundColor: "#E4EEE8", color: GREEN }}>
                          <CheckCircle2 size={12} /> Actif
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-black" style={{ backgroundColor: "#EFEAE0", color: MUTED }}>
                          <Ban size={12} /> Inactif
                        </span>
                      )}
                    </button>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button onClick={() => supprimer(u.id)} className="text-xs font-black" style={{ color: RED }}>Supprimer</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function SuiviLivePage() {
  const [selection, setSelection] = useState(null);
  const { data: commandes, erreur, chargement } = useApiData(() => api.commandes(), []);
  const centre = [5.35, -3.99]; // Abidjan

  const avecGPS = (commandes || []).filter((c) => c.client_lat != null && c.client_lng != null);

  return (
    <div className="flex-1 overflow-y-auto px-8 py-6">
      <EtatChargement erreur={erreur} chargement={chargement} />
      {!chargement && !erreur && (
        <>
          <SectionTitle>Positions en direct</SectionTitle>
          <div className="mb-6 overflow-hidden rounded-2xl border" style={{ borderColor: LINE, height: 380 }}>
            <MapContainer center={centre} zoom={12} style={{ height: "100%", width: "100%" }}>
              <TileLayer
                attribution='&copy; OpenStreetMap contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              {avecGPS.map((c) => (
                <React.Fragment key={c.id}>
                  <Marker position={[c.client_lat, c.client_lng]} icon={iconClient}>
                    <Popup>
                      <strong>{c.client_nom || c.client_telephone}</strong> — {c.numero}
                      <br />
                      {Number(c.client_lat).toFixed(5)}, {Number(c.client_lng).toFixed(5)}
                    </Popup>
                  </Marker>
                  {c.livreur_lat != null && c.livreur_lng != null && (
                    <Marker position={[c.livreur_lat, c.livreur_lng]} icon={iconLivreur}>
                      <Popup>
                        <strong>{c.livreur_nom}</strong> → {c.numero}
                        <br />
                        {Number(c.livreur_lat).toFixed(5)}, {Number(c.livreur_lng).toFixed(5)}
                      </Popup>
                    </Marker>
                  )}
                </React.Fragment>
              ))}
            </MapContainer>
          </div>

          <SectionTitle>Commandes & positions GPS exactes</SectionTitle>
          <div className="mb-6 overflow-hidden rounded-2xl border bg-white" style={{ borderColor: LINE }}>
            <table className="w-full text-left text-sm">
              <thead>
                <tr style={{ color: MUTED, backgroundColor: SAND }} className="text-xs font-black uppercase">
                  <th className="px-4 py-3">Commande</th>
                  <th className="px-4 py-3">Client</th>
                  <th className="px-4 py-3">Position GPS client</th>
                  <th className="px-4 py-3">Livreur</th>
                  <th className="px-4 py-3">Position GPS livreur</th>
                  <th className="px-4 py-3">Statut</th>
                </tr>
              </thead>
              <tbody>
                {avecGPS.length === 0 && (
                  <tr><td colSpan={6} className="px-4 py-6 text-center font-bold" style={{ color: MUTED }}>Aucune commande avec position GPS pour le moment</td></tr>
                )}
                {avecGPS.map((c) => (
                  <tr key={c.id} className="border-t" style={{ borderColor: LINE }}>
                    <td className="px-4 py-3 font-black" style={{ color: INK }}>{c.numero}</td>
                    <td className="px-4 py-3 font-semibold" style={{ color: INK }}>{c.client_nom || c.client_telephone}</td>
                    <td className="px-4 py-3 font-mono text-xs font-semibold" style={{ color: MUTED }}>
                      {Number(c.client_lat).toFixed(5)}, {Number(c.client_lng).toFixed(5)}
                    </td>
                    <td className="px-4 py-3 font-semibold" style={{ color: MUTED }}>{c.livreur_nom || "—"}</td>
                    <td className="px-4 py-3 font-mono text-xs font-semibold" style={{ color: MUTED }}>
                      {c.livreur_lat != null ? `${Number(c.livreur_lat).toFixed(5)}, ${Number(c.livreur_lng).toFixed(5)}` : "—"}
                    </td>
                    <td className="px-4 py-3"><StatutBadge statut={c.statut} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <SectionTitle>Preuves de paiement</SectionTitle>
          <div className="overflow-hidden rounded-2xl border bg-white" style={{ borderColor: LINE }}>
            <table className="w-full text-left text-sm">
              <thead>
                <tr style={{ color: MUTED, backgroundColor: SAND }} className="text-xs font-black uppercase">
                  <th className="px-4 py-3">Commande</th>
                  <th className="px-4 py-3">Client</th>
                  <th className="px-4 py-3">Montant</th>
                  <th className="px-4 py-3">Moyen</th>
                  <th className="px-4 py-3">Référence</th>
                  <th className="px-4 py-3">Statut paiement</th>
                  <th className="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody>
                {(commandes || []).length === 0 && (
                  <tr><td colSpan={7} className="px-4 py-6 text-center font-bold" style={{ color: MUTED }}>Aucune commande pour le moment</td></tr>
                )}
                {(commandes || []).map((p) => {
                  const s = TRX_STATUT_STYLE[p.statut_paiement] || TRX_STATUT_STYLE["En attente"];
                  return (
                    <tr key={p.id} className="border-t" style={{ borderColor: LINE }}>
                      <td className="px-4 py-3 font-black" style={{ color: INK }}>{p.numero}</td>
                      <td className="px-4 py-3 font-semibold" style={{ color: INK }}>{p.client_nom || p.client_telephone}</td>
                      <td className="px-4 py-3 font-black" style={{ color: INK }}>{fmt(p.total)}</td>
                      <td className="px-4 py-3 font-semibold" style={{ color: MUTED }}>{p.moyen_paiement || "—"}</td>
                      <td className="px-4 py-3 font-mono text-xs font-semibold" style={{ color: MUTED }}>{p.reference_paiement || "—"}</td>
                      <td className="px-4 py-3">
                        <span className="rounded-full px-2.5 py-1 text-xs font-black" style={{ backgroundColor: s.bg, color: s.color }}>{p.statut_paiement}</span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button
                          onClick={() => setSelection(p)}
                          className="rounded-full px-3 py-1 text-xs font-black"
                          style={{ backgroundColor: SAND, color: OCHRE }}
                        >
                          Voir le détail
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </>
      )}

      {selection && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-6"
          style={{ backgroundColor: "rgba(43,38,32,0.5)" }}
          onClick={() => setSelection(null)}
        >
          <div
            className="w-full max-w-sm rounded-2xl bg-white p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <p className="mb-1 text-xs font-black uppercase" style={{ color: OCHRE }}>Détail de la commande</p>
            <p className="mb-4 text-lg font-black" style={{ color: INK }}>{selection.numero}</p>
            <div className="mb-4 flex h-40 items-center justify-center rounded-xl" style={{ backgroundColor: SAND }}>
              <Receipt size={40} style={{ color: OCHRE }} />
            </div>
            <div className="flex flex-col gap-1.5 text-sm">
              <div className="flex justify-between"><span style={{ color: MUTED }}>Client</span><span className="font-bold" style={{ color: INK }}>{selection.client_nom || selection.client_telephone}</span></div>
              <div className="flex justify-between"><span style={{ color: MUTED }}>Montant</span><span className="font-bold" style={{ color: INK }}>{fmt(selection.total)}</span></div>
              <div className="flex justify-between"><span style={{ color: MUTED }}>Moyen</span><span className="font-bold" style={{ color: INK }}>{selection.moyen_paiement || "—"}</span></div>
              <div className="flex justify-between"><span style={{ color: MUTED }}>Référence</span><span className="font-mono font-bold" style={{ color: INK }}>{selection.reference_paiement || "—"}</span></div>
              <div className="flex justify-between"><span style={{ color: MUTED }}>Statut paiement</span><span className="font-bold" style={{ color: INK }}>{selection.statut_paiement}</span></div>
            </div>
            <button
              onClick={() => setSelection(null)}
              className="mt-5 w-full rounded-xl py-2.5 text-sm font-black text-white"
              style={{ backgroundColor: GREEN }}
            >
              Fermer
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function AuditPage() {
  return (
    <div className="flex-1 overflow-y-auto px-8 py-6">
      <div className="flex flex-col gap-3">
        {AUDIT.map((a, i) => (
          <div key={i} className="rounded-2xl border bg-white p-4" style={{ borderColor: LINE }}>
            <div className="mb-1 flex items-center justify-between">
              <p className="font-black" style={{ color: INK }}>{a.quoi}</p>
              <span className="text-xs font-bold" style={{ color: MUTED }}>{a.quand}</span>
            </div>
            <p className="mb-2 text-xs font-bold" style={{ color: OCHRE }}>Par {a.qui}</p>
            <div className="flex items-center gap-2 text-xs font-semibold">
              <span className="rounded-full px-2.5 py-1" style={{ backgroundColor: "#F7E4E2", color: RED }}>{a.avant}</span>
              <ArrowRightLeft size={12} style={{ color: MUTED }} />
              <span className="rounded-full px-2.5 py-1" style={{ backgroundColor: "#E4EEE8", color: GREEN }}>{a.apres}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

const PAGES = {
  dashboard: { title: "Dashboard", subtitle: "Aujourd'hui, 30 août 2026", Comp: DashboardPage },
  commandes: { title: "Commandes", subtitle: "47 commandes aujourd'hui", Comp: CommandesPage },
  stock: { title: "Produits & Stock", subtitle: "6 produits suivis", Comp: StockPage },
  clients: { title: "Clients", subtitle: "5 clients actifs affichés", Comp: ClientsPage },
  livraisons: { title: "Livraisons", subtitle: "8 zones · 5 livreurs", Comp: LivraisonsPage },
  "suivi-live": { title: "Suivi & Paiements", subtitle: "Positions GPS, commandes, preuves de paiement", Comp: SuiviLivePage },
  finance: { title: "Finance", subtitle: "Rapprochements et caisse", Comp: FinancePage },
  rapports: { title: "Rapports", subtitle: "Analytics ventes, clients, livraison", Comp: RapportsPage },
  utilisateurs: { title: "Utilisateurs & Rôles", subtitle: "6 comptes internes", Comp: UtilisateursPage },
  audit: { title: "Audit", subtitle: "Journal des actions sensibles", Comp: AuditPage },
};

export default function AdminApp() {
  const [page, setPage] = useState("dashboard");
  const { title, subtitle, Comp } = PAGES[page];

  return (
    <div className="flex h-screen w-full" style={{ backgroundColor: CREAM, fontFamily: "Inter, system-ui, sans-serif" }}>
      <link href="https://fonts.googleapis.com/css2?family=Inter:wght@500;600;700;800;900&display=swap" rel="stylesheet" />
      <Sidebar page={page} setPage={setPage} />
      <div className="flex flex-1 flex-col overflow-hidden">
        <TopBar title={title} subtitle={subtitle} />
        <Comp />
      </div>
    </div>
  );
}
