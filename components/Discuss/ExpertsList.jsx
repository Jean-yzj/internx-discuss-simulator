import { useEffect, useState } from "react";
import Link from "next/link";
import { BadgeRow } from "@/components/Badge";
import styles from "./ExpertsList.module.css";

function avatar(name) {
    if (!name) return "•";
    return name.trim().charAt(0).toUpperCase();
}

export default function ExpertsList() {
    const [brands, setBrands] = useState([]);
    const [creators, setCreators] = useState([]);
    const [industryExperts, setIndustryExperts] = useState([]);
    const [topContributors, setTopContributors] = useState([]);

    useEffect(() => {
        let cancelled = false;
        (async () => {
            try {
                const [brandsRes, vcRes, ieRes, tcRes] = await Promise.all([
                    fetch("/api/discuss/brands"),
                    fetch("/api/discuss/users?badge=verified-creator"),
                    fetch("/api/discuss/users?badge=industry-expert"),
                    fetch("/api/discuss/users?badge=top-contributor"),
                ]);
                const [brandsJson, vcJson, ieJson, tcJson] = await Promise.all([
                    brandsRes.json(),
                    vcRes.json(),
                    ieRes.json(),
                    tcRes.json(),
                ]);
                if (cancelled) return;
                if (brandsJson.ok) setBrands(brandsJson.brands);
                if (vcJson.ok) {
                    // Filter out brand-experts so we don't double-list them in
                    // both the brand showcase + the creator grid
                    setCreators(vcJson.users.filter((u) => !u.badges.includes("brand-expert")));
                }
                if (ieJson.ok) setIndustryExperts(ieJson.users);
                if (tcJson.ok) setTopContributors(tcJson.users);
            } catch (err) {
                console.error("load experts failed", err);
            }
        })();
        return () => { cancelled = true; };
    }, []);

    return (
        <div className={styles.page}>
            <div className={styles.inner}>
                <div className={styles.crumbs}>
                    <Link href="/">← 回到首頁</Link>
                </div>
                <div className={styles.hero}>
                    <span className={styles.heroBadge}>
                        <i className="ri-vip-crown-line" /> 認證專家
                    </span>
                    <h1 className={styles.heroTitle}>由認證專家分享，更有信心參考</h1>
                    <p className={styles.heroSubtitle}>
                        這個論壇上有多種類型的認證身份：合作品牌（如航拓）的專家、業界 5 年以上資歷的學長姐、職涯內容創作者、版上熱心助人的活躍學長姐。
                        他們的回覆會在訊息旁顯示對應的標籤，讓你一眼看出這些建議的來源。
                    </p>
                </div>

                {/* Brand showcases (e.g. 航拓) */}
                {brands.map((b) => (
                    <section key={b.id} className={styles.section}>
                        <h2 className={styles.sectionTitle}>
                            <i className="ri-handshake-line" /> 合作品牌
                        </h2>
                        <div
                            className={styles.brandCard}
                            style={{ "--brand-color": b.color, "--brand-accent": b.accent }}
                        >
                            <div className={styles.brandHero}>
                                <div className={styles.brandLogo}>{b.emoji}</div>
                                <span className={styles.label}>合作專家品牌</span>
                                <h3 className={styles.brandName}>{b.fullName || b.name}</h3>
                                <p className={styles.brandTagline}>{b.tagline}</p>
                                <p className={styles.brandDesc}>{b.description}</p>
                            </div>
                            <div className={styles.brandExperts}>
                                <h4 className={styles.brandExpertsTitle}>
                                    {b.name} 的專家（{b.experts.length} 位）
                                </h4>
                                {b.experts.map((u) => (
                                    <div key={u.userId} className={styles.brandExpertRow}>
                                        <div className={styles.brandExpertAvatar}>{u.avatarSeed || avatar(u.displayName)}</div>
                                        <div style={{ flex: 1, minWidth: 0 }}>
                                            <div className={styles.brandExpertName}>{u.displayName}</div>
                                            <div className={styles.brandExpertRole}>
                                                {u.brand?.role}{u.brand?.years ? ` · ${u.brand.years} 年` : ""}
                                            </div>
                                            {u.bio && <p className={styles.brandExpertBio}>{u.bio}</p>}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </section>
                ))}

                {/* Verified creators (non-brand) */}
                {creators.length > 0 && (
                    <section className={styles.section}>
                        <h2 className={styles.sectionTitle}>
                            <i className="ri-quill-pen-line" /> 認證創作者
                        </h2>
                        <div className={styles.peopleGrid}>
                            {creators.map((u) => (
                                <PersonCard key={u.userId} user={u} />
                            ))}
                        </div>
                    </section>
                )}

                {/* Industry experts */}
                {industryExperts.length > 0 && (
                    <section className={styles.section}>
                        <h2 className={styles.sectionTitle}>
                            <i className="ri-graduation-cap-line" /> 業界專家
                        </h2>
                        <div className={styles.peopleGrid}>
                            {industryExperts.map((u) => (
                                <PersonCard key={u.userId} user={u} />
                            ))}
                        </div>
                    </section>
                )}

                {/* Top contributors */}
                {topContributors.length > 0 && (
                    <section className={styles.section}>
                        <h2 className={styles.sectionTitle}>
                            <i className="ri-heart-3-line" /> 熱心助人榜
                        </h2>
                        <div className={styles.peopleGrid}>
                            {topContributors.map((u) => (
                                <PersonCard key={u.userId} user={u} />
                            ))}
                        </div>
                    </section>
                )}
            </div>
        </div>
    );
}

function PersonCard({ user }) {
    return (
        <div className={styles.personCard}>
            <div className={styles.personHeader}>
                <div className={styles.personAvatar}>{user.avatarSeed || avatar(user.displayName)}</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                    <h3 className={styles.personName}>{user.displayName}</h3>
                    <BadgeRow badges={user.badges} brand={user.brand} size="small" limit={3} />
                </div>
            </div>
            {user.bio && <p className={styles.personBio}>{user.bio}</p>}
            <div className={styles.personStats}>
                <span className={styles.helpfulPill}>
                    <i className="ri-heart-3-fill" /> <strong>{user.helpfulCount || 0}</strong> 個 helpful
                </span>
                {user.joinedAt && (
                    <span><i className="ri-calendar-line" /> 加入 {user.joinedAt}</span>
                )}
            </div>
        </div>
    );
}
