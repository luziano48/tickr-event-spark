import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { createSupabaseServerClient } from "@/lib/supabase.server";

const ticketSchema = z.object({
  name: z.string().trim().min(1).max(80),
  price: z.coerce.number().finite().min(0).max(1000000000),
  quantity: z.coerce.number().int().min(1).max(100000),
});

const createEventSchema = z.object({
  title: z.string().trim().min(2).max(120),
  category: z.string().trim().min(1).max(60),
  description: z.string().trim().max(600),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  time: z.string().regex(/^\d{2}:\d{2}$/),
  city: z.string().trim().min(1).max(100),
  venue: z.string().trim().min(1).max(200),
  address: z.string().trim().max(500),
  age: z.enum(["Livre", "+12", "+16", "+18"]),
  rules: z.string().trim().max(400),
  contactName: z.string().trim().min(1).max(100),
  whatsapp: z.string().trim().min(1).max(40),
  tickets: z.array(ticketSchema).min(1).max(20),
  imageData: z.union([
    z.literal(""),
    z
      .string()
      .max(7000000)
      .regex(/^data:image\/(?:jpeg|png|webp);base64,[A-Za-z0-9+/]+={0,2}$/),
  ]),
});

const createEvent = createServerFn({ method: "POST" })
  .validator(createEventSchema)
  .handler(async ({ data }) => {
    const client = createSupabaseServerClient();
    const { data: authData, error: authError } = await client.auth.getUser();
    if (authError?.name === "AuthSessionMissingError") {
      throw new Error("Inicia sessão para criar um evento.");
    }
    if (authError) throw new Error(authError.message);
    if (!authData.user) throw new Error("Inicia sessão para criar um evento.");

    const [year, month, day] = data.date.split("-").map(Number);
    const [hour, minute] = data.time.split(":").map(Number);
    const localDate = new Date(Date.UTC(year, month - 1, day, hour, minute));
    if (
      Number.isNaN(localDate.getTime()) ||
      localDate.getUTCFullYear() !== year ||
      localDate.getUTCMonth() !== month - 1 ||
      localDate.getUTCDate() !== day ||
      localDate.getUTCHours() !== hour ||
      localDate.getUTCMinutes() !== minute
    ) {
      throw new Error("A data ou hora do evento é inválida.");
    }
    const startsAt = new Date(localDate.getTime() - 60 * 60 * 1000);

    const slugBase =
      data.title
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "")
        .slice(0, 60) || "evento";
    const slug = `${slugBase}-${crypto.randomUUID().slice(0, 8)}`;
    let imagePath;
    let imageUploaded = false;
    let imageUrl = null;

    try {
      if (data.imageData) {
        const [, contentType] = data.imageData.match(/^data:(image\/(?:jpeg|png|webp));base64,/);
        const extension = { "image/jpeg": "jpg", "image/png": "png", "image/webp": "webp" }[
          contentType
        ];
        imagePath = `${authData.user.id}/${crypto.randomUUID()}.${extension}`;
        const imageBlob = await (await fetch(data.imageData)).blob();
        const { error: uploadError } = await client.storage
          .from("tickr-event-covers")
          .upload(imagePath, imageBlob, { contentType, upsert: false, cacheControl: "3600" });
        if (uploadError)
          throw new Error(`Não foi possível guardar a imagem: ${uploadError.message}`);
        imageUploaded = true;
        imageUrl = client.storage.from("tickr-event-covers").getPublicUrl(imagePath).data.publicUrl;
      }

      const { data: event, error } = await client.rpc("tickr_create_event", {
        p_event: {
          title: data.title,
          slug,
          category: data.category,
          description: data.description,
          starts_at: startsAt.toISOString(),
          city: data.city,
          venue: data.venue,
          address: data.address,
          image_url: imageUrl,
          age_restriction: data.age,
          rules: data.rules,
          contact_name: data.contactName,
          whatsapp: data.whatsapp,
        },
        p_tickets: data.tickets,
      });
      if (error) throw new Error(error.message);
      return event;
    } catch (error) {
      if (imageUploaded) {
        const { error: cleanupError } = await client.storage
          .from("tickr-event-covers")
          .remove([imagePath]);
        if (cleanupError) {
          console.error("Não foi possível remover a imagem de um evento não criado.", cleanupError);
          throw new Error(`${error.message} A imagem enviada não foi removida do Storage.`);
        }
      }
      throw error;
    }
  });

export const eventsApi = {
  create: (event) => createEvent({ data: event }),
};
