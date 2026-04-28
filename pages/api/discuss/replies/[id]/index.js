import { deleteReply } from "@/lib/store";

export default function handler(req, res) {
    if (req.method !== "DELETE") {
        res.setHeader("Allow", "DELETE");
        return res.status(405).end();
    }
    const id = Array.isArray(req.query.id) ? req.query.id[0] : req.query.id;
    try {
        const body = req.body || {};
        const result = deleteReply({
            replyId: id,
            userId: body.userId,
            badges: body.badges,
            moderates: body.moderates,
        });
        return res.status(200).json({ ok: true, ...result });
    } catch (err) {
        const code = err.message === "forbidden" ? 403 : err.message === "reply not found" ? 404 : 400;
        return res.status(code).json({ ok: false, error: err.message });
    }
}
