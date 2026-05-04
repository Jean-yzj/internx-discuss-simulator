import { useEffect, useState } from "react";
import Head from "next/head";
import styles from "@/components/AccountingForm.module.css";
import {
    BUDGET_SOURCE_OPTIONS,
    NOTION_CATEGORY_OPTIONS,
    PAYMENT_METHOD_OPTIONS,
    STATUS_PENDING,
    TAX_ID_OPTIONS,
    inferBudgetSource,
    inferCategories,
} from "@/lib/accounting";

const INITIAL_FORM = {
    submitterEmail: "",
    submitterName: "",
    department: "",
    item: "",
    purpose: "",
    expenseDate: "",
    amount: "",
    receiptUrl: "",
    projectName: "",
    bankInfo: "",
    statementAccepted: false,
    paymentMethod: "銀行轉賬",
    budgetSource: "營運",
    taxIdType: "無統編",
    receiptNumber: "",
    categories: ["其他"],
};

function toggleCategory(selected, category) {
    if (selected.includes(category)) {
        const next = selected.filter((item) => item !== category);
        return next.length > 0 ? next : ["其他"];
    }
    return [...selected.filter((item) => item !== "其他"), category];
}

export default function AccountingPage() {
    const [form, setForm] = useState(INITIAL_FORM);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState(null);
    const [categoryTouched, setCategoryTouched] = useState(false);
    const [budgetTouched, setBudgetTouched] = useState(false);

    useEffect(() => {
        if (!categoryTouched) {
            setForm((current) => ({
                ...current,
                categories: inferCategories({
                    item: current.item,
                    department: current.department,
                }),
            }));
        }
    }, [form.item, form.department, categoryTouched]);

    useEffect(() => {
        if (!budgetTouched) {
            setForm((current) => ({
                ...current,
                budgetSource: inferBudgetSource(current.projectName),
            }));
        }
    }, [form.projectName, budgetTouched]);

    function updateField(key, value) {
        setForm((current) => ({ ...current, [key]: value }));
    }

    async function handleSubmit(event) {
        event.preventDefault();
        setSubmitting(true);
        setError("");
        setSuccess(null);

        try {
            const response = await fetch("/api/accounting/submit", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    ...form,
                    amount: Number(form.amount),
                    statement: form.statementAccepted
                        ? "本人確認以上資料屬實，所請款項目確實為實習通 InternX 相關支出，並同意團隊依內部協議進行審核與撥款。"
                        : "",
                    incomeType: "支出",
                    reimbursementStatus: STATUS_PENDING,
                    settlementStatus: STATUS_PENDING,
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || "送出失敗，請稍後再試。");
            }

            setSuccess(data);
            setForm(INITIAL_FORM);
            setCategoryTouched(false);
            setBudgetTouched(false);
        } catch (submitError) {
            setError(submitError instanceof Error ? submitError.message : "送出失敗，請稍後再試。");
        } finally {
            setSubmitting(false);
        }
    }

    return (
        <>
            <Head>
                <title>InternX 內部記帳工具</title>
                <meta name="description" content="團隊內部請款表單，送出後自動寫入 Notion 公司帳目資料庫。" />
            </Head>
            <main className={styles.page}>
                <div className={styles.shell}>
                    <div>
                        <section className={styles.hero}>
                            <div className={styles.eyebrow}>InternX Internal Accounting</div>
                            <h1>團隊內部記帳，一次填完就自動進 Notion</h1>
                            <p>
                                這個版本保留原本 Google 表單的核心欄位，送出後會自動對應到你現在的
                                Notion「公司帳目 (新)」資料庫。憑證目前採連結上傳，最適合貼 Google Drive、
                                Dropbox 或任何可公開讀取的檔案網址。
                            </p>
                        </section>

                        <form className={styles.panel} onSubmit={handleSubmit}>
                            <section className={styles.section}>
                                <h2 className={styles.sectionTitle}>請款人資料</h2>
                                <p className={styles.sectionHint}>這一段對應原本表單的 Email、姓名、部門。</p>
                                <div className={styles.grid}>
                                    <div className={styles.field}>
                                        <label htmlFor="submitterEmail">Email<span className={styles.required}>*</span></label>
                                        <input id="submitterEmail" type="email" value={form.submitterEmail} onChange={(e) => updateField("submitterEmail", e.target.value)} required />
                                    </div>
                                    <div className={styles.field}>
                                        <label htmlFor="submitterName">姓名<span className={styles.required}>*</span></label>
                                        <input id="submitterName" value={form.submitterName} onChange={(e) => updateField("submitterName", e.target.value)} required />
                                    </div>
                                    <div className={styles.field}>
                                        <label htmlFor="department">部門<span className={styles.required}>*</span></label>
                                        <input id="department" value={form.department} onChange={(e) => updateField("department", e.target.value)} placeholder="例如：技術、營運、行銷" required />
                                    </div>
                                    <div className={styles.field}>
                                        <label htmlFor="projectName">所屬專案 / 比賽名稱</label>
                                        <input id="projectName" value={form.projectName} onChange={(e) => updateField("projectName", e.target.value)} placeholder="沒有可留白" />
                                    </div>
                                </div>
                            </section>

                            <section className={styles.section}>
                                <h2 className={styles.sectionTitle}>支出內容</h2>
                                <p className={styles.sectionHint}>這一段是送進 Notion 的主要帳目資訊。</p>
                                <div className={styles.grid}>
                                    <div className={styles.field}>
                                        <label htmlFor="item">項目<span className={styles.required}>*</span></label>
                                        <input id="item" value={form.item} onChange={(e) => updateField("item", e.target.value)} placeholder="例如：平台費用、餐飲、交通費" required />
                                    </div>
                                    <div className={styles.field}>
                                        <label htmlFor="expenseDate">支出日期<span className={styles.required}>*</span></label>
                                        <input id="expenseDate" type="date" value={form.expenseDate} onChange={(e) => updateField("expenseDate", e.target.value)} required />
                                    </div>
                                    <div className={styles.field}>
                                        <label htmlFor="amount">請款金額（TWD）<span className={styles.required}>*</span></label>
                                        <input id="amount" type="number" min="1" step="1" value={form.amount} onChange={(e) => updateField("amount", e.target.value)} required />
                                    </div>
                                    <div className={styles.field}>
                                        <label htmlFor="paymentMethod">付款方式</label>
                                        <select id="paymentMethod" value={form.paymentMethod} onChange={(e) => updateField("paymentMethod", e.target.value)}>
                                            {PAYMENT_METHOD_OPTIONS.map((option) => (
                                                <option key={option} value={option}>{option}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className={`${styles.field} ${styles.full}`}>
                                        <label htmlFor="purpose">支出用途說明<span className={styles.required}>*</span></label>
                                        <textarea id="purpose" value={form.purpose} onChange={(e) => updateField("purpose", e.target.value)} placeholder="請盡量描述清楚，這段會同步到 Notion 的文字 / 備註欄位。" required />
                                    </div>
                                    <div className={`${styles.field} ${styles.full}`}>
                                        <label htmlFor="receiptUrl">憑證連結<span className={styles.required}>*</span></label>
                                        <input id="receiptUrl" type="url" value={form.receiptUrl} onChange={(e) => updateField("receiptUrl", e.target.value)} placeholder="貼上 Google Drive / Dropbox / 圖床連結" required />
                                        <p className={styles.fieldHelp}>目前為了穩定同步到 Notion，憑證採網址方式附上。</p>
                                    </div>
                                    <div className={styles.field}>
                                        <label htmlFor="receiptNumber">收據編號</label>
                                        <input id="receiptNumber" value={form.receiptNumber} onChange={(e) => updateField("receiptNumber", e.target.value)} placeholder="有的話再填" />
                                    </div>
                                    <div className={styles.field}>
                                        <label htmlFor="taxIdType">統編需求</label>
                                        <select id="taxIdType" value={form.taxIdType} onChange={(e) => updateField("taxIdType", e.target.value)}>
                                            {TAX_ID_OPTIONS.map((option) => (
                                                <option key={option} value={option}>{option}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                            </section>

                            <section className={styles.section}>
                                <h2 className={styles.sectionTitle}>匯款與 Notion 對應</h2>
                                <p className={styles.sectionHint}>這一段是把 Google 表單欄位補進你現有的 Notion 結構。</p>
                                <div className={styles.grid}>
                                    <div className={`${styles.field} ${styles.full}`}>
                                        <label htmlFor="bankInfo">匯款資訊<span className={styles.required}>*</span></label>
                                        <textarea id="bankInfo" value={form.bankInfo} onChange={(e) => updateField("bankInfo", e.target.value)} placeholder="例如：玉山銀行 808 / 帳號後五碼 12345 / 戶名 王小明" required />
                                    </div>
                                    <div className={styles.field}>
                                        <div className={styles.labelRow}>
                                            <label htmlFor="budgetSource">花哪邊的錢</label>
                                            <span className={styles.fieldHelp}>會依專案名稱自動猜</span>
                                        </div>
                                        <select
                                            id="budgetSource"
                                            value={form.budgetSource}
                                            onChange={(e) => {
                                                setBudgetTouched(true);
                                                updateField("budgetSource", e.target.value);
                                            }}
                                        >
                                            {BUDGET_SOURCE_OPTIONS.map((option) => (
                                                <option key={option} value={option}>{option}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className={`${styles.field} ${styles.full}`}>
                                        <div className={styles.labelRow}>
                                            <span className={styles.checkboxLegend}>類別</span>
                                            <span className={styles.fieldHelp}>會依項目 / 部門自動帶建議值</span>
                                        </div>
                                        <div className={styles.chipGroup}>
                                            {NOTION_CATEGORY_OPTIONS.map((category) => (
                                                <label key={category} className={styles.chip}>
                                                    <input
                                                        type="checkbox"
                                                        checked={form.categories.includes(category)}
                                                        onChange={() => {
                                                            setCategoryTouched(true);
                                                            updateField("categories", toggleCategory(form.categories, category));
                                                        }}
                                                    />
                                                    <span>{category}</span>
                                                </label>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </section>

                            <section className={styles.section}>
                                <div className={styles.statement}>
                                    <input
                                        id="statementAccepted"
                                        type="checkbox"
                                        checked={form.statementAccepted}
                                        onChange={(e) => updateField("statementAccepted", e.target.checked)}
                                        required
                                    />
                                    <label className={styles.statementText} htmlFor="statementAccepted">
                                        本人確認以上資料屬實，所請款項目確實為實習通 InternX 相關支出，並同意團隊依內部協議進行審核與撥款。
                                    </label>
                                </div>

                                <div className={styles.actions}>
                                    <button className={styles.submitBtn} type="submit" disabled={submitting}>
                                        {submitting ? "送出中..." : "送出並同步到 Notion"}
                                    </button>
                                    {error ? <span className={`${styles.statusText} ${styles.error}`}>{error}</span> : null}
                                    {success ? (
                                        <span className={`${styles.statusText} ${styles.success}`}>
                                            已成功送出。
                                            {success.notionPageUrl ? (
                                                <>
                                                    {" "}
                                                    <a href={success.notionPageUrl} target="_blank" rel="noreferrer">查看 Notion 頁面</a>
                                                </>
                                            ) : null}
                                        </span>
                                    ) : null}
                                </div>
                            </section>
                        </form>
                    </div>

                    <aside className={styles.aside}>
                        <section className={styles.asideCard}>
                            <h2>目前同步規則</h2>
                            <ul>
                                <li>建立到 Notion 的資料庫：公司帳目 (新)</li>
                                <li>交易名稱會由「項目 + 用途 + 專案名稱」自動組成</li>
                                <li>收入/支出固定寫入「支出」</li>
                                <li>代墊請款與付款狀態預設都是「待處理」</li>
                                <li>請款人、匯款資訊、原始聲明會保留在備註欄位</li>
                            </ul>
                        </section>

                        <section className={styles.asideCard}>
                            <h2>你需要先設定</h2>
                            <p>在部署環境加上 <code>NOTION_TOKEN</code>，並把該 integration share 進你的 Notion 資料庫。</p>
                            <p>如果要讓「經手人」自動對到 Notion 成員，可以另外設定 <code>NOTION_USER_MAP_JSON</code>。</p>
                            <div className={styles.pillRow}>
                                <span className={styles.pill}>NOTION_TOKEN</span>
                                <span className={styles.pill}>NOTION_USER_MAP_JSON</span>
                                <span className={styles.pill}>NOTION_ACCOUNTING_DATA_SOURCE_ID</span>
                            </div>
                        </section>

                        <section className={styles.asideCard}>
                            <h2>目前參考來源</h2>
                            <p>
                                Google Sheet：
                                {" "}
                                <a href="https://docs.google.com/spreadsheets/d/1RgBS2wzT3Kx90y1osOKkJoIrVvKSCiVRj6GdZ2Vvjvk/edit?usp=sharing" target="_blank" rel="noreferrer">
                                    原始請款回覆表
                                </a>
                            </p>
                            <p>
                                Notion：
                                {" "}
                                <a href="https://www.notion.so/26a0184088bc807da712d4981033b77f" target="_blank" rel="noreferrer">
                                    公司記帳（新）
                                </a>
                            </p>
                        </section>
                    </aside>
                </div>
            </main>
        </>
    );
}
