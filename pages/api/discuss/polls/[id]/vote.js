import { votePoll } from "@/lib/store";

export default function handler(req, res) {
    if (req.method !== "POST") {
        res.setHeader("Allow", "POST");
        return res.status(405).end();
    }
    const id = Array.isArray(req.query.id) ? req.query.id[0] : req.query.id;
    try {
        const body = req.body || {};
        const result = votePoll({
            pollId: id,
            questionId: body.questionId,
            optionId: body.optionId,
            userId: body.userId,
        });
        return res.status(200).json({ ok: true, ...result });
    } catch (err) {
        const code = err.message === "poll not found" ? 404 : 400;
        return res.status(code).json({ ok: false, error: err.message });
    }
}
