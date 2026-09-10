import React, { useState, useEffect } from "react";
import {
  Home,
  ShoppingCart,
  Package,
  User,
  MapPin,
  Plus,
  Minus,
  Wallet,
  Smartphone,
  CreditCard,
  Truck,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  RotateCcw,
  LocateFixed,
  Store,
  Camera,
  Loader2,
  FileText,
  Star,
  MessageCircle,
  Send,
  Image as ImageIcon,
  AlertCircle,
  X,
} from "lucide-react";
import { api } from "../api.js";

// ---- Données ----
// Les produits ne sont plus codés en dur : ils sont chargés depuis l'API
// réelle (voir fetchProduits dans le composant racine ClientApp).

const RECOMMANDE = [
  { nom: "20 Poulets", detail: "Commande habituelle" },
  { nom: "5kg Cuisses + 3 plateaux d'œufs", detail: "Il y a 4 jours" },
];

const MOTIFS_RECLAMATION = [
  "Produit manquant",
  "Mauvais produit",
  "Produit endommagé",
  "Quantité incorrecte",
  "Retard de livraison",
  "Problème de paiement",
  "Problème avec le livreur",
  "Autre",
];

const RECLAMATIONS_INIT = [
  { numero: "REC-0231", commande: "CMD-1042", motif: "Quantité incorrecte", date: "28 août", statut: "En cours" },
  { numero: "REC-0198", commande: "CMD-1030", motif: "Retard de livraison", date: "14 août", statut: "Résolue" },
];

const RECLAMATION_STATUT_STYLE = {
  "En cours": { bg: "#F1E4C4", color: "#8B5E34" },
  "Résolue": { bg: "#E4EEE8", color: "#2F6B4F" },
};

const MESSAGES_SUPPORT_INIT = [
  { de: "support", texte: "Bonjour, votre commande CMD-1042 est en préparation." },
  { de: "client", texte: "D'accord merci, il manquait 2 plateaux d'œufs la dernière fois." },
  { de: "support", texte: "Désolé pour la gêne, nous vérifions et vous recontactons rapidement." },
];

const COMMANDES_RECENTES = [
  { id: "CMD-1042", detail: "20 poulets · aujourd'hui" },
  { id: "CMD-1030", detail: "5kg cuisses + 3 plateaux d'œufs · 14 août" },
];

const TYPES_ACTIVITE = [
  "Boutique",
  "Petit revendeur",
  "Restaurant",
  "Maquis",
  "Point choukouya",
  "Vendeur de poulet braisé",
  "Vendeur de panini",
  "Fast-food",
  "Hôtel",
  "Cantine",
  "Traiteur",
  "Superette",
  "Vendeur de quartier",
  "Revendeur indépendant",
  "Particulier professionnel",
  "Autre",
];

const COMMANDE_MINIMUM_QTE = 5; // articles

// ---- Composants génériques ----

function Stamp() {
  return (
    <div
      className="absolute -right-2 -top-2 flex h-14 w-14 -rotate-12 items-center justify-center rounded-full border-2 border-dashed text-center leading-tight shadow-sm"
      style={{ borderColor: "#2F6B4F", color: "#2F6B4F", backgroundColor: "#FBF3E3" }}
    >
      <span className="text-[9px] font-black uppercase tracking-wide">
        Frais
        <br />
        du jour
      </span>
    </div>
  );
}

function BigButton({ children, onClick, tone = "primary", full = true, icon: Icon, disabled }) {
  const tones = {
    primary: { backgroundColor: "#2F6B4F", color: "#FBF3E3" },
    accent: { backgroundColor: "#E8A23D", color: "#2B2620" },
    ghost: { backgroundColor: "transparent", color: "#2B2620", border: "2px solid #2B2620" },
  };
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{ ...tones[tone], opacity: disabled ? 0.5 : 1 }}
      className={`${full ? "w-full" : ""} flex items-center justify-center gap-2 rounded-2xl py-4 text-lg font-black shadow-md active:scale-[0.98] transition`}
    >
      {Icon && <Icon size={22} strokeWidth={2.5} />}
      {children}
    </button>
  );
}

function Field({ label, value, onChange, placeholder, type = "text" }) {
  return (
    <div className="mb-3">
      <label className="mb-1 block text-xs font-black uppercase tracking-wide" style={{ color: "#8B5E34" }}>
        {label}
      </label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-2xl border-2 bg-white px-4 py-3 text-base font-bold outline-none"
        style={{ borderColor: "#EEE3CE", color: "#2B2620" }}
      />
    </div>
  );
}

function Select({ label, value, onChange, options, placeholder }) {
  return (
    <div className="mb-3">
      <label className="mb-1 block text-xs font-black uppercase tracking-wide" style={{ color: "#8B5E34" }}>
        {label}
      </label>
      <div className="relative">
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full appearance-none rounded-2xl border-2 bg-white px-4 py-3 text-base font-bold outline-none"
          style={{ borderColor: "#EEE3CE", color: value ? "#2B2620" : "#9CA3AF" }}
        >
          <option value="" disabled>{placeholder}</option>
          {options.map((o) => (
            <option key={o} value={o}>{o}</option>
          ))}
        </select>
        <ChevronDown size={18} className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2" style={{ color: "#8B5E34" }} />
      </div>
    </div>
  );
}

function ProductImage({ product, size = 20 }) {
  const [erreur, setErreur] = useState(false);
  const dim = `${size * 0.25}rem`;
  if (erreur) {
    return (
      <div
        className="flex items-center justify-center rounded-full"
        style={{ width: dim, height: dim, backgroundColor: "#F1E4C4", fontSize: size >= 20 ? "2.25rem" : "1.25rem" }}
      >
        {product.emoji}
      </div>
    );
  }
  return (
    <img
      src={product.photo}
      alt={product.nom}
      onError={() => setErreur(true)}
      className="rounded-full object-cover"
      style={{ width: dim, height: dim, backgroundColor: "#F1E4C4" }}
    />
  );
}

