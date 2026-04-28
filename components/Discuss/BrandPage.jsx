import { useEffect, useState } from "react";
import Link from "next/link";
import { BadgeRow } from "@/components/Badge";
import styles from "./BrandPage.module.css";

function avatar(s) {
    if (!s) return "•";
    return s.trim().charAt(0).toUpperCase();
}

function relativeTime(date) {
    if (!date) return "";
    const d = new Date(date);
    const m = Math.floor((Date.now() - d.getTime()) / 60000);
    if (m < 60) return `${m} 分鐘前`;
    const h = Math.floor(m / 60);
    if (h < 24) return `${h} 小時前`;
    return `${Math.floor(h / 24)} 天前`;
}

export default function BrandPage({ brandId }) {
    const [data, setData] = useState(undefined);
    const [recentReplies, setRecentReplies] = useState([]);

    useEffect(() => {
        if (!brandId) return;
        let cancelled = false;
        (async () => {
            try {
                const res = await fetch(`/api/discuss/brands/${brandId}`);
                if (res.status === 404) { setData(null); return; }
                const json = await res.json();
                if (!cancelled && json.ok) setData(json);

                // Fetch recent replies for each expert
                if (!cancelled && json.ok) {
                    const allReplies = [];
                    for (const expert of json.experts) {
                        try {
                            const rr = await fetch(`/api/discuss/users/${expert.userId}`);
                            const rj = await rr.json();
                            if (rj.ok) {
                                rj.replies.slice(0, 3).forEach((r) => {
                                    allReplies.push({ ...r, expertName: expert.displayName });
                                });
                            }
                        } catch {}
                    }
                    allReplies.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
                    if (!cancelled) setRecentReplies(allReplies.slice(0, 8));
                }
            } catch (err) {
                console.error(err);
                if (!cancelled) setData(null);
            }
        })();
        return () => { cancelled = true; };
    }, [brandId]);

    if (data === undefined) {
        return <div className={styles.page}><div className={styles.notFound}>載入中⋯⋯</div></div>;
    }

    if (data === null) {
        return (
            <div className={styles.page}>
                <div className={styles.notFound}>
                    <h2>找不到這個品牌</h2>
                    <Link href="/experts" style={{ color: "var(--theme-color)" }}>看認證專家 →</Link>
                </div>
            </div>
        );
    }

    const { brand, experts } = data;

    return (
        <div
            className={styles.page}
            style={{ "--brand-color": brand.color, "--brand-accent": brand.accent }}
        >
            <div className={styles.hero}>
                <div className={styles.heroInner}>
                    <div className={styles.crumbs}>
                        <Link href="/">首頁</Link> · <Link href="/experts">認證專家</Link> · <span>{brand.name}</span>
                    </div>
                    <div className={styles.heroTop}>
                        <div className={styles.brandLogo}>{brand.emoji}</div>
                        <div>
                            <div className={styles.brandKind}>合作專家品牌</div>
                            <h1 className={styles.brandName}>{brand.fullName || brand.name}</h1>
                            <p className={styles.brandTagline}>{brand.tagline}</p>
                        </div>
                    </div>
                    <p className={styles.brandDesc}>{brand.description}</p>
                    <div className={styles.heroActions}>
                        {brand.websiteUrl && (
                            <a
                                href={brand.websiteUrl}
                                target="_blank"
                                rel="noreferrer"
                                className={styles.actionPrimary}
                            >
                                <i className="ri-external-link-line" /> 前往 {brand.name} 網站
                            </a>
                        )}
                        <Link href="/experts" className={styles.actionGhost}>
                            看其他認證專家
                        </Link>
                    </div>
                </div>
            </div>

            <div className={styles.body}>
                <section className={styles.section}>
                    <h2 className={styles.sectionTitle}>
                        <i className="ri-team-line" /> {brand.name}的專家（{experts.length}）
                    </h2>
                    {experts.length === 0 ? (
                        <div className={styles.empty}>還沒有認證專家</div>
                    ) : (
                        <div className={styles.expertsGrid}>
                            {experts.map((u) => (
                                <Link
                                    key={u.userId}
                                    href={`/u/${u.userId}`}
                                    className={styles.expertCard}
                                >
                                    <div className={styles.expertHead}>
                                        <div className={styles.expertAvatar}>{u.avatarSeed || avatar(u.displayName)}</div>
                                        <div>
                                            <div className={styles.expertName}>{u.displayName}</div>
                                            <div className={styles.expertRole}>
                                                {u.brand?.role}{u.brand?.years ? ` · ${u.brand.years} 年` : ""}
                                            </div>
                                        </div>
                                    </div>
                                    <BadgeRow badges={u.badges} brand={u.brand} size="small" limit={3} />
                                    {u.bio && <p className={styles.expertBio}>{u.bio}</p>}
                                    <div className={styles.expertStats}>
                                        <span><i className="ri-heart-3-fill" /> {u.helpfulCount} helpful</span>
                                        <span><i className="ri-calendar-line" /> {u.joinedAt}</span>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    )}
                </section>

                <section className={styles.section}>
                    <h2 className={styles.sectionTitle}>
                        <i className="ri-chat-3-line" /> {brand.name}專家的最新分享
                    </h2>
                    {recentReplies.length === 0 ? (
                        <div className={styles.empty}>還沒有最新分享</div>
                    ) : (
                        <div className={styles.recentList}>
                            {recentReplies.map((r) => (
                                <Link key={r.id} href={`/topics/${r.topicId}`} className={styles.recentItem}>
                                    <h3 className={styles.recentItemTitle}>「{r.topicTitle}」</h3>
                                    <p className={styles.recentItemSnippet}>{r.content}</p>
                                    <div className={styles.recentItemMeta}>
                                        <span><i className="ri-user-line" /> {r.expertName}</span>
                                        <span><i className="ri-heart-3-line" /> {r.helpfulCount || 0}</span>
                                        <span>{relativeTime(r.createdAt)}</span>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    )}
                </section>
            </div>
        </div>
    );
}
