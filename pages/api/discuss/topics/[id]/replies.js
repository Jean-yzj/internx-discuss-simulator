import { listReplies, postReply } from "@/lib/store";

export default function handler(req, res) {
    const id = Array.isArray(req.query.id) ? req.query.id[0] : req.query.id;

    if (req.method === "GET") {
        return res.status(200).json({ ok: true, replies: listReplies(id) });
    }
    if (req.method === "POST") {
        try {
            const body = req.body || {};
            const reply = postReply({
                topicId: id,
                authorName: body.authorName,
                content: body.content,
            });
            return res.status(200).json({ ok: true, reply });
        } catch (err) {
            const code = err.message === "topic not found" ? 404 : 400;
            return res.status(code).json({ ok: false, error: err.message || "bad request" });
        }
    }
    res.setHeader("Allow", "GET, POST");
    return res.status(405).end();
}