// Fenêtre superposée (bottom sheet) — tout ce qui n'est pas un des 2 écrans
// principaux passe par ici : onboarding, finaliser, compte, réclamation, support.
function GlobalAnimStyles() {
  return (
    <style>{`
      @keyframes sheetBackdropIn { from { opacity: 0; } to { opacity: 1; } }
      @keyframes sheetSlideUp { from { transform: translateY(100%); } to { transform: translateY(0); } }
      @keyframes popIn {
        0% { opacity: 0; transform: scale(0.6); }
        60% { opacity: 1; transform: scale(1.08); }
        100% { transform: scale(1); }
      }
      @keyframes bump {
        0% { transform: scale(1); }
        40% { transform: scale(1.18); }
        100% { transform: scale(1); }
      }
      @keyframes checkDraw {
        from { stroke-dashoffset: 24; }
        to { stroke-dashoffset: 0; }
      }
      .sheet-backdrop { animation: sheetBackdropIn 0.22s ease-out; }
      .sheet-panel { animation: sheetSlideUp 0.32s cubic-bezier(0.22, 1, 0.36, 1); }
      .anim-pop { animation: popIn 0.38s cubic-bezier(0.22, 1, 0.36, 1); }
      .anim-bump { animation: bump 0.28s cubic-bezier(0.22, 1, 0.36, 1); }
      .btn-tap { transition: transform 0.12s ease-out; }
      .btn-tap:active { transform: scale(0.94); }
    `}</style>
  );
}

