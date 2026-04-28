import { useState } from "react";
import Link from "next/link";
import SimulatorBar from "@/components/SimulatorBar";
import Onboarding from "@/components/Onboarding";
import { BadgeRow } from "@/components/Badge";
import { useUserSession } from "@/lib/useUserSession";
import { DEMO_ROLES } from "@/lib/profile";

const card = {
    background: "white",
    border: "1px solid #e5e5e5",
    borderRadius: "var(--border-radius)",
    padding: 20,
    marginBottom: 16,
};

const label = {
    fontSize: 13,
    fontWeight: 600,
    color: "#1a1a1a",
    margin: "0 0 6px 0",
    display: "block",
};

const helpText = {
    fontSize: 12,
    color: "var(--muted-color)",
    margin: "0 0 12px 0",
    lineHeight: 1.5,
};

const inputStyle = {
    width: "100%",
    border: "1px solid #ddd",
    borderRadius: "var(--border-radius)",
    padding: "10px 12px",
    fontSize: 14,
    fontFamily: "inherit",
    boxSizing: "border-box",
};

const primaryBtn = {
    appearance: "none",
    border: "1px solid transparent",
    background: "var(--theme-color)",
    color: "white",
    padding: "0 18px",
    height: 42,
    borderRadius: "var(--border-radius)",
    fontWeight: 500,
    fontSize: 14,
    cursor: "pointer",
    fontFamily: "inherit",
    display: "inline-flex",
    alignItems: "center",
    gap: 6,
};

const ghostBtn = {
    appearance: "none",
    border: "1px solid #999",
    background: "white",
    color: "#555",
    padding: "0 16px",
    height: 42,
    borderRadius: "var(--border-radius)",
    fontWeight: 500,
    fontSize: 14,
    cursor: "pointer",
    fontFamily: "inherit",
    display: "inline-flex",
    alignItems: "center",
    gap: 6,
    textDecoration: "none",
};

