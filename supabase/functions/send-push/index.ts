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

const admin = createClient(supabaseUrl, serviceRoleKey);

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

type PushPayload = { title: string; body: string; url: string };

async function sendToUsers(userIds: string[], payload: PushPayload) {
  if (userIds.length === 0) return;

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
          url: "/clubes",
        },
      };

      await sendToUsers([userId], payloads[type]);
    } else if (type === "club_message") {
      const [{ data: callerMember }, { data: lastMessage }] =
        await Promise.all([
          admin
            .from("club_members")
            .select("user_id")
            .eq("club_id", clubId)
            .eq("user_id", user.id)
            .maybeSingle(),
          admin
            .from("club_messages")
            .select("content, is_spoiler, created_at")
            .eq("club_id", clubId)
            .eq("user_id", user.id)
            .order("created_at", { ascending: false })
            .limit(1)
            .maybeSingle(),
        ]);

      const isRecent =
        lastMessage &&
        Date.now() - new Date(lastMessage.created_at).getTime() <
          2 * 60 * 1000;

      if (!callerMember || !isRecent) {
        return new Response(JSON.stringify({ skipped: true }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const [{ data: profile }, { data: members }] = await Promise.all([
        admin.from("profiles").select("name").eq("id", user.id).single(),
        admin
          .from("club_members")
          .select("user_id")
          .eq("club_id", clubId),
      ]);

      const chatUrl = `/clubes/${club.id}/chat`;
      const others = (members ?? [])
        .map((member) => member.user_id)
        .filter((memberId) => memberId !== user.id);

      const { data: unread } = await admin
        .from("notifications")
        .select("user_id")
        .in("user_id", others)
        .eq("url", chatUrl)
        .eq("read", false);

      const alreadyNotified = new Set(
        (unread ?? []).map((notification) => notification.user_id),
      );
      const recipients = others.filter(
        (memberId) => !alreadyNotified.has(memberId),
      );

      const senderName = profile?.name ?? "Alguém";
      const body = lastMessage.is_spoiler
        ? `${senderName} enviou uma mensagem com spoiler.`
        : `${senderName}: ${lastMessage.content.slice(0, 80)}${
            lastMessage.content.length > 80 ? "…" : ""
          }`;

      await sendToUsers(recipients, {
        title: `Nova mensagem no clube ${club.name}`,
        body,
        url: chatUrl,
      });
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
