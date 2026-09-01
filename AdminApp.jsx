import React, { useState } from "react";
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

const COMMANDES = [
  { id: "CMD-1042", client: "Maquis Chez Awa", zone: "Cocody", montant: 68000, statut: "En préparation", paiement: "Orange Money" },
  { id: "CMD-1041", client: "Resto Le Bon Goût", zone: "Marcory", montant: 142500, statut: "Livrée", paiement: "Wave" },
  { id: "CMD-1040", client: "Superette Diallo", zone: "Yopougon", montant: 305000, statut: "En attente", paiement: "Crédit pro" },
  { id: "CMD-1039", client: "Panini Express", zone: "Angré", montant: 41000, statut: "Livreur en route", paiement: "MTN MoMo" },
  { id: "CMD-1038", client: "Hôtel Ivoire Plage", zone: "Treichville", montant: 512000, statut: "Annulée", paiement: "Carte bancaire" },
  { id: "CMD-1037", client: "Choukouya Fatou", zone: "Abobo", montant: 27500, statut: "Livrée", paiement: "Orange Money" },
];

const STATUT_STYLE = {
  "En attente": { bg: "#F1E4C4", color: OCHRE, icon: Clock },
  "En préparation": { bg: "#FBEBD1", color: GOLD, icon: Clock },
  "Livreur en route": { bg: "#E4EEE8", color: GREEN, icon: Truck },
  "Livrée": { bg: "#E4EEE8", color: GREEN, icon: CheckCircle2 },
  "Annulée": { bg: "#F7E4E2", color: RED, icon: XCircle },
};

const STOCK = [
  { produit: "Poulet de chair", emoji: "🐔", unite: "unité", niveau: 68, seuil: 30, alerte: false },
  { produit: "Œufs", emoji: "🥚", unite: "plateau", niveau: 12, seuil: 20, alerte: true },
  { produit: "Cuisses", emoji: "🍗", unite: "kg", niveau: 45, seuil: 25, alerte: false },
  { produit: "Pilons", emoji: "🍗", unite: "kg", niveau: 8, seuil: 20, alerte: true },
  { produit: "Poisson", emoji: "🐟", unite: "kg", niveau: 30, seuil: 15, alerte: false },
  { produit: "Brochettes", emoji: "🍢", unite: "unité", niveau: 90, seuil: 40, alerte: false },
];

const CLIENTS = [
  { nom: "Maquis Chez Awa", segment: "Gold", commandes: 84, panierMoyen: 62000, credit: "180 000 / 500 000" },
  { nom: "Resto Le Bon Goût", segment: "VIP", commandes: 210, panierMoyen: 140000, credit: "—" },
  { nom: "Superette Diallo", segment: "Silver", commandes: 33, panierMoyen: 95000, credit: "305 000 / 400 000" },
  { nom: "Panini Express", segment: "Bronze", commandes: 12, panierMoyen: 39000, credit: "—" },
  { nom: "Choukouya Fatou", segment: "Silver", commandes: 46, panierMoyen: 27000, credit: "—" },
];

const SEGMENT_STYLE = {
  Bronze: "#B08D57",
  Silver: "#9AA1A9",
  Gold: "#D9A441",
  VIP: "#6B4F9E",
};

// ---- Livraisons ----
const ZONES = [
  { zone: "Cocody", prix: 1000, distance: "3 km", temps: "18 min", gratuitDes: 50000 },
  { zone: "Angré", prix: 1200, distance: "5 km", temps: "22 min", gratuitDes: 50000 },
  { zone: "Marcory", prix: 1500, distance: "8 km", temps: "30 min", gratuitDes: 60000 },
  { zone: "Yopougon", prix: 2000, distance: "12 km", temps: "40 min", gratuitDes: 75000 },
  { zone: "Treichville", prix: 1500, distance: "7 km", temps: "28 min", gratuitDes: 60000 },
  { zone: "Abobo", prix: 2200, distance: "14 km", temps: "45 min", gratuitDes: 75000 },
  { zone: "Bingerville", prix: 2500, distance: "16 km", temps: "50 min", gratuitDes: 80000 },
  { zone: "Port-Bouët", prix: 2000, distance: "11 km", temps: "38 min", gratuitDes: 70000 },
];

