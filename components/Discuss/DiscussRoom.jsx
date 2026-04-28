import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { CATEGORIES, INDUSTRIES } from "@/lib/store";
import { loadProfile, saveProfile, isModeratorOf } from "@/lib/profile";
import { BadgeRow, BrandCallout } from "@/components/Badge";
import styles from "./DiscussRoom.module.css";

function avatarInitial(name) {
    if (!name) return "💬";
    return name.trim().charAt(0) || "💬";
}

function formatTime(date) {
    if (!date) return "";
    const d = typeof date === "string" ? new Date(date) : date;
    const now = new Date();
    const sameDay =
        now.getFullYear() === d.getFullYear() &&
        now.getMonth() === d.getMonth() &&
        now.getDate() === d.getDate();
    if (sameDay) {
        return d.toLocaleTimeString("zh-TW", { hour: "2-digit", minute: "2-digit" });
    }
    return (
        d.toLocaleDateString("zh-TW", { month: "short", day: "numeric" }) +
        " " +
        d.toLocaleTimeString("zh-TW", { hour: "2-digit", minute: "2-digit" })
    );
}

function dayKey(d) {
    if (!d) return "";
    const x = typeof d === "string" ? new Date(d) : d;
    return `${x.getFullYear()}-${x.getMonth()}-${x.getDate()}`;
}

function dayLabel(d) {
    if (!d) return "";
    const x = typeof d === "string" ? new Date(d) : d;
    const today = new Date();
    if (dayKey(today) === dayKey(x)) return "今天";
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);
    if (dayKey(yesterday) === dayKey(x)) return "昨天";
    return x.toLocaleDateString("zh-TW", { year: "numeric", month: "long", day: "numeric" });
}

