import { createServerFn } from "@tanstack/react-start";
import { getRequestUrl } from "@tanstack/react-start/server";
import { z } from "zod";
import { createSupabaseServerClient } from "@/lib/supabase.server";

const credentialsSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});
const registrationSchema = credentialsSchema.extend({
  name: z.string().trim().min(1),
  businessProfile: z.enum(["organizer", "service_provider"]),
});
const recoverySchema = z.object({ email: z.string().email() });
const passwordSchema = z.object({ password: z.string().min(8) });
const codeSchema = z.object({ code: z.string().min(1) });
const userIdSchema = z.object({ userId: z.string().uuid() });
const roleSchema = z.enum(["organizer", "service_provider", "moderator", "admin"]);
const setRoleSchema = userIdSchema.extend({
  role: roleSchema,
  enabled: z.boolean(),
});
const profileSchema = z
  .object({
    username: z
      .string()
      .trim()
      .regex(/^[A-Za-z0-9._-]{3,30}$/)
      .nullable()
      .optional(),
    fullName: z.string().trim().min(1).max(100).optional(),
    avatarUrl: z.string().url().max(2048).nullable().optional(),
    bio: z.string().max(1000).optional(),
    location: z.string().max(150).optional(),
    instagram: z.string().max(255).optional(),
    linkedin: z.string().max(255).optional(),
    website: z.string().max(2048).optional(),
    whatsapp: z.string().max(40).optional(),
    contactEmail: z.union([z.string().trim().email().max(320), z.literal("")]).optional(),
    publicProfile: z.boolean().optional(),
  })
  .strict()
  .refine((profile) => Object.keys(profile).length > 0, "Indica pelo menos um campo do perfil.");
const profilePhotoSchema = z.object({
  imageData: z
    .string()
    .max(7000000)
    .regex(/^data:image\/(?:jpeg|png|webp);base64,[A-Za-z0-9+/]+={0,2}$/),
});
const legacyProfileSchema = z
  .object({
    name: z.string().max(100).optional(),
    username: z.string().max(40).optional(),
    location: z.string().max(150).optional(),
    photo: z.string().max(7000000).optional(),
    bio: z.string().max(1000).optional(),
    email: z.string().max(320).optional(),
    instagram: z.string().max(255).optional(),
    linkedin: z.string().max(255).optional(),
    website: z.string().max(2048).optional(),
    whatsapp: z.string().max(40).optional(),
    notifications: z.boolean().optional(),
    publicProfile: z.boolean().optional(),
  })
  .passthrough();
const accountPreferencesSchema = z.object({ notificationsEnabled: z.boolean() });

const profileColumns =
  "id, username, full_name, avatar_url, bio, location, business_profile, contact_email, instagram, linkedin, website, whatsapp, public_profile, created_at, updated_at";

function getAuthRedirectUrl(flow) {
  const configuredUrl = import.meta.env.VITE_SITE_URL;
  if (configuredUrl) return new URL(`/login?flow=${flow}`, configuredUrl).toString();

  const requestUrl = getRequestUrl();
  if (requestUrl.hostname === "localhost" || requestUrl.hostname === "127.0.0.1") {
    return new URL(`/login?flow=${flow}`, requestUrl).toString();
  }

  throw new Error("Define VITE_SITE_URL com o endereço público da aplicação.");
}

function mapProfile(profile) {
  return {
    username: profile.username,
    fullName: profile.full_name,
    avatarUrl: profile.avatar_url,
    bio: profile.bio,
    location: profile.location,
    businessProfile: profile.business_profile,
    contactEmail: profile.contact_email,
    instagram: profile.instagram,
    linkedin: profile.linkedin,
    website: profile.website,
    whatsapp: profile.whatsapp,
    publicProfile: profile.public_profile,
    createdAt: profile.created_at,
    updatedAt: profile.updated_at,
  };
}

async function uploadProfilePhotoForUser(client, userId, imageData) {
  const [, contentType] = imageData.match(/^data:(image\/(?:jpeg|png|webp));base64,/);
  const extension = { "image/jpeg": "jpg", "image/png": "png", "image/webp": "webp" }[contentType];
  const imageBlob = await (await fetch(imageData)).blob();
  if (imageBlob.size > 5 * 1024 * 1024) {
    throw new Error("A imagem não pode exceder 5 MB.");
  }

  const imagePath = `${userId}/profile/${crypto.randomUUID()}.${extension}`;
  const { error } = await client.storage
    .from("tickr-event-covers")
    .upload(imagePath, imageBlob, { contentType, upsert: false, cacheControl: "3600" });
  if (error) throw new Error(`Não foi possível guardar a foto: ${error.message}`);
  return client.storage.from("tickr-event-covers").getPublicUrl(imagePath).data.publicUrl;
}

