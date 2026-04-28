import { searchAll } from "@/lib/store";

export default function handler(req, res) {
    if (req.method !== "GET") {
        res.setHeader("Allow", "GET");
        return res.status(405).end();
    }
    const q = typeof req.query.q === "string" ? req.query.q : "";
    return res.status(200).json({ ok: true, query: q, ...searchAll(q, { limit: 6 }) });
}
