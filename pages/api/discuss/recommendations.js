import { recommendTopics } from "@/lib/store";

export default function handler(req, res) {
    if (req.method !== "POST") {
        res.setHeader("Allow", "POST");
        return res.status(405).end();
    }
    const body = req.body || {};
    const items = recommendTopics({
        industries: Array.isArray(body.industries) ? body.industries : [],
        painPointIds: Array.isArray(body.painPointIds) ? body.painPointIds : [],
        pollVotes: Array.isArray(body.pollVotes) ? body.pollVotes : [],
        excludeIds: Array.isArray(body.excludeIds) ? body.excludeIds : [],
        limit: Math.max(1, Math.min(Number(body.limit) || 6, 20)),
    });
    return res.status(200).json({ ok: true, topics: items });
}
