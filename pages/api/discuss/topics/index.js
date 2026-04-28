import { listTopics, createTopic } from "@/lib/store";

export default function handler(req, res) {
    if (req.method === "GET") {
        const category = typeof req.query.category === "string" ? req.query.category : "all";
        return res.status(200).json({ ok: true, topics: listTopics({ category }) });
    }
    if (req.method === "POST") {
        try {
            const body = req.body || {};
            const topic = createTopic({
                title: body.title,
                description: body.description,
                category: body.category,
                authorName: body.authorName,
            });
            return res.status(200).json({ ok: true, topic });
        } catch (err) {
            return res.status(400).json({ ok: false, error: err.message || "bad request" });
        }
    }
    res.setHeader("Allow", "GET, POST");
    return res.status(405).end();
}
