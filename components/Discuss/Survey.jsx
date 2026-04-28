import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import styles from "./Survey.module.css";

export default function Survey({ profile, onSubmitted }) {
    const router = useRouter();
    const [definitions, setDefinitions] = useState([]);
    const [stats, setStats] = useState(null);
    const [step, setStep] = useState("pick"); // pick → intensity → done
    const [selected, setSelected] = useState([]);
    const [intensities, setIntensities] = useState({}); // id -> 1..5
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState("");

    // If user already completed the survey, jump straight to results
    useEffect(() => {
        if (profile?.painPoints && Array.isArray(profile.painPoints.painPoints) && profile.painPoints.painPoints.length > 0) {
            const ids = profile.painPoints.painPoints.map((p) => p.id);
            const inten = {};
            for (const p of profile.painPoints.painPoints) inten[p.id] = p.intensity;
            setSelected(ids);
            setIntensities(inten);
            setStep("done");
        }
    }, [profile]);

    useEffect(() => {
        (async () => {
            try {
                const res = await fetch("/api/discuss/pain-points");
                const json = await res.json();
                if (json.ok) setDefinitions(json.painPoints);
            } catch (err) { console.error(err); }
        })();
    }, []);

    useEffect(() => {
        if (step !== "done") return;
        (async () => {
            try {
                const res = await fetch("/api/discuss/pain-points/stats");
                const json = await res.json();
                if (json.ok) setStats(json);
            } catch (err) { console.error(err); }
        })();
    }, [step]);

    function togglePainPoint(id) {
        setSelected((curr) => {
            if (curr.includes(id)) {
                const next = curr.filter((x) => x !== id);
                const ni = { ...intensities };
                delete ni[id];
                setIntensities(ni);
                return next;
            }
            if (curr.length >= 5) return curr; // cap at 5 for clarity
            setIntensities((p) => ({ ...p, [id]: 3 }));
            return [...curr, id];
        });
    }

    async function submit() {
        if (selected.length === 0) return;
        setSubmitting(true);
        setError("");
        try {
            const payload = selected.map((id) => ({ id, intensity: intensities[id] || 3 }));
            const res = await fetch("/api/discuss/pain-points", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ userId: profile.userId, painPoints: payload }),
            });
            const json = await res.json();
            if (!json.ok) throw new Error(json.error || "submit failed");
            onSubmitted?.(payload);
            setStep("done");
        } catch (err) {
            setError(err.message || "送出失敗");
        } finally {
            setSubmitting(false);
        }
    }

    if (step === "done") {
        return (
            <div className={styles.page}>
                <div className={styles.inner}>
                    <div className={styles.crumbs}>
                        <Link href="/">← 回到首頁</Link>
                    </div>

                    <div className={styles.resultsHero}>
                        <h2 className={styles.resultsHeroTitle}>
                            你勾選了 {selected.length} 個困擾
                        </h2>
                        <p className={styles.resultsHeroSubtitle}>
                            我們已經根據你的回答調整推薦內容。回到首頁就能看到「為你推薦」的話題與行業論壇。
                        </p>
                    </div>

                    {/* Your top picks */}
                    <div className={styles.resultsCard}>
                        <h3>📌 你的困擾排行</h3>
                        {selected
                            .map((id) => ({
                                def: definitions.find((d) => d.id === id),
                                intensity: intensities[id] || 3,
                            }))
                            .filter((x) => x.def)
                            .sort((a, b) => b.intensity - a.intensity)
                            .map(({ def, intensity }) => (
                                <div key={def.id} className={styles.painStat}>
                                    <div className={styles.painStatEmoji}>{def.emoji}</div>
                                    <div className={styles.painStatBody}>
                                        <div className={styles.painStatLabel}>{def.label}</div>
                                        <div className={styles.painStatBar}>
                                            <div className={styles.painStatBarFill} style={{ width: `${intensity * 20}%` }} />
                                        </div>
                                    </div>
                                    <div className={styles.painStatPct}>{intensity}/5</div>
                                </div>
                            ))}
                    </div>

                    {/* Aggregate stats */}
                    <div className={styles.resultsCard}>
                        <h3>📊 全站學生最大困擾 Top 10</h3>
                        {!stats ? (
                            <div style={{ color: "#888", fontSize: 13 }}>載入中⋯⋯</div>
                        ) : (
                            <>
                                {stats.items.slice(0, 10).map((p) => {
                                    const isMine = selected.includes(p.id);
                                    return (
                                        <div key={p.id} className={styles.painStat}>
                                            <div className={styles.painStatEmoji}>{p.emoji}</div>
                                            <div className={styles.painStatBody}>
                                                <div className={styles.painStatLabel}>
                                                    {p.label}
                                                    {isMine && <span className={styles.painStatMine}>你也勾了</span>}
                                                </div>
                                                <div className={styles.painStatBar}>
                                                    <div className={styles.painStatBarFill} style={{ width: `${Math.max(2, p.sharePct)}%` }} />
                                                </div>
                                            </div>
                                            <div className={styles.painStatPct}>{p.sharePct}%</div>
                                        </div>
                                    );
                                })}
                                <div className={styles.notice}>
                                    📈 共 {stats.respondents} 位學生填過這份調查。比例 = 該困擾被多少人勾選。
                                </div>
                            </>
                        )}
                    </div>

                    <div className={styles.actions}>
                        <button
                            type="button"
                            className={styles.ghostBtn}
                            onClick={() => {
                                setStep("pick");
                                setSelected([]);
                                setIntensities({});
                            }}
                        >
                            重新填寫
                        </button>
                        <button
                            type="button"
                            className={styles.primaryBtn}
                            onClick={() => router.push("/")}
                        >
                            看為你推薦的話題 <i className="ri-arrow-right-line" />
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    if (step === "intensity") {
        return (
            <div className={styles.page}>
                <div className={styles.inner}>
                    <div className={styles.crumbs}>
                        <Link href="/">← 回到首頁</Link>
                    </div>
                    <div className={styles.hero}>
                        <span className={styles.heroBadge}>困擾調查</span>
                        <h1 className={styles.heroTitle}>每個困擾對你的影響有多大？</h1>
                        <p className={styles.heroSubtitle}>
                            1 = 偶爾困擾、5 = 嚴重影響我每天的狀態。我們會用這個排序你的「為你推薦」內容。
                        </p>
                    </div>

                    <div className={styles.surveyForm}>
                        <p className={styles.stepLabel}>2 / 2</p>
                        <h2 className={styles.stepTitle}>標記強度</h2>
                        <p className={styles.stepHelp}>滑動或點擊 1-5。</p>

                        <div className={styles.intensityRow}>
                            {selected.map((id) => {
                                const def = definitions.find((d) => d.id === id);
                                if (!def) return null;
                                const value = intensities[id] || 3;
                                return (
                                    <div key={id} className={styles.intensityCard}>
                                        <div className={styles.intensityHeader}>
                                            <span style={{ fontSize: 20 }}>{def.emoji}</span>
                                            <strong>{def.label}</strong>
                                        </div>
                                        <div className={styles.intensityRange}>
                                            {[1, 2, 3, 4, 5].map((n) => (
                                                <button
                                                    key={n}
                                                    type="button"
                                                    className={`${styles.intensityBtn} ${value === n ? styles.intensityBtnActive : ""}`}
                                                    onClick={() => setIntensities((p) => ({ ...p, [id]: n }))}
                                                >
                                                    {n}
                                                </button>
                                            ))}
                                        </div>
                                        <div className={styles.intensityLabels}>
                                            <span>偶爾</span>
                                            <span>很嚴重</span>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        {error && <div style={{ color: "#c43e3e", marginTop: 12 }}>{error}</div>}

                        <div className={styles.actions}>
                            <button
                                type="button"
                                className={styles.ghostBtn}
                                onClick={() => setStep("pick")}
                                disabled={submitting}
                            >
                                ← 上一步
                            </button>
                            <button
                                type="button"
                                className={styles.primaryBtn}
                                onClick={submit}
                                disabled={submitting}
                            >
                                {submitting ? "送出中⋯⋯" : "完成調查 →"}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // step === "pick"
    return (
        <div className={styles.page}>
            <div className={styles.inner}>
                <div className={styles.crumbs}>
                    <Link href="/">← 回到首頁</Link>
                </div>
                <div className={styles.hero}>
                    <span className={styles.heroBadge}>困擾調查 · 約 1 分鐘</span>
                    <h1 className={styles.heroTitle}>什麼讓你最困擾？</h1>
                    <p className={styles.heroSubtitle}>
                        告訴我們你最近最頭痛的 1-5 件事，我們會把<strong>有同樣困擾的學長姐怎麼解</strong>放在你的首頁。
                    </p>
                </div>

                <div className={styles.surveyForm}>
                    <p className={styles.stepLabel}>1 / 2 · 已選 {selected.length}/5</p>
                    <h2 className={styles.stepTitle}>勾選最有共鳴的困擾</h2>
                    <p className={styles.stepHelp}>最多選 5 個。</p>

                    <div className={styles.painGrid}>
                        {definitions.map((p) => {
                            const active = selected.includes(p.id);
                            const disabled = !active && selected.length >= 5;
                            return (
                                <button
                                    key={p.id}
                                    type="button"
                                    className={`${styles.painCard} ${active ? styles.painCardActive : ""}`}
                                    onClick={() => togglePainPoint(p.id)}
                                    disabled={disabled}
                                    style={disabled ? { opacity: 0.4, cursor: "not-allowed" } : undefined}
                                    aria-pressed={active}
                                >
                                    <span className={styles.painEmoji}>{p.emoji}</span>
                                    <span className={styles.painLabel}>{p.label}</span>
                                    {active && <span className={styles.painCheck}><i className="ri-check-line" /></span>}
                                </button>
                            );
                        })}
                    </div>

                    <div className={styles.actions}>
                        <Link href="/" className={styles.ghostBtn}>
                            稍後再說
                        </Link>
                        <button
                            type="button"
                            className={styles.primaryBtn}
                            disabled={selected.length === 0}
                            onClick={() => setStep("intensity")}
                        >
                            下一步 →
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