export default function SettingsPage() {
    const session = useUserSession();
    const [name, setName] = useState("");
    const [savedFlash, setSavedFlash] = useState(false);

    if (!session.hydrated) return null;

    if (!session.isOnboarded) {
        return (
            <>
                <SimulatorBar
                    profile={session.profile}
                    industries={session.industries}
                    onEditProfile={session.openEditProfile}
                    notifications={session.notifications}
                    onMarkNotificationsRead={session.markNotificationsRead}
                />
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

    const profile = session.profile;
    const currentRole = DEMO_ROLES.find((r) => r.id === profile.demoRole) || DEMO_ROLES[0];

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
            <div style={{ minHeight: "calc(100vh - var(--top-bar-height))", padding: "28px 20px 80px", background: "var(--background-color-blank)" }}>
                <div style={{ maxWidth: 720, margin: "0 auto" }}>
                    <div style={{ fontSize: 13, color: "var(--muted-color)", marginBottom: 14 }}>
                        <Link href="/" style={{ color: "var(--theme-color)", textDecoration: "none" }}>首頁</Link>
                        {" · "}<span>設定</span>
                    </div>
                    <h1 style={{
                        fontSize: "calc(var(--font-size) / 4)",
                        fontWeight: 600,
                        margin: "0 0 6px 0",
                        color: "#1a1a1a",
                        letterSpacing: "-0.02em",
                    }}>設定</h1>
                    <p style={{ color: "#555", margin: "0 0 24px", lineHeight: 1.6 }}>
                        管理你的個人資料、訂閱、Demo 身份。所有資料只存在你瀏覽器的 localStorage。
                    </p>

                    {/* Display name */}
                    <div style={card}>
                        <h2 style={{ ...label, fontSize: 16, marginBottom: 4 }}>顯示名稱</h2>
                        <p style={helpText}>留言時顯示的名字。可以是匿稱。</p>
                        <input
                            style={inputStyle}
                            value={name || profile.displayName || ""}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="匿名同學"
                            maxLength={20}
                        />
                        <div style={{ marginTop: 10, display: "flex", gap: 8 }}>
                            <button
                                type="button"
                                style={primaryBtn}
                                onClick={() => {
                                    session.updateDisplayName((name || "").trim() || "匿名同學");
                                    setSavedFlash(true);
                                    setTimeout(() => setSavedFlash(false), 1800);
                                }}
                            >
                                <i className="ri-save-line" /> 儲存
                            </button>
                            {savedFlash && (
                                <span style={{ alignSelf: "center", color: "var(--theme-color)", fontSize: 13, fontWeight: 600 }}>
                                    ✓ 已儲存
                                </span>
                            )}
                        </div>
                    </div>

                    {/* Industries */}
                    <div style={card}>
                        <h2 style={{ ...label, fontSize: 16, marginBottom: 4 }}>訂閱的行業論壇</h2>
                        <p style={helpText}>影響首頁推薦與「最新話題」的範圍。</p>
                        <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 12 }}>
                            {session.industries
                                .filter((ind) => profile.industries.includes(ind.id))
                                .map((ind) => (
                                    <span
                                        key={ind.id}
                                        style={{
                                            background: "var(--theme-white)",
                                            color: "var(--theme-color)",
                                            border: "1px solid rgba(1,130,253,0.25)",
                                            padding: "4px 10px",
                                            borderRadius: 999,
                                            fontSize: 12,
                                            fontWeight: 600,
                                        }}
                                    >
                                        {ind.emoji} {ind.label}
                                    </span>
                                ))}
                        </div>
                        <button type="button" style={ghostBtn} onClick={session.openEditProfile}>
                            <i className="ri-equalizer-2-line" /> 修改訂閱
                        </button>
                    </div>

                    {/* Demo role */}
                    <div style={card}>
                        <h2 style={{ ...label, fontSize: 16, marginBottom: 4 }}>
                            目前 Demo 身份
                            <span style={{ marginLeft: 8, padding: "2px 8px", borderRadius: 999, background: "rgba(99,102,241,0.10)", color: "#4338ca", fontSize: 11, fontWeight: 700 }}>
                                測試用
                            </span>
                        </h2>
                        <p style={helpText}>
                            這是 simulator 專用的身份切換工具，正式版整合進主站後會移除。換身份不會影響資料。
                        </p>
                        <div style={{
                            background: "#f9fafb",
                            border: "1px solid #e5e5e5",
                            borderRadius: "var(--border-radius)",
                            padding: 12,
                            marginBottom: 10,
                            display: "flex",
                            alignItems: "center",
                            gap: 10,
                        }}>
                            <span style={{ fontSize: 22 }}>{currentRole.emoji}</span>
                            <div style={{ flex: 1 }}>
                                <div style={{ fontWeight: 600, fontSize: 14 }}>{currentRole.label}</div>
                                <div style={{ fontSize: 12, color: "var(--muted-color)", marginTop: 2 }}>{currentRole.description}</div>
                            </div>
                        </div>
                        {profile.badges?.length > 0 && (
                            <div style={{ marginTop: 8 }}>
                                <BadgeRow badges={profile.badges} brand={profile.brand} size="default" />
                            </div>
                        )}
                        <select
                            value={currentRole.id}
                            onChange={(e) => session.setDemoRole(e.target.value)}
                            style={{ ...inputStyle, marginTop: 12, cursor: "pointer" }}
                        >
                            {DEMO_ROLES.map((r) => (
                                <option key={r.id} value={r.id}>{r.emoji} {r.label}</option>
                            ))}
                        </select>
                    </div>

                    {/* Quick links */}
                    <div style={card}>
                        <h2 style={{ ...label, fontSize: 16, marginBottom: 4 }}>快速連結</h2>
                        <p style={helpText}>到其他頁面看更多。</p>
                        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                            <Link href="/saved" style={ghostBtn}>
                                <i className="ri-bookmark-line" /> 我的收藏 ({profile.savedTopics?.length || 0})
                            </Link>
                            <Link href="/survey" style={ghostBtn}>
                                <i className="ri-emotion-sad-line" /> {session.hasCompletedSurvey ? "看困擾調查結果" : "做困擾調查"}
                            </Link>
                            <Link href="/experts" style={ghostBtn}>
                                <i className="ri-vip-crown-line" /> 認證專家
                            </Link>
                        </div>
                    </div>

                    {/* Danger zone */}
                    <div style={{ ...card, borderColor: "#fca5a5", background: "#fef2f2" }}>
                        <h2 style={{ ...label, fontSize: 16, marginBottom: 4, color: "#b91c1c" }}>
                            重置 Demo
                        </h2>
                        <p style={{ ...helpText, color: "#b91c1c" }}>
                            會清掉你在這個 simulator 留下的所有 localStorage 資料（顯示名稱、訂閱行業、困擾調查、收藏、活動記錄、投票），但<strong>不會</strong>影響其他人看到的資料。
                        </p>
                        <button
                            type="button"
                            style={{
                                ...ghostBtn,
                                borderColor: "#dc2626",
                                color: "#dc2626",
                                background: "white",
                            }}
                            onClick={() => {
                                if (window.confirm("確定要清掉所有本機資料嗎？這個動作不能復原。")) {
                                    session.resetEverything();
                                }
                            }}
                        >
                            <i className="ri-delete-bin-line" /> 清除我的本機資料
                        </button>
                    </div>
                </div>
            </div>
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
