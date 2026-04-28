import { useState } from "react";
import Link from "next/link";
import { BadgeRow } from "./Badge";
import { DEMO_ROLES } from "@/lib/profile";
import styles from "./SimulatorBar.module.css";

function avatarInitial(name) {
    if (!name) return "•";
    return (name.trim().charAt(0) || "•").toUpperCase();
}

export default function SimulatorBar({
    profile,
    industries = [],
    onEditProfile,
    onSwitchRole,
}) {
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

    return (
        <>
            <div className={styles.bar}>
                <Link href="/" className={styles.left} style={{ textDecoration: "none" }}>
                    <div className={styles.logoMark}>實</div>
                    <div className={styles.brand}>
                        <span className={styles.brandName}>實習通．話題</span>
                        <span className={styles.brandSub}>Discussion Simulator</span>
                    </div>
                </Link>
                <div className={styles.right}>
                    <span className={styles.simChip}>
                        <span className={styles.simDot} />
                        SIMULATOR
                    </span>

                    {onSwitchRole && (
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
                            <i className="ri-arrow-down-s-line" style={{ fontSize: 14, color: "#9ca3af" }} />
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
                zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center",
                padding: 20,
            }}
        >
            <div style={{
                background: "white", borderRadius: 18, padding: 24, maxWidth: 540, width: "100%",
                boxShadow: "0 30px 80px rgba(0,0,0,0.3)", lineHeight: 1.6, color: "#222",
            }}>
                <h3 style={{ margin: "0 0 12px 0", fontSize: 20, fontWeight: 800 }}>
                    這是一個模擬器
                </h3>
                <p style={{ margin: "0 0 8px 0" }}>
                    這個專案是「實習通」<strong>「話題」功能</strong>的獨立 demo，給技術人員預覽 UI 與互動使用。
                </p>
                <ul style={{ margin: "0 0 12px 18px", padding: 0, color: "#444" }}>
                    <li>後端是純 in-memory，重啟伺服器資料會回到 seed。</li>
                    <li>沒有與「實習通」主站共用任何資料、認證、Firestore。</li>
                    <li>「註冊」只是 localStorage 偏好，不會送到任何地方。</li>
                    <li>留言、開新話題的功能都可實際操作，僅在這個 demo 內生效。</li>
                    <li>「切換身份」按鈕讓你假扮不同 badge（航拓顧問、版主、認證創作者⋯）來看 UI。</li>
                </ul>
                <button
                    onClick={onClose}
                    type="button"
                    style={{
                        appearance: "none", border: "none", background: "var(--theme-color)",
                        color: "white", padding: "10px 20px", borderRadius: 999, fontWeight: 600,
                        cursor: "pointer", marginTop: 6,
                    }}
                >
                    我知道了
                </button>
            </div>
        </div>
    );
}
