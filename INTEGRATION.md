# 把這個 simulator 接回「實習通」主站的指南

> 給工程師看的整合手冊。本檔說明這份 demo 跟 `internx-me/frontend` 主站如何對齊、有哪些東西可以直接搬、有哪些東西需要改成 Firestore 版本。

這份 simulator 的設計目標是 **「外觀完全對齊主站，後端用 in-memory 替代 Firestore」**。所以視覺、字體、配色、TopBar、Badge taxonomy 都跟主站同步。整合時的工作主要是：

1. 把 `lib/store.js` 裡的純函式拆掉，改成 Firestore 操作（`BaseModelController` 模式）
2. 把 `lib/profile.js` 的 demo profile 改成 InternX 既有的 `Profile` 物件
3. 把 React 元件 + CSS 直接搬進 `components/Discuss/`
4. 把 Pages 放到 `pages/[lang]/discuss/...`

---

## 一、視覺與設計：已對齊主站

| 項目 | Demo | InternX 主站 | 狀態 |
|---|---|---|---|
| 主色 | `#0182fd` | `#0182fd` | ✅ 一致 |
| 主色（深） | `#1861a8` | `#1861a8` | ✅ 一致 |
| 互補色 | `#e2a200` | `#e2a200` | ✅ 一致 |
| 字體 | Poppins + Noto Sans TC | Poppins + Noto Sans TC | ✅ 一致 |
| 字級系統 | `calc(var(--font-size) / N)` | 同左 | ✅ 一致 |
| TopBar 高度 | 64px | 64px | ✅ 一致 |
| TopBar 底邊 | 1px solid #e5e5e5 | 同左 | ✅ 一致 |
| Logo | `/internx-logo-long-black.svg`（複製自主站） | 同檔案 | ✅ 一致 |
| 膠囊分頁 | 50px radius、`#f3f4f6` 灰底、`#0182fd` 藍底 active | 同左（見 `globals.css` 末段） | ✅ 一致 |
| Border radius | `var(--border-radius)` = 10px | 同左 | ✅ 一致 |

### globals.css 是直接複製來的
`styles/globals.css` 的 `:root` 區塊就是從 `page-styles/globals.css` copy 過來的，包含所有 `--theme-*`、`--complementary-*`、`--background-color-*`、`--link-*` 等變數。整合時**不需要改任何 CSS**。

---

## 二、Badge 系統：擴充而非取代

主站 (`data/profile.ts`) 既有的 `BadgeType`：

```typescript
export type BadgeType = "admin" | "kol" | "early-access" | "business" | "school-org";
```

這份 demo 的 `BADGE_DEFINITIONS` 包含上面五個 + 五個新的：

```js
BADGE_DEFINITIONS = [
  // Already exists in main site (lib/config.js BADGES_CONFIG)
  { id: "admin", ... },
  { id: "kol", ... },
  { id: "early-access", ... },
  { id: "business", ... },
  { id: "school-org", ... },

  // New: simulator additions
  { id: "verified-creator", ... },   // 認證創作者，搭配 KOL 視覺
  { id: "brand-expert", ... },       // 品牌專家（航拓）
  { id: "industry-expert", ... },    // 業界專家（5+ 年）
  { id: "top-contributor", ... },    // 熱心助人
  { id: "moderator", ... },          // 版主
];
```

### 整合動作

1. **擴充 `BadgeType`**（`data/profile.ts` 第 6 行）：
   ```typescript
   export type BadgeType =
     | "admin" | "kol" | "early-access" | "business" | "school-org"
     | "verified-creator" | "brand-expert" | "industry-expert"
     | "top-contributor" | "moderator";
   ```
2. **擴充 `BADGES_CONFIG`**（`lib/config.js` 第 1215 行）— 把 demo 的新五個加進去，icon 名稱已經是 Remix Icon 標準。
3. **新欄位放在 `RealProfileExtension`**：
   - `brand?: { brandId: string; role: string; years?: number }` — 品牌附屬（航拓）
   - `moderates?: string[]` — 此 user 管理哪些行業 forum（industryId 列表）
   - 既有 `badges: BadgeType[]` 不變

### Badge 元件
- Demo 的 `components/Badge.jsx` 已經支援兩種 variant：
  - `variant="chip"`（預設）— pill 樣式，自己配色
  - `variant="icon"` — 跟主站 `components/Badge/ProfileBadge.tsx` 一樣的 icon + tooltip
