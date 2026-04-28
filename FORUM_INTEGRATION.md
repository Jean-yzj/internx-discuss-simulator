# 把 Simulator 功能放回「實習通論壇」的整合說明

> 這份文件是給「實習通」工程師看的具體整合手冊。它假設你熟悉
> `internx-me/frontend` 的程式碼（特別是 `data/chat.ts`、`components/Chat/`、
> `data/profile.ts`、`pages/[lang]/dashboard/forum/`）。
>
> 整合的核心理念：**simulator 的每個新功能都是「現有論壇的擴充」**，
> 不需要新增獨立的「話題」頁面。直接把這些功能掛在你既有的
> `ChatRoom` / `ChatMessage` / `Profile` 模型上就好。

---

## 一、目前實習通論壇是這樣設計的

我看了一下 `internx-me/frontend` 主 repo：

| 概念 | 對應檔案 | 你已經有什麼 |
|---|---|---|
| 「論壇」入口 | `pages/[lang]/dashboard/forum/index.jsx` | redirect 到 `/forum/none` |
| 「論壇」內容 | `pages/[lang]/dashboard/forum/[chatRoomId].jsx` | 渲染 `<Chat chatRoomId>` |
| 主元件 | `components/Chat/Chat.tsx` | 左邊 `ChatList` + 右邊 `ChatContent` |
| 聊天室列表 | `components/Chat/ChatList.tsx` | 顯示 `ChatRoom` 樹（含 root + recent） |
| 聊天室內容 | `components/Chat/ChatContent.tsx` | 訊息流 + composer |
| 資料模型 | `data/chat.ts` | `ChatRoom`、`ChatMessage`、`Tag` |
| 使用者 | `data/profile.ts` | `Profile`、`BadgeType`、`Avatar` |
| Badge UI | `components/Badge/ProfileBadge.tsx` | 圖示 + tooltip 樣式 |

換句話說，**實習通的論壇本質上已經是一個「群組聊天室」結構**。Simulator
做的所有功能都可以視為：「給每個 `ChatRoom` 加上額外的元資料 + UI 行為」。

---

## 二、把每個 Simulator 功能對映到現有論壇

### 1. 行業（Industry） → 既有的 `ChatRoom.tags`

主 repo 的 `ChatRoom` 已經有 `tags: Tag[]`，每個 tag 有 `targetType: 'company' | 'topic' | 'user'`。

**做法**：把 `INDUSTRIES` 常數搬進 `lib/config.js`，然後給每個 ChatRoom 加一個
industry tag：

```typescript
// lib/config.js (加到既有常數區)
export const INDUSTRIES = [
    { id: "finance", label: "金融業", emoji: "💰", accent: "#1e3a8a" },
    { id: "consulting", label: "管顧業", emoji: "📊", accent: "#7c3aed" },
    // ... 其餘 6 個
];

// 然後 ChatRoom 加一個 industryId 欄位
interface ChatRoomData {
    // 既有欄位...
    industryId?: string;  // ← 新增（optional，向後相容）
}
```

**新做的「行業論壇頁」**（`/forums/[industry]`）= 顯示「該 industryId 下所有
頂層 ChatRoom」的列表，等同主 repo 的 `pages/[lang]/dashboard/forum/index.jsx`
但 filter by industry。

不需要建新 collection；既有的 `chatRooms` collection 加一個 indexed field 就夠。

### 2. 話題（Topic） = 既有的「最頂層 ChatRoom」

主 repo 已經有 `parentId: null` 的「root」聊天室概念。

**話題就是 root ChatRoom，回覆就是 ChatMessage。** 直接複用，不要新建。

Simulator 的 `discussTopics` collection 對應主 repo 的 `chatRooms` 中
`parentId === null` 且 `industryId` 有值的那些。

| Simulator 欄位 | 主站對應 |
|---|---|
| `topic.id` | `chatRoom.id` |
| `topic.title` | `chatRoom.name` |
| `topic.description` | `chatRoom.description` |
| `topic.industry` | `chatRoom.industryId`（新欄位） |
| `topic.category` | `chatRoom.tags`（用 `targetType: 'topic'`） |
| `topic.authorId` | `chatRoom.addedBy` |
| `topic.replyCount` | 從 `chatMessages where to=roomId` 算（已有） |
| `topic.viewCount` | `chatRoom.viewCount`（新欄位，optional） |
| `topic.pinned` | `chatRoom.pinned`（新欄位） |
| `topic.locked` | `chatRoom.locked`（新欄位） |
| `topic.lastActivityAt` | `chatRoom.updatedAt` 或 latestMessage.timestamp（已有） |

### 3. 回覆 → 既有的 `ChatMessage`

