import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { BadgeRow } from "./Badge";
import { DEMO_ROLES } from "@/lib/profile";
import styles from "./SimulatorBar.module.css";

function avatarInitial(name) {
    if (!name) return "•";
    return (name.trim().charAt(0) || "•").toUpperCase();
}

/**
 * Top bar mirrored from InternX's TopBar:
 *   - white background, 1px #e5e5e5 border-bottom
 *   - 64px tall (--top-bar-height)
 *   - logo image (long, black) on the left
 *   - tab nav in the middle (mirrors InternX's TOP_BAR_TABS pattern)
 *   - user pill + role switcher on the right
 *
 * Differences (kept distinct from main site):
 *   - "SIMULATOR" indicator chip
 *   - "切換身份" demo-role pill (testing tool)
 *   - "關於" help dialog explaining what this preview is
 */
// Mirrors InternX's TopBar nav pattern (icon + label, active border-bottom).
// Industry forums are reachable via the home page's "我的論壇" cards, so we
// don't put a 論壇 tab here.
const TABS = [
    { href: "/", icon: "ri-chat-1-line", label: "話題", match: ["/"] },
    { href: "/polls", icon: "ri-bar-chart-grouped-line", label: "投票", match: ["/polls"] },
    { href: "/survey", icon: "ri-emotion-sad-line", label: "困擾調查", match: ["/survey"] },
    { href: "/experts", icon: "ri-vip-crown-line", label: "認證專家", match: ["/experts"] },
];

export default function SimulatorBar({
    profile,
    industries = [],
    onEditProfile,
    onSwitchRole,
}) {
    const router = useRouter();
    const [showHelp, setShowHelp] = useState(false);
    const [showRoles, setShowRoles] = useState(false);

    const onboarded = profile && Array.isArray(profile.industries) && profile.industries.length > 0;

    let industriesText = "";
    if (onboarded) {
        const labels = profile.industries
            .map((id) => industries.find((i) => i.id === id)?.label)
            .filter(Boolean);
        industriesText = labels.length > 2
            ? `${labels.slice(0, 2).join("、")}＋${labels.length - 2}`
            : labels.join("、");
    }

    const currentRole = DEMO_ROLES.find((r) => r.id === profile?.demoRole) || DEMO_ROLES[0];

    function isActive(tab) {
        const path = router.pathname;
        if (tab.href === "/" && path === "/") return true;
        return tab.match.some((m) => m !== "/" && path.startsWith(m));
    }

    return (
        <>
            <div className={styles.outer}>
                <div className={styles.bar}>
                    <div className={styles.left}>
                        <Link href="/" aria-label="首頁">
                            <button type="button" className={styles.logoBtn} aria-label="實習通" />
                        </Link>
                    </div>
                    <div className={styles.middle}>
                        <div className={styles.navIcons}>
                            {TABS.map((tab) => {
                                const active = isActive(tab);
                                return (
                                    <Link key={tab.href} href={tab.href} className={`${styles.navItem} ${active ? styles.navItemActive : ""}`}>
                                        <i className={tab.icon} />
                                        <span>{tab.label}</span>
                                    </Link>
                                );
                            })}
                        </div>
                    </div>
                    <div className={styles.right}>
                        <span className={styles.simChip}>
                            <span className={styles.simDot} />
                            SIMULATOR
                        </span>

                        {onSwitchRole && onboarded && (
                            <button
                                type="button"
                                className={styles.rolePill}
                                onClick={() => setShowRoles((s) => !s)}
                                title="切換 demo 身份（測試用）"
                            >
                                <span className={styles.roleEmoji}>{currentRole.emoji}</span>
                                <span>切換身份</span>
                            </button>
                        )}

                        {onboarded && (
                            <button
                                type="button"
                                className={styles.userPill}
                                onClick={onEditProfile}
                                title="編輯個人資料"
                            >
                                <span className={styles.userAvatar}>{avatarInitial(profile.displayName)}</span>
                                <span className={styles.userMeta}>
                                    <span className={styles.userName}>{profile.displayName || "匿名同學"}</span>
                                    {industriesText && (
                                        <span className={styles.userIndustries}>{industriesText}</span>
                                    )}
                                </span>
                                {Array.isArray(profile.badges) && profile.badges.length > 0 && (
                                    <BadgeRow badges={profile.badges} brand={profile.brand} size="small" limit={2} />
                                )}
                            </button>
                        )}

                        <button
                            className={styles.helpBtn}
                            onClick={() => setShowHelp(true)}
                            type="button"
                        >
                            <i className="ri-information-line" /> <span>關於</span>
                        </button>
                    </div>
                </div>
            </div>

            {showRoles && (
                <>
                    <div className={styles.menuBackdrop} onClick={() => setShowRoles(false)} />
                    <div className={styles.roleMenu} role="menu">
                        <div className={styles.roleMenuHeader}>
                            <h3 className={styles.roleMenuTitle}>切換 demo 身份</h3>
                            <p className={styles.roleMenuHelp}>
                                測試用：選一個身份，看看不同 badge 在留言、論壇與版主功能上的呈現。
                            </p>
                        </div>
                        {DEMO_ROLES.map((role) => {
                            const active = role.id === currentRole.id;
                            return (
                                <button
                                    key={role.id}
                                    type="button"
                                    className={`${styles.roleItem} ${active ? styles.roleItemActive : ""}`}
                                    onClick={() => {
                                        onSwitchRole(role.id);
                                        setShowRoles(false);
                                    }}
                                >
                                    <span className={styles.roleEmoji}>{role.emoji}</span>
                                    <div className={styles.roleBody}>
                                        <div className={styles.roleName}>{role.label}</div>
                                        <div className={styles.roleDesc}>{role.description}</div>
                                    </div>
                                    {active && <i className={`ri-check-line ${styles.roleCheck}`} />}
                                </button>
                            );
                        })}
                    </div>
                </>
            )}

            {showHelp && <HelpDialog onClose={() => setShowHelp(false)} />}
        </>
    );
}