function Sheet({ open, onClose, title, onBack, children, closable = true }) {
  if (!open) return null;
  return (
    <div
      className="sheet-backdrop absolute inset-0 z-40 flex flex-col justify-end"
      style={{ backgroundColor: "rgba(43,38,32,0.5)" }}
      onClick={closable ? onClose : undefined}
    >
      <div
        className="sheet-panel flex max-h-[94%] flex-col overflow-hidden rounded-t-[2rem]"
        style={{ backgroundColor: "#FBF3E3" }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-2 px-5 pb-2 pt-4" style={{ color: "#2B2620" }}>
          {onBack && (
            <button onClick={onBack} className="btn-tap rounded-full p-1">
              <ChevronLeft size={22} strokeWidth={3} />
            </button>
          )}
          <h2 className="flex-1 text-lg font-black" style={{ fontFamily: "Fraunces, serif" }}>
            {title}
          </h2>
          {closable && (
            <button onClick={onClose} aria-label="Fermer" className="btn-tap rounded-full p-1.5" style={{ backgroundColor: "#F1E4C4" }}>
              <X size={16} strokeWidth={3} style={{ color: "#5A4326" }} />
            </button>
          )}
        </div>
        <div className="flex-1 overflow-y-auto">{children}</div>
      </div>
    </div>
  );
}

function pointSurCourbe(t, p0, p1, p2) {
  const x = (1 - t) ** 2 * p0.x + 2 * (1 - t) * t * p1.x + t ** 2 * p2.x;
  const y = (1 - t) ** 2 * p0.y + 2 * (1 - t) * t * p1.y + t ** 2 * p2.y;
  return { x, y };
}

function CarteTrajet({ progression }) {
  const p0 = { x: 25, y: 105 };
  const p1 = { x: 150, y: 15 };
  const p2 = { x: 275, y: 55 };
  const pos = pointSurCourbe(progression, p0, p1, p2);
  const angle =
    (Math.atan2(
      2 * (1 - progression) * (p1.y - p0.y) + 2 * progression * (p2.y - p1.y),
      2 * (1 - progression) * (p1.x - p0.x) + 2 * progression * (p2.x - p1.x)
    ) * 180) / Math.PI;

  return (
    <div className="relative mb-4 overflow-hidden rounded-2xl" style={{ height: "120px", backgroundColor: "#F1E4C4" }}>
      <svg viewBox="0 0 300 130" className="absolute inset-0 h-full w-full">
        <path d={`M ${p0.x} ${p0.y} Q ${p1.x} ${p1.y} ${p2.x} ${p2.y}`} fill="none" stroke="#C9B98A" strokeWidth="3" strokeDasharray="6 7" strokeLinecap="round" />
      </svg>
      <div className="absolute flex flex-col items-center" style={{ left: p0.x - 12, top: p0.y - 26 }}>
        <Store size={18} style={{ color: "#8B5E34" }} />
        <span className="text-[8px] font-black" style={{ color: "#8B5E34" }}>Fournisseur</span>
      </div>
      <div className="absolute flex flex-col items-center" style={{ left: p2.x - 8, top: p2.y - 26 }}>
        <Home size={18} style={{ color: "#2F6B4F" }} />
        <span className="text-[8px] font-black" style={{ color: "#2F6B4F" }}>Vous</span>
      </div>
      <div className="absolute text-2xl transition-all duration-500 ease-linear" style={{ left: pos.x - 14, top: pos.y - 14, transform: `rotate(${angle}deg)` }}>
        🏍️
      </div>
    </div>
  );
}

// ---- Fenêtre : Inscription (téléphone → OTP → profil → localisation) ----
function OnboardingSheet({ open, profil, setProfil, adresses, setAdresses, onTermine }) {
  const [etape, setEtape] = useState("identite");
  const [otp, setOtp] = useState("");
  const [codeEnvoye, setCodeEnvoye] = useState(false);
  const [statutGPS, setStatutGPS] = useState("idle");
  const [position, setPosition] = useState(null);

  const localiser = () => {
    setStatutGPS("chargement");
    setTimeout(() => {
      setStatutGPS("trouve");
      setPosition({ label: "Ma boutique", detail: "Cocody, Rue des Jardins" });
    }, 1200);
  };

  return (
    <Sheet open={open} closable={false} title={etape === "identite" ? "Bienvenue" : "Votre commerce"}>
      {etape === "identite" && (
        <div className="flex flex-col px-5 pb-6">
          <p className="mb-4 text-sm font-bold" style={{ color: "#8B5E34" }}>
            Entrez votre numéro pour démarrer. C'est rapide, pas de mot de passe à retenir.
          </p>
          <Field
            label="Numéro de téléphone"
            value={profil.telephone}
            onChange={(v) => setProfil({ ...profil, telephone: v })}
            placeholder="Ex : 07 00 00 00 00"
            type="tel"
          />
          {!codeEnvoye ? (
            <BigButton disabled={!profil.telephone} onClick={() => setCodeEnvoye(true)}>Recevoir le code</BigButton>
          ) : (
            <>
              <p className="mb-3 -mt-1 text-xs font-bold" style={{ color: "#8B5E34" }}>Un code a été envoyé au {profil.telephone}.</p>
              <Field label="Code reçu par SMS" value={otp} onChange={setOtp} placeholder="• • • •" />
              <BigButton disabled={otp.length < 4} onClick={() => setEtape("profil")}>Valider</BigButton>
            </>
          )}
        </div>
      )}
      {etape === "profil" && (
        <div className="flex flex-col px-5 pb-6">
          <p className="mb-4 text-sm font-bold" style={{ color: "#8B5E34" }}>
            Dernière étape avant de commander.
          </p>
          <Field label="Nom du commerce" value={profil.commerce} onChange={(v) => setProfil({ ...profil, commerce: v })} placeholder="Ex : Maquis Chez Awa" />
          <Select
            label="Type d'activité"
            value={profil.type}
            onChange={(v) => setProfil({ ...profil, type: v })}
            options={TYPES_ACTIVITE}
            placeholder="Choisissez une catégorie"
          />

          <p className="mb-2 mt-1 text-xs font-black uppercase tracking-wide" style={{ color: "#8B5E34" }}>Où êtes-vous ?</p>
          {statutGPS !== "trouve" ? (
            <button onClick={localiser} className="mb-4 flex items-center gap-3 rounded-2xl px-4 py-4" style={{ backgroundColor: "#2F6B4F" }}>
              {statutGPS === "chargement" ? <Loader2 size={22} className="animate-spin" color="#FBF3E3" /> : <LocateFixed size={22} color="#FBF3E3" />}
              <span className="font-black" style={{ color: "#FBF3E3" }}>
                {statutGPS === "chargement" ? "Recherche de votre position..." : "Utiliser ma position actuelle"}
              </span>
            </button>
          ) : (
            <div className="mb-4 flex items-center gap-3 rounded-2xl border-2 px-4 py-4" style={{ borderColor: "#2F6B4F", backgroundColor: "#F1E4C4" }}>
              <MapPin size={22} style={{ color: "#2F6B4F" }} />
              <div>
                <p className="font-black" style={{ color: "#2B2620" }}>{position.label}</p>
                <p className="text-xs font-semibold" style={{ color: "#5A4326" }}>{position.detail}</p>
              </div>
              <CheckCircle2 className="ml-auto" size={20} style={{ color: "#2F6B4F" }} />
            </div>
          )}
          <BigButton
            disabled={statutGPS !== "trouve"}
            onClick={() => onTermine(position)}
          >
            Terminer
          </BigButton>
        </div>
      )}
    </Sheet>
  );
}

// ---- Fenêtre : Finaliser (livraison + paiement) ----
function FinaliserSheet({ open, onClose, panier, produits, livraison, setLivraison, adresses, dernierPaiement, setDernierPaiement, onConfirmer }) {
  const [adresseOuverte, setAdresseOuverte] = useState(!livraison);
  const [choixPaiement, setChoixPaiement] = useState(dernierPaiement || "orange");
  const [statutGPS, setStatutGPS] = useState("idle");
  const [envoiEnCours, setEnvoiEnCours] = useState(false);
  const [erreurEnvoi, setErreurEnvoi] = useState(null);

  useEffect(() => {
    if (open) setAdresseOuverte(!livraison);
  }, [open]);

  const items = Object.entries(panier).map(([id, q]) => ({ ...produits.find((p) => p.id === id), q })).filter(Boolean);
  const sousTotal = items.reduce((s, i) => s + i.prix * i.q, 0);
  const fraisLivraison = sousTotal > 0 ? 1000 : 0;
  const total = sousTotal + fraisLivraison;

  const localiser = () => {
    setStatutGPS("chargement");
    setTimeout(() => {
      setStatutGPS("idle");
      setLivraison({ label: "Position actuelle", detail: "Cocody, Rue des Jardins" });
      setAdresseOuverte(false);
    }, 1000);
  };

  const optionsPaiement = [
    { id: "orange", label: "Orange Money", icon: Smartphone, color: "#E8A23D" },
    { id: "mtn", label: "MTN MoMo", icon: Smartphone, color: "#F0C419" },
    { id: "wave", label: "Wave", icon: Smartphone, color: "#2F6B4F" },
    { id: "carte", label: "Carte bancaire", icon: CreditCard, color: "#8B5E34" },
    { id: "credit", label: "Mon crédit pro", icon: Wallet, color: "#5A4326" },
  ];

  return (
    <Sheet open={open} onClose={onClose} title="Finaliser la commande">
      <div className="px-5 pb-3">
        <p className="mb-2 text-xs font-black uppercase tracking-wider" style={{ color: "#8B5E34" }}>1. Livrer où ?</p>
        {!adresseOuverte && livraison ? (
          <button onClick={() => setAdresseOuverte(true)} className="mb-5 flex w-full items-center gap-3 rounded-2xl border-2 px-4 py-3" style={{ borderColor: "#2F6B4F", backgroundColor: "#F1E4C4" }}>
            <MapPin size={20} style={{ color: "#2F6B4F" }} />
            <div className="text-left">
              <p className="text-sm font-black" style={{ color: "#2B2620" }}>{livraison.label}</p>
              <p className="text-xs font-semibold" style={{ color: "#5A4326" }}>{livraison.detail}</p>
            </div>
            <span className="ml-auto text-xs font-black" style={{ color: "#2F6B4F" }}>Changer</span>
          </button>
        ) : (
          <div className="mb-5">
            <button onClick={localiser} className="mb-2 flex w-full items-center gap-3 rounded-2xl px-4 py-3.5" style={{ backgroundColor: "#2F6B4F" }}>
              {statutGPS === "chargement" ? <Loader2 size={20} className="animate-spin" color="#FBF3E3" /> : <LocateFixed size={20} color="#FBF3E3" />}
              <span className="font-black" style={{ color: "#FBF3E3" }}>{statutGPS === "chargement" ? "Recherche..." : "Utiliser ma position actuelle"}</span>
            </button>
            {adresses.map((a) => (
              <button key={a.label} onClick={() => { setLivraison(a); setAdresseOuverte(false); }} className="mb-2 flex w-full items-center gap-3 rounded-2xl border-2 bg-white px-4 py-3 text-left" style={{ borderColor: "#EEE3CE" }}>
                <Store size={18} style={{ color: "#8B5E34" }} />
                <div>
                  <p className="text-sm font-black" style={{ color: "#2B2620" }}>{a.label}</p>
                  <p className="text-xs font-semibold" style={{ color: "#B8AC94" }}>{a.detail}</p>
                </div>
              </button>
            ))}
          </div>
        )}

        <p className="mb-2 text-xs font-black uppercase tracking-wider" style={{ color: "#8B5E34" }}>2. Comment payer ?</p>
        <div className="mb-4 flex flex-col gap-2">
          {optionsPaiement.map((o) => (
            <button key={o.id} onClick={() => setChoixPaiement(o.id)} className="flex items-center gap-3 rounded-2xl border-2 bg-white px-4 py-3 text-left" style={{ borderColor: choixPaiement === o.id ? "#2F6B4F" : "#EEE3CE" }}>
              <div className="flex h-9 w-9 items-center justify-center rounded-full" style={{ backgroundColor: `${o.color}22` }}>
                <o.icon size={18} style={{ color: o.color }} />
              </div>
              <span className="text-sm font-black" style={{ color: "#2B2620" }}>{o.label}</span>
              {choixPaiement === o.id && <CheckCircle2 className="ml-auto" size={20} style={{ color: "#2F6B4F" }} />}
            </button>
          ))}
        </div>
      </div>
      <div className="border-t px-5 pb-5 pt-3" style={{ borderColor: "#EEE3CE" }}>
        <div className="mb-3 flex justify-between text-lg font-black" style={{ color: "#2B2620" }}>
          <span>Total à payer</span>
          <span>{total.toLocaleString("fr-FR")} F</span>
        </div>
        {erreurEnvoi && (
          <p className="mb-2 text-center text-xs font-bold" style={{ color: "#C1443B" }}>{erreurEnvoi}</p>
        )}
        <BigButton
          disabled={!livraison || items.reduce((s, i) => s + i.q, 0) < COMMANDE_MINIMUM_QTE || envoiEnCours}
          onClick={async () => {
            setErreurEnvoi(null);
            setEnvoiEnCours(true);
            try {
              const resultat = await onConfirmer({
                items: items.map((i) => ({ product_id: i.dbId, quantite: i.q })),
                adresse_label: livraison.label,
                adresse_detail: livraison.detail,
                zone: livraison.label,
                moyen_paiement: choixPaiement,
              });
              setDernierPaiement(choixPaiement);
            } catch (e) {
              setErreurEnvoi("Impossible d'envoyer la commande : " + e.message);
            } finally {
              setEnvoiEnCours(false);
            }
          }}
        >
          {envoiEnCours ? "Envoi en cours..." : "Confirmer la commande"}
        </BigButton>
      </div>
    </Sheet>
  );
}

// ---- Fenêtre : Mon compte ----
function CompteSheet({ open, onClose, profil, setProfil }) {
  return (
    <Sheet open={open} onClose={onClose} title="Mon compte">
      <div className="px-5 pb-6">
        <div className="mb-5 flex items-center gap-3 rounded-2xl px-4 py-4" style={{ backgroundColor: "#F1E4C4" }}>
          <div className="flex h-12 w-12 items-center justify-center rounded-full text-lg font-black" style={{ backgroundColor: "#2F6B4F", color: "#FBF3E3" }}>
            {(profil.commerce || "MA").slice(0, 2).toUpperCase()}
          </div>
          <div>
            <p className="font-black" style={{ color: "#2B2620" }}>{profil.commerce || "Mon commerce"}</p>
            <p className="text-xs font-semibold" style={{ color: "#8B5E34" }}>Client Gold</p>
          </div>
        </div>
        <Field label="Nom du commerce" value={profil.commerce} onChange={(v) => setProfil({ ...profil, commerce: v })} placeholder="Ex : Maquis Chez Awa" />
        <Select label="Type d'activité" value={profil.type} onChange={(v) => setProfil({ ...profil, type: v })} options={TYPES_ACTIVITE} placeholder="Choisissez une catégorie" />
        <Field label="Téléphone" value={profil.telephone} onChange={(v) => setProfil({ ...profil, telephone: v })} placeholder="Ex : 07 00 00 00 00" type="tel" />
        <div className="mt-2 flex flex-col gap-2">
          <button className="flex items-center gap-3 rounded-2xl border-2 bg-white px-4 py-3 text-left" style={{ borderColor: "#EEE3CE" }}>
            <FileText size={18} style={{ color: "#8B5E34" }} />
            <span className="font-black text-sm" style={{ color: "#2B2620" }}>Mes factures</span>
            <ChevronRight className="ml-auto" size={16} style={{ color: "#B8AC94" }} />
          </button>
          <button className="flex items-center gap-3 rounded-2xl border-2 bg-white px-4 py-3 text-left" style={{ borderColor: "#EEE3CE" }}>
            <Star size={18} style={{ color: "#8B5E34" }} />
            <span className="font-black text-sm" style={{ color: "#2B2620" }}>Fidélité & promotions</span>
            <ChevronRight className="ml-auto" size={16} style={{ color: "#B8AC94" }} />
          </button>
        </div>
      </div>
    </Sheet>
  );
}

// ---- Fenêtre : Nouvelle réclamation ----
function ReclamationSheet({ open, onClose, onEnvoyer }) {
  const [commande, setCommande] = useState(COMMANDES_RECENTES[0].id);
  const [motif, setMotif] = useState(null);
  const [commentaire, setCommentaire] = useState("");
  const [envoye, setEnvoye] = useState(false);

  useEffect(() => {
    if (open) {
      setMotif(null);
      setCommentaire("");
      setEnvoye(false);
    }
  }, [open]);

  return (
    <Sheet open={open} onClose={onClose} title={envoye ? "Envoyé" : "Signaler un problème"}>
      {envoye ? (
        <div className="flex flex-col items-center gap-3 px-8 pb-8 pt-4 text-center">
          <div className="anim-pop flex h-16 w-16 items-center justify-center rounded-full" style={{ backgroundColor: "#E4EEE8" }}>
            <CheckCircle2 size={32} style={{ color: "#2F6B4F" }} />
          </div>
          <p className="text-lg font-black" style={{ color: "#2B2620" }}>Réclamation envoyée</p>
          <p className="text-sm font-bold" style={{ color: "#8B5E34" }}>Notre service client vous répond généralement sous 24h.</p>
          <div className="w-full pt-2">
            <BigButton onClick={onClose}>Fermer</BigButton>
          </div>
        </div>
      ) : (
        <div className="px-5 pb-6">
          <p className="mb-2 text-xs font-black uppercase tracking-wider" style={{ color: "#8B5E34" }}>Quelle commande ?</p>
          <div className="mb-4 flex flex-col gap-2">
            {COMMANDES_RECENTES.map((c) => (
              <button key={c.id} onClick={() => setCommande(c.id)} className="flex items-center justify-between rounded-2xl border-2 bg-white px-4 py-3 text-left" style={{ borderColor: commande === c.id ? "#2F6B4F" : "#EEE3CE" }}>
                <div>
                  <p className="font-black" style={{ color: "#2B2620" }}>{c.id}</p>
                  <p className="text-xs font-semibold" style={{ color: "#B8AC94" }}>{c.detail}</p>
                </div>
                {commande === c.id && <CheckCircle2 size={20} style={{ color: "#2F6B4F" }} />}
              </button>
            ))}
          </div>
          <p className="mb-2 text-xs font-black uppercase tracking-wider" style={{ color: "#8B5E34" }}>Quel est le problème ?</p>
          <div className="mb-4 flex flex-wrap gap-2">
            {MOTIFS_RECLAMATION.map((m) => (
              <button key={m} onClick={() => setMotif(m)} className="rounded-full px-3.5 py-2 text-sm font-black" style={{ backgroundColor: motif === m ? "#2F6B4F" : "#FFFFFF", color: motif === m ? "#FBF3E3" : "#5A4326", border: `2px solid ${motif === m ? "#2F6B4F" : "#EEE3CE"}` }}>
                {m}
              </button>
            ))}
          </div>
          <button className="mb-4 flex w-full items-center gap-3 rounded-2xl border-2 border-dashed px-4 py-4" style={{ borderColor: "#E8A23D" }}>
            <div className="flex h-11 w-11 items-center justify-center rounded-full" style={{ backgroundColor: "#F1E4C4" }}>
              <ImageIcon size={20} style={{ color: "#8B5E34" }} />
            </div>
            <span className="font-black" style={{ color: "#2B2620" }}>Ajouter une photo (facultatif)</span>
          </button>
          <Field label="Un commentaire ? (facultatif)" value={commentaire} onChange={setCommentaire} placeholder="Expliquez en quelques mots..." />
          <BigButton disabled={!motif} onClick={() => { setEnvoye(true); onEnvoyer(commande, motif); }}>
            Envoyer ma réclamation
          </BigButton>
        </div>
      )}
    </Sheet>
  );
}

// ---- Fenêtre : Support ----
function SupportSheet({ open, onClose }) {
  const [messages, setMessages] = useState(MESSAGES_SUPPORT_INIT);
  const [texte, setTexte] = useState("");

  const envoyer = () => {
    if (!texte.trim()) return;
    setMessages((m) => [...m, { de: "client", texte }]);
    setTexte("");
    setTimeout(() => {
      setMessages((m) => [...m, { de: "support", texte: "Merci, votre livreur arrive dans environ 10 minutes." }]);
    }, 900);
  };

  return (
    <Sheet open={open} onClose={onClose} title="Service client">
      <div className="flex h-[55vh] flex-col">
        <div className="flex-1 overflow-y-auto px-5 py-2">
          <div className="flex flex-col gap-2">
            {messages.map((m, i) => (
              <div key={i} className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm font-semibold ${m.de === "client" ? "self-end" : "self-start"}`} style={{ backgroundColor: m.de === "client" ? "#2F6B4F" : "#FFFFFF", color: m.de === "client" ? "#FBF3E3" : "#2B2620", border: m.de === "client" ? "none" : "2px solid #EEE3CE" }}>
                {m.texte}
              </div>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-2 border-t px-4 py-3" style={{ borderColor: "#EEE3CE" }}>
          <input value={texte} onChange={(e) => setTexte(e.target.value)} onKeyDown={(e) => e.key === "Enter" && envoyer()} placeholder="Écrire un message..." className="flex-1 rounded-full border-2 px-4 py-2.5 text-sm font-semibold outline-none" style={{ borderColor: "#EEE3CE", color: "#2B2620" }} />
          <button onClick={envoyer} className="flex h-11 w-11 items-center justify-center rounded-full" style={{ backgroundColor: "#2F6B4F" }}>
            <Send size={18} color="#FBF3E3" />
          </button>
        </div>
      </div>
    </Sheet>
  );
}

// ---- Barre du haut commune (avatar -> Mon compte) ----
function TopBar2({ titre, sousTitre, onAvatar }) {
  return (
    <div className="flex items-center justify-between px-5 pb-3 pt-6">
      <div>
        {sousTitre && <p className="text-sm font-bold" style={{ color: "#8B5E34" }}>{sousTitre}</p>}
        <h1 className="text-2xl font-black leading-tight" style={{ fontFamily: "Fraunces, serif", color: "#2B2620" }}>{titre}</h1>
      </div>
      <button onClick={onAvatar} aria-label="Mon compte" className="flex h-10 w-10 items-center justify-center rounded-full" style={{ backgroundColor: "#2F6B4F" }}>
        <User size={18} color="#FBF3E3" />
      </button>
    </div>
  );
}

// ---- Onglets du bas : seulement 2 ----
function BottomNav2({ ecran, setEcran, badge }) {
  const items = [
    { key: "commander", label: "Commander", icon: ShoppingCart },
    { key: "espace", label: "Mon espace", icon: Package },
  ];
  return (
    <div className="mt-auto grid grid-cols-2 border-t bg-white px-1 pb-3 pt-2" style={{ borderColor: "#EEE3CE" }}>
      {items.map(({ key, label, icon: Icon }) => (
        <button key={key} onClick={() => setEcran(key)} className="btn-tap relative flex flex-col items-center gap-1" style={{ color: ecran === key ? "#2F6B4F" : "#B8AC94" }}>
          <Icon key={ecran === key ? key : "off"} className={ecran === key ? "anim-bump" : ""} size={22} strokeWidth={ecran === key ? 2.8 : 2} />
          <span className="text-[11px] font-bold leading-none">{label}</span>
          {key === "espace" && badge && (
            <span className="absolute -right-1 top-0 h-2 w-2 rounded-full" style={{ backgroundColor: "#C1443B" }} />
          )}
        </button>
      ))}
    </div>
  );
}

// ---- Écran 1 : Commander (accueil + catalogue + panier) ----
function CommanderScreen({ panier, setPanier, onOuvrirCompte, onContinuer, profil, produits, produitsChargement, produitsErreur }) {
  const [panierOuvert, setPanierOuvert] = useState(false);
  const items = Object.entries(panier).map(([id, q]) => ({ ...produits.find((p) => p.id === id), q })).filter(Boolean);
  const total = items.reduce((s, i) => s + i.prix * i.q, 0);
  const nbArticles = items.reduce((s, i) => s + i.q, 0);

  const changeQty = (id, delta) => {
    setPanier((prev) => {
      const produit = produits.find((p) => p.id === id);
      const maxStock = produit ? produit.stock : Infinity;
      const q = Math.min(maxStock, Math.max(0, (prev[id] || 0) + delta));
      const next = { ...prev };
      if (q === 0) delete next[id];
      else next[id] = q;
      return next;
    });
  };

  return (
    <div className="flex h-full flex-col">
      <TopBar2 titre="Que commandez-vous ?" sousTitre={`Bonjour ${profil.commerce || "chez vous"} 👋`} onAvatar={onOuvrirCompte} />

      <div className="flex-1 overflow-y-auto px-5 pb-2">
        <p className="mb-2 text-xs font-black uppercase tracking-wider" style={{ color: "#8B5E34" }}>Catalogue</p>
        {produitsChargement && (
          <p className="py-8 text-center text-sm font-bold" style={{ color: "#8B5E34" }}>Chargement du catalogue...</p>
        )}
        {produitsErreur && (
          <div className="rounded-2xl border-2 px-4 py-3 text-sm font-bold" style={{ borderColor: "#F0C2BC", backgroundColor: "#F7E4E2", color: "#C1443B" }}>
            Impossible de charger le catalogue : {produitsErreur}
          </div>
        )}
        {!produitsChargement && !produitsErreur && (
          <div className="grid grid-cols-2 gap-3">
            {produits.map((p) => (
              <div key={p.id} className="relative flex flex-col items-center rounded-2xl border-2 bg-white p-3 text-center shadow-sm" style={{ borderColor: "#EEE3CE" }}>
                {(p.id === "poulet" || p.id === "oeufs") && <Stamp />}
                <ProductImage product={p} />
                <p className="mt-2 text-sm font-black" style={{ color: "#2B2620" }}>{p.nom}</p>
                <p className="text-xs font-bold" style={{ color: "#8B5E34" }}>{p.prix.toLocaleString("fr-FR")} F / {p.unite}</p>
                {p.stock <= 0 ? (
                  <p className="mt-2 text-xs font-black" style={{ color: "#C1443B" }}>Rupture de stock</p>
                ) : panier[p.id] ? (
                  <div className="mt-2 flex items-center gap-3">
                    <button onClick={() => changeQty(p.id, -1)} className="btn-tap flex h-9 w-9 items-center justify-center rounded-full" style={{ backgroundColor: "#F1E4C4", color: "#2B2620" }}>
                      <Minus size={18} strokeWidth={3} />
                    </button>
                    <span key={panier[p.id]} className="anim-bump w-5 text-center text-lg font-black" style={{ color: "#2B2620" }}>{panier[p.id]}</span>
                    <button onClick={() => changeQty(p.id, 1)} className="btn-tap flex h-9 w-9 items-center justify-center rounded-full" style={{ backgroundColor: "#2F6B4F", color: "#FBF3E3" }}>
                      <Plus size={18} strokeWidth={3} />
                    </button>
                  </div>
                ) : (
                  <button onClick={() => changeQty(p.id, 1)} className="btn-tap mt-2 flex h-9 w-full items-center justify-center gap-1 rounded-full text-sm font-black" style={{ backgroundColor: "#E8A23D", color: "#2B2620" }}>
                    <Plus size={16} strokeWidth={3} /> Ajouter
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {nbArticles > 0 && (
        <div className="border-t bg-white px-5 pt-3" style={{ borderColor: "#EEE3CE" }}>
          <button onClick={() => setPanierOuvert((v) => !v)} className="mb-3 flex w-full items-center justify-between">
            <span key={total} className="anim-bump text-sm font-black" style={{ color: "#2B2620" }}>{nbArticles} article{nbArticles > 1 ? "s" : ""} · {total.toLocaleString("fr-FR")} F</span>
            <span className="flex items-center gap-1 text-xs font-black" style={{ color: "#2F6B4F" }}>
              {panierOuvert ? "Réduire" : "Voir le panier"}
              <ChevronDown size={16} style={{ transform: panierOuvert ? "rotate(180deg)" : "none", transition: "transform 0.2s" }} />
            </span>
          </button>
          {panierOuvert && (
            <div className="mb-3 flex max-h-32 flex-col gap-2 overflow-y-auto">
              {items.map((i) => (
                <div key={i.id} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <ProductImage product={i} size={8} />
                    <span className="text-sm font-bold" style={{ color: "#2B2620" }}>{i.q} × {i.nom}</span>
                  </div>
                  <span className="text-sm font-black" style={{ color: "#2F6B4F" }}>{(i.prix * i.q).toLocaleString("fr-FR")} F</span>
                </div>
              ))}
            </div>
          )}
          <div className="pb-4">
            {nbArticles < COMMANDE_MINIMUM_QTE ? (
              <>
                <p className="mb-2 text-center text-xs font-bold" style={{ color: "#C1443B" }}>
                  Commande minimum {COMMANDE_MINIMUM_QTE} articles — il manque {COMMANDE_MINIMUM_QTE - nbArticles} article{COMMANDE_MINIMUM_QTE - nbArticles > 1 ? "s" : ""}
                </p>
                <BigButton icon={ShoppingCart} disabled>Continuer</BigButton>
              </>
            ) : (
              <BigButton icon={ShoppingCart} onClick={onContinuer}>Continuer</BigButton>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ---- Écran 2 : Mon espace (suivi + historique + réclamations + support) ----
function EspaceScreen({ profil, onOuvrirCompte, commandeEnCours, derniereCommande, reclamations, onNouvelleReclamation, onSupport }) {
  const ETAPES = [
    { label: "Commande reçue", seuil: 0 },
    { label: "Paiement confirmé", seuil: 0 },
    { label: "En préparation", seuil: 0 },
    { label: "Livreur affecté", seuil: 3 },
    { label: "Livreur en route", seuil: 6 },
    { label: "Livreur proche", seuil: 14 },
    { label: "Livrée", seuil: 20 },
  ];
  const DUREE_TOTALE = 20;
  const [ecoule, setEcoule] = useState(0);

  useEffect(() => {
    if (!commandeEnCours) { setEcoule(0); return; }
    if (ecoule >= DUREE_TOTALE) return;
    const t = setInterval(() => setEcoule((e) => Math.min(e + 1, DUREE_TOTALE)), 500);
    return () => clearInterval(t);
  }, [ecoule, commandeEnCours]);

  const etapeActuelleIdx = ETAPES.reduce((acc, e, idx) => (ecoule >= e.seuil ? idx : acc), 0);
  const livree = ecoule >= DUREE_TOTALE;
  const minutesRestantes = Math.max(0, Math.ceil(12 * (1 - ecoule / DUREE_TOTALE)));
  const progressionTrajet = Math.min(1, Math.max(0, (ecoule - 6) / (DUREE_TOTALE - 6)));

  return (
    <div className="flex h-full flex-col">
      <TopBar2 titre="Mon espace" sousTitre="Suivi, historique & support" onAvatar={onOuvrirCompte} />
      <div className="flex-1 overflow-y-auto px-5 pb-4">
        {commandeEnCours ? (
          <>
            <p className="mb-2 text-xs font-black uppercase tracking-wider" style={{ color: "#8B5E34" }}>
              Commande en cours{derniereCommande ? ` — ${derniereCommande.numero}` : ""}
            </p>
            <CarteTrajet progression={progressionTrajet} />
            <div className="mb-2 flex items-center gap-3 rounded-2xl px-4 py-3" style={{ backgroundColor: "#2F6B4F" }}>
              {livree ? <CheckCircle2 key="done" className="anim-pop" size={24} color="#FBF3E3" /> : <Truck size={24} color="#FBF3E3" />}
              <p className="text-sm font-black text-white">{livree ? "Livrée — merci pour votre commande !" : `Environ ${minutesRestantes} min`}</p>
            </div>
            <div className="mb-5 flex flex-col">
              {ETAPES.map((e, idx) => {
                const fait = idx <= etapeActuelleIdx;
                return (
                  <div key={e.label} className="flex items-center gap-2 py-1">
                    <div className="flex h-5 w-5 items-center justify-center rounded-full transition-colors duration-300" style={{ backgroundColor: fait ? "#2F6B4F" : "#EEE3CE" }}>
                      {fait && <CheckCircle2 key={idx} className="anim-pop" size={12} color="#FBF3E3" />}
                    </div>
                    <span className="text-xs font-bold" style={{ color: fait ? "#2B2620" : "#B8AC94" }}>{e.label}</span>
                  </div>
                );
              })}
            </div>
          </>
        ) : (
          <div className="mb-5 rounded-2xl px-4 py-4 text-center" style={{ backgroundColor: "#F1E4C4" }}>
            <p className="text-sm font-bold" style={{ color: "#5A4326" }}>Aucune commande en cours</p>
          </div>
        )}

        <p className="mb-2 text-xs font-black uppercase tracking-wider" style={{ color: "#8B5E34" }}>Mes réclamations</p>
        <div className="mb-3 flex flex-col gap-2">
          {reclamations.map((r) => {
            const s = RECLAMATION_STATUT_STYLE[r.statut];
            return (
              <div key={r.numero} className="rounded-2xl border-2 bg-white px-4 py-3" style={{ borderColor: "#EEE3CE" }}>
                <div className="mb-1 flex items-center justify-between">
                  <p className="text-sm font-black" style={{ color: "#2B2620" }}>{r.numero}</p>
                  <span className="rounded-full px-2 py-0.5 text-[10px] font-black" style={{ backgroundColor: s.bg, color: s.color }}>{r.statut}</span>
                </div>
                <p className="text-xs font-bold" style={{ color: "#8B5E34" }}>{r.motif} · {r.commande}</p>
              </div>
            );
          })}
        </div>
        <button onClick={onNouvelleReclamation} className="mb-5 flex w-full items-center gap-3 rounded-2xl border-2 border-dashed px-4 py-3" style={{ borderColor: "#E8A23D" }}>
          <AlertCircle size={18} style={{ color: "#8B5E34" }} />
          <span className="text-sm font-black" style={{ color: "#2B2620" }}>Signaler un problème</span>
        </button>

        <button onClick={onSupport} className="flex w-full items-center gap-3 rounded-2xl px-4 py-3.5" style={{ backgroundColor: "#2F6B4F" }}>
          <MessageCircle size={20} color="#FBF3E3" />
          <span className="text-sm font-black" style={{ color: "#FBF3E3" }}>Discuter avec le support</span>
        </button>
      </div>
    </div>
  );
}

// ---- App shell : 2 écrans + fenêtres superposées ----
export default function ClientApp() {
  const [ecran, setEcran] = useState("commander");
  const [profil, setProfil] = useState({ telephone: "", commerce: "", type: "" });
  const [adresses, setAdresses] = useState([]);
  const [panier, setPanier] = useState({});
  const [livraison, setLivraison] = useState(null);
  const [dernierPaiement, setDernierPaiement] = useState(null);
  const [reclamations, setReclamations] = useState(RECLAMATIONS_INIT);
  const [derniereCommande, setDerniereCommande] = useState(null);

  const [produits, setProduits] = useState([]);
  const [produitsChargement, setProduitsChargement] = useState(true);
  const [produitsErreur, setProduitsErreur] = useState(null);

  const [onboardingOuvert, setOnboardingOuvert] = useState(true);
  const [finaliserOuvert, setFinaliserOuvert] = useState(false);
  const [compteOuvert, setCompteOuvert] = useState(false);
  const [reclamationOuverte, setReclamationOuverte] = useState(false);
  const [supportOuvert, setSupportOuvert] = useState(false);
  const [commandeEnCours, setCommandeEnCours] = useState(false);

  // Chargement du vrai catalogue depuis l'API au démarrage.
  useEffect(() => {
    let annule = false;
    api.produits()
      .then((rows) => {
        if (annule) return;
        setProduits(
          rows.map((r) => ({
            id: r.slug,
            dbId: r.id,
            nom: r.nom,
            emoji: r.emoji,
            photo: r.photo,
            prix: r.prix,
            unite: r.unite,
            stock: r.stock,
          }))
        );
      })
      .catch((e) => { if (!annule) setProduitsErreur(e.message); })
      .finally(() => { if (!annule) setProduitsChargement(false); });
    return () => { annule = true; };
  }, []);

  // Enregistre réellement le client (créé ou mis à jour en base) à la fin de l'inscription.
  const enregistrerProfil = async (position) => {
    try {
      await api.enregistrerClient({
        telephone: profil.telephone,
        commerce: profil.commerce,
        type_activite: profil.type,
        adresse_label: position.label,
        adresse_detail: position.detail,
      });
    } catch (e) {
      // On n'empêche pas l'accès à l'app si l'enregistrement échoue,
      // mais l'info ne sera pas visible côté back-office.
      console.error("Échec de l'enregistrement du client :", e.message);
    }
    setAdresses((prev) => [...prev, position]);
    setOnboardingOuvert(false);
  };

  // Envoie réellement la commande à l'API (stock déduit en base, numéro réel renvoyé).
  const confirmerCommande = async ({ items, adresse_label, adresse_detail, zone, moyen_paiement }) => {
    const resultat = await api.creerCommande({
      telephone: profil.telephone,
      items,
      adresse_label,
      adresse_detail,
      zone,
      moyen_paiement,
    });
    setDerniereCommande(resultat);
    setFinaliserOuvert(false);
    setCommandeEnCours(true);
    setPanier({});
    setEcran("espace");
    // Rafraîchir le catalogue pour refléter le stock réellement déduit.
    api.produits().then((rows) => {
      setProduits(rows.map((r) => ({ id: r.slug, dbId: r.id, nom: r.nom, emoji: r.emoji, photo: r.photo, prix: r.prix, unite: r.unite, stock: r.stock })));
    }).catch(() => {});
    return resultat;
  };

  return (
    <div
      data-export-shell="1"
      className="flex min-h-screen w-full flex-col items-center justify-center gap-4 p-6"
      style={{ backgroundColor: "#F1E4C4", fontFamily: "Inter, system-ui, sans-serif" }}
    >
      <link href="https://fonts.googleapis.com/css2?family=Fraunces:wght@700;900&family=Inter:wght@600;700;800;900&display=swap" rel="stylesheet" />
      <GlobalAnimStyles />

      <div
        data-export-frame="1"
        className="relative flex h-[720px] w-[360px] flex-col overflow-hidden rounded-[2.5rem] border-8 shadow-2xl"
        style={{ borderColor: "#2B2620", backgroundColor: "#FBF3E3" }}
      >
        <div className="flex-1 overflow-hidden">
          {ecran === "commander" ? (
            <CommanderScreen
              panier={panier}
              setPanier={setPanier}
              profil={profil}
              produits={produits}
              produitsChargement={produitsChargement}
              produitsErreur={produitsErreur}
              onOuvrirCompte={() => setCompteOuvert(true)}
              onContinuer={() => setFinaliserOuvert(true)}
            />
          ) : (
            <EspaceScreen
              profil={profil}
              onOuvrirCompte={() => setCompteOuvert(true)}
              commandeEnCours={commandeEnCours}
              derniereCommande={derniereCommande}
              reclamations={reclamations}
              onNouvelleReclamation={() => setReclamationOuverte(true)}
              onSupport={() => setSupportOuvert(true)}
            />
          )}
        </div>
        <BottomNav2 ecran={ecran} setEcran={setEcran} badge={commandeEnCours} />

        <OnboardingSheet
          open={onboardingOuvert}
          profil={profil}
          setProfil={setProfil}
          adresses={adresses}
          setAdresses={setAdresses}
          onTermine={enregistrerProfil}
        />
        <FinaliserSheet
          open={finaliserOuvert}
          onClose={() => setFinaliserOuvert(false)}
          panier={panier}
          produits={produits}
          livraison={livraison}
          setLivraison={setLivraison}
          adresses={adresses}
          dernierPaiement={dernierPaiement}
          setDernierPaiement={setDernierPaiement}
          onConfirmer={confirmerCommande}
        />
        <CompteSheet open={compteOuvert} onClose={() => setCompteOuvert(false)} profil={profil} setProfil={setProfil} />
        <ReclamationSheet
          open={reclamationOuverte}
          onClose={() => setReclamationOuverte(false)}
          onEnvoyer={(commande, motif) => setReclamations((r) => [{ numero: `REC-0${Math.floor(Math.random() * 900 + 100)}`, commande, motif, date: "Aujourd'hui", statut: "En cours" }, ...r])}
        />
        <SupportSheet open={supportOuvert} onClose={() => setSupportOuvert(false)} />
      </div>
    </div>
  );
}