直接用 `ChatMessage`，不要新建。Simulator 的 `discussReplies.content` =
`ChatMessage.content`，`type: 'text'`。

Simulator 加的兩個欄位：
- `authorBadges: BadgeType[]` → 加到 `ChatMessage`，當作「post-time snapshot」
- `helpfulCount: number` → 加到 `ChatMessage`
- `authorBrand: { brandId, role }` → 加到 `ChatMessage`（optional）

主站的 `ChatMessage` 已經有 `senderBadges?: BadgeType[]`（見 `data/chat.ts` line 79）！
**這欄已經存在，simulator 用的是同一個概念，可以直接接上。**

### 4. Badge 系統 → 擴充既有 `BadgeType`

主 repo 既有：

```typescript
// data/profile.ts
export type BadgeType = "admin" | "kol" | "early-access" | "business" | "school-org";

// lib/config.js BADGES_CONFIG 也已經設定好 icon + color
```

**只需要在 `BadgeType` 加 4 個新類型**：

```typescript
export type BadgeType =
    | "admin" | "kol" | "early-access" | "business" | "school-org"
    | "brand-expert" | "industry-expert" | "top-contributor" | "moderator";
```

Simulator 的 `verified-creator` = 主站的 `kol`，**不要重複加**，直接在
simulator 那邊改 alias。

對應的 `BADGES_CONFIG` 條目（icon + color）：

```js
// lib/config.js BADGES_CONFIG 加 4 條
"brand-expert": {
    label: "品牌專家", description: "與職涯顧問品牌合作的專家",
    icon: "vip-crown-fill", color: "var(--theme-color)",
},
"industry-expert": {
    label: "業界專家", description: "5+ 年業界資歷、經審核",
    icon: "medal-2-fill", color: "#0891b2",
},
"top-contributor": {
    label: "熱心助人", description: "累積大量回覆 + 高 helpful 票",
    icon: "heart-3-fill", color: "#dc2626",
},
"moderator": {
    label: "版主", description: "協助管理特定行業論壇",
    icon: "shield-user-fill", color: "#16a34a",
},
```

主 repo 的 `components/Badge/ProfileBadge.tsx` **完全不用改** — 它讀
`BADGES_CONFIG[badgeType]` 就會自動處理新 badge。

### 5. 品牌專家（航拓）→ Profile + 新的 brand collection

新加：

```typescript
// data/brand.ts (新檔)
export class Brand extends BaseModelController {
    id!: string;       // e.g. "hangtuo"
    name!: string;     // "航拓"
    fullName!: string; // "航拓策略顧問"
    emoji!: string;
    color!: string;
    accent!: string;
    tagline!: string;
    description!: string;
    websiteUrl!: string;
    getCollectionName() { return "brands"; }
}

// data/profile.ts RealProfileExtension 加一個欄位
interface RealProfileData {
    // 既有...
    brandAffiliation?: { brandId: string; role: string; years: number };
}
```

**在 ChatMessage 渲染時**，如果 sender 的 `realProfile.brandAffiliation`
存在，就顯示 simulator 的 `BrandCallout` 元件（藍色橫條卡片）。

主 repo 的 `components/Chat/ChatMessage.tsx` 加一行：

```jsx
{message.senderBrand && <BrandCallout brand={message.senderBrand} />}
```

這個 `senderBrand` 跟 `senderBadges` 一樣，都是 post-time snapshot。

### 6. 版主（Moderator）→ Profile + ChatRoom.communityAdmin

主 repo 的 `ChatRoom` 已經有 `communityAdmin: string[]`（見 `data/chat.ts` line 22）！

**版主就是該 ChatRoom 或該 industry 的 communityAdmin。** 不用新建欄位。

Simulator 的「版主刪留言 / 置頂 / 鎖定」對應主站既有的 `ChatRoom.communityAdmin`
權限檢查：

```typescript
// 已存在於 ChatRoom — 加幾個 server-side endpoints:
// POST /api/chat/messages/[id]/delete   (mod only)
// POST /api/chat/rooms/[id]/pin         (mod only)
// POST /api/chat/rooms/[id]/lock        (mod only)

// 授權檢查（server-side，必做）
async function isModerator(uid: string, roomId: string) {
    const room = await ChatRoom.load(db, roomId);
    if (room.communityAdmin?.includes(uid)) return true;
    const profile = await Profile.load(db, uid);
    if (profile?.badges?.includes("admin")) return true;
    return false;
}
```

Simulator 的「行業版主」 = 該 industry 旗下所有 root ChatRoom 的
`communityAdmin`。可以用 Cloud Function 同步 user.moderates → 各 room
的 communityAdmin 陣列。

