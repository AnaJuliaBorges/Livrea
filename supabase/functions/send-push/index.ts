// Edge Function send-push — envia web push para membros do clube.
//
// Eventos:
//   { type: "join_request", clubId }
//     Chamador pediu para entrar no clube → notifica os admins.
//     Valida que existe um pedido PENDENTE do chamador nesse clube
//     (clube público entra direto, não gera pedido nem notificação).
//   { type: "request_approved", clubId, userId }
//     Chamador (admin) aprovou userId → notifica o aprovado.
//     Valida que o chamador é admin do clube e que userId é membro.
//   { type: "member_promoted", clubId, userId }
//     userId virou admin → notifica. Valida: chamador admin + alvo com
//     role 'admin'.
//   { type: "member_demoted", clubId, userId }
//     userId deixou de ser admin → notifica. Valida: chamador admin +
//     alvo com role 'member'.
//   { type: "member_removed", clubId, userId }
//     userId foi removido do clube → notifica. Valida: chamador admin +
//     alvo NÃO é mais membro.
//   { type: "new_follower", userId }
//     Chamador começou a seguir userId → notifica o seguido.
//     Valida que a linha em follows (chamador → userId) existe.
//
// Segurança: o JWT do chamador identifica quem dispara; os dados vêm do
// banco (service role), nunca do payload. Secrets necessários no projeto:
//   VAPID_PUBLIC_KEY / VAPID_PRIVATE_KEY / VAPID_SUBJECT (mailto:...)
//
// Deploy: supabase functions deploy send-push  (ou colar no Dashboard)

import { createClient } from "npm:@supabase/supabase-js@2";
import webpush from "npm:web-push@3";

const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;

webpush.setVapidDetails(
  Deno.env.get("VAPID_SUBJECT") ?? "mailto:najuborgess@gmail.com",
  Deno.env.get("VAPID_PUBLIC_KEY")!,
  Deno.env.get("VAPID_PRIVATE_KEY")!,
);

// service role: lê inscrições/membros de outros usuários (ignora RLS)
const admin = createClient(supabaseUrl, serviceRoleKey);

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

type PushPayload = { title: string; body: string; url: string };

