import { toggleReaction } from "@/lib/store";

export default function handler(req, res) {
    if (req.method !== "POST") {
        res.setHeader("Allow", "POST");
        return res.status(405).end();
    }
    const id = Array.isArray(req.query.id) ? req.query.id[0] : req.query.id;
    try {
        const body = req.body || {};
        const result = toggleReaction({
            replyId: id,
            userId: body.userId,
            emoji: body.emoji,
        });
        return res.status(200).json({ ok: true, ...result });
    } catch (err) {
        const code = err.message === "reply not found" ? 404 : 400;
        return res.status(code).json({ ok: false, error: err.message });
    }
}
