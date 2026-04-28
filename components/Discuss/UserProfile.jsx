import { useEffect, useState } from "react";
import Link from "next/link";
import { BadgeRow } from "@/components/Badge";
import { INDUSTRIES, BRANDS } from "@/lib/store";
import styles from "./UserProfile.module.css";

function avatar(s) {
    if (!s) return "•";
    return s.trim().charAt(0).toUpperCase();
}

function relativeTime(date) {
    if (!date) return "";
    const d = new Date(date);
    const diffMs = Date.now() - d.getTime();
    const m = Math.floor(diffMs / 60000);
    if (m < 60) return `${m} 分鐘前`;
    const h = Math.floor(m / 60);
    if (h < 24) return `${h} 小時前`;
    return `${Math.floor(h / 24)} 天前`;
}

export default function UserProfile({ userId }) {
    const [data, setData] = useState(undefined); // undefined = loading, null = not found

    useEffect(() => {
        if (!userId) return;
        let cancelled = false;
        (async () => {
            try {
                const res = await fetch(`/api/discuss/users/${userId}`);
                if (res.status === 404) { setData(null); return; }
                const json = await res.json();
                if (!cancelled && json.ok) setData(json);
            } catch (err) {
                console.error(err);
                if (!cancelled) setData(null);
            }
        })();
        return () => { cancelled = true; };
    }, [userId]);

    if (data === undefined) {
        return <div className={styles.page}><div className={styles.inner}>載入中⋯⋯</div></div>;
    }

    if (data === null) {
        return (
            <div className={styles.page}>
                <div className={styles.inner}>
                    <div className={styles.notFound}>
                        <div style={{ fontSize: 48, marginBottom: 8 }}>🤔</div>
                        <h2>找不到這位使用者</h2>
                        <p>這個 ID 可能屬於匿名學生，沒有公開的個人頁。</p>
                        <Link href="/experts" className={styles.crumbs} style={{ color: "var(--theme-color)" }}>
                            看認證專家 →
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    const { user, topics, replies } = data;
    const brand = user.brand?.brandId ? BRANDS.find((b) => b.id === user.brand.brandId) : null;

    return (
        <div className={styles.page}>
            <div className={styles.inner}>
                <div className={styles.crumbs}>
                    <Link href="/">首頁</Link> ·{" "}
                    <Link href="/experts">認證專家</Link> · <span>{user.displayName}</span>
                </div>

                <div className={styles.header}>
                    <div className={styles.avatar}>{user.avatarSeed || avatar(user.displayName)}</div>
                    <div className={styles.identity}>
                        <h1 className={styles.name}>{user.displayName}</h1>
                        <span className={styles.handle}>@{user.userId.slice(-8)}</span>
                        <BadgeRow badges={user.badges} brand={user.brand} size="default" />
                        {user.bio && <p className={styles.bio}>{user.bio}</p>}
                        <div className={styles.stats}>
                            {user.helpfulCount !== undefined && (
                                <span><strong>{user.helpfulCount}</strong> 個 helpful</span>
                            )}
                            {user.joinedAt && <span>加入 <strong>{user.joinedAt}</strong></span>}
                            {brand && (
                                <span>
                                    <strong>{brand.name}</strong>
                                    {user.brand?.role ? ` · ${user.brand.role}` : ""}
                                    {" · "}
                                    <Link href={`/brands/${brand.id}`} style={{ color: "var(--theme-color)" }}>看品牌頁 →</Link>
                                </span>
                            )}
                        </div>
                    </div>
                </div>

                <section className={styles.section}>
                    <h2 className={styles.sectionTitle}>{user.displayName}發起的話題</h2>
                    {topics.length === 0 ? (
                        <div className={styles.empty}>還沒有發起過話題</div>
                    ) : (
                        <div className={styles.grid}>
                            {topics.map((t) => {
                                const ind = INDUSTRIES.find((i) => i.id === t.industry);
                                return (
                                    <Link key={t.id} href={`/topics/${t.id}`} className={styles.card}>
                                        <h3 className={styles.cardTitle}>{t.title}</h3>
                                        <p className={styles.cardSnippet}>{t.description}</p>
                                        <div className={styles.cardMeta}>
                                            {ind && <span>{ind.emoji} {ind.label}</span>}
                                            <span><i className="ri-chat-3-line" /> {t.replyCount}</span>
                                            <span>{relativeTime(t.lastActivityAt)}</span>
                                        </div>
                                    </Link>
                                );
                            })}
                        </div>
                    )}
                </section>

                <section className={styles.section}>
                    <h2 className={styles.sectionTitle}>{user.displayName}的最新回覆</h2>
                    {replies.length === 0 ? (
                        <div className={styles.empty}>還沒有回覆過任何話題</div>
                    ) : (
                        <div className={styles.grid}>
                            {replies.map((r) => {
                                const ind = INDUSTRIES.find((i) => i.id === r.topicIndustry);
                                return (
                                    <Link key={r.id} href={`/topics/${r.topicId}`} className={styles.card}>
                                        <h3 className={styles.cardTitle}>{r.topicTitle}</h3>
                                        <p className={styles.cardSnippet}>「{r.content}」</p>
                                        <div className={styles.cardMeta}>
                                            {ind && <span>{ind.emoji} {ind.label}</span>}
                                            <span><i className="ri-heart-3-line" /> {r.helpfulCount || 0}</span>
                                            <span>{relativeTime(r.createdAt)}</span>
                                        </div>
                                    </Link>
                                );
                            })}
                        </div>
                    )}
                </section>
            </div>
        </div>
    );
}