### 7. 投票（Polls）→ 新 collection（最低成本）

這是唯一需要新 Firestore collection 的 feature：

```typescript
// data/poll.ts
export class Poll extends BaseModelController {
    id!: string;
    question!: string;
    industryId?: string;
    chatRoomId?: string;     // 可選：把 poll 綁在某個 ChatRoom 內
    optionA!: { label, emoji, subtitle };
    optionB!: { label, emoji, subtitle };
    votes!: { a: number, b: number };
    voters!: string[];       // user ids that have voted
    createdAt!: Date;
    getCollectionName() { return "polls"; }
}
```

UI：simulator 的 `<PollCard>` 元件直接 port，渲染為 `ChatMessage` 的特殊
`type: 'poll'` 變體（主 repo `ChatMessage.type` 已經是 `'text' | 'image' | 'addThread'`，
**加 `'poll'` 一個值就好**），然後 message body 帶 `pollId`，前端 lookup 顯示。

這樣投票就直接出現在聊天串中、跟訊息排在一起。

### 8. 困擾調查（Pain Points）→ Profile.realProfile.painPoints

```typescript
// data/profile.ts RealProfileExtension
interface RealProfileData {
    // 既有...
    painPoints?: { id: string, intensity: number }[];
    painPointsSubmittedAt?: Date;
}
```

定義常數加到 `lib/config.js`：

```js
export const PAIN_POINTS = [/* simulator lib/store.js 的 14 條 */];
```

新 page：`pages/[lang]/dashboard/account/survey.jsx`（也可以直接接到
既有的 onboarding flow）。

聚合統計用 Cloud Function 跑，結果存 `painPointStats` 文件。

### 9. 推薦引擎 → 純前端 / 後端 query 都行

simulator 是純前端（`recommendTopics()` 在 in-memory 算分），但放到主站
推薦的對象是 `ChatRoom`，候選量大，建議改 server-side：

```typescript
// data/chat.ts 加
static async loadRecommendedRoomsForUser(db, profile): Promise<ChatRoom[]> {
    const myIndustries = profile.industries || [];
    const painCats = derivePainCategories(profile.realProfile?.painPoints);
    // Firestore query: rooms in myIndustries, order by lastActivityAt
    // 然後 client-side 加分排序
}
```

UI：在既有的 `ChatList.tsx` 上方加一個「為你推薦」section（卡片樣式）。

### 10. ⌘K 搜尋 → 跟主站 SearchOverlay 整合

主 repo 已經有 `components/Popup/SearchOverlay.tsx`！（在 `pages/_app.jsx`
line 666-672 看到 Cmd+K 已經被 wired up 為 `appStates.appSearch`）

**Simulator 的 search 直接合併到既有 SearchOverlay**：

```typescript
// 既有 SearchOverlay 加一個 result type: 'topic' | 'expert' | 'brand'
// （它原本可能只有 'company' / 'profile' / 'post'）
```

這樣全站搜尋就會包含論壇話題、認證專家、合作品牌。

### 11. 通知中心 → 既有的 `data/notification.ts` Notification

主 repo 的 `data/notification.ts` 已經有 `Notification` 類型 + UI
（見 `components/NotificationPopup/`）。

Simulator 加的「有人回覆你的話題」、「品牌入駐」事件，全部用既有
`Notification` 模型發送，**不需要新元件**。

### 12. 「我的活動」→ Profile.realProfile or query

可以兩種做法：
- **簡單版**：query Firestore — `chatMessages where senderId = me`（找回過的訊息），
  + `chatRooms where addedBy = me`（找開過的話題），兩個合併排序。
- **效能版**：在 `Profile` 加 `recentActivity: { roomId, role, at }[]`，
  Cloud Function 在每次發訊時更新。

UI：simulator 的「我的活動」section 直接 port，渲染在既有
`pages/[lang]/dashboard/forum/index.jsx`（forum 入口頁）的最上面。

### 13. 作者 popover → 既有 Profile 頁

主 repo 已經有 `pages/[lang]/user/[profileId].jsx`（個人頁）。

**Simulator 的 popover 直接 link 到那一頁**，不需要新做。或在
ChatMessage hover 時 fetch `Profile.load(db, senderId)` 顯示一個小卡片。

---

## 三、對應到主 repo 的具體檔案修改清單

按照優先順序：

### Phase 1 — 視覺/Badge（半天）
1. `lib/config.js` BADGES_CONFIG 加 4 條（brand-expert / industry-expert / top-contributor / moderator）
2. `data/profile.ts` BadgeType 加同樣 4 個 string literal
3. （Optional）`components/Badge/ProfileBadge.tsx` — 不用改，已能 work
4. ✅ 結果：既有 forum 中所有 ChatMessage 的 `senderBadges` 開始能渲染新類型

