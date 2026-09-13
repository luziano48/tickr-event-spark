import { useEffect, useState } from "react";
import { organizerProfile } from "@/data/profile";

const STORAGE_KEY = "tickr-organizer-profile";

const defaults = {
  name: organizerProfile.name,
  username: organizerProfile.username,
  location: organizerProfile.location,
  photo: organizerProfile.photo,
  notifications: true,
  publicProfile: true,
};

function readStored() {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return { ...defaults, ...JSON.parse(raw) };
  } catch {
    return null;
  }
}

export function useOrganizerProfile() {
  const [profile, setProfile] = useState(defaults);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(defaults);

  // Carrega o perfil guardado apenas no navegador (evita erros de hidratação).
  useEffect(() => {
    const stored = readStored();
    if (stored) {
      setProfile(stored);
      setDraft(stored);
    }
  }, []);

  const persist = (next) => {
    setProfile(next);
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {
      /* armazenamento indisponível */
    }
  };

  const changePhoto = (file) => {
    if (!file || !file.type.startsWith("image/")) return;
    const reader = new FileReader();
    reader.onload = () => persist({ ...profile, photo: String(reader.result) });
    reader.readAsDataURL(file);
  };

  const startEditing = () => {
    setDraft(profile);
    setEditing(true);
  };

  const saveProfile = () => {
    const cleaned = {
      ...profile,
      name: draft.name.trim() || profile.name,
      username: draft.username.trim().startsWith("@")
        ? draft.username.trim()
        : `@${draft.username.trim()}`,
      location: draft.location.trim() || profile.location,
    };
    persist(cleaned);
    setEditing(false);
  };

  const cancelEditing = () => {
    setDraft(profile);
    setEditing(false);
  };

  const toggleSetting = (key) => persist({ ...profile, [key]: !profile[key] });

  return {
    profile,
    editing,
    draft,
    setDraft,
    changePhoto,
    startEditing,
    saveProfile,
    cancelEditing,
    toggleSetting,
  };
}