export default function DiscussRoom({ topicId }) {
    const router = useRouter();
    const [topic, setTopic] = useState(undefined); // undefined = loading, null = not found
    const [replies, setReplies] = useState([]);
    const [draft, setDraft] = useState("");
    const [sending, setSending] = useState(false);
    const [profile, setProfile] = useState(null);
    const [helpfulVotes, setHelpfulVotes] = useState({}); // replyId -> bool (this client voted)
    const [openMenuId, setOpenMenuId] = useState(null);
    const feedRef = useRef(null);

    useEffect(() => {
        setProfile(loadProfile());
    }, []);

    async function loadTopic() {
        try {
            const res = await fetch(`/api/discuss/topics/${topicId}`);
            if (res.status === 404) { setTopic(null); return; }
            const json = await res.json();
            if (json.ok) setTopic(json.topic);
            else setTopic(null);
        } catch (err) {
            console.error("load topic failed", err);
            setTopic(null);
        }
    }

    async function loadReplies() {
        try {
            const res = await fetch(`/api/discuss/topics/${topicId}/replies`);
            const json = await res.json();
            if (json.ok) setReplies(json.replies);
        } catch (err) {
            console.error("load replies failed", err);
        }
    }

    useEffect(() => {
        if (!topicId) return;
        setTopic(undefined);
        loadTopic();
        loadReplies();
    }, [topicId]);

    useEffect(() => {
        if (!topicId) return;
        const t = setInterval(loadReplies, 5000);
        return () => clearInterval(t);
    }, [topicId]);

    useEffect(() => {
        if (!feedRef.current) return;
        const node = feedRef.current;
        const distFromBottom = node.scrollHeight - (node.scrollTop + node.clientHeight);
        if (distFromBottom < 200 || replies.length <= 1) {
            node.scrollTop = node.scrollHeight;
        }
    }, [replies.length, topic?.id]);

    const groupedReplies = useMemo(() => {
        const groups = [];
        let lastKey = "";
        for (const r of replies) {
            const k = dayKey(r.createdAt);
            if (k !== lastKey) {
                groups.push({ kind: "day", key: k, label: dayLabel(r.createdAt) });
                lastKey = k;
            }
            groups.push({ kind: "reply", key: r.id, reply: r });
        }
        return groups;
    }, [replies]);

    async function handleSend() {
        const content = draft.trim();
        if (!content) return;
        setSending(true);
        try {
            const cleanName = (profile?.displayName || "").trim() || "匿名同學";
            const res = await fetch(`/api/discuss/topics/${topicId}/replies`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    userId: profile?.userId,
                    authorName: cleanName,
                    content,
                    badges: profile?.badges || [],
                    brand: profile?.brand || null,
                }),
            });
            const json = await res.json();
            if (!json.ok) throw new Error(json.error || "post failed");
            setReplies((curr) => [...curr, json.reply]);
            setDraft("");
        } catch (err) {
            console.error("post reply failed", err);
            alert("送出失敗：" + (err.message || "未知錯誤"));
        } finally {
            setSending(false);
        }
    }

    function onKeyDown(e) {
        if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) {
            e.preventDefault();
            handleSend();
        }
    }

    async function toggleHelpful(replyId) {
        if (!profile?.userId) return;
        // Optimistic
        const wasVoted = !!helpfulVotes[replyId];
        setHelpfulVotes((c) => ({ ...c, [replyId]: !wasVoted }));
        setReplies((curr) =>
            curr.map((r) =>
                r.id === replyId
                    ? { ...r, helpfulCount: Math.max(0, (r.helpfulCount || 0) + (wasVoted ? -1 : 1)) }
                    : r
            )
        );
        try {
            const res = await fetch(`/api/discuss/replies/${replyId}/helpful`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ userId: profile.userId }),
            });
            const json = await res.json();
            if (json.ok && json.reply) {
                setReplies((curr) => curr.map((r) => (r.id === replyId ? { ...r, helpfulCount: json.reply.helpfulCount } : r)));
                setHelpfulVotes((c) => ({ ...c, [replyId]: json.toggled === "added" }));
            }
        } catch (err) {
            console.error(err);
        }
    }

    async function reportReply(replyId) {
        if (!profile?.userId) return;
        const reason = window.prompt("檢舉原因（簡短說明，會送給版主）", "");
        if (reason === null) return;
        try {
            await fetch(`/api/discuss/replies/${replyId}/report`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ userId: profile.userId, reason }),
            });
            alert("已送出檢舉，版主會審查。");
        } catch (err) {
            console.error(err);
        } finally {
            setOpenMenuId(null);
        }
    }

    async function deleteReply(replyId) {
        if (!profile?.userId) return;
        if (!window.confirm("確定要刪除這則留言？")) return;
        try {
            const res = await fetch(`/api/discuss/replies/${replyId}`, {
                method: "DELETE",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    userId: profile.userId,
                    badges: profile.badges,
                    moderates: profile.moderates,
                }),
            });
            const json = await res.json();
            if (json.ok) {
                setReplies((curr) => curr.filter((r) => r.id !== replyId));
            } else {
                alert(json.error || "刪除失敗");
            }
        } catch (err) {
            console.error(err);
        } finally {
            setOpenMenuId(null);
        }
    }

    async function modAction(action) {
        if (!profile?.userId || !topic) return;
        try {
            const res = await fetch(`/api/discuss/topics/${topic.id}/pin`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    action,
                    badges: profile.badges,
                    moderates: profile.moderates,
                }),
            });
            const json = await res.json();
            if (json.ok && json.topic) {
                setTopic(json.topic);
            } else {
                alert(json.error || "操作失敗");
            }
        } catch (err) {
            console.error(err);
        }
    }

    if (topic === undefined) {
        return <div className={styles.page}><div className={styles.empty}>載入中⋯⋯</div></div>;
    }

    if (topic === null) {
        return (
            <div className={styles.page}>
                <div className={styles.notFound}>
                    <div className={styles.notFoundEmoji}>🤔</div>
                    <h3>找不到這個話題</h3>
                    <p style={{ color: "#888" }}>
                        Demo 是 in-memory 的，伺服器重啟後 ID 會重生。
                    </p>
                    <Link href="/" className={styles.backBtn} style={{ marginTop: 12 }}>
                        ← 回到話題列表
                    </Link>
                </div>
            </div>
        );
    }

    const categoryLabel = CATEGORIES.find((c) => c.id === topic.category)?.label || "其他";
    const industry = INDUSTRIES.find((i) => i.id === topic.industry);
    const canMod = isModeratorOf(profile, topic.industry);

    return (
        <div className={styles.page}>
            <div className={styles.header}>
                <Link
                    href={industry ? `/forums/${industry.id}` : "/"}
                    className={styles.backBtn}
                    aria-label="返回"
                >
                    <i className="ri-arrow-left-line" />
                </Link>
                <div className={styles.headerBody}>
                    {industry && (
                        <Link
                            href={`/forums/${industry.id}`}
                            style={{
                                display: "inline-flex",
                                alignItems: "center",
                                gap: 4,
                                padding: "3px 10px",
                                background: industry.accent,
                                color: "white",
                                borderRadius: 999,
                                fontSize: 12,
                                fontWeight: 700,
                                textDecoration: "none",
                                marginBottom: 6,
                            }}
                        >
                            {industry.emoji} {industry.label}論壇
                        </Link>
                    )}
                    <h1 className={styles.title}>
                        {topic.pinned && <span className={styles.pinnedTag}>📌 置頂</span>}
                        {topic.title}
                    </h1>
                    {topic.description && <p className={styles.subtitle}>{topic.description}</p>}
                    <div className={styles.meta}>
                        <span className={styles.metaPill}>{categoryLabel}</span>
                        <span><i className="ri-chat-3-line" /> {topic.replyCount} 則回覆</span>
                        <span><i className="ri-eye-line" /> {topic.viewCount} 次瀏覽</span>
                        <span><i className="ri-user-line" /> 由 {topic.authorName} 發起</span>
                    </div>
                    {canMod && (
                        <div className={styles.modToolbar}>
                            <span style={{ fontSize: 12, color: "#15803d", fontWeight: 700, marginRight: 4 }}>
                                🛡️ 版主工具：
                            </span>
                            <button
                                type="button"
                                className={`${styles.modToolbarChip} ${topic.pinned ? styles.modToolbarChipActive : ""}`}
                                onClick={() => modAction(topic.pinned ? "unpin" : "pin")}
                            >
                                <i className="ri-pushpin-line" /> {topic.pinned ? "取消置頂" : "置頂話題"}
                            </button>
                            <button
                                type="button"
                                className={`${styles.modToolbarChip} ${topic.locked ? styles.modToolbarChipActive : ""}`}
                                onClick={() => modAction(topic.locked ? "unlock" : "lock")}
                            >
                                <i className="ri-lock-line" /> {topic.locked ? "解除鎖定" : "鎖定話題"}
                            </button>
                        </div>
                    )}
                </div>
            </div>

            <div className={styles.feed} ref={feedRef}>
                <div className={styles.feedInner}>
                    {/* Topic body shown as the first "post" */}
                    <div className={styles.firstPost}>
                        <div className={styles.bubble} style={{ maxWidth: "100%" }}>
                            <div className={styles.avatar}>{avatarInitial(topic.authorName)}</div>
                            <div className={styles.bubbleBody} style={{ flex: 1 }}>
                                <div className={styles.authorRow}>
                                    <span className={styles.authorName}>{topic.authorName}</span>
                                    {Array.isArray(topic.authorBadges) && topic.authorBadges.length > 0 && (
                                        <BadgeRow badges={topic.authorBadges} brand={topic.authorBrand} size="small" />
                                    )}
                                    <span style={{ color: "#9ca3af" }}>· {formatTime(topic.createdAt)}</span>
                                </div>
                                {topic.authorBrand && <BrandCallout brand={topic.authorBrand} />}
                                <div className={styles.bubbleContent}>
                                    {topic.description || "（沒有更多說明）"}
                                </div>
                            </div>
                        </div>
                    </div>

                    {replies.length === 0 && (
                        <div className={styles.empty}>
                            <p>還沒有人回覆，當第一個分享想法的人吧 👋</p>
                        </div>
                    )}

                    {groupedReplies.map((g) => {
                        if (g.kind === "day") {
                            return (
                                <div key={`d-${g.key}`} className={styles.dayDivider}>
                                    <span>{g.label}</span>
                                </div>
                            );
                        }
                        const r = g.reply;
                        const self = profile?.userId && r.authorId === profile.userId;
                        const isBrandReply = !!r.authorBrand;
                        const voted = !!helpfulVotes[r.id];
                        return (
                            <div
                                key={r.id}
                                className={`${styles.bubble} ${self ? styles.bubbleSelf : ""} ${isBrandReply ? styles.bubbleBrand : ""}`}
                            >
                                <div className={`${styles.avatar} ${self ? styles.avatarSelf : ""}`}>
                                    {avatarInitial(r.authorName)}
                                </div>
                                <div className={styles.bubbleBody}>
                                    <div className={styles.authorRow}>
                                        <span className={styles.authorName}>{r.authorName}</span>
                                        {Array.isArray(r.authorBadges) && r.authorBadges.length > 0 && (
                                            <BadgeRow badges={r.authorBadges} brand={r.authorBrand} size="small" />
                                        )}
                                    </div>
                                    {r.authorBrand && <BrandCallout brand={r.authorBrand} />}
                                    <div className={styles.bubbleContent}>{r.content}</div>
                                    <div className={styles.replyActions}>
                                        <button
                                            type="button"
                                            className={`${styles.actionBtn} ${voted ? styles.actionBtnActive : ""}`}
                                            onClick={() => toggleHelpful(r.id)}
                                            title="覺得有幫助"
                                        >
                                            <i className={voted ? "ri-heart-3-fill" : "ri-heart-3-line"} />
                                            <span className={styles.helpfulCount}>{r.helpfulCount || 0}</span>
                                            <span style={{ marginLeft: 2 }}>有幫助</span>
                                        </button>
                                        <span style={{ color: "#9ca3af", fontSize: 11 }}>{formatTime(r.createdAt)}</span>
                                        {!self && (
                                            <div className={styles.modMenuWrap}>
                                                <button
                                                    type="button"
                                                    className={styles.actionBtn}
                                                    onClick={() => setOpenMenuId(openMenuId === r.id ? null : r.id)}
                                                    aria-label="更多"
                                                >
                                                    <i className="ri-more-line" />
                                                </button>
                                                {openMenuId === r.id && (
                                                    <>
                                                        <div className={styles.menuBackdrop} onClick={() => setOpenMenuId(null)} />
                                                        <div className={styles.modMenu}>
                                                            <button
                                                                type="button"
                                                                className={styles.modMenuItem}
                                                                onClick={() => reportReply(r.id)}
                                                            >
                                                                <i className="ri-flag-line" /> 檢舉
                                                            </button>
                                                            {canMod && (
                                                                <button
                                                                    type="button"
                                                                    className={`${styles.modMenuItem} ${styles.modMenuItemDanger}`}
                                                                    onClick={() => deleteReply(r.id)}
                                                                >
                                                                    <i className="ri-delete-bin-line" /> 版主刪除
                                                                </button>
                                                            )}
                                                        </div>
                                                    </>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                    })}

                    {topic.locked && (
                        <div className={styles.lockedBanner}>
                            🔒 此話題已被版主鎖定，無法新增留言
                        </div>
                    )}
                </div>
            </div>

            {!topic.locked && (
                <div className={styles.composer}>
                    <div className={styles.composerInner}>
                        <input
                            className={styles.nameInput}
                            value={profile?.displayName || ""}
                            onChange={(e) => {
                                const next = { ...(profile || {}), displayName: e.target.value };
                                setProfile(next);
                                saveProfile(next);
                            }}
                            placeholder="顯示名稱"
                            maxLength={20}
                        />
                        <textarea
                            className={styles.textarea}
                            value={draft}
                            onChange={(e) => setDraft(e.target.value)}
                            onKeyDown={onKeyDown}
                            placeholder={`以「${profile?.displayName || "匿名同學"}」身份留言⋯⋯ (Enter 送出，Shift+Enter 換行)`}
                            rows={1}
                            disabled={sending}
                        />
                        <button
                            className={styles.sendBtn}
                            type="button"
                            onClick={handleSend}
                            disabled={!draft.trim() || sending}
                            aria-label="送出"
                        >
                            <i className="ri-send-plane-fill" />
                        </button>
                    </div>
                    {Array.isArray(profile?.badges) && profile.badges.length > 0 && (
                        <div className={styles.helpHint}>
                            你目前以
                            <span style={{ display: "inline-flex", verticalAlign: "middle", margin: "0 4px" }}>
                                <BadgeRow badges={profile.badges} brand={profile.brand} size="small" />
                            </span>
                            身份留言，這些 badge 會顯示在你的訊息旁。
                        </div>
                    )}
                    {(!profile?.badges || profile.badges.length === 0) && (
                        <div className={styles.helpHint}>
                            友善留言、分享真實經驗，這裡會有更多人受惠 ❤️
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
