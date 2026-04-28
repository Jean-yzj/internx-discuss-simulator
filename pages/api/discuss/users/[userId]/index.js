import { getUser, listUserActivity } from "@/lib/store";

export default function handler(req, res) {
    if (req.method !== "GET") {
        res.setHeader("Allow", "GET");
        return res.status(405).end();
    }
    const userId = Array.isArray(req.query.userId) ? req.query.userId[0] : req.query.userId;
    const user = getUser(userId);
    if (!user) return res.status(404).json({ ok: false, error: "not found" });
    const activity = listUserActivity(userId, { limit: 20 });
    return res.status(200).json({ ok: true, user, ...activity });
}