async function sendToUsers(userIds: string[], payload: PushPayload) {
  if (userIds.length === 0) return;

  // grava o histórico in-app (tela /notificacoes) pra TODOS os destinatários,
  // inclusive quem não tem inscrição de push neste momento
  const { error: insertError } = await admin.from("notifications").insert(
    userIds.map((userId) => ({
      user_id: userId,
      title: payload.title,
      body: payload.body,
      url: payload.url,
    })),
  );

  if (insertError) console.error("Erro gravando notificações:", insertError);

  const { data: subscriptions, error } = await admin
    .from("push_subscriptions")
    .select("id, endpoint, p256dh, auth")
    .in("user_id", userIds);

  if (error) throw error;

  await Promise.all(
    (subscriptions ?? []).map(async (sub) => {
      try {
        await webpush.sendNotification(
          {
            endpoint: sub.endpoint,
            keys: { p256dh: sub.p256dh, auth: sub.auth },
          },
          JSON.stringify(payload),
        );
      } catch (err: unknown) {
        // 404/410 = inscrição morta (usuário revogou/limpou) — remove
        const status = (err as { statusCode?: number }).statusCode;
        if (status === 404 || status === 410) {
          await admin.from("push_subscriptions").delete().eq("id", sub.id);
        } else {
          console.error("Erro enviando push:", err);
        }
      }
    }),
  );
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // identifica o chamador pelo JWT do Authorization header
    const authClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: req.headers.get("Authorization")! } },
    });
    const {
      data: { user },
    } = await authClient.auth.getUser();

    if (!user) {
      return new Response(JSON.stringify({ error: "não autenticado" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { type, clubId, userId } = await req.json();

    // evento de seguidor não envolve clube — tratado antes da busca do clube
    if (type === "new_follower") {
      const { data: follow } = await admin
        .from("follows")
        .select("follower_id")
        .eq("follower_id", user.id)
        .eq("followed_id", userId)
        .maybeSingle();

      if (!follow) {
        return new Response(JSON.stringify({ skipped: true }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const { data: profile } = await admin
        .from("profiles")
        .select("name")
        .eq("id", user.id)
        .single();

      await sendToUsers([userId], {
        title: "Novo seguidor 📚",
        body: `${profile?.name ?? "Alguém"} começou a seguir você.`,
        url: `/perfil/${user.id}`,
      });

      return new Response(JSON.stringify({ ok: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { data: club } = await admin
      .from("clubs")
      .select("id, name")
      .eq("id", clubId)
      .single();

    if (!club) {
      return new Response(JSON.stringify({ error: "clube não encontrado" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const clubUrl = `/clubes/${club.id}`;

    if (type === "join_request") {
      // só notifica se existe pedido pendente do chamador (clube privado)
      const { data: pending } = await admin
        .from("club_join_requests")
        .select("id")
        .eq("club_id", clubId)
        .eq("user_id", user.id)
        .eq("status", "pending")
        .maybeSingle();

      if (!pending) {
        return new Response(JSON.stringify({ skipped: true }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const [{ data: profile }, { data: admins }] = await Promise.all([
        admin.from("profiles").select("name").eq("id", user.id).single(),
        admin
          .from("club_members")
          .select("user_id")
          .eq("club_id", clubId)
          .eq("role", "admin"),
      ]);

      await sendToUsers(
        (admins ?? []).map((m) => m.user_id),
        {
          title: "Novo pedido de participação",
          body: `${profile?.name ?? "Alguém"} pediu para entrar no clube ${club.name}.`,
          url: clubUrl,
        },
      );
    } else if (type === "request_approved") {
      // chamador precisa ser admin do clube e o alvo precisa já ser membro
      const [{ data: callerAdmin }, { data: targetMember }] =
        await Promise.all([
          admin
            .from("club_members")
            .select("user_id")
            .eq("club_id", clubId)
            .eq("user_id", user.id)
            .eq("role", "admin")
            .maybeSingle(),
          admin
            .from("club_members")
            .select("user_id")
            .eq("club_id", clubId)
            .eq("user_id", userId)
            .maybeSingle(),
        ]);

      if (!callerAdmin || !targetMember) {
        return new Response(JSON.stringify({ skipped: true }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      await sendToUsers([userId], {
        title: "Pedido aceito 🎉",
        body: `Você agora faz parte do clube ${club.name}. Boas leituras!`,
        url: clubUrl,
      });
    } else if (
      type === "member_promoted" ||
      type === "member_demoted" ||
      type === "member_removed"
    ) {
      const [{ data: callerAdmin }, { data: targetMember }] =
        await Promise.all([
          admin
            .from("club_members")
            .select("user_id")
            .eq("club_id", clubId)
            .eq("user_id", user.id)
            .eq("role", "admin")
            .maybeSingle(),
          admin
            .from("club_members")
            .select("role")
            .eq("club_id", clubId)
            .eq("user_id", userId)
            .maybeSingle(),
        ]);

      // o estado atual do alvo tem que bater com o evento anunciado
      const stateMatches =
        type === "member_promoted"
          ? targetMember?.role === "admin"
          : type === "member_demoted"
            ? targetMember?.role === "member"
            : targetMember === null;

      if (!callerAdmin || !stateMatches) {
        return new Response(JSON.stringify({ skipped: true }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const payloads: Record<string, PushPayload> = {
        member_promoted: {
          title: "Você agora é administrador ⭐",
          body: `Você virou administrador do clube ${club.name}.`,
          url: clubUrl,
        },
        member_demoted: {
          title: "Cargo alterado",
          body: `Você não é mais administrador do clube ${club.name}.`,
          url: clubUrl,
        },
        member_removed: {
          title: "Removido do clube",
          body: `Você foi removido do clube ${club.name}.`,
          // sem acesso garantido à página do clube — leva pra listagem
          url: "/clubes",
        },
      };

      await sendToUsers([userId], payloads[type]);
    } else {
      return new Response(JSON.stringify({ error: "tipo inválido" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ ok: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("send-push:", error);
    return new Response(JSON.stringify({ error: String(error) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
