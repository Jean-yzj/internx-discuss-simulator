import { editOwnReply } from "@/lib/store";

export default function handler(req, res) {
    if (req.method !== "POST") {
        res.setHeader("Allow", "POST");
        return res.status(405).end();
    }
    const id = Array.isArray(req.query.id) ? req.query.id[0] : req.query.id;
    try {
        const body = req.body || {};
        const reply = editOwnReply({
            replyId: id,
            userId: body.userId,
            content: body.content,
        });
        return res.status(200).json({ ok: true, reply });
    } catch (err) {
        const code = err.message === "forbidden" ? 403 : err.message === "reply not found" ? 404 : 400;
        return res.status(code).json({ ok: false, error: err.message });
    }
}
