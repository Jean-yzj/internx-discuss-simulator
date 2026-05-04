export const NOTION_CATEGORY_OPTIONS = [
    "競賽獎金",
    "平台費",
    "租金",
    "營運收入",
    "交通費",
    "行銷廣告",
    "餐飲",
    "其他",
    "規費",
    "行銷",
    "硬體設備",
    "技術",
    "營運",
    "人事費",
    "諮詢",
    "手續費",
    "稅",
];

export const PAYMENT_METHOD_OPTIONS = [
    "現金",
    "信用卡",
    "銀行轉賬",
    "支票",
    "電子支付",
    "公司卡",
    "第三方支付",
];

export const BUDGET_SOURCE_OPTIONS = ["和泰", "Ustart", "競賽", "營運"];

export const TAX_ID_OPTIONS = ["和泰", "無統編", "公司統編"];

export const STATUS_PENDING = "待處理";

export function inferBudgetSource(projectName = "") {
    const text = String(projectName).toLowerCase();
    if (!text) return "營運";
    if (text.includes("競賽") || text.includes("比賽") || text.includes("獎")) return "競賽";
    if (text.includes("和泰")) return "和泰";
    if (text.includes("ustart")) return "Ustart";
    return "營運";
}

export function inferCategories({ item = "", department = "" }) {
    const text = `${item} ${department}`.toLowerCase();
    const categories = new Set();

    if (text.includes("平台")) categories.add("平台費");
    if (text.includes("餐")) categories.add("餐飲");
    if (text.includes("交通")) categories.add("交通費");
    if (text.includes("廣告")) categories.add("行銷廣告");
    if (text.includes("行銷")) categories.add("行銷");
    if (text.includes("租")) categories.add("租金");
    if (text.includes("規費")) categories.add("規費");
    if (text.includes("手續")) categories.add("手續費");
    if (text.includes("稅")) categories.add("稅");
    if (text.includes("硬體") || text.includes("設備")) categories.add("硬體設備");
    if (text.includes("諮詢")) categories.add("諮詢");
    if (text.includes("人事")) categories.add("人事費");
    if (text.includes("技術") || text.includes("cloud") || text.includes("netlify") || text.includes("cursor")) {
        categories.add("技術");
    }
    if (text.includes("營運")) categories.add("營運");

    if (categories.size === 0) categories.add("其他");

    return NOTION_CATEGORY_OPTIONS.filter((option) => categories.has(option));
}

export function buildTransactionName({ item = "", purpose = "", projectName = "" }) {
    const trimmedItem = String(item).trim();
    const trimmedPurpose = String(purpose).trim();
    const trimmedProject = String(projectName).trim();
    const titleParts = [trimmedItem || "內部請款"];

    if (trimmedPurpose) titleParts.push(trimmedPurpose);
    if (trimmedProject) titleParts.push(`(${trimmedProject})`);

    return titleParts.join(" - ").slice(0, 120);
}
