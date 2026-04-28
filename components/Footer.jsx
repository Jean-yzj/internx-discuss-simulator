import Link from "next/link";
import styles from "./Footer.module.css";

/**
 * InternX-style footer (dark #222, white text). The simulator's footer
 * keeps the same visual language but has different links — pointing to
 * the demo repo + INTEGRATION.md instead of real legal pages.
 */
export default function Footer() {
    return (
        <footer className={styles.footer}>
            <div className={styles.center}>
                <div className={styles.brandColumn}>
                    <div className={styles.brandLogo} />
                    <p className={styles.brandTagline}>
                        實習通．話題討論模擬器。給技術人員預覽用的獨立 demo，獨立部署、獨立資料、獨立 GitHub repo。
                    </p>
                    <span className={styles.simChip}>
                        <i className="ri-flask-line" /> SIMULATOR · 預覽版
                    </span>
                </div>
                <div className={styles.column}>
                    <h4 className={styles.columnTitle}>探索</h4>
                    <li className={styles.columnLink}><Link href="/">話題首頁</Link></li>
                    <li className={styles.columnLink}><Link href="/polls">投票</Link></li>
                    <li className={styles.columnLink}><Link href="/survey">困擾調查</Link></li>
                    <li className={styles.columnLink}><Link href="/experts">認證專家</Link></li>
                </div>
                <div className={styles.column}>
                    <h4 className={styles.columnTitle}>行業論壇</h4>
                    <li className={styles.columnLink}><Link href="/forums/finance">金融業</Link></li>
                    <li className={styles.columnLink}><Link href="/forums/consulting">管顧業</Link></li>
                    <li className={styles.columnLink}><Link href="/forums/tech">科技業</Link></li>
                    <li className={styles.columnLink}><Link href="/forums/marketing">行銷／廣告</Link></li>
                </div>
                <div className={styles.column}>
                    <h4 className={styles.columnTitle}>給工程師</h4>
                    <li className={styles.columnLink}>
                        <a href="https://github.com/Jean-yzj/internx-discuss-simulator" target="_blank" rel="noreferrer">
                            <i className="ri-github-fill" /> GitHub Repo
                        </a>
                    </li>
                    <li className={styles.columnLink}>
                        <a href="https://github.com/Jean-yzj/internx-discuss-simulator/blob/main/INTEGRATION.md" target="_blank" rel="noreferrer">
                            <i className="ri-file-text-line" /> 整合手冊
                        </a>
                    </li>
                    <li className={styles.columnLink}>
                        <a href="https://github.com/Jean-yzj/internx-discuss-simulator/blob/main/README.md" target="_blank" rel="noreferrer">
                            <i className="ri-book-2-line" /> README
                        </a>
                    </li>
                </div>
            </div>
            <div className={styles.bottom}>
                <span>© 2026 實習通．話題模擬器</span>
                <span>不會碰到「實習通」主站任何資料 · 純 in-memory demo</span>
            </div>
        </footer>
    );
}