### Phase 2 — 行業論壇（1-2 天）
1. `lib/config.js` 加 `INDUSTRIES` 常數
2. `data/chat.ts` ChatRoomData 加 `industryId?: string`
3. 一次性 backfill：給既有 root ChatRoom 補 industryId
4. 新 page: `pages/[lang]/dashboard/forum/industries/[industry].jsx` —
   「該 industry 旗下的所有 root ChatRoom」列表，可以從 simulator 的
   `IndustryForum.jsx` 改寫
5. 在 `components/Chat/ChatList.tsx` 加「按行業分頁」filter
6. ✅ 結果：論壇有了「金融業 / 管顧業 / ...」分類

### Phase 3 — 投票（1 天）
1. `data/poll.ts` 新建 model
2. `data/chat.ts` ChatMessage.type 加 `'poll'`
3. `components/Chat/ChatMessage.tsx` 加一個 `if (message.type === 'poll')` 分支，
   渲染 simulator 的 `<PollCard>` 元件
4. Composer 加「📊 開投票」按鈕
5. ✅ 結果：聊天室裡可以發投票訊息

### Phase 4 — 版主（1 天）
1. server-side moderator API（reuse `ChatRoom.communityAdmin`）
2. `components/Chat/ChatMessage.tsx` 加 ⋯ menu，mod 看到「刪除」「檢舉」
3. `components/Chat/ChatRoom` header 加 mod toolbar（置頂/鎖定）
4. ✅ 結果：版主可以治理自己的 industry 論壇

### Phase 5 — 困擾調查 + 推薦（1-2 天）
1. `data/profile.ts` RealProfileExtension 加 `painPoints` 欄位
2. 新 page: `/[lang]/dashboard/account/survey.jsx`
3. server-side recommendation function
4. `pages/[lang]/dashboard/forum/index.jsx` 加「為你推薦」section
5. ✅ 結果：論壇有了個人化推薦

### Phase 6 — 品牌專家（航拓）+ Experts 頁（1 天）
1. `data/brand.ts` 新 model + 資料
2. `RealProfileExtension.brandAffiliation` 欄位
3. 新 page: `/[lang]/dashboard/forum/experts.jsx`
4. ChatMessage 渲染 `<BrandCallout>`
5. ✅ 結果：航拓顧問的留言會帶品牌標籤

### Phase 7 — 通知整合（半天）
1. 在現有 `Notification` 上加新 event types
2. Cloud Function：當 user 訂閱的 industry 有新熱門話題、有人回覆我的話題時觸發
3. ✅ 結果：論壇活動會出現在主站既有的鈴鐺通知中

---

## 四、不要 port 的東西

這些是 simulator only 的，整合時刪掉即可：

- `lib/store.js` 整個 in-memory store → 直接刪
- `lib/profile.js` `DEMO_ROLES` 跟 `setDemoRole()` → 純 testing 工具
- `lib/useUserSession.js` → 用 `useContext(AppContext)` 取代
- `components/SimulatorBar.jsx` → 用既有 TopBar
- `components/Onboarding.jsx` 是 demo only 的，可以拿來啟發
  「行業訂閱」步驟加到既有 onboarding flow
- 各種 API routes (`pages/api/discuss/*`) → 全部改寫為 Firestore 操作，
  跟 simulator 的 API shape 一一對應就好

---

## 五、最重要的承諾

**這份 simulator 把所有 UI / 互動邏輯都做好了。**整合進主站時：

1. **Firestore schema 改動很小**：`ChatRoom` 加 3 個 optional 欄位、
   `ChatMessage` 加 1 個欄位、`RealProfileExtension` 加 2 個欄位、
   1 個新 collection (`polls`)、1 個新 collection (`brands`)。
2. **沒有 breaking change**：既有的 ChatRoom / ChatMessage / Profile
   讀寫邏輯完全不動。
3. **既有 UI 最小修改**：`ChatList`、`ChatMessage`、`ChatContent`
   各加 1-2 條 conditional render，不要重寫。
4. **權限模型沿用**：版主 = `communityAdmin`，不要新增 ACL 系統。
5. **Cloud Functions 可以後做**：通知、推薦快取、聚合統計都可以
   不裝就先上線（純 query 一樣會 work，只是沒有 prebuilt cache）。

整合完之後，主站的「論壇」分頁會多出：
- 行業分頁
- 投票訊息
- 困擾調查 + 推薦
- 認證專家頁（航拓品牌曝光）
- 版主治理工具

但**論壇底層架構（ChatRoom + ChatMessage）一行都不用改**。
