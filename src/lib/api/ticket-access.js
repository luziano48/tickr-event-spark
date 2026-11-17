import { createServerFn } from "@tanstack/react-start";
import { getRequest } from "@tanstack/react-start/server";
import { z } from "zod";

const requestSchema = z.object({
  accessCode: z
    .string()
    .trim()
    .regex(/^[A-Z0-9]{10}$/i),
  contact: z.string().trim().min(3).max(320),
});

const verifySchema = z.object({
  challengeId: z.string().uuid(),
  code: z.string().regex(/^\d{6}$/),
});

async function getCrypto() {
  return import("node:crypto");
}

function otpHash(code, secret, createHmac) {
  if (!secret || secret.length < 32) {
    throw new Error("O acesso a ingressos não está configurado neste momento.");
  }
  return createHmac("sha256", secret).update(code).digest("hex");
}

const requestAccess = createServerFn({ method: "POST" })
  .validator(requestSchema)
  .handler(async ({ data }) => {
    const apiKey = process.env.RESEND_API_KEY;
    const from = process.env.TICKR_TICKET_EMAIL_FROM;
    const secret = process.env.TICKR_TICKET_ACCESS_SECRET;
    if (!apiKey || !from || !secret || secret.length < 32) {
      throw new Error("O acesso a ingressos não está configurado neste momento.");
    }

    const { randomInt, randomUUID, createHmac } = await getCrypto();
    const code = String(randomInt(100000, 1000000));
    const challengeId = randomUUID();
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: result, error } = await supabaseAdmin.rpc("tickr_request_ticket_access", {
      p_access_code: data.accessCode.toUpperCase(),
      p_contact: data.contact,
      p_ip_hash: getClientIpHashWith(createHmac, secret),
      p_challenge_id: challengeId,
      p_otp_hash: otpHash(code, secret, createHmac),
    });
    if (error) {
      console.error("[TicketAccess] Ticket access request RPC failed", error.code);
      throw new Error("Não foi possível iniciar a verificação do ingresso.");
    }

    const match = result?.[0];
    if (match?.found) {
      try {
        const emailResponse = await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${apiKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            from,
            to: [match.recipient_email],
            subject: "Código de acesso ao teu ingresso Tickr",
            text: `O teu código de verificação para ${match.event_title} é ${code}. É válido por 5 minutos. Se não pediste este código, ignora esta mensagem.`,
          }),
        });
        if (!emailResponse.ok) {
          console.error("[TicketAccess] Email provider rejected ticket OTP", emailResponse.status);
        }
      } catch {
        console.error("[TicketAccess] Email provider request failed");
      }
    }

    return {
      challengeId,
      message:
        "Se os dados coincidirem, a Tickr tentará enviar um código para o email associado. Aguarda alguns minutos antes de tentar novamente.",
    };
  });

const verifyAccess = createServerFn({ method: "POST" })
  .validator(verifySchema)
  .handler(async ({ data }) => {
    const secret = process.env.TICKR_TICKET_ACCESS_SECRET;
    if (!secret || secret.length < 32) {
      throw new Error("O acesso a ingressos não está configurado neste momento.");
    }

    const { createHmac } = await getCrypto();
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: rows, error } = await supabaseAdmin.rpc("tickr_verify_ticket_access", {
      p_challenge_id: data.challengeId,
      p_otp_hash: otpHash(data.code, secret, createHmac),
      p_ip_hash: getClientIpHashWith(createHmac, secret),
    });
    if (error) throw new Error("Não foi possível validar o código.");
    if (!rows?.length) throw new Error("Não encontrámos um ingresso com esses dados.");

    const [ticket] = rows;
    return {
      accessCode: ticket.ticket_code,
      qrToken: ticket.qr_token_hash,
      status: ticket.ticket_status,
      checkedInAt: ticket.checked_in_at,
      event: {
        title: ticket.event_title,
        startsAt: ticket.event_starts_at,
        city: ticket.event_city,
        venue: ticket.event_venue,
      },
      ticketName: ticket.ticket_name,
    };
  });

function getClientIpHashWith(createHmac, secret) {
  const headers = getRequest().headers;
  const ip =
    headers.get("cf-connecting-ip") ||
    headers.get("x-real-ip") ||
    headers.get("x-forwarded-for")?.split(",").at(-1)?.trim() ||
    "unknown";
  return createHmac("sha256", secret).update(`ip:${ip}`).digest("hex");
}

export const ticketAccessApi = {
  request: (data) => requestAccess({ data }),
  verify: (data) => verifyAccess({ data }),
};
