import { reportReply } from "@/lib/store";

export default function handler(req, res) {
    if (req.method !== "POST") {
        res.setHeader("Allow", "POST");
        return res.status(405).end();
    }
    const id = Array.isArray(req.query.id) ? req.query.id[0] : req.query.id;
    try {
        const body = req.body || {};
        const result = reportReply({ replyId: id, userId: body.userId, reason: body.reason });
        return res.status(200).json({ ok: true, ...result });
    } catch (err) {
        return res.status(400).json({ ok: false, error: err.message });
    }
}
