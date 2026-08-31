import React, { useState, useEffect } from "react";
import {
  Home,
  ShoppingCart,
  Package,
  Heart,
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
  RotateCcw,
  LocateFixed,
  Store,
  Camera,
  Loader2,
  ArrowDown,
  FileText,
  Star,
  MessageCircle,
  Send,
  Image as ImageIcon,
  AlertCircle,
  Clock3,
  ChevronRight,
} from "lucide-react";

// ---- Design tokens ----
// Cream:  #FBF3E3   Golden yellow: #E8A23D   Deep green: #2F6B4F
// Ochre/brown: #8B5E34   Ink: #2B2620   Alert red: #C1443B

const PRODUCTS = [
  { id: "poulet", nom: "Poulet de chair", emoji: "🐔", photo: "https://loremflickr.com/300/300/raw,chicken", prix: 3500, unite: "unité" },
  { id: "oeufs", nom: "Œufs", emoji: "🥚", photo: "https://loremflickr.com/300/300/eggs,tray", prix: 2200, unite: "plateau" },
  { id: "cuisses", nom: "Cuisses", emoji: "🍗", photo: "https://loremflickr.com/300/300/chicken,thighs", prix: 2800, unite: "kg" },
  { id: "pilons", nom: "Pilons", emoji: "🍗", photo: "https://loremflickr.com/300/300/chicken,drumstick", prix: 2600, unite: "kg" },
  { id: "poisson", nom: "Poisson", emoji: "🐟", photo: "https://loremflickr.com/300/300/fresh,fish", prix: 3000, unite: "kg" },
  { id: "brochette", nom: "Brochettes", emoji: "🍢", photo: "https://loremflickr.com/300/300/chicken,skewer", prix: 500, unite: "unité" },
];

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

const RECLAMATIONS = [
  {
    numero: "REC-0231",
    commande: "CMD-1042",
    motif: "Quantité incorrecte",
    date: "28 août",
    statut: "En cours",
  },
  {
    numero: "REC-0198",
    commande: "CMD-1030",
    motif: "Retard de livraison",
    date: "14 août",
    statut: "Résolue",
  },
];

const RECLAMATION_STATUT_STYLE = {
  "En cours": { bg: "#F1E4C4", color: "#8B5E34" },
  "Résolue": { bg: "#E4EEE8", color: "#2F6B4F" },
};

const MESSAGES_SUPPORT = [
  { de: "support", texte: "Bonjour, votre commande CMD-1042 est en préparation." },
  { de: "client", texte: "D'accord merci, il manquait 2 plateaux d'œufs la dernière fois." },
  { de: "support", texte: "Désolé pour la gêne, nous vérifions et vous recontactons rapidement." },
];

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

