import { useEffect, useState } from "react";
import { organizerProfile } from "@/data/profile";
import { useAuthSession } from "@/components/tickr/AuthContext";
import { authApi } from "@/lib/api/auth";

const STORAGE_KEY = "tickr-organizer-profile";
const IMPORT_OWNER_KEY = "tickr-organizer-profile-import-owner";

const defaults = {
  name: organizerProfile.name,
  username: organizerProfile.username,
  location: organizerProfile.location,
  photo: organizerProfile.photo,
  avatarUrl: null,
  bio: "Eventos, música e cultura em Luanda. Acompanhe as novidades e descubra as próximas experiências.",
  email: "",
  instagram: "",
  linkedin: "",
  website: "",
  whatsapp: "",
  notifications: true,
  publicProfile: true,
};

function mapDatabaseProfile(profile) {
  return {
    name: profile.fullName || "",
    username: profile.username ? `@${profile.username}` : "",
    location: profile.location || "",
    photo: profile.avatarUrl || organizerProfile.photo,
    avatarUrl: profile.avatarUrl,
    bio: profile.bio || "",
    email: profile.contactEmail || "",
    instagram: profile.instagram || "",
    linkedin: profile.linkedin || "",
    website: profile.website || "",
    whatsapp: profile.whatsapp || "",
    notifications: profile.notifications,
    publicProfile: profile.publicProfile,
  };
}

function readLegacyProfile() {
  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) return null;

  const profile = JSON.parse(raw);
  if (!profile || typeof profile !== "object" || Array.isArray(profile)) {
    throw new Error("Os dados antigos do perfil não têm um formato válido. Não foram alterados.");
  }
  return profile;
}

export function useOrganizerProfile() {
  const { status, user, setUser } = useAuthSession();
  const userId = user?.id;
  const [profile, setProfile] = useState(
    user?.profile ? mapDatabaseProfile(user.profile) : defaults,
  );
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(profile);
  const [loading, setLoading] = useState(status === "loading");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (status === "loading") {
      setLoading(true);
      return;
    }
    if (status !== "authenticated" || !userId) {
      setProfile(defaults);
      setDraft(defaults);
      setLoading(false);
      return;
    }

    let active = true;
    setLoading(true);
    setError("");

    const loadProfile = async () => {
      try {
        const legacyProfile = readLegacyProfile();
        const migrationOwner = window.localStorage.getItem(IMPORT_OWNER_KEY);
        const savedProfile =
          legacyProfile && !migrationOwner
            ? await authApi.importLegacyProfile(legacyProfile)
            : await authApi.getProfile();

        if (!active) return;
        const mapped = mapDatabaseProfile(savedProfile);
        setProfile(mapped);
        setDraft(mapped);
        setUser((currentUser) => ({
          ...currentUser,
          name: savedProfile.fullName,
          avatar: savedProfile.avatarUrl,
          profile: savedProfile,
        }));
        if (legacyProfile && !migrationOwner) {
          window.localStorage.setItem(IMPORT_OWNER_KEY, userId);
        }
      } catch (loadError) {
        if (active) setError(loadError.message || "Não foi possível carregar o perfil da conta.");
      } finally {
        if (active) setLoading(false);
      }
    };

    loadProfile();
    return () => {
      active = false;
    };
  }, [status, userId, setUser]);

  const changeDraftPhoto = (file) => {
    if (!file) return;
    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      setError("A foto deve estar em formato JPG, PNG ou WebP.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError("A foto não pode exceder 5 MB.");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => setDraft((current) => ({ ...current, photo: String(reader.result) }));
    reader.onerror = () => setError("Não foi possível ler a foto selecionada.");
    reader.readAsDataURL(file);
  };

  const startEditing = () => {
    setDraft(profile);
    setError("");
    setEditing(true);
  };

  const syncAuthUser = (savedProfile) => {
    setUser((currentUser) => {
      if (!currentUser) return currentUser;
      return {
        ...currentUser,
        name: savedProfile.fullName,
        avatar: savedProfile.avatarUrl,
        profile: savedProfile,
      };
    });
  };

  const saveProfile = async () => {
    setSaving(true);
    setError("");
    try {
      let avatarUrl = profile.avatarUrl;
      if (draft.photo?.startsWith("data:image/")) {
        avatarUrl = await authApi.uploadProfilePhoto(draft.photo);
      }

      const savedProfile = await authApi.updateProfile({
        fullName: draft.name.trim() || profile.name,
        username: draft.username.trim().replace(/^@+/, "") || null,
        location: draft.location.trim(),
        avatarUrl,
        bio: draft.bio.trim(),
        contactEmail: draft.email.trim(),
        instagram: draft.instagram.trim(),
        linkedin: draft.linkedin.trim(),
        website: draft.website.trim(),
        whatsapp: draft.whatsapp.trim(),
      });
      const mapped = mapDatabaseProfile(savedProfile);
      setProfile(mapped);
      setDraft(mapped);
      syncAuthUser(savedProfile);
      setEditing(false);
    } catch (saveError) {
      setError(saveError.message || "Não foi possível guardar o perfil.");
    } finally {
      setSaving(false);
    }
  };

  const cancelEditing = () => {
    setDraft(profile);
    setError("");
    setEditing(false);
  };

  const toggleSetting = async (key) => {
    if (!user || !["notifications", "publicProfile"].includes(key)) return;
    const nextValue = !profile[key];
    setError("");
    try {
      let savedProfile;
      if (key === "notifications") {
        await authApi.updateAccountPreferences({ notificationsEnabled: nextValue });
        savedProfile = { ...user.profile, notifications: nextValue };
      } else {
        savedProfile = await authApi.updateProfile({ publicProfile: nextValue });
      }
      const mapped = mapDatabaseProfile(savedProfile);
      setProfile(mapped);
      setDraft(mapped);
      syncAuthUser(savedProfile);
    } catch (settingError) {
      setError(settingError.message || "Não foi possível guardar a preferência.");
      window.alert(settingError.message || "Não foi possível guardar a preferência.");
    }
  };

  return {
    profile,
    editing,
    draft,
    setDraft,
    changeDraftPhoto,
    startEditing,
    saveProfile,
    cancelEditing,
    toggleSetting,
    loading,
    saving,
    error,
  };
}
