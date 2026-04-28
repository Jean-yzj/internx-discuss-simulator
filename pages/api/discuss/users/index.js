import { listUsers } from "@/lib/store";

export default function handler(req, res) {
    if (req.method !== "GET") {
        res.setHeader("Allow", "GET");
        return res.status(405).end();
    }
    const industryModeratedBy = typeof req.query.moderatesIndustry === "string" ? req.query.moderatesIndustry : undefined;
    const badge = typeof req.query.badge === "string" ? req.query.badge : undefined;
    return res.status(200).json({ ok: true, users: listUsers({ industryModeratedBy, badge }) });
}
