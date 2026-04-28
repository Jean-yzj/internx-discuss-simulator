import { getTopic } from "@/lib/store";

export default function handler(req, res) {
    if (req.method !== "GET") {
        res.setHeader("Allow", "GET");
        return res.status(405).end();
    }
    const id = Array.isArray(req.query.id) ? req.query.id[0] : req.query.id;
    const topic = getTopic(id);
    if (!topic) return res.status(404).json({ ok: false, error: "not found" });
    return res.status(200).json({ ok: true, topic });
}
