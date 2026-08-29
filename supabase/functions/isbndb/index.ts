const ISBNDB_BASE_URL = "https://api2.isbndb.com";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  const apiKey = Deno.env.get("ISBNDB_API_KEY");
  if (!apiKey) {
    return json({ error: "ISBNDB_API_KEY não configurada" }, 500);
  }

  let payload: {
    action?: string;
    term?: string;
    pageSize?: number;
    page?: number;
  };
  try {
    payload = await req.json();
  } catch {
    return json({ error: "Corpo da requisição inválido" }, 400);
  }

  const term = String(payload.term ?? "").trim();
  if (!term) {
    return json({ error: "term é obrigatório" }, 400);
  }

  const pageSize = Math.min(Math.max(Number(payload.pageSize) || 20, 1), 50);
  const page = Math.max(Number(payload.page) || 1, 1);

  let url: URL;
  switch (payload.action) {
    case "books":
      url = new URL(`${ISBNDB_BASE_URL}/books/${encodeURIComponent(term)}`);
      url.searchParams.set("shouldMatchAll", "false");
      url.searchParams.set("language", "por");
      url.searchParams.set("pageSize", String(pageSize));
      url.searchParams.set("page", String(page));
      break;
    case "subject":
      url = new URL(`${ISBNDB_BASE_URL}/subject/${encodeURIComponent(term)}`);
      url.searchParams.set("language", "pt-br");
      url.searchParams.set("pageSize", String(pageSize));
      url.searchParams.set("page", String(page));
      break;
    case "book":
      url = new URL(`${ISBNDB_BASE_URL}/book/${encodeURIComponent(term)}`);
      break;
    default:
      return json({ error: "action inválida" }, 400);
  }

  const response = await fetch(url, { headers: { Authorization: apiKey } });

  if (payload.action === "book" && response.status === 404) {
    return json({ book: null });
  }

  if (!response.ok) {
    return json({ error: `ISBNDB respondeu ${response.status}` }, 502);
  }

  return json(await response.json());
});
