import Link from "next/link";
import SimulatorBar from "@/components/SimulatorBar";
import Onboarding from "@/components/Onboarding";
import { useUserSession } from "@/lib/useUserSession";
import { INDUSTRIES } from "@/lib/store";

function relativeTime(date) {
    if (!date) return "";
    const d = new Date(date);
    const m = Math.floor((Date.now() - d.getTime()) / 60000);
    if (m < 60) return `${m} 分鐘前`;
    const h = Math.floor(m / 60);
    if (h < 24) return `${h} 小時前`;
    return `${Math.floor(h / 24)} 天前`;
}

export default function SavedPage() {
    const session = useUserSession();
    if (!session.hydrated) return null;

    const saved = session.profile?.savedTopics || [];

    return (
        <>
            <SimulatorBar
                profile={session.profile}
                industries={session.industries}
                onEditProfile={session.openEditProfile}
                onSwitchRole={session.setDemoRole}
                notifications={session.notifications}
                onMarkNotificationsRead={session.markNotificationsRead}
            />
            {session.isOnboarded ? (
                <div style={{ minHeight: "calc(100vh - var(--top-bar-height))", padding: "28px 20px 80px", background: "var(--background-color-blank)" }}>
                    <div style={{ maxWidth: 1100, margin: "0 auto" }}>
                        <div style={{ fontSize: 13, color: "var(--muted-color)", marginBottom: 14 }}>
                            <Link href="/" style={{ color: "var(--theme-color)", textDecoration: "none" }}>首頁</Link>
                            {" · "}
                            <span>我的收藏</span>
                        </div>
                        <h1 style={{
                            fontSize: "calc(var(--font-size) / 4)",
                            fontWeight: 600,
                            margin: "0 0 6px 0",
                            color: "#1a1a1a",
                            letterSpacing: "-0.02em",
                        }}>
                            <i className="ri-bookmark-fill" style={{ color: "var(--theme-color)" }} /> 我的收藏（{saved.length}）
                        </h1>
                        <p style={{ color: "#555", margin: "0 0 24px", lineHeight: 1.6 }}>
                            你之前點過收藏的話題會顯示在這裡。點任何一張卡片就能回到該話題。
                        </p>

                        {saved.length === 0 ? (
                            <div style={{
                                border: "1px dashed #e5e5e5",
                                borderRadius: "var(--border-radius)",
                                padding: "48px 20px",
                                textAlign: "center",
                                color: "var(--muted-color)",
                            }}>
                                <div style={{ fontSize: 36, marginBottom: 8 }}>🔖</div>
                                <p style={{ margin: 0 }}>還沒有收藏任何話題</p>
                                <p style={{ margin: "8px 0 0", fontSize: 13 }}>進到任一個話題頁，點頭部的「收藏」按鈕即可加入這裡。</p>
                            </div>
                        ) : (
                            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                                {saved.map((s) => {
                                    const ind = INDUSTRIES.find((i) => i.id === s.industry);
                                    return (
                                        <Link
                                            key={s.id}
                                            href={`/topics/${s.id}`}
                                            style={{
                                                border: "1px solid #e5e5e5",
                                                borderRadius: "var(--border-radius)",
                                                padding: "14px 18px",
                                                background: "white",
                                                textDecoration: "none",
                                                color: "inherit",
                                                display: "flex",
                                                alignItems: "center",
                                                gap: 14,
                                                transition: "border-color 0.15s, background 0.15s",
                                            }}
                                            onMouseEnter={(e) => {
                                                e.currentTarget.style.borderColor = "var(--theme-color)";
                                                e.currentTarget.style.background = "#fafcff";
                                            }}
                                            onMouseLeave={(e) => {
                                                e.currentTarget.style.borderColor = "#e5e5e5";
                                                e.currentTarget.style.background = "white";
                                            }}
                                        >
                                            <div style={{
                                                width: 40,
                                                height: 40,
                                                borderRadius: "50%",
                                                background: "var(--theme-white)",
                                                color: "var(--theme-color)",
                                                display: "inline-flex",
                                                alignItems: "center",
                                                justifyContent: "center",
                                                fontSize: 16,
                                                flexShrink: 0,
                                            }}>
                                                <i className="ri-bookmark-fill" />
                                            </div>
                                            <div style={{ flex: 1, minWidth: 0 }}>
                                                <h3 style={{
                                                    margin: 0,
                                                    fontSize: 15,
                                                    fontWeight: 600,
                                                    color: "#1a1a1a",
                                                    lineHeight: 1.4,
                                                }}>
                                                    {s.title}
                                                </h3>
                                                <div style={{
                                                    marginTop: 4,
                                                    fontSize: 12,
                                                    color: "var(--muted-color)",
                                                    display: "inline-flex",
                                                    gap: 12,
                                                    flexWrap: "wrap",
                                                }}>
                                                    {ind && <span>{ind.emoji} {ind.label}</span>}
                                                    <span>收藏於 {relativeTime(s.savedAt)}</span>
                                                </div>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    e.stopPropagation();
                                                    session.toggleSaveTopic(s);
                                                }}
                                                style={{
                                                    appearance: "none",
                                                    border: "1px solid #e5e5e5",
                                                    background: "white",
                                                    color: "#999",
                                                    padding: "4px 10px",
                                                    borderRadius: 999,
                                                    fontSize: 11,
                                                    cursor: "pointer",
                                                    fontFamily: "inherit",
                                                }}
                                                title="從收藏中移除"
                                            >
                                                <i className="ri-close-line" /> 移除
                                            </button>
                                        </Link>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </div>
            ) : null}
            {session.showOnboarding && (
                <Onboarding
                    initialProfile={session.profile}
                    industries={session.industries}
                    closable={session.isOnboarded}
                    onClose={session.closeEditProfile}
                    onComplete={session.completeOnboarding}
                />
            )}
        </>
    );
}
