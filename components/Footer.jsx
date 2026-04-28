import Link from "next/link";
import styles from "./Footer.module.css";

/**
 * Footer mirrored from InternX main site Footer.jsx — same layout, same
 * social icons, same link columns. The simulator only swaps in:
 *   - the SIMULATOR chip (so reviewers know this isn't prod)
 *   - one extra "給工程師" column linking to GitHub repo + INTEGRATION.md
 *
 * When this gets ported back into the main repo, just delete the chip
 * and the engineer column — the rest is already aligned with main-site
 * config.js (FOOTER_COLUMNS + FOOTER_SOCIAL_LINKS).
 */
const FOOTER_COLUMNS = [
    {
        title: "實習通．話題",
        links: [
            { to: "/", text: "話題首頁" },
            { to: "/polls", text: "本週投票" },
            { to: "/survey", text: "困擾調查" },
            { to: "/experts", text: "認證專家" },
        ],
    },
    {
        title: "行業論壇",
        links: [
            { to: "/forums/finance", text: "金融業" },
            { to: "/forums/consulting", text: "管顧業" },
            { to: "/forums/tech", text: "科技業" },
            { to: "/forums/marketing", text: "行銷／廣告" },
        ],
    },
    {
        title: "給工程師",
        links: [
            { to: "https://github.com/Jean-yzj/internx-discuss-simulator", text: "GitHub Repo", external: true },
            { to: "https://github.com/Jean-yzj/internx-discuss-simulator/blob/main/INTEGRATION.md", text: "整合手冊", external: true },
            { to: "https://github.com/Jean-yzj/internx-discuss-simulator/blob/main/FORUM_INTEGRATION.md", text: "論壇整合說明", external: true },
        ],
    },
];

const FOOTER_SOCIAL_LINKS = [
    { iconName: "instagram-line", url: "https://instagram.com/internx.me", title: "@internx.me" },
    { iconName: "mail-line", url: "mailto:internx.me@gmail.com", title: "internx.me@gmail.com" },
    { iconName: "line-line", url: "https://line.me/ti/g2/jYgS-7nytcXt_T_ejgNiN98p6dqrmowfdKxRoA", title: "LINE 群組" },
];

export default function Footer() {
    return (
        <footer className={styles.footer}>
            <div className={styles.center}>
                <div className={styles.inner}>
                    {/* Logo + tagline + social — same as main-site */}
                    <div className={styles.logoRegion}>
                        <div className={styles.logoImg} />
                        <div className={styles.tagline}>
                            &nbsp;&nbsp;從實習出發，
                            <br />
                            &nbsp;&nbsp;通往理想職涯。
                        </div>
                        <div className={styles.socialLinks}>
                            {FOOTER_SOCIAL_LINKS.map((s) => (
                                <a
                                    key={s.iconName}
                                    href={s.url}
                                    target="_blank"
                                    rel="noreferrer"
                                    className={styles.socialIcon}
                                    title={s.title}
                                    aria-label={s.title}
                                >
                                    <i className={`ri-${s.iconName}`} />
                                </a>
                            ))}
                        </div>
                        <div>
                            <span className={styles.simChip}>
                                <i className="ri-flask-line" /> SIMULATOR · 預覽版
                            </span>
                        </div>
                    </div>

                    {FOOTER_COLUMNS.map((col, idx) => (
                        <div key={idx} className={styles.column}>
                            <h3 className={styles.columnTitle}>{col.title}</h3>
                            <ul className={styles.columnList}>
                                {col.links.map((link, i) => (
                                    <li key={i} className={styles.columnLink}>
                                        {link.external ? (
                                            <a href={link.to} target="_blank" rel="noreferrer">
                                                {link.text}
                                            </a>
                                        ) : (
                                            <Link prefetch={false} href={link.to}>{link.text}</Link>
                                        )}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>
            </div>
            <div className={styles.bottom}>
                <div className={styles.bottomLeft}>
                    &copy; 2026 實習通．話題模擬器
                </div>
                <div className={styles.bottomRight}>
                    <a href="mailto:internx.me@gmail.com">internx.me@gmail.com</a>
                </div>
            </div>
        </footer>
    );
}
