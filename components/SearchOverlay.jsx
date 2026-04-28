import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/router";
import { INDUSTRIES } from "@/lib/store";
import styles from "./SearchOverlay.module.css";

/**
 * Cmd+K (or Ctrl+K) opens. Searches topics + experts + brands by
 * substring match through /api/discuss/search.
 *
 * Keyboard: ↑ ↓ to navigate, Enter to open, Esc to close.
 * Click anywhere outside the box also closes.
 */
export default function SearchOverlay({ open, onClose }) {
    const router = useRouter();
    const [query, setQuery] = useState("");
    const [results, setResults] = useState({ topics: [], users: [], brands: [] });
    const [activeIdx, setActiveIdx] = useState(0);
    const inputRef = useRef(null);

    useEffect(() => {
        if (!open) return;
        const t = setTimeout(() => inputRef.current?.focus(), 50);
        return () => clearTimeout(t);
    }, [open]);

    useEffect(() => {
        if (!open) {
            setQuery("");
            setResults({ topics: [], users: [], brands: [] });
            setActiveIdx(0);
        }
    }, [open]);

    useEffect(() => {
        if (!query.trim()) {
            setResults({ topics: [], users: [], brands: [] });
            return;
        }
        let cancelled = false;
        const t = setTimeout(async () => {
            try {
                const res = await fetch(`/api/discuss/search?q=${encodeURIComponent(query)}`);
                const json = await res.json();
                if (!cancelled && json.ok) {
                    setResults({ topics: json.topics, users: json.users, brands: json.brands });
                    setActiveIdx(0);
                }
            } catch (err) { console.error(err); }
        }, 120);
        return () => { cancelled = true; clearTimeout(t); };
    }, [query]);

    // Build flat list of selectable items for arrow-key nav
    const flat = [];
    results.topics.forEach((t) => flat.push({ kind: "topic", item: t, href: `/topics/${t.id}` }));
    results.users.forEach((u) => flat.push({ kind: "user", item: u, href: `/experts` }));
    results.brands.forEach((b) => flat.push({ kind: "brand", item: b, href: `/experts` }));

    function onKeyDown(e) {
        if (e.key === "Escape") { e.preventDefault(); onClose(); return; }
        if (e.key === "ArrowDown") {
            e.preventDefault();
            setActiveIdx((i) => Math.min(flat.length - 1, i + 1));
        } else if (e.key === "ArrowUp") {
            e.preventDefault();
            setActiveIdx((i) => Math.max(0, i - 1));
        } else if (e.key === "Enter") {
            e.preventDefault();
            const target = flat[activeIdx];
            if (target) {
                router.push(target.href);
                onClose();
            }
        }
    }

    if (!open) return null;

    return (
        <div
            className={styles.backdrop}
            onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
        >
            <div className={styles.box}>
                <div className={styles.searchRow}>
                    <i className={`ri-search-line ${styles.searchIcon}`} />
                    <input
                        ref={inputRef}
                        className={styles.searchInput}
                        type="search"
                        placeholder="搜尋話題、專家、合作品牌⋯⋯"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        onKeyDown={onKeyDown}
                    />
                    <span className={styles.kbd}>Esc</span>
                </div>

                <div className={styles.results}>
                    {!query.trim() && (
                        <div className={styles.empty}>
                            打字開始搜尋。試試「投行」、「leetcode」、「航拓」、「面試」。
                        </div>
                    )}
                    {query.trim() && flat.length === 0 && (
                        <div className={styles.empty}>沒有符合「{query}」的結果</div>
                    )}

                    {results.topics.length > 0 && (
                        <div className={styles.section}>
                            <h4 className={styles.sectionTitle}>話題（{results.topics.length}）</h4>
                            {results.topics.map((t, i) => {
                                const ind = INDUSTRIES.find((x) => x.id === t.industry);
                                const idx = i;
                                return (
                                    <a
                                        key={t.id}
                                        className={`${styles.row} ${activeIdx === idx ? styles.rowActive : ""}`}
                                        onMouseEnter={() => setActiveIdx(idx)}
                                        onClick={(e) => { e.preventDefault(); router.push(`/topics/${t.id}`); onClose(); }}
                                        href={`/topics/${t.id}`}
                                    >
                                        <span className={styles.rowIcon}>
                                            <i className="ri-chat-3-line" />
                                        </span>
                                        <div className={styles.rowBody}>
                                            <h5 className={styles.rowTitle}>{t.title}</h5>
                                            {t.description && <p className={styles.rowSubtitle}>{t.description}</p>}
                                            <div className={styles.rowMeta}>
                                                {ind && <span>{ind.emoji} {ind.label}</span>}
                                                <span><i className="ri-chat-3-line" /> {t.replyCount}</span>
                                                <span><i className="ri-eye-line" /> {t.viewCount}</span>
                                            </div>
                                        </div>
                                    </a>
                                );
                            })}
                        </div>
                    )}

                    {results.users.length > 0 && (
                        <div className={styles.section}>
                            <h4 className={styles.sectionTitle}>專家（{results.users.length}）</h4>
                            {results.users.map((u, i) => {
                                const idx = results.topics.length + i;
                                return (
                                    <a
                                        key={u.userId}
                                        className={`${styles.row} ${activeIdx === idx ? styles.rowActive : ""}`}
                                        onMouseEnter={() => setActiveIdx(idx)}
                                        onClick={(e) => { e.preventDefault(); router.push(`/experts`); onClose(); }}
                                        href="/experts"
                                    >
                                        <span className={`${styles.rowIcon} ${styles.rowIconUser}`}>
                                            {u.avatarSeed || u.displayName.charAt(0)}
                                        </span>
                                        <div className={styles.rowBody}>
                                            <h5 className={styles.rowTitle}>{u.displayName}</h5>
                                            {u.bio && <p className={styles.rowSubtitle}>{u.bio}</p>}
                                        </div>
                                    </a>
                                );
                            })}
                        </div>
                    )}

                    {results.brands.length > 0 && (
                        <div className={styles.section}>
                            <h4 className={styles.sectionTitle}>合作品牌（{results.brands.length}）</h4>
                            {results.brands.map((b, i) => {
                                const idx = results.topics.length + results.users.length + i;
                                return (
                                    <a
                                        key={b.id}
                                        className={`${styles.row} ${activeIdx === idx ? styles.rowActive : ""}`}
                                        onMouseEnter={() => setActiveIdx(idx)}
                                        onClick={(e) => { e.preventDefault(); router.push(`/experts`); onClose(); }}
                                        href="/experts"
                                    >
                                        <span
                                            className={`${styles.rowIcon} ${styles.rowIconBrand}`}
                                            style={{ "--brand-color": b.color }}
                                        >
                                            {b.emoji}
                                        </span>
                                        <div className={styles.rowBody}>
                                            <h5 className={styles.rowTitle}>{b.fullName || b.name}</h5>
                                            {b.tagline && <p className={styles.rowSubtitle}>{b.tagline}</p>}
                                            <div className={styles.rowMeta}>
                                                <span><i className="ri-team-line" /> {b.experts?.length || 0} 位專家</span>
                                            </div>
                                        </div>
                                    </a>
                                );
                            })}
                        </div>
                    )}
                </div>

                <div className={styles.footerHint}>
                    <span><span className={styles.kbd}>↑↓</span> 移動</span>
                    <span><span className={styles.kbd}>Enter</span> 開啟</span>
                    <span style={{ marginLeft: "auto" }}>
                        <span className={styles.kbd}>⌘</span>+<span className={styles.kbd}>K</span> 隨時呼叫
                    </span>
                </div>
            </div>
        </div>
    );
}
