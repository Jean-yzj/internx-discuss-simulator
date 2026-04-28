import { listPolls } from "@/lib/store";

export default function handler(req, res) {
    if (req.method !== "GET") {
        res.setHeader("Allow", "GET");
        return res.status(405).end();
    }
    const industriesParam = typeof req.query.industries === "string" ? req.query.industries : "";
    const industries = industriesParam
        ? industriesParam.split(",").map((s) => s.trim()).filter(Boolean)
        : undefined;
    const industry = typeof req.query.industry === "string" ? req.query.industry : undefined;
    return res.status(200).json({ ok: true, polls: listPolls({ industry, industries }) });
}