const LIVREURS = [
  { nom: "Ibrahim Koné", statut: "En livraison", mission: "CMD-1039 → Angré", livraisonsJour: 6 },
  { nom: "Adama Traoré", statut: "Disponible", mission: "—", livraisonsJour: 8 },
  { nom: "Fatoumata Sy", statut: "En livraison", mission: "CMD-1042 → Cocody", livraisonsJour: 5 },
  { nom: "Souleymane Bamba", statut: "Hors ligne", mission: "—", livraisonsJour: 0 },
  { nom: "Aïcha Ouattara", statut: "Disponible", mission: "—", livraisonsJour: 7 },
];

const LIVREUR_STATUT_STYLE = {
  "Disponible": { bg: "#E4EEE8", color: "#2F6B4F" },
  "En livraison": { bg: "#FBEBD1", color: "#E8A23D" },
  "Hors ligne": { bg: "#EFEAE0", color: "#9C8F72" },
};

// ---- Finance ----
const RAPPROCHEMENT = [
  { commande: "CMD-1042", paiement: "Confirmé", livraison: "En cours", facture: "En attente" },
  { commande: "CMD-1041", paiement: "Confirmé", livraison: "Livrée", facture: "Émise" },
  { commande: "CMD-1040", paiement: "En attente", livraison: "Non démarrée", facture: "—" },
  { commande: "CMD-1039", paiement: "Confirmé", livraison: "En cours", facture: "En attente" },
  { commande: "CMD-1038", paiement: "Remboursé", livraison: "Annulée", facture: "Annulée" },
];

const TRANSACTIONS = [
  { id: "TRX-8841", client: "Maquis Chez Awa", montant: 68000, moyen: "Orange Money", statut: "Réussi", date: "Aujourd'hui, 09:12" },
  { id: "TRX-8840", client: "Resto Le Bon Goût", montant: 142500, moyen: "Wave", statut: "Réussi", date: "Aujourd'hui, 08:47" },
  { id: "TRX-8839", client: "Superette Diallo", montant: 305000, moyen: "Crédit pro", statut: "En attente", date: "Hier, 17:20" },
  { id: "TRX-8838", client: "Hôtel Ivoire Plage", montant: 512000, moyen: "Carte bancaire", statut: "Remboursé", date: "Hier, 14:05" },
];

const TRX_STATUT_STYLE = {
  "Réussi": { bg: "#E4EEE8", color: "#2F6B4F" },
  "En attente": { bg: "#F1E4C4", color: "#8B5E34" },
  "Remboursé": { bg: "#F7E4E2", color: "#C1443B" },
};

// ---- Rapports ----
const VENTES_PAR_PRODUIT = [
  { produit: "Poulet", ventes: 4200000 },
  { produit: "Œufs", ventes: 1800000 },
  { produit: "Cuisses", ventes: 2100000 },
  { produit: "Pilons", ventes: 1300000 },
  { produit: "Poisson", ventes: 1600000 },
  { produit: "Brochettes", ventes: 700000 },
];

const CLIENTS_MOIS = [
  { mois: "Avr", nouveaux: 12, actifs: 88 },
  { mois: "Mai", nouveaux: 18, actifs: 102 },
  { mois: "Jun", nouveaux: 15, actifs: 110 },
  { mois: "Jul", nouveaux: 22, actifs: 128 },
  { mois: "Août", nouveaux: 27, actifs: 145 },
];

const PERF_LIVREURS = [
  { nom: "Adama Traoré", livraisons: 210, tempsMoyen: "24 min", retards: "2%" },
  { nom: "Ibrahim Koné", livraisons: 188, tempsMoyen: "27 min", retards: "4%" },
  { nom: "Fatoumata Sy", livraisons: 176, tempsMoyen: "22 min", retards: "1%" },
  { nom: "Aïcha Ouattara", livraisons: 165, tempsMoyen: "29 min", retards: "6%" },
];

// ---- Utilisateurs & Rôles ----
const UTILISATEURS = [
  { nom: "Dan Eurolien", role: "Super Admin", email: "dan@monmarchefermier.ci", statut: "Actif" },
  { nom: "Awa Bamba", role: "Manager", email: "awa@monmarchefermier.ci", statut: "Actif" },
  { nom: "Koffi N'Guessan", role: "Commercial", email: "koffi@monmarchefermier.ci", statut: "Actif" },
  { nom: "Mariam Cissé", role: "Caissier", email: "mariam@monmarchefermier.ci", statut: "Actif" },
  { nom: "Bakary Sanogo", role: "Stock", email: "bakary@monmarchefermier.ci", statut: "Inactif" },
  { nom: "Service Client CI", role: "Service client", email: "support@monmarchefermier.ci", statut: "Actif" },
];

