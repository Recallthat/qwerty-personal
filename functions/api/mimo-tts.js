const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type"
};

export async function onRequestOptions() {
  return new Response(null, { headers: corsHeaders });
}

export async function onRequestPost({ request }) {
  try {
    const { apiKey, baseUrl, payload } = await request.json();
    if (!apiKey || !payload) {
      return json({ error: "Missing apiKey or payload" }, 400);
    }

    const upstreamBase = String(baseUrl || "https://api.xiaomimimo.com/v1").replace(/\/+$/, "");
    const upstream = await fetch(`${upstreamBase}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "api-key": apiKey
      },
      body: JSON.stringify(payload)
    });

    const headers = new Headers(corsHeaders);
    const contentType = upstream.headers.get("content-type") || "application/json";
    headers.set("content-type", contentType);
    return new Response(await upstream.arrayBuffer(), {
      status: upstream.status,
      headers
    });
  } catch (error) {
    return json({ error: error.message || "MiMo proxy failed" }, 500);
  }
}

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      ...corsHeaders,
      "content-type": "application/json; charset=utf-8"
    }
  });
}