- 主站既有的 `ProfileBadge.tsx` **可以直接保留**，不需替換。Demo 的 `BadgeRow` 包裝層在 chat 列表顯示時用 `variant="icon"`，視覺與既有 ProfileBadge 一致。

---

## 三、資料模型對應

Demo 用 in-memory store；主站用 Firestore + `BaseModelController`（見 `data/README.md`）。

| Demo（`lib/store.js`） | 主站對應 |
|---|---|
| `discussTopics` collection | 新增 Firestore collection `discussTopics` |
| `discussReplies` collection | 新增 Firestore collection `discussReplies` |
| `discussPolls` collection | 新增 Firestore collection `discussPolls` |
| `painPointResponses` | 新增 Firestore collection `discussPainPointResponses` |
| `helpfulVotes` (in-memory Set) | 新增 Firestore subcollection `discussReplies/{replyId}/helpfulVoters` 或 attach 到 reply doc 的 `helpfulVoters: string[]` |
| `INDUSTRIES` 常數 | 加到 `lib/config.js` 既有的常數區（跟 `DASHBOARD_SERVICES` 等並列） |
| `CATEGORIES` 常數 | 同上 |
| `PAIN_POINTS` 常數 | 同上 |
| `BRANDS` 常數 | 加到 `lib/config.js`，命名為 `DISCUSS_BRANDS` 避免 namespace 衝突 |
| `SEED_USERS` | **不要 port** — 主站用既有的 `Profile` collection，這只是 demo 為了讓畫面有專家而做的 fixture |

### 需要新建的 Model class（套 BaseModelController）

```typescript
// data/discuss-topic.ts
export class DiscussTopic extends BaseModelController implements DiscussTopicData {
    id!: string;
    title!: string;
    description!: string;
    industry!: string;
    category!: string;
    authorId!: string;        // = Profile.id
    authorName!: string;
    authorBadges!: BadgeType[];
    authorBrand?: { brandId: string; role: string };
    createdAt!: Date;
    lastActivityAt!: Date;
    replyCount!: number;
    viewCount!: number;
    pinned!: boolean;
    locked!: boolean;
    // ...
    getCollectionName() { return "discussTopics"; }
}

// 同樣對 DiscussReply / DiscussPoll / DiscussPainPointResponse 各做一份
```

`authorBadges` / `authorBrand` 是「post 時的 snapshot」— 即使作者後來 badge 改變，舊留言仍保留當時的 badge。Firestore 直接存陣列就好。

### Firestore 索引
- `discussTopics`：複合索引 `(industry asc, lastActivityAt desc)`、`(industry asc, category asc, lastActivityAt desc)`
- `discussReplies`：`(topicId asc, createdAt asc)`
- `discussPolls`：`(industry asc, createdAt desc)` 或 `(createdAt desc)` 看 query 怎麼下

---

## 四、Profile 欄位整合

主站既有的 `Profile`（`data/profile.ts`）。這份 demo 的 `loadProfile()`（`lib/profile.js`）回傳的 shape 是：

```js
{
  userId,                 // = Profile.id (主站)
  displayName,            // = Profile.nickname / schoolNickname / realProfile.realName
  industries,             // 新欄位：學生訂閱哪些行業 forum
  painPoints,             // 新欄位：困擾調查回應
  pollVotes,              // 新欄位：投過哪些 poll、選哪邊
  badges,                 // = Profile.badges (主站既有)
  brand,                  // 新欄位：品牌專家附屬
  moderates,              // 新欄位：管理哪些行業 forum
}
```

整合時：
1. `industries`、`painPoints`、`pollVotes`、`brand`、`moderates` 加到 `Profile` 或 `RealProfileExtension`（建議放 `RealProfileExtension`，因為這些是「真實身分相關」的偏好）
2. Demo 的 `useUserSession` hook 的功能對應到主站的 `AppContext` —— 直接刪除 `useUserSession`，改用 `appStates.userProfile`
3. Demo 的 `setDemoRole()` **完全不要 port**（這只是 simulator 的測試工具）

---

## 五、Page 路徑

