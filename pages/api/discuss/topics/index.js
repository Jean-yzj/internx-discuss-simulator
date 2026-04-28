import { listTopics, createTopic } from "@/lib/store";

export default function handler(req, res) {
    if (req.method === "GET") {
        const category = typeof req.query.category === "string" ? req.query.category : "all";
        const industry = typeof req.query.industry === "string" ? req.query.industry : undefined;
        const industriesParam =
            typeof req.query.industries === "string" ? req.query.industries : "";
        const industries = industriesParam
            ? industriesParam.split(",").map((s) => s.trim()).filter(Boolean)
            : undefined;
        return res.status(200).json({
            ok: true,
            topics: listTopics({ industry, industries, category }),
        });
    }
    if (req.method === "POST") {
        try {
            const body = req.body || {};
            const topic = createTopic({
                title: body.title,
                description: body.description,
                industry: body.industry,
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