async function getAccountProfile(client, userId) {
  const [{ data: profile, error: profileError }, { data: preferences, error: preferencesError }] =
    await Promise.all([
      client.from("tickr_profiles").select(profileColumns).eq("id", userId).single(),
      client
        .from("tickr_account_preferences")
        .select("notifications_enabled")
        .eq("user_id", userId)
        .single(),
    ]);
  if (profileError) throw new Error(profileError.message);
  if (preferencesError) throw new Error(preferencesError.message);
  return { ...mapProfile(profile), notifications: preferences.notifications_enabled };
}

async function mapUser(client, user) {
  if (!user) return null;

  const profile = await getAccountProfile(client, user.id);

  const { data: roleRows, error: rolesError } = await client
    .from("tickr_user_roles")
    .select("role")
    .eq("user_id", user.id);
  if (rolesError) throw new Error(rolesError.message);

  const roles = (roleRows || []).map(({ role }) => role);
  const role =
    ["admin", "moderator", "organizer", "service_provider", "member"].find((item) =>
      roles.includes(item),
    ) || "member";
  return {
    id: user.id,
    name: profile.fullName,
    email: user.email || "",
    avatar: profile.avatarUrl,
    businessProfile: profile.businessProfile,
    role,
    roles,
    profile,
  };
}

const getSession = createServerFn({ method: "GET" }).handler(async () => {
  const client = createSupabaseServerClient();
  const { data, error } = await client.auth.getUser();
  if (error?.name === "AuthSessionMissingError") return { user: null };
  if (error) throw new Error(error.message);
  return { user: await mapUser(client, data.user) };
});

const signIn = createServerFn({ method: "POST" })
  .validator(credentialsSchema)
  .handler(async ({ data }) => {
    const client = createSupabaseServerClient();
    const { data: result, error } = await client.auth.signInWithPassword(data);
    if (error) throw new Error(error.message);
    return { user: await mapUser(client, result.user) };
  });

const signUp = createServerFn({ method: "POST" })
  .validator(registrationSchema)
  .handler(async ({ data }) => {
    const client = createSupabaseServerClient();
    const { data: result, error } = await client.auth.signUp({
      email: data.email,
      password: data.password,
      options: {
        data: { name: data.name, business_profile: data.businessProfile },
        emailRedirectTo: getAuthRedirectUrl("signup"),
      },
    });
    if (error) throw new Error(error.message);
    return {
      needsEmailConfirmation: !result.session,
    };
  });

const signOut = createServerFn({ method: "POST" }).handler(async () => {
  const { error } = await createSupabaseServerClient().auth.signOut();
  if (error) throw new Error(error.message);
  return { ok: true };
});

const recoverPassword = createServerFn({ method: "POST" })
  .validator(recoverySchema)
  .handler(async ({ data }) => {
    const { error } = await createSupabaseServerClient().auth.resetPasswordForEmail(data.email, {
      redirectTo: getAuthRedirectUrl("recovery"),
    });
    if (error) throw new Error(error.message);
    return { message: "Se a conta existir, receberás instruções de recuperação." };
  });

const updatePassword = createServerFn({ method: "POST" })
  .validator(passwordSchema)
  .handler(async ({ data }) => {
    const { error } = await createSupabaseServerClient().auth.updateUser({
      password: data.password,
    });
    if (error) throw new Error(error.message);
    return { ok: true };
  });

const exchangeCode = createServerFn({ method: "POST" })
  .validator(codeSchema)
  .handler(async ({ data }) => {
    const client = createSupabaseServerClient();
    const { data: result, error } = await client.auth.exchangeCodeForSession(data.code);
    if (error) throw new Error(error.message);
    return { user: await mapUser(client, result.user) };
  });

const getProfile = createServerFn({ method: "GET" }).handler(async () => {
  const client = createSupabaseServerClient();
  const { data, error } = await client.auth.getUser();
  if (error) throw new Error(error.message);
  if (!data.user) throw new Error("Inicia sessão para consultar o perfil.");

  return getAccountProfile(client, data.user.id);
});