function TopBar({ title, onBack }) {
  return (
    <div className="flex items-center gap-3 px-5 pb-3 pt-6" style={{ color: "#2B2620" }}>
      {onBack && (
        <button onClick={onBack} className="rounded-full p-1" aria-label="Retour">
          <ChevronLeft size={26} strokeWidth={3} />
        </button>
      )}
      <h1 className="text-2xl font-black tracking-tight" style={{ fontFamily: "Fraunces, serif" }}>
        {title}
      </h1>
    </div>
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

function BottomNav({ screen, setScreen }) {
  const items = [
    { key: "accueil", label: "Accueil", icon: Home },
    { key: "catalogue", label: "Commander", icon: ShoppingCart },
    { key: "suivi", label: "Mes commandes", icon: Package },
    { key: "favoris", label: "Favoris", icon: Heart },
    { key: "compte", label: "Mon compte", icon: User },
  ];
  const active = screen === "accueil" ? "accueil" : screen;
  return (
    <div
      className="mt-auto grid grid-cols-5 border-t bg-white px-1 pb-3 pt-2"
      style={{ borderColor: "#EEE3CE" }}
    >
      {items.map(({ key, label, icon: Icon }) => (
        <button
          key={key}
          onClick={() => setScreen(key)}
          className="flex flex-col items-center gap-1"
          style={{ color: active === key ? "#2F6B4F" : "#B8AC94" }}
        >
          <Icon size={22} strokeWidth={active === key ? 2.8 : 2} fill={active === key && key === "favoris" ? "#2F6B4F" : "none"} />
          <span className="text-[10px] font-bold leading-none">{label}</span>
        </button>
      ))}
    </div>
  );
}

// ---- Onboarding screens ----

function InscriptionScreen({ setScreen, profil, setProfil }) {
  const [etape, setEtape] = useState("telephone"); // telephone | otp | profil
  const [otp, setOtp] = useState("");

  if (etape === "telephone") {
    return (
      <div className="flex h-full flex-col">
        <TopBar title="Bienvenue" />
        <div className="flex-1 px-5">
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
        </div>
        <div className="px-5 pb-4 pt-3">
          <BigButton disabled={!profil.telephone} onClick={() => setEtape("otp")}>
            Recevoir le code
          </BigButton>
        </div>
      </div>
    );
  }

  if (etape === "otp") {
    return (
      <div className="flex h-full flex-col">
        <TopBar title="Vérification" onBack={() => setEtape("telephone")} />
        <div className="flex-1 px-5">
          <p className="mb-4 text-sm font-bold" style={{ color: "#8B5E34" }}>
            Un code a été envoyé au {profil.telephone}.
          </p>
          <Field label="Code reçu par SMS" value={otp} onChange={setOtp} placeholder="• • • •" />
        </div>
        <div className="px-5 pb-4 pt-3">
          <BigButton disabled={otp.length < 4} onClick={() => setEtape("profil")}>
            Valider
          </BigButton>
        </div>
      </div>
    );
  }

  // Le nom du commerce et le type sont demandés une seule fois, mais
  // peuvent être complétés plus tard depuis "Mon compte" — on n'en fait
  // pas un frein à l'entrée dans l'application.
  return (
    <div className="flex h-full flex-col">
      <TopBar title="Votre commerce" />
      <div className="flex-1 overflow-y-auto px-5">
        <p className="mb-4 text-sm font-bold" style={{ color: "#8B5E34" }}>
          Optionnel, vous pourrez le compléter plus tard dans "Mon compte".
        </p>
        <Field label="Nom du commerce" value={profil.commerce} onChange={(v) => setProfil({ ...profil, commerce: v })} placeholder="Ex : Maquis Chez Awa" />
        <Field label="Type d'activité" value={profil.type} onChange={(v) => setProfil({ ...profil, type: v })} placeholder="Ex : Maquis, boutique, restaurant..." />
      </div>
      <div className="flex gap-3 px-5 pb-4 pt-3">
        <BigButton tone="ghost" full={false} onClick={() => setScreen("localisation-initiale")}>
          Passer
        </BigButton>
        <BigButton onClick={() => setScreen("localisation-initiale")}>
          Continuer
        </BigButton>
      </div>
    </div>
  );
}

function LocalisationScreen({ setScreen, onValider, contexte, adresses, setAdresses }) {
  // contexte: "initiale" (à l'inscription) ou "livraison" (avant de payer)
  const [statut, setStatut] = useState("idle"); // idle | chargement | trouve
  const [choisie, setChoisie] = useState(null);

  const localiser = () => {
    setStatut("chargement");
    setTimeout(() => {
      setStatut("trouve");
      setChoisie({ label: "Position actuelle", detail: "Cocody, Rue des Jardins" });
    }, 1400);
  };

  useEffect(() => {
    // Fluidité : si une adresse habituelle existe déjà, on la propose
    // pré-sélectionnée pour une livraison — le client n'a plus qu'à confirmer.
    const boutique = adresses.find((a) => a.label === "Ma boutique");
    if (contexte === "livraison" && boutique) {
      setChoisie(boutique);
      setStatut("trouve");
    } else {
      setStatut("idle");
      setChoisie(null);
    }
  }, [contexte]);

  return (
    <div className="flex h-full flex-col">
      <TopBar
        title={contexte === "initiale" ? "Votre position" : "Livrer où ?"}
        onBack={contexte === "livraison" ? () => setScreen("panier") : undefined}
      />
      <div className="flex-1 overflow-y-auto px-5">
        <p className="mb-4 text-sm font-bold" style={{ color: "#8B5E34" }}>
          {contexte === "initiale"
            ? "Où se trouve votre commerce ?"
            : choisie
            ? "Votre adresse habituelle est déjà prête — confirmez ou changez-la."
            : "Où souhaitez-vous être livré pour cette commande ?"}
        </p>

        {statut !== "trouve" && (
          <button
            onClick={localiser}
            className="mb-3 flex w-full items-center gap-3 rounded-2xl px-4 py-4"
            style={{ backgroundColor: "#2F6B4F" }}
          >
            {statut === "chargement" ? (
              <Loader2 size={24} className="animate-spin" color="#FBF3E3" />
            ) : (
              <LocateFixed size={24} color="#FBF3E3" />
            )}
            <span className="font-black" style={{ color: "#FBF3E3" }}>
              {statut === "chargement" ? "Recherche de votre position..." : "Utiliser ma position actuelle"}
            </span>
          </button>
        )}

        {statut === "trouve" && choisie && (
          <div
            className="mb-3 flex items-center gap-3 rounded-2xl border-2 px-4 py-4"
            style={{ borderColor: "#2F6B4F", backgroundColor: "#F1E4C4" }}
          >
            <MapPin size={24} style={{ color: "#2F6B4F" }} />
            <div>
              <p className="font-black" style={{ color: "#2B2620" }}>{choisie.label}</p>
              <p className="text-xs font-semibold" style={{ color: "#5A4326" }}>{choisie.detail}</p>
            </div>
            <CheckCircle2 className="ml-auto" size={22} style={{ color: "#2F6B4F" }} />
          </div>
        )}

        {adresses.length > 0 && (
          <>
            <p className="mb-2 mt-4 text-xs font-black uppercase tracking-wider" style={{ color: "#8B5E34" }}>
              Adresses enregistrées
            </p>
            {adresses.map((a) => (
              <button
                key={a.label}
                onClick={() => { setChoisie(a); setStatut("trouve"); }}
                className="mb-2 flex w-full items-center gap-3 rounded-2xl border-2 bg-white px-4 py-3 text-left"
                style={{ borderColor: choisie?.label === a.label ? "#2F6B4F" : "#EEE3CE" }}
              >
                <Store size={22} style={{ color: "#8B5E34" }} />
                <div>
                  <p className="font-black" style={{ color: "#2B2620" }}>{a.label}</p>
                  <p className="text-xs font-semibold" style={{ color: "#B8AC94" }}>{a.detail}</p>
                </div>
              </button>
            ))}
          </>
        )}
      </div>

      <div className="px-5 pb-4 pt-3">
        <BigButton
          disabled={!choisie}
          onClick={() => {
            if (contexte === "initiale" && !adresses.find((a) => a.label === "Ma boutique")) {
              setAdresses([...adresses, { ...choisie, label: "Ma boutique" }]);
            }
            onValider(choisie);
          }}
        >
          {contexte === "initiale" ? "Enregistrer comme \"Ma boutique\"" : "Livrer à cette adresse"}
        </BigButton>
      </div>
    </div>
  );
}

// ---- Main screens ----

function AccueilScreen({ setScreen, profil }) {
  return (
    <div className="flex h-full flex-col">
      <div className="px-5 pb-2 pt-7">
        <p className="text-sm font-bold" style={{ color: "#8B5E34" }}>
          Bonjour {profil.commerce || "Maquis Chez Awa"} 👋
        </p>
        <h1
          className="mt-1 text-3xl font-black leading-tight"
          style={{ fontFamily: "Fraunces, serif", color: "#2B2620" }}
        >
          Que voulez-vous
          <br />
          commander ?
        </h1>
      </div>

      <div className="px-5 pt-4">
        <p className="mb-2 text-xs font-black uppercase tracking-wider" style={{ color: "#8B5E34" }}>
          Nos produits
        </p>
        <div className="mb-2 flex gap-3 overflow-x-auto pb-1">
          {PRODUCTS.map((p) => (
            <div key={p.id} className="flex flex-shrink-0 flex-col items-center gap-1">
              <ProductImage product={p} size={16} />
              <span className="text-[10px] font-bold" style={{ color: "#5A4326" }}>{p.nom}</span>
            </div>
          ))}
        </div>

        <div className="flex flex-col items-center">
          <ArrowDown size={26} strokeWidth={3} className="animate-bounce" style={{ color: "#E8A23D" }} />
          <p className="mb-1 text-xs font-black" style={{ color: "#8B5E34" }}>
            Cliquez ici pour commander
          </p>
        </div>
        <BigButton icon={ShoppingCart} onClick={() => setScreen("catalogue")}>
          Commander
        </BigButton>
      </div>

      <div className="mt-6 px-5">
        <p className="mb-2 text-xs font-black uppercase tracking-wider" style={{ color: "#8B5E34" }}>
          Recommander en 1 clic
        </p>
        <div className="flex flex-col gap-3">
          {RECOMMANDE.map((r) => (
            <button
              key={r.nom}
              onClick={() => setScreen("panier")}
              className="flex items-center justify-between rounded-2xl border-2 bg-white px-4 py-3 text-left shadow-sm"
              style={{ borderColor: "#EEE3CE" }}
            >
              <div>
                <p className="font-black" style={{ color: "#2B2620" }}>{r.nom}</p>
                <p className="text-xs font-semibold" style={{ color: "#B8AC94" }}>{r.detail}</p>
              </div>
              <RotateCcw size={22} style={{ color: "#2F6B4F" }} strokeWidth={2.6} />
            </button>
          ))}
        </div>
      </div>

      <div className="mt-6 px-5">
        <div
          className="flex items-center gap-3 rounded-2xl px-4 py-3"
          style={{ backgroundColor: "#F1E4C4" }}
        >
          <Truck size={26} style={{ color: "#8B5E34" }} />
          <p className="text-sm font-bold" style={{ color: "#5A4326" }}>
            Livraison rapide dans votre zone
          </p>
        </div>
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

function CatalogueScreen({ setScreen, panier, setPanier }) {
  const total = Object.entries(panier).reduce((s, [id, q]) => {
    const p = PRODUCTS.find((p) => p.id === id);
    return s + (p ? p.prix * q : 0);
  }, 0);
  const nbArticles = Object.values(panier).reduce((a, b) => a + b, 0);

  const changeQty = (id, delta) => {
    setPanier((prev) => {
      const q = Math.max(0, (prev[id] || 0) + delta);
      const next = { ...prev };
      if (q === 0) delete next[id];
      else next[id] = q;
      return next;
    });
  };

  return (
    <div className="flex h-full flex-col">
      <TopBar title="Catalogue" onBack={() => setScreen("accueil")} />
      <div className="flex-1 overflow-y-auto px-5 pb-2">
        <div className="grid grid-cols-2 gap-3">
          {PRODUCTS.map((p) => (
            <div
              key={p.id}
              className="relative flex flex-col items-center rounded-2xl border-2 bg-white p-3 text-center shadow-sm"
              style={{ borderColor: "#EEE3CE" }}
            >
              {(p.id === "poulet" || p.id === "oeufs") && <Stamp />}
              <ProductImage product={p} />
              <p className="mt-2 text-sm font-black" style={{ color: "#2B2620" }}>{p.nom}</p>
              <p className="text-xs font-bold" style={{ color: "#8B5E34" }}>
                {p.prix.toLocaleString("fr-FR")} F / {p.unite}
              </p>

              {panier[p.id] ? (
                <div className="mt-2 flex items-center gap-3">
                  <button
                    onClick={() => changeQty(p.id, -1)}
                    className="flex h-9 w-9 items-center justify-center rounded-full"
                    style={{ backgroundColor: "#F1E4C4", color: "#2B2620" }}
                  >
                    <Minus size={18} strokeWidth={3} />
                  </button>
                  <span className="w-5 text-center text-lg font-black" style={{ color: "#2B2620" }}>
                    {panier[p.id]}
                  </span>
                  <button
                    onClick={() => changeQty(p.id, 1)}
                    className="flex h-9 w-9 items-center justify-center rounded-full"
                    style={{ backgroundColor: "#2F6B4F", color: "#FBF3E3" }}
                  >
                    <Plus size={18} strokeWidth={3} />
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => changeQty(p.id, 1)}
                  className="mt-2 flex h-9 w-full items-center justify-center gap-1 rounded-full text-sm font-black"
                  style={{ backgroundColor: "#E8A23D", color: "#2B2620" }}
                >
                  <Plus size={16} strokeWidth={3} /> Ajouter
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {nbArticles > 0 && (
        <div className="px-5 pb-3 pt-2">
          <BigButton icon={ShoppingCart} onClick={() => setScreen("panier")}>
            Voir le panier · {total.toLocaleString("fr-FR")} F
          </BigButton>
        </div>
      )}
    </div>
  );
}

function PanierScreen({ setScreen, panier, setPanier, livraison }) {
  const items = Object.entries(panier)
    .map(([id, q]) => ({ ...PRODUCTS.find((p) => p.id === id), q }))
    .filter(Boolean);
  const sousTotal = items.reduce((s, i) => s + i.prix * i.q, 0);
  const fraisLivraison = sousTotal > 0 ? 1000 : 0;
  const total = sousTotal + fraisLivraison;

  return (
    <div className="flex h-full flex-col">
      <TopBar title="Mon panier" onBack={() => setScreen("catalogue")} />
      <div className="flex-1 overflow-y-auto px-5">
        {items.length === 0 && (
          <p className="mt-10 text-center font-bold" style={{ color: "#B8AC94" }}>
            Votre panier est vide
          </p>
        )}
        <div className="flex flex-col gap-3">
          {items.map((i) => (
            <div
              key={i.id}
              className="flex items-center justify-between rounded-2xl border-2 bg-white px-4 py-3"
              style={{ borderColor: "#EEE3CE" }}
            >
              <div className="flex items-center gap-3">
                <ProductImage product={i} size={10} />
                <div>
                  <p className="font-black" style={{ color: "#2B2620" }}>{i.nom}</p>
                  <p className="text-xs font-semibold" style={{ color: "#B8AC94" }}>
                    {i.q} {i.unite}
                  </p>
                </div>
              </div>
              <p className="font-black" style={{ color: "#2F6B4F" }}>
                {(i.prix * i.q).toLocaleString("fr-FR")} F
              </p>
            </div>
          ))}
        </div>

        {items.length > 0 && (
          <button
            onClick={() => setScreen("livraison")}
            className="mt-5 flex w-full items-center gap-3 rounded-2xl px-4 py-3"
            style={{ backgroundColor: "#F1E4C4" }}
          >
            <MapPin size={22} style={{ color: "#8B5E34" }} />
            <div className="text-left">
              <p className="text-xs font-black uppercase" style={{ color: "#8B5E34" }}>Livrer à</p>
              <p className="text-sm font-bold" style={{ color: "#2B2620" }}>
                {livraison ? livraison.label + " — " + livraison.detail : "Choisir une adresse"}
              </p>
            </div>
            <span className="ml-auto text-xs font-black" style={{ color: "#2F6B4F" }}>Changer</span>
          </button>
        )}
      </div>

      {items.length > 0 && (
        <div className="border-t px-5 pb-4 pt-3" style={{ borderColor: "#EEE3CE" }}>
          <div className="mb-1 flex justify-between text-sm font-bold" style={{ color: "#8B5E34" }}>
            <span>Sous-total</span>
            <span>{sousTotal.toLocaleString("fr-FR")} F</span>
          </div>
          <div className="mb-3 flex justify-between text-sm font-bold" style={{ color: "#8B5E34" }}>
            <span>Livraison</span>
            <span>{fraisLivraison.toLocaleString("fr-FR")} F</span>
          </div>
          <div className="mb-4 flex justify-between text-xl font-black" style={{ color: "#2B2620" }}>
            <span>Total à payer</span>
            <span>{total.toLocaleString("fr-FR")} F</span>
          </div>
          <BigButton onClick={() => setScreen("livraison")}>
            {livraison ? "Payer maintenant" : "Choisir où être livré"}
          </BigButton>
        </div>
      )}
    </div>
  );
}

function PaiementScreen({ setScreen, dernierPaiement, setDernierPaiement }) {
  const [choix, setChoix] = useState(dernierPaiement || "orange");
  const options = [
    { id: "orange", label: "Orange Money", icon: Smartphone, color: "#E8A23D" },
    { id: "mtn", label: "MTN MoMo", icon: Smartphone, color: "#F0C419" },
    { id: "wave", label: "Wave", icon: Smartphone, color: "#2F6B4F" },
    { id: "carte", label: "Carte bancaire", icon: CreditCard, color: "#8B5E34" },
    { id: "credit", label: "Mon crédit pro", icon: Wallet, color: "#5A4326" },
  ];
  return (
    <div className="flex h-full flex-col">
      <TopBar title="Paiement" onBack={() => setScreen("panier")} />
      <div className="flex-1 px-5">
        <p className="mb-3 text-xs font-black uppercase tracking-wider" style={{ color: "#8B5E34" }}>
          {dernierPaiement ? "Votre moyen habituel est pré-sélectionné" : "Choisissez un moyen de paiement"}
        </p>
        <div className="flex flex-col gap-3">
          {options.map((o) => (
            <button
              key={o.id}
              onClick={() => setChoix(o.id)}
              className="flex items-center gap-3 rounded-2xl border-2 bg-white px-4 py-4 text-left"
              style={{ borderColor: choix === o.id ? "#2F6B4F" : "#EEE3CE" }}
            >
              <div
                className="flex h-11 w-11 items-center justify-center rounded-full"
                style={{ backgroundColor: `${o.color}22` }}
              >
                <o.icon size={22} style={{ color: o.color }} />
              </div>
              <span className="font-black" style={{ color: "#2B2620" }}>{o.label}</span>
              {choix === o.id && (
                <CheckCircle2 className="ml-auto" size={22} style={{ color: "#2F6B4F" }} />
              )}
            </button>
          ))}
        </div>
      </div>
      <div className="px-5 pb-4 pt-3">
        <BigButton onClick={() => { setDernierPaiement(choix); setScreen("suivi"); }}>
          Confirmer le paiement
        </BigButton>
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
  // Trajet stylisé fournisseur -> client. En production : tracé réel sur
  // fond de carte, alimenté par la position GPS envoyée par l'app livreur.
  const p0 = { x: 25, y: 105 };
  const p1 = { x: 150, y: 15 };
  const p2 = { x: 275, y: 55 };
  const pos = pointSurCourbe(progression, p0, p1, p2);
  const angle =
    (Math.atan2(
      2 * (1 - progression) * (p1.y - p0.y) + 2 * progression * (p2.y - p1.y),
      2 * (1 - progression) * (p1.x - p0.x) + 2 * progression * (p2.x - p1.x)
    ) *
      180) /
    Math.PI;

  return (
    <div
      className="relative mb-4 overflow-hidden rounded-2xl"
      style={{ height: "130px", backgroundColor: "#F1E4C4" }}
    >
      <svg viewBox="0 0 300 130" className="absolute inset-0 h-full w-full">
        <path
          d={`M ${p0.x} ${p0.y} Q ${p1.x} ${p1.y} ${p2.x} ${p2.y}`}
          fill="none"
          stroke="#C9B98A"
          strokeWidth="3"
          strokeDasharray="6 7"
          strokeLinecap="round"
        />
      </svg>

      <div className="absolute flex flex-col items-center" style={{ left: p0.x - 12, top: p0.y - 26 }}>
        <Store size={20} style={{ color: "#8B5E34" }} />
        <span className="text-[8px] font-black" style={{ color: "#8B5E34" }}>Fournisseur</span>
      </div>
      <div className="absolute flex flex-col items-center" style={{ left: p2.x - 8, top: p2.y - 26 }}>
        <Home size={20} style={{ color: "#2F6B4F" }} />
        <span className="text-[8px] font-black" style={{ color: "#2F6B4F" }}>Vous</span>
      </div>

      <div
        className="absolute text-2xl transition-all duration-500 ease-linear"
        style={{
          left: pos.x - 14,
          top: pos.y - 14,
          transform: `rotate(${angle}deg)`,
        }}
      >
        🏍️
      </div>
    </div>
  );
}

function SuiviScreen({ setScreen }) {
  const ETAPES = [
    { label: "Commande reçue", seuil: 0 },
    { label: "Paiement confirmé", seuil: 0 },
    { label: "En préparation", seuil: 0 },
    { label: "Livreur affecté", seuil: 3 },
    { label: "Livreur en route", seuil: 6 },
    { label: "Livreur proche", seuil: 14 },
    { label: "Livrée", seuil: 20 },
  ];
  const DUREE_TOTALE = 20; // secondes simulées = 12 minutes réelles côté vrai backend GPS

  const [ecoule, setEcoule] = useState(0);
  const [code, setCode] = useState("");

  useEffect(() => {
    if (ecoule >= DUREE_TOTALE) return;
    const t = setInterval(() => setEcoule((e) => Math.min(e + 1, DUREE_TOTALE)), 500);
    return () => clearInterval(t);
  }, [ecoule]);

  const etapeActuelleIdx = ETAPES.reduce((acc, e, idx) => (ecoule >= e.seuil ? idx : acc), 0);
  const livree = ecoule >= DUREE_TOTALE;
  const distanceKm = Math.max(0, (1.6 * (1 - ecoule / DUREE_TOTALE)).toFixed(1));
  const minutesRestantes = Math.max(0, Math.ceil(12 * (1 - ecoule / DUREE_TOTALE)));

  // La moto n'avance que pendant la phase "en route" : avant, elle attend
  // chez le fournisseur ; après livraison, elle reste chez le client.
  const DEBUT_TRAJET = 6;
  const FIN_TRAJET = DUREE_TOTALE;
  const progressionTrajet = Math.min(
    1,
    Math.max(0, (ecoule - DEBUT_TRAJET) / (FIN_TRAJET - DEBUT_TRAJET))
  );

  return (
    <div className="flex h-full flex-col">
      <TopBar title="Suivi de commande" onBack={() => setScreen("accueil")} />
      <div className="flex-1 overflow-y-auto px-5">
        <CarteTrajet progression={progressionTrajet} />
        <div
          className="mb-2 flex items-center gap-3 rounded-2xl px-4 py-4"
          style={{ backgroundColor: livree ? "#2F6B4F" : "#2F6B4F" }}
        >
          {livree ? (
            <CheckCircle2 size={30} color="#FBF3E3" />
          ) : (
            <Truck size={30} color="#FBF3E3" />
          )}
          <div>
            <p className="text-sm font-bold text-white opacity-90">
              {livree ? "Livraison terminée" : "Votre livreur arrive"}
            </p>
            <p className="text-lg font-black text-white">
              {livree ? "Merci pour votre commande !" : `${distanceKm} km · environ ${minutesRestantes} min`}
            </p>
          </div>
        </div>
        <p className="mb-5 text-center text-[11px] font-bold" style={{ color: "#B8AC94" }}>
          Position mise à jour automatiquement depuis l'app du livreur
        </p>

        <div className="flex flex-col">
          {ETAPES.map((e, idx) => {
            const fait = idx <= etapeActuelleIdx;
            const actif = idx === etapeActuelleIdx && !livree;
            return (
              <div key={e.label} className="flex gap-3">
                <div className="flex flex-col items-center">
                  <div
                    className="flex h-8 w-8 items-center justify-center rounded-full border-2 transition-colors duration-500"
                    style={{
                      borderColor: fait ? "#2F6B4F" : "#EEE3CE",
                      backgroundColor: fait ? "#2F6B4F" : "#FFF",
                    }}
                  >
                    {fait && <CheckCircle2 size={18} color="#FBF3E3" />}
                  </div>
                  {idx < ETAPES.length - 1 && (
                    <div
                      className="h-8 w-1 transition-colors duration-500"
                      style={{ backgroundColor: fait ? "#2F6B4F" : "#EEE3CE" }}
                    />
                  )}
                </div>
                <p
                  className={`pb-6 pt-1 font-black ${actif ? "text-lg" : ""}`}
                  style={{ color: fait ? "#2B2620" : "#B8AC94" }}
                >
                  {e.label}
                </p>
              </div>
            );
          })}
        </div>

        {!livree ? (
          <div
            className="mb-4 rounded-2xl border-2 border-dashed px-4 py-3 text-center"
            style={{ borderColor: "#E8A23D" }}
          >
            <p className="text-xs font-black uppercase" style={{ color: "#8B5E34" }}>
              Code à donner au livreur
            </p>
            <p className="text-3xl font-black tracking-widest" style={{ color: "#2B2620" }}>
              4827
            </p>
          </div>
        ) : (
          <div
            className="mb-4 rounded-2xl px-4 py-4 text-center"
            style={{ backgroundColor: "#F1E4C4" }}
          >
            <p className="text-sm font-bold" style={{ color: "#5A4326" }}>
              Le livreur a saisi le code 4827 — livraison confirmée automatiquement.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

const COMMANDES_RECENTES = [
  { id: "CMD-1042", detail: "20 poulets · aujourd'hui" },
  { id: "CMD-1030", detail: "5kg cuisses + 3 plateaux d'œufs · 14 août" },
];

function CompteScreen({ setScreen }) {
  const items = [
    { label: "Historique des commandes", icon: Package, screen: "suivi" },
    { label: "Mes factures", icon: FileText, screen: "compte" },
    { label: "Fidélité & promotions", icon: Star, screen: "compte" },
    { label: "Mes réclamations", icon: AlertCircle, screen: "reclamations" },
    { label: "Discuter avec le support", icon: MessageCircle, screen: "support" },
  ];
  return (
    <div className="flex h-full flex-col">
      <TopBar title="Mon compte" />
      <div className="flex-1 overflow-y-auto px-5">
        <div className="mb-5 flex items-center gap-3 rounded-2xl px-4 py-4" style={{ backgroundColor: "#F1E4C4" }}>
          <div className="flex h-12 w-12 items-center justify-center rounded-full text-lg font-black" style={{ backgroundColor: "#2F6B4F", color: "#FBF3E3" }}>
            MA
          </div>
          <div>
            <p className="font-black" style={{ color: "#2B2620" }}>Maquis Chez Awa</p>
            <p className="text-xs font-semibold" style={{ color: "#8B5E34" }}>Client Gold</p>
          </div>
        </div>
        <div className="flex flex-col gap-2">
          {items.map((it) => (
            <button
              key={it.label}
              onClick={() => setScreen(it.screen)}
              className="flex items-center gap-3 rounded-2xl border-2 bg-white px-4 py-3.5 text-left"
              style={{ borderColor: "#EEE3CE" }}
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-full" style={{ backgroundColor: "#F1E4C4" }}>
                <it.icon size={18} style={{ color: "#8B5E34" }} />
              </div>
              <span className="flex-1 font-black" style={{ color: "#2B2620" }}>{it.label}</span>
              <ChevronRight size={18} style={{ color: "#B8AC94" }} />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function ReclamationsScreen({ setScreen }) {
  return (
    <div className="flex h-full flex-col">
      <TopBar title="Mes réclamations" onBack={() => setScreen("compte")} />
      <div className="flex-1 overflow-y-auto px-5">
        <div className="flex flex-col gap-3">
          {RECLAMATIONS.map((r) => {
            const s = RECLAMATION_STATUT_STYLE[r.statut];
            return (
              <div key={r.numero} className="rounded-2xl border-2 bg-white px-4 py-3" style={{ borderColor: "#EEE3CE" }}>
                <div className="mb-1 flex items-center justify-between">
                  <p className="font-black" style={{ color: "#2B2620" }}>{r.numero}</p>
                  <span className="rounded-full px-2.5 py-1 text-[11px] font-black" style={{ backgroundColor: s.bg, color: s.color }}>
                    {r.statut}
                  </span>
                </div>
                <p className="text-sm font-bold" style={{ color: "#8B5E34" }}>{r.motif}</p>
                <p className="text-xs font-semibold" style={{ color: "#B8AC94" }}>
                  Commande {r.commande} · {r.date}
                </p>
              </div>
            );
          })}
        </div>
      </div>
      <div className="px-5 pb-4 pt-3">
        <BigButton icon={AlertCircle} onClick={() => setScreen("nouvelle-reclamation")}>
          Signaler un problème
        </BigButton>
      </div>
    </div>
  );
}

function NouvelleReclamationScreen({ setScreen }) {
  const [commande, setCommande] = useState(COMMANDES_RECENTES[0].id);
  const [motif, setMotif] = useState(null);
  const [commentaire, setCommentaire] = useState("");
  const [envoye, setEnvoye] = useState(false);

  if (envoye) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-3 px-8 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full" style={{ backgroundColor: "#E4EEE8" }}>
          <CheckCircle2 size={32} style={{ color: "#2F6B4F" }} />
        </div>
        <p className="text-xl font-black" style={{ color: "#2B2620" }}>Réclamation envoyée</p>
        <p className="text-sm font-bold" style={{ color: "#8B5E34" }}>
          Notre service client vous répond généralement sous 24h.
        </p>
        <div className="w-full pt-3">
          <BigButton onClick={() => setScreen("reclamations")}>Retour à mes réclamations</BigButton>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col">
      <TopBar title="Signaler un problème" onBack={() => setScreen("reclamations")} />
      <div className="flex-1 overflow-y-auto px-5">
        <p className="mb-2 text-xs font-black uppercase tracking-wider" style={{ color: "#8B5E34" }}>
          Quelle commande ?
        </p>
        <div className="mb-4 flex flex-col gap-2">
          {COMMANDES_RECENTES.map((c) => (
            <button
              key={c.id}
              onClick={() => setCommande(c.id)}
              className="flex items-center justify-between rounded-2xl border-2 bg-white px-4 py-3 text-left"
              style={{ borderColor: commande === c.id ? "#2F6B4F" : "#EEE3CE" }}
            >
              <div>
                <p className="font-black" style={{ color: "#2B2620" }}>{c.id}</p>
                <p className="text-xs font-semibold" style={{ color: "#B8AC94" }}>{c.detail}</p>
              </div>
              {commande === c.id && <CheckCircle2 size={20} style={{ color: "#2F6B4F" }} />}
            </button>
          ))}
        </div>

        <p className="mb-2 text-xs font-black uppercase tracking-wider" style={{ color: "#8B5E34" }}>
          Quel est le problème ?
        </p>
        <div className="mb-4 flex flex-wrap gap-2">
          {MOTIFS_RECLAMATION.map((m) => (
            <button
              key={m}
              onClick={() => setMotif(m)}
              className="rounded-full px-3.5 py-2 text-sm font-black"
              style={{
                backgroundColor: motif === m ? "#2F6B4F" : "#FFFFFF",
                color: motif === m ? "#FBF3E3" : "#5A4326",
                border: `2px solid ${motif === m ? "#2F6B4F" : "#EEE3CE"}`,
              }}
            >
              {m}
            </button>
          ))}
        </div>

        <button
          className="mb-4 flex w-full items-center gap-3 rounded-2xl border-2 border-dashed px-4 py-4"
          style={{ borderColor: "#E8A23D" }}
        >
          <div className="flex h-11 w-11 items-center justify-center rounded-full" style={{ backgroundColor: "#F1E4C4" }}>
            <ImageIcon size={20} style={{ color: "#8B5E34" }} />
          </div>
          <span className="font-black" style={{ color: "#2B2620" }}>Ajouter une photo (facultatif)</span>
        </button>

        <Field label="Un commentaire ? (facultatif)" value={commentaire} onChange={setCommentaire} placeholder="Expliquez en quelques mots..." />
      </div>
      <div className="px-5 pb-4 pt-3">
        <BigButton disabled={!motif} onClick={() => setEnvoye(true)}>
          Envoyer ma réclamation
        </BigButton>
      </div>
    </div>
  );
}

function SupportScreen({ setScreen }) {
  const [messages, setMessages] = useState(MESSAGES_SUPPORT);
  const [texte, setTexte] = useState("");

  const envoyer = () => {
    if (!texte.trim()) return;
    setMessages([...messages, { de: "client", texte }]);
    setTexte("");
    setTimeout(() => {
      setMessages((m) => [...m, { de: "support", texte: "Merci, votre livreur arrive dans environ 10 minutes." }]);
    }, 900);
  };

  return (
    <div className="flex h-full flex-col">
      <TopBar title="Service client" onBack={() => setScreen("compte")} />
      <div className="flex-1 overflow-y-auto px-5 py-2">
        <div className="flex flex-col gap-2">
          {messages.map((m, i) => (
            <div
              key={i}
              className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm font-semibold ${m.de === "client" ? "self-end" : "self-start"}`}
              style={{
                backgroundColor: m.de === "client" ? "#2F6B4F" : "#FFFFFF",
                color: m.de === "client" ? "#FBF3E3" : "#2B2620",
                border: m.de === "client" ? "none" : "2px solid #EEE3CE",
              }}
            >
              {m.texte}
            </div>
          ))}
        </div>
      </div>
      <div className="flex items-center gap-2 border-t px-4 py-3" style={{ borderColor: "#EEE3CE" }}>
        <input
          value={texte}
          onChange={(e) => setTexte(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && envoyer()}
          placeholder="Écrire un message..."
          className="flex-1 rounded-full border-2 px-4 py-2.5 text-sm font-semibold outline-none"
          style={{ borderColor: "#EEE3CE", color: "#2B2620" }}
        />
        <button onClick={envoyer} className="flex h-11 w-11 items-center justify-center rounded-full" style={{ backgroundColor: "#2F6B4F" }}>
          <Send size={18} color="#FBF3E3" />
        </button>
      </div>
    </div>
  );
}

// ---- App shell ----

export default function ClientApp() {
  const [screen, setScreen] = useState("inscription");
  const [panier, setPanier] = useState({ poulet: 2, oeufs: 1 });
  const [profil, setProfil] = useState({ nom: "", telephone: "", commerce: "", type: "" });
  const [adresses, setAdresses] = useState([]);
  const [livraison, setLivraison] = useState(null);
  const [dernierPaiement, setDernierPaiement] = useState(null);
  const [animKey, setAnimKey] = useState(0);

  const goTo = (next) => {
    setScreen(next);
    setAnimKey((k) => k + 1);
  };

  const screensNoNav = ["inscription", "localisation-initiale", "livraison", "panier", "paiement", "reclamations", "nouvelle-reclamation", "support"];

  const render = () => {
    switch (screen) {
      case "inscription":
        return <InscriptionScreen setScreen={goTo} profil={profil} setProfil={setProfil} />;
      case "localisation-initiale":
        return (
          <LocalisationScreen
            setScreen={goTo}
            contexte="initiale"
            adresses={adresses}
            setAdresses={setAdresses}
            onValider={() => goTo("accueil")}
          />
        );
      case "livraison":
        return (
          <LocalisationScreen
            setScreen={goTo}
            contexte="livraison"
            adresses={adresses}
            setAdresses={setAdresses}
            onValider={(choisie) => { setLivraison(choisie); goTo("paiement"); }}
          />
        );
      case "catalogue":
        return <CatalogueScreen setScreen={goTo} panier={panier} setPanier={setPanier} />;
      case "panier":
        return <PanierScreen setScreen={goTo} panier={panier} setPanier={setPanier} livraison={livraison} />;
      case "paiement":
        return <PaiementScreen setScreen={goTo} dernierPaiement={dernierPaiement} setDernierPaiement={setDernierPaiement} />;
      case "suivi":
        return <SuiviScreen setScreen={goTo} />;
      case "compte":
        return <CompteScreen setScreen={goTo} />;
      case "reclamations":
        return <ReclamationsScreen setScreen={goTo} />;
      case "nouvelle-reclamation":
        return <NouvelleReclamationScreen setScreen={goTo} />;
      case "support":
        return <SupportScreen setScreen={goTo} />;
      default:
        return <AccueilScreen setScreen={goTo} profil={profil} />;
    }
  };

  const onglets = ["inscription", "localisation-initiale", "accueil", "catalogue", "panier", "livraison", "paiement", "suivi", "compte", "reclamations", "nouvelle-reclamation", "support"];

  return (
    <div
      className="flex min-h-screen w-full flex-col items-center justify-center gap-4 p-6"
      style={{ backgroundColor: "#F1E4C4", fontFamily: "Inter, system-ui, sans-serif" }}
    >
      <link
        href="https://fonts.googleapis.com/css2?family=Fraunces:wght@700;900&family=Inter:wght@600;700;800;900&display=swap"
        rel="stylesheet"
      />
      <style>{`
        @keyframes screenFadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .screen-transition { animation: screenFadeIn 0.28s ease-out; }
      `}</style>
      <div className="flex flex-wrap justify-center gap-1.5 rounded-2xl bg-white/70 p-1.5 text-[11px] font-bold" style={{ color: "#5A4326" }}>
        {onglets.map((s) => (
          <button
            key={s}
            onClick={() => goTo(s)}
            className="rounded-full px-2.5 py-1.5 capitalize"
            style={{ backgroundColor: screen === s ? "#2F6B4F" : "transparent", color: screen === s ? "#FBF3E3" : "#5A4326" }}
          >
            {s.replace("-", " ")}
          </button>
        ))}
      </div>

      <div
        className="flex h-[720px] w-[360px] flex-col overflow-hidden rounded-[2.5rem] border-8 shadow-2xl"
        style={{ borderColor: "#2B2620", backgroundColor: "#FBF3E3" }}
      >
        <div key={animKey} className="screen-transition flex-1 overflow-hidden">{render()}</div>
        {!screensNoNav.includes(screen) && <BottomNav screen={screen} setScreen={goTo} />}
      </div>
    </div>
  );
}
