import React, { useState, useRef, useEffect } from "react";
import { api } from "../api.js";

const INK = "#2B2620";
const CREAM = "#FBF3E3";
const SAND = "#F1E4C4";
const GREEN = "#2F6B4F";
const OCHRE = "#8B5E34";
const RED = "#C1443B";

function fmt(n) {
  return n.toLocaleString("fr-FR") + " F";
}

function BigButton({ children, onClick, disabled, tone = "primary" }) {
  const tones = {
    primary: { backgroundColor: GREEN, color: CREAM },
    stop: { backgroundColor: RED, color: CREAM },
    ghost: { backgroundColor: "transparent", color: INK, border: `2px solid ${INK}` },
  };
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{ ...tones[tone], opacity: disabled ? 0.5 : 1 }}
      className="w-full rounded-2xl py-4 text-lg font-black shadow-md transition active:scale-[0.98]"
    >
      {children}
    </button>
  );
}

export default function LivreurApp() {
  const [nomLivreur, setNomLivreur] = useState("");
  const [nomValide, setNomValide] = useState(false);

  const [disponibles, setDisponibles] = useState([]);
  const [erreurListe, setErreurListe] = useState(null);
  const idsConnusRef = useRef(new Set());
  const [permissionNotif, setPermissionNotif] = useState(
    typeof Notification !== "undefined" ? Notification.permission : "unsupported"
  );

  const [commandeSelectionnee, setCommandeSelectionnee] = useState(null); // détail (avec items) en cours de consultation
  const [chargementDetail, setChargementDetail] = useState(false);
  const [erreurDetail, setErreurDetail] = useState(null);
  const [acceptationEnCours, setAcceptationEnCours] = useState(false);

  const [commandeAcceptee, setCommandeAcceptee] = useState(null); // commande prise en charge, prête pour le partage GPS
  const [partageActif, setPartageActif] = useState(false);
  const [dernierePosition, setDernierePosition] = useState(null);
  const [erreurGPS, setErreurGPS] = useState(null);
  const watchId = useRef(null);

  // Demande la permission de notification une fois le nom saisi.
  useEffect(() => {
    if (nomValide && typeof Notification !== "undefined" && Notification.permission === "default") {
      Notification.requestPermission().then(setPermissionNotif);
    }
  }, [nomValide]);

  // Rafraîchit la liste des commandes disponibles (pas encore prises), façon notifications.
  useEffect(() => {
    if (!nomValide || commandeAcceptee) return;
    let annule = false;
    let premierChargement = true;
    const rafraichir = async () => {
      try {
        const rows = await api.commandesDisponibles();
        if (annule) return;
        const nouvelles = rows.filter((c) => !idsConnusRef.current.has(c.id));
        rows.forEach((c) => idsConnusRef.current.add(c.id));
        setDisponibles(rows);
        setErreurListe(null);
        if (!premierChargement && nouvelles.length > 0) {
          if (permissionNotif === "granted") {
            try {
              new Notification("Nouvelle commande à livrer", {
                body: `${nouvelles[0].numero} — ${nouvelles[0].zone || nouvelles[0].adresse_label || ""}`,
              });
            } catch {
              // notification indisponible sur cet appareil : pas bloquant
            }
          }
          if (navigator.vibrate) navigator.vibrate(200);
        }
        premierChargement = false;
      } catch (e) {
        if (!annule) setErreurListe(e.message);
      }
    };
    rafraichir();
    const t = setInterval(rafraichir, 8000);
    return () => { annule = true; clearInterval(t); };
  }, [nomValide, commandeAcceptee, permissionNotif]);

  const ouvrirDetail = async (commandeResume) => {
    setErreurDetail(null);
    setChargementDetail(true);
    setCommandeSelectionnee(commandeResume);
    try {
      const complet = await api.commande(commandeResume.id);
      setCommandeSelectionnee(complet);
    } catch (e) {
      setErreurDetail(e.message);
    } finally {
      setChargementDetail(false);
    }
  };

  const accepter = async () => {
    setAcceptationEnCours(true);
    setErreurDetail(null);
    try {
      const misAJour = await api.accepterCommande(commandeSelectionnee.id, nomLivreur);
      setCommandeAcceptee({ ...commandeSelectionnee, ...misAJour });
      setCommandeSelectionnee(null);
    } catch (e) {
      setErreurDetail(e.message);
    } finally {
      setAcceptationEnCours(false);
    }
  };

  const demarrerPartage = () => {
    if (!navigator.geolocation) {
      setErreurGPS("La géolocalisation n'est pas disponible sur cet appareil.");
      return;
    }
    setErreurGPS(null);
    setPartageActif(true);
    watchId.current = navigator.geolocation.watchPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        setDernierePosition({ lat: latitude, lng: longitude, heure: new Date() });
        api.majPosition(commandeAcceptee.id, { lat: latitude, lng: longitude, livreur_nom: nomLivreur || null }).catch(() => {});
      },
      (err) => {
        setErreurGPS("Impossible d'accéder à la position : " + err.message);
        setPartageActif(false);
      },
      { enableHighAccuracy: true, maximumAge: 5000, timeout: 15000 }
    );
  };

  const arreterPartage = () => {
    if (watchId.current !== null) {
      navigator.geolocation.clearWatch(watchId.current);
      watchId.current = null;
    }
    setPartageActif(false);
  };

  useEffect(() => () => { if (watchId.current !== null) navigator.geolocation.clearWatch(watchId.current); }, []);

  const marquerLivree = async () => {
    try {
      await api.majCommande(commandeAcceptee.id, { statut: "Livrée" });
      arreterPartage();
      setCommandeAcceptee(null);
      setDernierePosition(null);
    } catch (e) {
      setErreurGPS(e.message);
    }
  };

  return (
    <div className="flex min-h-screen w-full items-center justify-center p-6" style={{ backgroundColor: SAND, fontFamily: "Inter, system-ui, sans-serif" }}>
      <div className="w-full max-w-sm rounded-[2rem] p-6" style={{ backgroundColor: CREAM }}>
        <p className="mb-1 text-xs font-black uppercase tracking-wider" style={{ color: OCHRE }}>MON MARCHE FERMIER</p>
        <h1 className="mb-5 text-2xl font-black" style={{ color: INK }}>App livreur</h1>

        {/* Étape 1 : identification simple du livreur */}
        {!nomValide && (
          <>
            <label className="mb-1 block text-xs font-black uppercase" style={{ color: OCHRE }}>Votre nom</label>
            <input
              value={nomLivreur}
              onChange={(e) => setNomLivreur(e.target.value)}
              placeholder="Ex : Ibrahim Koné"
              className="mb-4 w-full rounded-2xl border-2 bg-white px-4 py-3 font-bold outline-none"
              style={{ borderColor: "#EEE3CE", color: INK }}
            />
            <BigButton disabled={!nomLivreur.trim()} onClick={() => setNomValide(true)}>Commencer ma tournée</BigButton>
          </>
        )}

        {/* Étape 2 : liste des commandes disponibles (façon notifications) */}
        {nomValide && !commandeAcceptee && !commandeSelectionnee && (
          <>
            <p className="mb-3 text-sm font-bold" style={{ color: OCHRE }}>Bonjour {nomLivreur}</p>
            <p className="mb-2 text-xs font-black uppercase tracking-wider" style={{ color: OCHRE }}>
              Commandes disponibles {disponibles.length > 0 && `(${disponibles.length})`}
            </p>
            {erreurListe && <p className="mb-3 text-sm font-bold" style={{ color: RED }}>{erreurListe}</p>}
            {disponibles.length === 0 && !erreurListe && (
              <p className="rounded-2xl px-4 py-6 text-center text-sm font-bold" style={{ backgroundColor: SAND, color: "#5A4326" }}>
                Aucune commande à livrer pour le moment. Cette liste se met à jour automatiquement.
              </p>
            )}
            <div className="flex flex-col gap-2">
              {disponibles.map((c) => (
                <button
                  key={c.id}
                  onClick={() => ouvrirDetail(c)}
                  className="flex items-center justify-between rounded-2xl border-2 bg-white px-4 py-3 text-left"
                  style={{ borderColor: "#EEE3CE" }}
                >
                  <div>
                    <p className="font-black" style={{ color: INK }}>{c.numero}</p>
                    <p className="text-xs font-semibold" style={{ color: "#B8AC94" }}>{c.client_nom || c.client_telephone} · {c.zone || c.adresse_label}</p>
                  </div>
                  <p className="font-black" style={{ color: GREEN }}>{fmt(c.total)}</p>
                </button>
              ))}
            </div>
          </>
        )}

        {/* Étape 3 : détail d'une commande + acceptation */}
        {commandeSelectionnee && !commandeAcceptee && (
          <>
            <button onClick={() => setCommandeSelectionnee(null)} className="mb-3 text-xs font-black" style={{ color: OCHRE }}>
              ← Retour à la liste
            </button>
            <div className="mb-4 rounded-2xl px-4 py-4" style={{ backgroundColor: SAND }}>
              <p className="mb-2 font-black" style={{ color: INK }}>{commandeSelectionnee.numero}</p>

              <p className="text-[11px] font-black uppercase" style={{ color: OCHRE }}>Client</p>
              <p className="mb-2 font-bold" style={{ color: INK }}>{commandeSelectionnee.client_nom || "—"}</p>

              <p className="text-[11px] font-black uppercase" style={{ color: OCHRE }}>Téléphone</p>
              <p className="mb-2 font-bold" style={{ color: INK }}>{commandeSelectionnee.client_telephone || "—"}</p>

              <p className="text-[11px] font-black uppercase" style={{ color: OCHRE }}>Destination</p>
              <p className="mb-2 font-bold" style={{ color: INK }}>
                {commandeSelectionnee.adresse_label} — {commandeSelectionnee.adresse_detail}
              </p>

              {chargementDetail && <p className="text-xs font-bold" style={{ color: OCHRE }}>Chargement du détail...</p>}
              {commandeSelectionnee.items && commandeSelectionnee.items.length > 0 && (
                <>
                  <p className="mb-1 mt-2 text-[11px] font-black uppercase" style={{ color: OCHRE }}>Articles</p>
                  <ul className="mb-2">
                    {commandeSelectionnee.items.map((it) => (
                      <li key={it.id} className="text-sm font-semibold" style={{ color: INK }}>
                        {it.quantite} × {it.nom}
                      </li>
                    ))}
                  </ul>
                </>
              )}
              <p className="mt-2 text-right text-lg font-black" style={{ color: GREEN }}>{fmt(commandeSelectionnee.total)}</p>
            </div>

            {erreurDetail && <p className="mb-3 text-sm font-bold" style={{ color: RED }}>{erreurDetail}</p>}

            <BigButton disabled={acceptationEnCours} onClick={accepter}>
              {acceptationEnCours ? "Validation..." : "Accepter cette livraison"}
            </BigButton>
          </>
        )}

        {/* Étape 4 : commande acceptée, partage GPS */}
        {commandeAcceptee && (
          <>
            <div className="mb-4 rounded-2xl px-4 py-3" style={{ backgroundColor: SAND }}>
              <p className="font-black" style={{ color: INK }}>{commandeAcceptee.numero}</p>
              <p className="text-sm font-bold" style={{ color: OCHRE }}>{commandeAcceptee.client_nom || commandeAcceptee.client_telephone}</p>
              <p className="text-sm font-semibold" style={{ color: "#5A4326" }}>
                {commandeAcceptee.adresse_label} — {commandeAcceptee.adresse_detail}
              </p>
              <p className="mt-1 text-xs font-black uppercase" style={{ color: GREEN }}>{commandeAcceptee.statut}</p>
            </div>

            {erreurGPS && <p className="mb-3 text-sm font-bold" style={{ color: RED }}>{erreurGPS}</p>}

            {!partageActif ? (
              <BigButton onClick={demarrerPartage}>Démarrer le partage de ma position</BigButton>
            ) : (
              <>
                <div className="mb-3 rounded-2xl px-4 py-3 text-center" style={{ backgroundColor: "#E4EEE8" }}>
                  <p className="text-sm font-black" style={{ color: GREEN }}>Position partagée en direct</p>
                  {dernierePosition && (
                    <p className="text-xs font-semibold" style={{ color: "#5A4326" }}>
                      {dernierePosition.lat.toFixed(5)}, {dernierePosition.lng.toFixed(5)} — {dernierePosition.heure.toLocaleTimeString("fr-FR")}
                    </p>
                  )}
                </div>
                <div className="mb-3">
                  <BigButton tone="stop" onClick={arreterPartage}>Arrêter le partage</BigButton>
                </div>
              </>
            )}

            <div className="mt-3">
              <BigButton tone="ghost" onClick={marquerLivree}>Marquer comme livrée</BigButton>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
