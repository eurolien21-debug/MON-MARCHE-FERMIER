import React, { useState, useRef, useEffect } from "react";
import { api } from "../api.js";

const INK = "#2B2620";
const CREAM = "#FBF3E3";
const SAND = "#F1E4C4";
const GREEN = "#2F6B4F";
const OCHRE = "#8B5E34";
const RED = "#C1443B";

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
  const [numero, setNumero] = useState("");
  const [nomLivreur, setNomLivreur] = useState("");
  const [commande, setCommande] = useState(null);
  const [recherche, setRecherche] = useState(false);
  const [erreur, setErreur] = useState(null);
  const [partageActif, setPartageActif] = useState(false);
  const [dernierePosition, setDernierePosition] = useState(null);
  const [erreurGPS, setErreurGPS] = useState(null);
  const watchId = useRef(null);

  const chercherCommande = async () => {
    setErreur(null);
    setRecherche(true);
    try {
      const c = await api.commandeParNumero(numero.trim());
      if (!c) {
        setErreur("Aucune commande trouvée avec ce numéro.");
        setCommande(null);
      } else {
        setCommande(c);
      }
    } catch (e) {
      setErreur(e.message);
    } finally {
      setRecherche(false);
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
        api.majPosition(commande.id, { lat: latitude, lng: longitude, livreur_nom: nomLivreur || null }).catch(() => {});
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
      await api.majCommande(commande.id, { statut: "Livrée" });
      arreterPartage();
      setCommande((c) => ({ ...c, statut: "Livrée" }));
    } catch (e) {
      setErreur(e.message);
    }
  };

  return (
    <div className="flex min-h-screen w-full items-center justify-center p-6" style={{ backgroundColor: SAND, fontFamily: "Inter, system-ui, sans-serif" }}>
      <div className="w-full max-w-sm rounded-[2rem] p-6" style={{ backgroundColor: CREAM }}>
        <p className="mb-1 text-xs font-black uppercase tracking-wider" style={{ color: OCHRE }}>MON MARCHE FERMIER</p>
        <h1 className="mb-5 text-2xl font-black" style={{ color: INK }}>App livreur</h1>

        {!commande ? (
          <>
            <label className="mb-1 block text-xs font-black uppercase" style={{ color: OCHRE }}>Votre nom</label>
            <input
              value={nomLivreur}
              onChange={(e) => setNomLivreur(e.target.value)}
              placeholder="Ex : Ibrahim Koné"
              className="mb-3 w-full rounded-2xl border-2 bg-white px-4 py-3 font-bold outline-none"
              style={{ borderColor: "#EEE3CE", color: INK }}
            />
            <label className="mb-1 block text-xs font-black uppercase" style={{ color: OCHRE }}>Numéro de commande</label>
            <input
              value={numero}
              onChange={(e) => setNumero(e.target.value)}
              placeholder="Ex : CMD-1042"
              className="mb-4 w-full rounded-2xl border-2 bg-white px-4 py-3 font-bold outline-none"
              style={{ borderColor: "#EEE3CE", color: INK }}
            />
            {erreur && <p className="mb-3 text-sm font-bold" style={{ color: RED }}>{erreur}</p>}
            <BigButton disabled={!numero.trim() || recherche} onClick={chercherCommande}>
              {recherche ? "Recherche..." : "Trouver la commande"}
            </BigButton>
          </>
        ) : (
          <>
            <div className="mb-4 rounded-2xl px-4 py-3" style={{ backgroundColor: SAND }}>
              <p className="font-black" style={{ color: INK }}>{commande.numero}</p>
              <p className="text-sm font-bold" style={{ color: OCHRE }}>{commande.client_nom || commande.client_telephone}</p>
              <p className="text-sm font-semibold" style={{ color: "#5A4326" }}>
                {commande.adresse_label} — {commande.adresse_detail}
              </p>
              <p className="mt-1 text-xs font-black uppercase" style={{ color: GREEN }}>{commande.statut}</p>
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

            <button onClick={() => { arreterPartage(); setCommande(null); setNumero(""); }} className="mt-4 w-full text-center text-xs font-bold" style={{ color: OCHRE }}>
              Changer de commande
            </button>
          </>
        )}
      </div>
    </div>
  );
}