function HelpDialog({ onClose }) {
    return (
        <div
            onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
            style={{
                position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)",
                zIndex: 1100, display: "flex", alignItems: "center", justifyContent: "center",
                padding: 20,
            }}
        >
            <div style={{
                background: "white", borderRadius: 18, padding: 24, maxWidth: 540, width: "100%",
                boxShadow: "0 30px 80px rgba(0,0,0,0.3)", lineHeight: 1.6, color: "#222",
                fontFamily: "var(--font-family)",
            }}>
                <h3 style={{ margin: "0 0 12px 0", fontSize: 20, fontWeight: 600 }}>
                    這是一個模擬器
                </h3>
                <p style={{ margin: "0 0 8px 0" }}>
                    這個專案是「實習通」<strong>「話題」功能</strong>的獨立 demo，給技術人員預覽 UI 與互動使用。
                    用色、字體、TopBar、按鈕風格都對齊「實習通」主站，所以這份 demo 可以直接抄回主站。
                </p>
                <ul style={{ margin: "0 0 12px 18px", padding: 0, color: "#444" }}>
                    <li>後端是純 in-memory，重啟伺服器資料會回到 seed。</li>
                    <li>沒有與「實習通」主站共用任何資料、認證、Firestore。</li>
                    <li>「註冊」只是 localStorage 偏好，不會送到任何地方。</li>
                    <li>留言、開新話題的功能都可實際操作，僅在這個 demo 內生效。</li>
                    <li>「切換身份」按鈕讓你假扮不同 badge（航拓顧問、版主、認證創作者⋯）來看 UI。</li>
                </ul>
                <p style={{ margin: "0 0 6px 0", fontSize: 13, color: "#777" }}>
                    要把這個 demo 整合進主站？看 GitHub repo 根目錄的 <strong>INTEGRATION.md</strong>。
                </p>
                <button
                    onClick={onClose}
                    type="button"
                    style={{
                        appearance: "none", border: "none", background: "var(--theme-color)",
                        color: "white", padding: "10px 20px", borderRadius: "var(--border-radius)", fontWeight: 500,
                        cursor: "pointer", marginTop: 6, fontFamily: "inherit",
                    }}
                >
                    我知道了
                </button>
            </div>
        </div>
    );
}
