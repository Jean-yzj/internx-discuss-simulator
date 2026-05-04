import {
    STATUS_PENDING,
    buildTransactionName,
    inferBudgetSource,
    inferCategories,
} from "@/lib/accounting";

const NOTION_API_URL = "https://api.notion.com/v1/pages";
const NOTION_VERSION = "2026-03-11";
const DEFAULT_DATA_SOURCE_ID = "26a01840-88bc-8101-8a2f-000bfeb2a44f";

function readString(value) {
    return String(value || "").trim();
}

function normalizeAmount(value) {
    const amount = Number(String(value).replace(/,/g, "").trim());
    return Number.isFinite(amount) ? amount : NaN;
}

function normalizeDate(value) {
    const date = readString(value);
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return "";
    return date;
}

function isValidUrl(value) {
    try {
        const url = new URL(value);
        return url.protocol === "http:" || url.protocol === "https:";
    } catch {
        return false;
    }
}

function parseUserMap() {
    try {
        const raw = process.env.NOTION_USER_MAP_JSON;
        if (!raw) return {};
        const parsed = JSON.parse(raw);
        return parsed && typeof parsed === "object" ? parsed : {};
    } catch {
        return {};
    }
}

function buildRichText(content) {
    if (!content) return [];
    return [{ type: "text", text: { content: String(content).slice(0, 1900) } }];
}

function resolvePersonIds({ submitterEmail, submitterName }) {
    const userMap = parseUserMap();
    const matchedId = userMap[submitterEmail] || userMap[submitterName];
    return matchedId ? [{ id: matchedId }] : [];
}

function buildProperties(payload) {
    const categories = Array.isArray(payload.categories) && payload.categories.length
        ? payload.categories
        : inferCategories({ item: payload.item, department: payload.department });
    const budgetSource = payload.budgetSource || inferBudgetSource(payload.projectName);
    const personIds = resolvePersonIds(payload);
    const noteParts = [
        `填單時間：${new Date().toLocaleString("zh-TW", { timeZone: "Asia/Taipei" })}`,
        `請款人：${payload.submitterName}`,
        `Email：${payload.submitterEmail}`,
        `部門：${payload.department}`,
        `項目：${payload.item}`,
        `用途：${payload.purpose}`,
        payload.projectName ? `所屬專案 / 比賽：${payload.projectName}` : "",
        payload.bankInfo ? `匯款資訊：${payload.bankInfo}` : "",
        payload.receiptNumber ? `收據編號：${payload.receiptNumber}` : "",
        `原始表單聲明：${payload.statement}`,
    ].filter(Boolean);

    const properties = {
        "交易名稱": {
            title: buildRichText(buildTransactionName(payload)),
        },
        "收入/支出": {
            select: { name: payload.incomeType || "支出" },
        },
        "金額": {
            number: payload.amount,
        },
        "日期": {
            date: { start: payload.expenseDate },
        },
        "付款方式": {
            select: { name: payload.paymentMethod || "銀行轉賬" },
        },
        "花哪邊的錢": {
            select: { name: budgetSource },
        },
        "統編": {
            select: { name: payload.taxIdType || "無統編" },
        },
        "類別": {
            multi_select: categories.map((name) => ({ name })),
        },
        "文字": {
            rich_text: buildRichText(payload.purpose),
        },
        "備註": {
            rich_text: buildRichText(noteParts.join("\n")),
        },
        "代墊請款": {
            status: { name: payload.reimbursementStatus || STATUS_PENDING },
        },
        "狀態（付出去了嗎）": {
            status: { name: payload.settlementStatus || STATUS_PENDING },
        },
        "收據編號": {
            rich_text: buildRichText(payload.receiptNumber),
        },
    };

    if (payload.receiptUrl) {
        properties["附件"] = {
            files: [
                {
                    name: "請款憑證",
                    type: "external",
                    external: { url: payload.receiptUrl },
                },
            ],
        };
    }

    if (personIds.length > 0) {
        properties["經手人"] = {
            people: personIds,
        };
    }

    return properties;
}

function validatePayload(body) {
    const payload = {
        submitterEmail: readString(body.submitterEmail),
        submitterName: readString(body.submitterName),
        department: readString(body.department),
        item: readString(body.item),
        purpose: readString(body.purpose),
        expenseDate: normalizeDate(body.expenseDate),
        amount: normalizeAmount(body.amount),
        receiptUrl: readString(body.receiptUrl),
        projectName: readString(body.projectName),
        bankInfo: readString(body.bankInfo),
        statement: readString(body.statement),
        paymentMethod: readString(body.paymentMethod),
        budgetSource: readString(body.budgetSource),
        taxIdType: readString(body.taxIdType),
        receiptNumber: readString(body.receiptNumber),
        incomeType: readString(body.incomeType) || "支出",
        reimbursementStatus: readString(body.reimbursementStatus) || STATUS_PENDING,
        settlementStatus: readString(body.settlementStatus) || STATUS_PENDING,
        categories: Array.isArray(body.categories) ? body.categories.map(readString).filter(Boolean) : [],
    };

    if (!payload.submitterEmail) return { error: "請填寫 Email。" };
    if (!payload.submitterName) return { error: "請填寫姓名。" };
    if (!payload.department) return { error: "請填寫部門。" };
    if (!payload.item) return { error: "請填寫項目。" };
    if (!payload.purpose) return { error: "請填寫支出用途說明。" };
    if (!payload.expenseDate) return { error: "請填寫有效的支出日期。" };
    if (!Number.isFinite(payload.amount) || payload.amount <= 0) return { error: "請填寫有效的請款金額。" };
    if (!payload.receiptUrl || !isValidUrl(payload.receiptUrl)) return { error: "請提供有效的憑證連結。" };
    if (!payload.bankInfo) return { error: "請填寫匯款資訊。" };
    if (!payload.statement) return { error: "請確認請款聲明。" };

    return { payload };
}

export default async function handler(req, res) {
    if (req.method !== "POST") {
        res.setHeader("Allow", "POST");
        return res.status(405).json({ error: "Method not allowed" });
    }

    const notionToken = process.env.NOTION_TOKEN;
    const dataSourceId = process.env.NOTION_ACCOUNTING_DATA_SOURCE_ID || DEFAULT_DATA_SOURCE_ID;

    if (!notionToken) {
        return res.status(500).json({
            error: "尚未設定 NOTION_TOKEN，請先把 Notion integration token 放進環境變數。",
        });
    }

    const { payload, error } = validatePayload(req.body || {});
    if (error) {
        return res.status(400).json({ error });
    }

    try {
        const response = await fetch(NOTION_API_URL, {
            method: "POST",
            headers: {
                Authorization: `Bearer ${notionToken}`,
                "Content-Type": "application/json",
                "Notion-Version": NOTION_VERSION,
            },
            body: JSON.stringify({
                parent: {
                    type: "data_source_id",
                    data_source_id: dataSourceId,
                },
                properties: buildProperties(payload),
            }),
        });

        const result = await response.json();

        if (!response.ok) {
            const notionMessage = result?.message || "Notion API 回傳錯誤。";
            return res.status(response.status).json({ error: notionMessage });
        }

        return res.status(200).json({
            ok: true,
            notionPageUrl: result.url,
            notionPageId: result.id,
        });
    } catch (submissionError) {
        return res.status(500).json({
            error: submissionError instanceof Error ? submissionError.message : "送單失敗，請稍後再試。",
        });
    }
}