const updateProfile = createServerFn({ method: "POST" })
  .validator(profileSchema)
  .handler(async ({ data }) => {
    const client = createSupabaseServerClient();
    const { data: userData, error: userError } = await client.auth.getUser();
    if (userError) throw new Error(userError.message);
    if (!userData.user) throw new Error("Inicia sessão para actualizar o perfil.");

    const columns = {
      username: "username",
      fullName: "full_name",
      avatarUrl: "avatar_url",
      bio: "bio",
      location: "location",
      instagram: "instagram",
      linkedin: "linkedin",
      website: "website",
      whatsapp: "whatsapp",
      contactEmail: "contact_email",
      publicProfile: "public_profile",
    };
    const updates = Object.fromEntries(
      Object.entries(data).map(([field, value]) => [columns[field], value]),
    );

    const { error } = await client
      .from("tickr_profiles")
      .update(updates)
      .eq("id", userData.user.id)
      .select(profileColumns)
      .single();
    if (error) throw new Error(error.message);
    return getAccountProfile(client, userData.user.id);
  });

const uploadProfilePhoto = createServerFn({ method: "POST" })
  .validator(profilePhotoSchema)
  .handler(async ({ data }) => {
    const client = createSupabaseServerClient();
    const { data: userData, error: userError } = await client.auth.getUser();
    if (userError) throw new Error(userError.message);
    if (!userData.user) throw new Error("Inicia sessão para actualizar a foto do perfil.");

    return uploadProfilePhotoForUser(client, userData.user.id, data.imageData);
  });

const updateAccountPreferences = createServerFn({ method: "POST" })
  .validator(accountPreferencesSchema)
  .handler(async ({ data }) => {
    const client = createSupabaseServerClient();
    const { data: userData, error: userError } = await client.auth.getUser();
    if (userError) throw new Error(userError.message);
    if (!userData.user) throw new Error("Inicia sessão para actualizar as preferências.");

    const { error } = await client
      .from("tickr_account_preferences")
      .update({ notifications_enabled: data.notificationsEnabled })
      .eq("user_id", userData.user.id);
    if (error) throw new Error(error.message);
    return { notificationsEnabled: data.notificationsEnabled };
  });

const importLegacyProfile = createServerFn({ method: "POST" })
  .validator(z.object({ profile: legacyProfileSchema }))
  .handler(async ({ data }) => {
    const client = createSupabaseServerClient();
    const { data: userData, error: userError } = await client.auth.getUser();
    if (userError) throw new Error(userError.message);
    if (!userData.user) throw new Error("Inicia sessão para migrar o perfil.");

    const { data: existingImport, error: importCheckError } = await client
      .from("tickr_profile_legacy_imports")
      .select("user_id")
      .eq("user_id", userData.user.id)
      .maybeSingle();
    if (importCheckError) throw new Error(importCheckError.message);
    if (existingImport) return getAccountProfile(client, userData.user.id);

    const legacy = { ...data.profile };
    let avatarUrl = null;
    if (legacy.photo?.startsWith("data:image/")) {
      avatarUrl = await uploadProfilePhotoForUser(client, userData.user.id, legacy.photo);
      legacy.photo = avatarUrl;
    } else if (legacy.photo && /^https?:\/\//i.test(legacy.photo)) {
      avatarUrl = legacy.photo;
    }

    const { error } = await client.rpc("tickr_import_legacy_profile", {
      p_profile: legacy,
      p_avatar_url: avatarUrl,
    });
    if (error) throw new Error(error.message);
    return getAccountProfile(client, userData.user.id);
  });

const setRole = createServerFn({ method: "POST" })
  .validator(setRoleSchema)
  .handler(async ({ data }) => {
    const { error } = await createSupabaseServerClient().rpc("tickr_set_role", {
      p_user_id: data.userId,
      p_role: data.role,
      p_enabled: data.enabled,
    });
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const authApi = {
  session: () => getSession(),
  signIn: (credentials) => signIn({ data: credentials }),
  signUp: (account) => signUp({ data: account }),
  signOut: () => signOut(),
  recoverPassword: (email) => recoverPassword({ data: { email } }),
  updatePassword: (password) => updatePassword({ data: { password } }),
  exchangeCode: (code) => exchangeCode({ data: { code } }),
  getProfile: () => getProfile(),
  updateProfile: (profile) => updateProfile({ data: profile }),
  uploadProfilePhoto: (imageData) => uploadProfilePhoto({ data: { imageData } }),
  updateAccountPreferences: (preferences) => updateAccountPreferences({ data: preferences }),
  importLegacyProfile: (profile) => importLegacyProfile({ data: { profile } }),
  setRole: (userId, role, enabled) => setRole({ data: { userId, role, enabled } }),
};