const ROLE_STYLE = {
  "Super Admin": "#6B4F9E",
  "Admin": "#8B5E34",
  "Manager": "#2F6B4F",
  "Commercial": "#D9A441",
  "Caissier": "#3E7CB1",
  "Stock": "#B08D57",
  "Service client": "#C1443B",
};

// ---- Audit ----
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

function Sidebar({ page, setPage }) {
  const items = [
    { key: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { key: "commandes", label: "Commandes", icon: ShoppingBag },
    { key: "stock", label: "Produits & Stock", icon: Package },
    { key: "clients", label: "Clients", icon: Users },
    { key: "livraisons", label: "Livraisons", icon: Truck },
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
  const s = STATUT_STYLE[statut];
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
  return (
    <div className="flex-1 overflow-y-auto px-8 py-6">
      <div className="mb-5 flex gap-4">
        <KpiCard label="Ventes du jour" value={fmt(1640000)} delta="12%" icon={TrendingUp} accent={GREEN} />
        <KpiCard label="Commandes" value="47" delta="5%" icon={ShoppingBag} accent={GOLD} />
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
            {STOCK.filter((s) => s.alerte).map((s) => (
              <div key={s.produit} className="flex items-center gap-3 rounded-xl px-3 py-2" style={{ backgroundColor: "#F7E4E2" }}>
                <span className="text-xl">{s.emoji}</span>
                <div>
                  <p className="text-xs font-black" style={{ color: INK }}>{s.produit}</p>
                  <p className="text-[11px] font-bold" style={{ color: RED }}>
                    {s.niveau} {s.unite} restants — seuil {s.seuil}
                  </p>
                </div>
              </div>
            ))}
            {STOCK.filter((s) => s.alerte).length === 0 && (
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
            {COMMANDES.slice(0, 4).map((c) => (
              <tr key={c.id} className="border-t" style={{ borderColor: LINE }}>
                <td className="py-2.5 font-black" style={{ color: INK }}>{c.id}</td>
                <td className="py-2.5 font-semibold" style={{ color: INK }}>{c.client}</td>
                <td className="py-2.5 font-semibold" style={{ color: MUTED }}>{c.zone}</td>
                <td className="py-2.5 font-black" style={{ color: INK }}>{fmt(c.montant)}</td>
                <td className="py-2.5"><StatutBadge statut={c.statut} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function CommandesPage() {
  const [filtre, setFiltre] = useState("Toutes");
  const statuts = ["Toutes", "En attente", "En préparation", "Livreur en route", "Livrée", "Annulée"];
  const visibles = filtre === "Toutes" ? COMMANDES : COMMANDES.filter((c) => c.statut === filtre);

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

      <div className="overflow-hidden rounded-2xl border bg-white" style={{ borderColor: LINE }}>
        <table className="w-full text-left text-sm">
          <thead>
            <tr style={{ color: MUTED, backgroundColor: SAND }} className="text-xs font-black uppercase">
              <th className="px-4 py-3">Commande</th>
              <th className="px-4 py-3">Client</th>
              <th className="px-4 py-3">Zone</th>
              <th className="px-4 py-3">Paiement</th>
              <th className="px-4 py-3">Montant</th>
              <th className="px-4 py-3">Statut</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {visibles.map((c) => (
              <tr key={c.id} className="border-t" style={{ borderColor: LINE }}>
                <td className="px-4 py-3 font-black" style={{ color: INK }}>{c.id}</td>
                <td className="px-4 py-3 font-semibold" style={{ color: INK }}>{c.client}</td>
                <td className="px-4 py-3 font-semibold" style={{ color: MUTED }}>
                  <span className="inline-flex items-center gap-1"><MapPin size={13} />{c.zone}</span>
                </td>
                <td className="px-4 py-3 font-semibold" style={{ color: MUTED }}>{c.paiement}</td>
                <td className="px-4 py-3 font-black" style={{ color: INK }}>{fmt(c.montant)}</td>
                <td className="px-4 py-3"><StatutBadge statut={c.statut} /></td>
                <td className="px-4 py-3 text-right">
                  <MoreHorizontal size={18} style={{ color: MUTED }} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function StockPage() {
  return (
    <div className="flex-1 overflow-y-auto px-8 py-6">
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
            {STOCK.map((s) => {
              const pct = Math.min(100, (s.niveau / (s.seuil * 3)) * 100);
              return (
                <tr key={s.produit} className="border-t" style={{ borderColor: LINE }}>
                  <td className="px-4 py-3">
                    <span className="mr-2 text-lg">{s.emoji}</span>
                    <span className="font-black" style={{ color: INK }}>{s.produit}</span>
                  </td>
                  <td className="px-4 py-3 font-bold" style={{ color: INK }}>{s.niveau} {s.unite}</td>
                  <td className="px-4 py-3">
                    <div className="h-2 w-40 overflow-hidden rounded-full" style={{ backgroundColor: SAND }}>
                      <div
                        className="h-full rounded-full"
                        style={{ width: `${pct}%`, backgroundColor: s.alerte ? RED : GREEN }}
                      />
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    {s.alerte ? (
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
    </div>
  );
}

function ClientsPage() {
  return (
    <div className="flex-1 overflow-y-auto px-8 py-6">
      <div className="overflow-hidden rounded-2xl border bg-white" style={{ borderColor: LINE }}>
        <table className="w-full text-left text-sm">
          <thead>
            <tr style={{ color: MUTED, backgroundColor: SAND }} className="text-xs font-black uppercase">
              <th className="px-4 py-3">Client</th>
              <th className="px-4 py-3">Segment</th>
              <th className="px-4 py-3">Commandes</th>
              <th className="px-4 py-3">Panier moyen</th>
              <th className="px-4 py-3">Crédit utilisé / plafond</th>
            </tr>
          </thead>
          <tbody>
            {CLIENTS.map((c) => (
              <tr key={c.nom} className="border-t" style={{ borderColor: LINE }}>
                <td className="px-4 py-3 font-black" style={{ color: INK }}>{c.nom}</td>
                <td className="px-4 py-3">
                  <span
                    className="rounded-full px-2.5 py-1 text-xs font-black text-white"
                    style={{ backgroundColor: SEGMENT_STYLE[c.segment] }}
                  >
                    {c.segment}
                  </span>
                </td>
                <td className="px-4 py-3 font-bold" style={{ color: INK }}>{c.commandes}</td>
                <td className="px-4 py-3 font-bold" style={{ color: INK }}>{fmt(c.panierMoyen)}</td>
                <td className="px-4 py-3 font-semibold" style={{ color: MUTED }}>{c.credit === "—" ? "—" : `${c.credit} F`}</td>
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
  return (
    <div className="flex-1 overflow-y-auto px-8 py-6">
      <div className="mb-4 flex items-center justify-between">
        <SectionTitle>Zones de livraison</SectionTitle>
        <button className="flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-black text-white" style={{ backgroundColor: GREEN }}>
          <Plus size={14} /> Nouvelle zone
        </button>
      </div>
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
            {ZONES.map((z) => (
              <tr key={z.zone} className="border-t" style={{ borderColor: LINE }}>
                <td className="px-4 py-3 font-black" style={{ color: INK }}>
                  <span className="inline-flex items-center gap-1.5"><MapPin size={14} style={{ color: OCHRE }} />{z.zone}</span>
                </td>
                <td className="px-4 py-3 font-bold" style={{ color: INK }}>{fmt(z.prix)}</td>
                <td className="px-4 py-3 font-semibold" style={{ color: MUTED }}>{z.distance}</td>
                <td className="px-4 py-3 font-semibold" style={{ color: MUTED }}>{z.temps}</td>
                <td className="px-4 py-3 font-semibold" style={{ color: MUTED }}>{fmt(z.gratuitDes)}</td>
                <td className="px-4 py-3 text-right"><PenLine size={16} style={{ color: MUTED }} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <SectionTitle>Livreurs</SectionTitle>
      <div className="grid grid-cols-2 gap-3">
        {LIVREURS.map((l) => {
          const s = LIVREUR_STATUT_STYLE[l.statut];
          return (
            <div key={l.nom} className="flex items-center gap-3 rounded-2xl border bg-white p-4" style={{ borderColor: LINE }}>
              <div className="flex h-11 w-11 items-center justify-center rounded-full" style={{ backgroundColor: SAND }}>
                <Bike size={20} style={{ color: OCHRE }} />
              </div>
              <div className="flex-1">
                <p className="font-black" style={{ color: INK }}>{l.nom}</p>
                <p className="text-xs font-semibold" style={{ color: MUTED }}>{l.mission}</p>
              </div>
              <div className="flex flex-col items-end gap-1">
                <span className="rounded-full px-2.5 py-1 text-[10px] font-black" style={{ backgroundColor: s.bg, color: s.color }}>
                  {l.statut}
                </span>
                <span className="text-[10px] font-bold" style={{ color: MUTED }}>{l.livraisonsJour} livraisons aujourd'hui</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function FinancePage() {
  return (
    <div className="flex-1 overflow-y-auto px-8 py-6">
      <div className="mb-5 flex gap-4">
        <KpiCard label="Chiffre d'affaires" value={fmt(11700000)} delta="8%" icon={TrendingUp} accent={GREEN} />
        <KpiCard label="Encaissé" value={fmt(9840000)} delta="6%" icon={CircleDollarSign} accent={GREEN} />
        <KpiCard label="Remboursements" value={fmt(512000)} delta="2%" positive={false} icon={TrendingDown} accent={RED} />
        <KpiCard label="Frais de livraison" value={fmt(680000)} delta="4%" icon={Truck} accent={OCHRE} />
        <KpiCard label="Marge estimée" value={fmt(2950000)} delta="9%" icon={PiggyBank} accent={OCHRE} />
      </div>

      <SectionTitle>Dernières transactions</SectionTitle>
      <div className="mb-6 overflow-hidden rounded-2xl border bg-white" style={{ borderColor: LINE }}>
        <table className="w-full text-left text-sm">
          <thead>
            <tr style={{ color: MUTED, backgroundColor: SAND }} className="text-xs font-black uppercase">
              <th className="px-4 py-3">Transaction</th>
              <th className="px-4 py-3">Client</th>
              <th className="px-4 py-3">Moyen</th>
              <th className="px-4 py-3">Montant</th>
              <th className="px-4 py-3">Statut</th>
              <th className="px-4 py-3">Date</th>
            </tr>
          </thead>
          <tbody>
            {TRANSACTIONS.map((t) => {
              const s = TRX_STATUT_STYLE[t.statut];
              return (
                <tr key={t.id} className="border-t" style={{ borderColor: LINE }}>
                  <td className="px-4 py-3 font-black" style={{ color: INK }}>{t.id}</td>
                  <td className="px-4 py-3 font-semibold" style={{ color: INK }}>{t.client}</td>
                  <td className="px-4 py-3 font-semibold" style={{ color: MUTED }}>{t.moyen}</td>
                  <td className="px-4 py-3 font-black" style={{ color: INK }}>{fmt(t.montant)}</td>
                  <td className="px-4 py-3">
                    <span className="rounded-full px-2.5 py-1 text-xs font-black" style={{ backgroundColor: s.bg, color: s.color }}>{t.statut}</span>
                  </td>
                  <td className="px-4 py-3 font-semibold" style={{ color: MUTED }}>{t.date}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <SectionTitle>Rapprochement commande ↔ paiement ↔ livraison ↔ facture</SectionTitle>
      <div className="overflow-hidden rounded-2xl border bg-white" style={{ borderColor: LINE }}>
        <table className="w-full text-left text-sm">
          <thead>
            <tr style={{ color: MUTED, backgroundColor: SAND }} className="text-xs font-black uppercase">
              <th className="px-4 py-3">Commande</th>
              <th className="px-4 py-3">Paiement</th>
              <th className="px-4 py-3">Livraison</th>
              <th className="px-4 py-3">Facture</th>
            </tr>
          </thead>
          <tbody>
            {RAPPROCHEMENT.map((r) => (
              <tr key={r.commande} className="border-t" style={{ borderColor: LINE }}>
                <td className="px-4 py-3 font-black" style={{ color: INK }}>
                  <span className="inline-flex items-center gap-1.5"><ArrowRightLeft size={13} style={{ color: OCHRE }} />{r.commande}</span>
                </td>
                <td className="px-4 py-3 font-semibold" style={{ color: MUTED }}>{r.paiement}</td>
                <td className="px-4 py-3 font-semibold" style={{ color: MUTED }}>{r.livraison}</td>
                <td className="px-4 py-3 font-semibold" style={{ color: MUTED }}>{r.facture}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
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
          <p className="mb-4 text-sm font-black" style={{ color: INK }}>Ventes par produit — 30 derniers jours</p>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={VENTES_PAR_PRODUIT}>
              <CartesianGrid vertical={false} stroke={LINE} />
              <XAxis dataKey="produit" tick={{ fontSize: 12, fill: MUTED, fontWeight: 700 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: MUTED }} axisLine={false} tickLine={false} tickFormatter={(v) => `${v / 1000000}M`} />
              <Tooltip formatter={(v) => fmt(v)} contentStyle={{ borderRadius: 12, borderColor: LINE }} />
              <Bar dataKey="ventes" fill={GREEN} radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {onglet === "clients" && (
        <div className="rounded-2xl border bg-white p-5" style={{ borderColor: LINE }}>
          <p className="mb-4 text-sm font-black" style={{ color: INK }}>Nouveaux clients & clients actifs — 5 derniers mois</p>
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={CLIENTS_MOIS}>
              <CartesianGrid vertical={false} stroke={LINE} />
              <XAxis dataKey="mois" tick={{ fontSize: 12, fill: MUTED, fontWeight: 700 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: MUTED }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ borderRadius: 12, borderColor: LINE }} />
              <Line type="monotone" dataKey="actifs" stroke={GREEN} strokeWidth={3} dot={{ r: 4 }} name="Clients actifs" />
              <Line type="monotone" dataKey="nouveaux" stroke={GOLD} strokeWidth={3} dot={{ r: 4 }} name="Nouveaux clients" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {onglet === "livraison" && (
        <div className="overflow-hidden rounded-2xl border bg-white" style={{ borderColor: LINE }}>
          <table className="w-full text-left text-sm">
            <thead>
              <tr style={{ color: MUTED, backgroundColor: SAND }} className="text-xs font-black uppercase">
                <th className="px-4 py-3">Livreur</th>
                <th className="px-4 py-3">Livraisons</th>
                <th className="px-4 py-3">Temps moyen</th>
                <th className="px-4 py-3">Taux de retard</th>
              </tr>
            </thead>
            <tbody>
              {PERF_LIVREURS.map((p) => (
                <tr key={p.nom} className="border-t" style={{ borderColor: LINE }}>
                  <td className="px-4 py-3 font-black" style={{ color: INK }}>{p.nom}</td>
                  <td className="px-4 py-3 font-bold" style={{ color: INK }}>{p.livraisons}</td>
                  <td className="px-4 py-3 font-semibold" style={{ color: MUTED }}>{p.tempsMoyen}</td>
                  <td className="px-4 py-3 font-semibold" style={{ color: MUTED }}>{p.retards}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function UtilisateursPage() {
  return (
    <div className="flex-1 overflow-y-auto px-8 py-6">
      <div className="mb-4 flex items-center justify-between">
        <SectionTitle>Comptes internes</SectionTitle>
        <button className="flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-black text-white" style={{ backgroundColor: GREEN }}>
          <Plus size={14} /> Inviter un utilisateur
        </button>
      </div>
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
            {UTILISATEURS.map((u) => (
              <tr key={u.nom} className="border-t" style={{ borderColor: LINE }}>
                <td className="px-4 py-3 font-black" style={{ color: INK }}>{u.nom}</td>
                <td className="px-4 py-3">
                  <span className="rounded-full px-2.5 py-1 text-xs font-black text-white" style={{ backgroundColor: ROLE_STYLE[u.role] || MUTED }}>
                    {u.role}
                  </span>
                </td>
                <td className="px-4 py-3 font-semibold" style={{ color: MUTED }}>{u.email}</td>
                <td className="px-4 py-3">
                  {u.statut === "Actif" ? (
                    <span className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-black" style={{ backgroundColor: "#E4EEE8", color: GREEN }}>
                      <CheckCircle2 size={12} /> Actif
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-black" style={{ backgroundColor: "#EFEAE0", color: MUTED }}>
                      <Ban size={12} /> Inactif
                    </span>
                  )}
                </td>
                <td className="px-4 py-3 text-right"><PenLine size={16} style={{ color: MUTED }} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
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
