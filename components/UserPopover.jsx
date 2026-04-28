import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { BadgeRow } from "./Badge";
import styles from "./UserPopover.module.css";

/**
 * Click an author name → floating card with their badges, bio, recent posts.
 *
 * Anonymous students don't have a user record on the server, so we just
 * show the snapshot data we already have on the topic / reply (badges,
 * brand, name). For badged authors we fetch the full user record.
 */
export default function UserPopover({
    children,
    authorId,
    authorName,
    authorBadges = [],
    authorBrand = null,
    className = "",
    style = {},
}) {
    const triggerRef = useRef(null);
    const [open, setOpen] = useState(false);
    const [pos, setPos] = useState({ top: 0, left: 0 });
    const [user, setUser] = useState(null);

    function show() {
        if (!triggerRef.current) return;
        const rect = triggerRef.current.getBoundingClientRect();
        const popoverWidth = 320;
        const left = Math.min(rect.left, window.innerWidth - popoverWidth - 16);
        const top = rect.bottom + 6;
        setPos({ top: Math.max(8, top), left: Math.max(8, left) });
        setOpen(true);
    }

    useEffect(() => {
        if (!open) return;
        // Try to fetch a real user record; if not found we render minimal info
        if (!authorId || authorId.startsWith("seed_") || authorId.startsWith("me_")) {
            // u_* userIds are real seed-user records
            if (!authorId?.startsWith("u_")) {
                setUser(null);
                return;
            }
        }
        let cancelled = false;
        (async () => {
            try {
                const res = await fetch(`/api/discuss/users`);
                const json = await res.json();
                if (!cancelled && json.ok) {
                    const u = json.users.find((x) => x.userId === authorId);
                    if (u) setUser(u);
                }
            } catch (err) { console.error(err); }
        })();
        return () => { cancelled = true; };
    }, [open, authorId]);

    function avatar(s) {
        if (!s) return "•";
        return s.trim().charAt(0).toUpperCase();
    }

    return (
        <>
            <button
                type="button"
                ref={triggerRef}
                className={`${styles.trigger} ${className}`}
                style={style}
                onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    show();
                }}
            >
                {children}
            </button>
            {open && (
                <>
                    <div className={styles.backdrop} onClick={() => setOpen(false)} />
                    <div
                        className={styles.popover}
                        style={{ top: pos.top, left: pos.left }}
                    >
                        <div className={styles.header}>
                            <div className={styles.avatar}>{user?.avatarSeed || avatar(user?.displayName || authorName)}</div>
                            <div className={styles.headerBody}>
                                <h3 className={styles.name}>{user?.displayName || authorName}</h3>
                                <span className={styles.handle}>
                                    @{(user?.userId || authorId || "anon").slice(-8)}
                                </span>
                                {(user?.badges || authorBadges).length > 0 && (
                                    <div className={styles.badges}>
                                        <BadgeRow
                                            badges={user?.badges || authorBadges}
                                            brand={user?.brand || authorBrand}
                                            size="small"
                                            limit={3}
                                        />
                                    </div>
                                )}
                            </div>
                        </div>

                        {user?.bio && <p className={styles.bio}>{user.bio}</p>}

                        {(user?.helpfulCount !== undefined || user?.joinedAt) && (
                            <>
                                <div className={styles.divider} />
                                <div className={styles.statsRow}>
                                    {user?.helpfulCount !== undefined && (
                                        <span><strong>{user.helpfulCount}</strong> 個 helpful</span>
                                    )}
                                    {user?.joinedAt && (
                                        <span>加入 <strong>{user.joinedAt}</strong></span>
                                    )}
                                </div>
                            </>
                        )}

                        <div className={styles.actions}>
                            <Link
                                href="/experts"
                                className={`${styles.linkBtn} ${user?.brand ? styles.linkBtnPrimary : ""}`}
                                onClick={() => setOpen(false)}
                            >
                                {user?.brand ? "看品牌頁" : "看認證專家"} <i className="ri-arrow-right-line" />
                            </Link>
                        </div>

                        {!user && (
                            <p className={styles.simNote}>
                                這位使用者沒有公開的個人頁。Demo 模式下匿名學生的留言不會建立 user 記錄。
                            </p>
                        )}
                    </div>
                </>
            )}
        </>
    );
}
