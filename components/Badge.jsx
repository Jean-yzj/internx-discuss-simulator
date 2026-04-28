import { BADGE_DEFINITIONS, BRANDS } from "@/lib/store";
import styles from "./Badge.module.css";

function defOf(id) {
    return BADGE_DEFINITIONS.find((b) => b.id === id);
}

function brandOf(brandId) {
    return BRANDS.find((b) => b.id === brandId);
}

/**
 * Render a single badge.
 * Special-cases `brand-expert` — we render the brand name + role inline.
 */
export function Badge({ id, brand, size = "default" }) {
    const def = defOf(id);
    if (!def) return null;
    const sizeClass = size === "small" ? styles.badgeSmall : size === "large" ? styles.badgeLarge : "";

    if (id === "brand-expert" && brand) {
        const b = brandOf(brand.brandId);
        const color = b?.color || "#1f2937";
        const accent = b?.accent || "#3b82f6";
        const emoji = b?.emoji || "🌟";
        const name = b?.name || brand.brandId;
        return (
            <span
                className={`${styles.badge} ${styles.brandBadge} ${sizeClass}`}
                style={{ "--brand-color": color, "--brand-accent": accent }}
                title={`${name}${brand.role ? `・${brand.role}` : ""}`}
            >
                <span aria-hidden="true">{emoji}</span>
                {name}
                {brand.role && <span className={styles.brandRole}>· {brand.role}</span>}
            </span>
        );
    }

    return (
        <span
            className={`${styles.badge} ${sizeClass}`}
            style={{ "--color": def.color || "#1f2937" }}
            title={def.description}
        >
            <span aria-hidden="true">{def.emoji}</span>
            {def.label}
        </span>
    );
}

/**
 * Render a list of badges (small chips). Always puts the most prestigious
 * (brand-expert > admin > industry-expert > verified-creator/kol > moderator > top-contributor)
 * first. Pass `variant="icon"` to render the InternX-style icon-only
 * badges with hover tooltips (matches main site ProfileBadge.tsx).
 */
const ORDER = [
    "brand-expert",
    "admin",
    "kol",
    "verified-creator",
    "industry-expert",
    "business",
    "school-org",
    "moderator",
    "top-contributor",
    "early-access",
];

export function BadgeRow({ badges, brand, size = "default", limit, variant = "chip" }) {
    if (!Array.isArray(badges) || badges.length === 0) return null;
    const sorted = badges
        .filter((b) => BADGE_DEFINITIONS.some((d) => d.id === b))
        .sort((a, b) => {
            const ai = ORDER.indexOf(a);
            const bi = ORDER.indexOf(b);
            return (ai < 0 ? 99 : ai) - (bi < 0 ? 99 : bi);
        });
    const shown = typeof limit === "number" ? sorted.slice(0, limit) : sorted;

    if (variant === "icon") {
        return (
            <span className={styles.iconRow}>
                {shown.map((id) => (
                    <IconBadge key={id} id={id} brand={brand} />
                ))}
            </span>
        );
    }

    return (
        <span className={styles.row}>
            {shown.map((id) => (
                <Badge key={id} id={id} brand={brand} size={size} />
            ))}
        </span>
    );
}

/** Icon-only badge — matches main site ProfileBadge.tsx style. */
export function IconBadge({ id, brand }) {
    const def = defOf(id);
    if (!def) return null;
    let color = def.color || "#1f2937";
    let label = def.label;
    let title = def.description;
    if (id === "brand-expert" && brand) {
        const b = brandOf(brand.brandId);
        if (b) {
            color = b.color;
            label = `${b.name}${brand.role ? `・${brand.role}` : ""}`;
            title = `來自合作品牌：${b.name}${brand.role ? `・${brand.role}` : ""}`;
        }
    }
    return (
        <span className={styles.iconBadge}>
            <i className={`ri-${def.icon}`} style={{ color }} aria-label={label} />
            <span className={styles.tooltip}>{title}</span>
        </span>
    );
}

/**
 * The brand "callout" we put inside a brand-expert reply bubble — bigger and
 * more visible than the inline badge so brand presence reads at a glance.
 */
export function BrandCallout({ brand }) {
    if (!brand) return null;
    const b = brandOf(brand.brandId);
    if (!b) return null;
    return (
        <div
            className={styles.brandCallout}
            style={{ "--brand-color": b.color, "--brand-accent": b.accent }}
        >
            <span className={styles.brandCalloutEmoji}>{b.emoji}</span>
            <div className={styles.brandCalloutMain}>
                <div className={styles.brandCalloutLabel}>來自合作品牌</div>
                <div className={styles.brandCalloutBrand}>{b.name}{brand.role ? ` · ${brand.role}` : ""}</div>
            </div>
        </div>
    );
}

export default Badge;
