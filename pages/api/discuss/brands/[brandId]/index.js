import { getBrand, listUsers } from "@/lib/store";

export default function handler(req, res) {
    if (req.method !== "GET") {
        res.setHeader("Allow", "GET");
        return res.status(405).end();
    }
    const brandId = Array.isArray(req.query.brandId) ? req.query.brandId[0] : req.query.brandId;
    const brand = getBrand(brandId);
    if (!brand) return res.status(404).json({ ok: false, error: "not found" });
    const allUsers = listUsers();
    const experts = allUsers.filter((u) => u.brand?.brandId === brandId);
    return res.status(200).json({ ok: true, brand, experts });
}
