import { getPainPoints, submitPainPointResponse } from "@/lib/store";

export default function handler(req, res) {
    if (req.method === "GET") {
        return res.status(200).json({ ok: true, painPoints: getPainPoints() });
    }
    if (req.method === "POST") {
        try {
            const body = req.body || {};
            const entry = submitPainPointResponse({
                userId: body.userId,
                painPoints: body.painPoints,
            });
            return res.status(200).json({ ok: true, response: entry });
        } catch (err) {
            return res.status(400).json({ ok: false, error: err.message });
        }
    }
    res.setHeader("Allow", "GET, POST");
    return res.status(405).end();
}
