export default async function handler(req, res) {
  try {
    if (req.method !== "POST") {
      res.setHeader("Allow", "POST");
      return res.status(405).json({ error: "Method Not Allowed" });
    }

    const MAGENTO_HOST = "http://13.203.184.96"; // Your Magento server

    const target = MAGENTO_HOST + "/rest/V1/guest-carts";

    const upstream = await fetch(target, {
      method: "POST",
      headers: {
        "content-type": "application/json",
      },
    });

    const text = await upstream.text();
    res.status(upstream.status).setHeader("Content-Type", upstream.headers.get("content-type") || "text/plain");
    return res.send(text);
  } catch (err) {
    console.error("create-guest proxy error:", err);
    return res.status(502).json({ error: "Proxy failed", detail: String(err) });
  }
}