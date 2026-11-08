import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { createSupabaseServerClient } from "@/lib/supabase.server";

const requestSchema = z.object({
  eventIdentifier: z.string().trim().min(1).max(160),
  name: z.string().trim().min(3).max(100),
  email: z.string().trim().email().max(320),
  phone: z.string().trim().min(9).max(40),
  ticketName: z.string().trim().min(1).max(80),
  quantity: z.number().int().min(1).max(10),
});

const statusSchema = z.object({
  requestId: z.string().uuid(),
  status: z.enum(["contacted", "closed"]),
});

const submitRequest = createServerFn({ method: "POST" })
  .validator(requestSchema)
  .handler(async ({ data }) => {
    const { data: requestId, error } = await createSupabaseServerClient().rpc(
      "tickr_submit_ticket_request",
      {
        p_event_identifier: data.eventIdentifier,
        p_buyer_name: data.name,
        p_buyer_email: data.email,
        p_buyer_phone: data.phone,
        p_ticket_name: data.ticketName,
        p_quantity: data.quantity,
      },
    );
    if (error) throw new Error(error.message);
    return { id: requestId };
  });

const listRequests = createServerFn({ method: "GET" }).handler(async () => {
  const client = createSupabaseServerClient();
  const { data: authData, error: authError } = await client.auth.getUser();
  if (authError?.name === "AuthSessionMissingError") {
    return { authenticated: false, requests: [] };
  }
  if (authError) throw new Error(authError.message);
  if (!authData.user) return { authenticated: false, requests: [] };

  const { data, error } = await client.rpc("tickr_list_ticket_requests");
  if (error) throw new Error(error.message);
  return { authenticated: true, requests: data || [] };
});

const updateRequest = createServerFn({ method: "POST" })
  .validator(statusSchema)
  .handler(async ({ data }) => {
    const client = createSupabaseServerClient();
    const { data: authData, error: authError } = await client.auth.getUser();
    if (authError) throw new Error(authError.message);
    if (!authData.user) throw new Error("Inicia sessão para actualizar os pedidos.");

    const { error } = await client.rpc("tickr_update_ticket_request_status", {
      p_request_id: data.requestId,
      p_status: data.status,
    });
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const ticketRequestsApi = {
  submit: (request) => submitRequest({ data: request }),
  list: () => listRequests(),
  update: (requestId, status) => updateRequest({ data: { requestId, status } }),
};