| Demo path | 建議的主站路徑 |
|---|---|
| `/` | `/[lang]/discuss` |
| `/forums/[industry]` | `/[lang]/discuss/forums/[industry]` |
| `/topics/[id]` | `/[lang]/discuss/topics/[id]` |
| `/polls` | `/[lang]/discuss/polls` |
| `/survey` | `/[lang]/discuss/survey` |
| `/experts` | `/[lang]/discuss/experts` |
| `/api/discuss/*` | `/api/discuss/*`（保留） |

### TopBar 整合
Demo 的 `SimulatorBar` 是視覺 mirror，但實際整合時用主站 `TopBar.jsx`。在 `TOP_BAR_TABS`（`lib/config.js` 第 849 行）加入「話題」分頁：

```js
{ href: "/[lang]/discuss", iconName: "chat-1-line", text: "話題", pathKey: "discuss" }
```

---

## 六、Moderation API 安全性檢查

Demo 的 `/api/discuss/replies/[id]` (DELETE) 跟 `/api/discuss/topics/[id]/pin` 是用 client-side 傳的 `badges` + `moderates` 做驗證 —— **僅適用 demo**，整合到主站時必須改成 server-side：

```typescript
// 整合後的伺服器端
async function isModerator(uid: string, industryId: string): Promise<boolean> {
    const profile = await Profile.load(db, uid);
    if (!profile?.badges?.includes("moderator")) return false;
    return (profile.realProfile?.moderates || []).includes(industryId);
}
```

---

## 七、UI 元件對應表

| Demo 元件 | 主站對應 |
|---|---|
| `components/SimulatorBar.jsx` | 不要 port，主站用既有 `components/TopBar/TopBar.jsx`、`BottomBar.jsx` |
| `components/Onboarding.jsx` | 可以 port — 整合到 `pages/[lang]/account/onboarding.jsx` 或做成獨立的「訂閱論壇」步驟 |
| `components/Badge.jsx` | **保留 chip variant，icon variant 用主站既有 ProfileBadge** |
| `components/Discuss/DiscussList.jsx` | 直接 port |
| `components/Discuss/DiscussRoom.jsx` | 直接 port，但 reply 寫入要改用 Firestore + `onSnapshot` 即時更新（demo 是 5 秒 polling） |
| `components/Discuss/IndustryForum.jsx` | 直接 port |
| `components/Discuss/PollCard.jsx` | 直接 port |
| `components/Discuss/Survey.jsx` | 直接 port |
| `components/Discuss/ExpertsList.jsx` | 直接 port |
| `components/Discuss/NewTopicModal.jsx` | 直接 port，但要套主站的 `Profile` 物件 |
| `lib/store.js` | **整個拋棄**，每個 export 改寫為 Firestore 操作 |
| `lib/useUserSession.js` | **整個拋棄**，用 `useContext(AppContext)` |

---

## 八、Demo-only 的東西，不要 port

- `pages/api/*` 的 in-memory 實作 → 主站 client 直接打 Firestore，或改成主站既有 API route 模式
- `lib/profile.js` 的 `DEMO_ROLES` 清單跟 `setDemoRole` → 純 testing 工具
- `components/SimulatorBar.jsx` 的 SIMULATOR chip / 切換身份 / 「關於」彈窗 → 純 demo UX
- 8 個產業 forum 的 seed 內容 → 整合後可以拿前 1-2 篇做正式範本，其他都會由真實使用者產出

---

## 九、優先順序建議

1. **第一波（最小可上線）**：
   - 加 `discussTopics` + `discussReplies` Firestore collection
   - 在 `BadgeType` 加 `verified-creator`、`top-contributor`、`moderator`
   - 上 home page + topic detail（chat 風格）
   - 不開新增話題、不開版主功能
2. **第二波（互動）**：
   - 投票、困擾調查
   - 推薦演算法（`recommendTopics()` 直接 port）
3. **第三波（治理）**：
   - 版主刪文 / 鎖文 / 置頂
   - 檢舉
   - `helpful` 票
4. **第四波（航拓行銷）**：
   - 加 `BRANDS` config + `brand-expert` badge
   - `/experts` 頁面
   - 給航拓開幾個內部帳號（標 `brand-expert` + brand=hangtuo）

---

最重要的承諾是：**整合進主站不需要改主站既有的任何東西**。所有 demo 的功能都是純加法。
