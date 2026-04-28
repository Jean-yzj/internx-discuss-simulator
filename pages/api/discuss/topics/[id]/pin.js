import { setPinTopic, setLockTopic } from "@/lib/store";

export default function handler(req, res) {
    if (req.method !== "POST") {
        res.setHeader("Allow", "POST");
        return res.status(405).end();
    }
    const id = Array.isArray(req.query.id) ? req.query.id[0] : req.query.id;
    try {
        const body = req.body || {};
        const action = body.action || "pin"; // 'pin' | 'unpin' | 'lock' | 'unlock'
        let result;
        if (action === "pin" || action === "unpin") {
            result = setPinTopic({
                topicId: id,
                badges: body.badges,
                moderates: body.moderates,
                pinned: action === "pin",
            });
        } else if (action === "lock" || action === "unlock") {
            result = setLockTopic({
                topicId: id,
                badges: body.badges,
                moderates: body.moderates,
                locked: action === "lock",
            });
        } else {
            return res.status(400).json({ ok: false, error: "unknown action" });
        }
        return res.status(200).json({ ok: true, ...result });
    } catch (err) {
        const code = err.message === "forbidden" ? 403 : 400;
        return res.status(code).json({ ok: false, error: err.message });
    }
}
