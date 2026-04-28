import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { CATEGORIES } from "@/lib/store";
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

const ME_KEY = "discuss-demo-me";

function loadMe() {
    if (typeof window === "undefined") return null;
    try {
        const raw = window.localStorage.getItem(ME_KEY);
        if (!raw) return null;
        return JSON.parse(raw);
    } catch { return null; }
}

function saveMe(me) {
    if (typeof window === "undefined") return;
    try {
        window.localStorage.setItem(ME_KEY, JSON.stringify(me));
    } catch {}
}

function ensureMe() {
    const existing = loadMe();
    if (existing && existing.authorId) return existing;
    const fresh = {
        authorId: `me_${Math.random().toString(36).slice(2, 12)}`,
        authorName: "",
    };
    saveMe(fresh);
    return fresh;
}

export default function DiscussRoom({ topicId }) {
    const router = useRouter();
    const [topic, setTopic] = useState(undefined); // undefined = loading, null = not found
    const [replies, setReplies] = useState([]);
    const [draft, setDraft] = useState("");
    const [sending, setSending] = useState(false);
    const [me, setMe] = useState({ authorId: "", authorName: "" });
    const feedRef = useRef(null);

    useEffect(() => {
        setMe(ensureMe());
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

    // Light polling so multiple tabs feel "live" even though there's no socket.
    useEffect(() => {
        if (!topicId) return;
        const t = setInterval(loadReplies, 5000);
        return () => clearInterval(t);
    }, [topicId]);

    // Auto-scroll to bottom
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
            const cleanName = (me.authorName || "").trim() || "匿名同學";
            if (cleanName !== me.authorName) {
                const updated = { ...me, authorName: cleanName };
                setMe(updated);
                saveMe(updated);
            }
            const res = await fetch(`/api/discuss/topics/${topicId}/replies`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    authorName: cleanName,
                    content,
                }),
            });
            const json = await res.json();
            if (!json.ok) throw new Error(json.error || "post failed");
            // Mark this reply as ours for self-styling
            const myReply = { ...json.reply, authorId: me.authorId };
            setReplies((curr) => [...curr, myReply]);
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
    const myLocalReplies = useMemoMyReplies(replies, me.authorId);

    return (
        <div className={styles.page}>
            <div className={styles.header}>
                <Link href="/" className={styles.backBtn} aria-label="返回">
                    <i className="ri-arrow-left-line" />
                </Link>
                <div className={styles.headerBody}>
                    <h1 className={styles.title}>{topic.title}</h1>
                    {topic.description && <p className={styles.subtitle}>{topic.description}</p>}
                    <div className={styles.meta}>
                        <span className={styles.metaPill}>{categoryLabel}</span>
                        <span><i className="ri-chat-3-line" /> {topic.replyCount} 則回覆</span>
                        <span><i className="ri-eye-line" /> {topic.viewCount} 次瀏覽</span>
                        <span><i className="ri-user-line" /> 由 {topic.authorName} 發起</span>
                    </div>
                </div>
            </div>

            <div className={styles.feed} ref={feedRef}>
                <div className={styles.feedInner}>
                    <div className={styles.firstPost}>
                        <div className={styles.bubble} style={{ maxWidth: "100%" }}>
                            <div className={styles.avatar}>{avatarInitial(topic.authorName)}</div>
                            <div className={styles.bubbleBody} style={{ flex: 1 }}>
                                <div className={styles.author}>
                                    {topic.authorName} · {formatTime(topic.createdAt)}
                                </div>
                                <div className={styles.bubbleContent}>
                                    <strong style={{ display: "block", marginBottom: 4 }}>{topic.title}</strong>
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
                        const self = myLocalReplies.has(r.id);
                        return (
                            <div
                                key={r.id}
                                className={`${styles.bubble} ${self ? styles.bubbleSelf : ""}`}
                            >
                                <div className={`${styles.avatar} ${self ? styles.avatarSelf : ""}`}>
                                    {avatarInitial(r.authorName)}
                                </div>
                                <div className={styles.bubbleBody}>
                                    <div className={styles.author}>{r.authorName}</div>
                                    <div className={styles.bubbleContent}>{r.content}</div>
                                    <div className={styles.bubbleTime}>{formatTime(r.createdAt)}</div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            <div className={styles.composer}>
                <div className={styles.composerInner}>
                    <input
                        className={styles.nameInput}
                        value={me.authorName}
                        onChange={(e) => {
                            const next = { ...me, authorName: e.target.value };
                            setMe(next);
                            saveMe(next);
                        }}
                        placeholder="顯示名稱"
                        maxLength={20}
                    />
                    <textarea
                        className={styles.textarea}
                        value={draft}
                        onChange={(e) => setDraft(e.target.value)}
                        onKeyDown={onKeyDown}
                        placeholder="在這裡留下你的想法⋯⋯ (Enter 送出，Shift+Enter 換行)"
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
                <div className={styles.helpHint}>
                    這是模擬器：留言會即時送出，但伺服器重啟會回到 seed 狀態。
                </div>
            </div>
        </div>
    );
}

// Tiny helper hook so we don't recompute the Set every render
function useMemoMyReplies(replies, myAuthorId) {
    return useMemo(() => {
        const set = new Set();
        if (!myAuthorId) return set;
        for (const r of replies) {
            if (r.authorId === myAuthorId) set.add(r.id);
        }
        return set;
    }, [replies, myAuthorId]);
}
