# 給實習通工程團隊的交接文件：把 Discuss Simulator 串回現有網站

> 文件目的：讓 `internx-me/frontend` 的工程師快速理解，這個 simulator 應該怎麼接回既有的實習通，而不是另外維護一套獨立產品。
>
> 文件日期：2026-04-29
>
> 參考環境：
> - Simulator repo：`internx-discuss-simulator`
> - 主站 repo：`internx-me/frontend`
> - Staging 觀察頁：`https://staging.internx.me/zh-tw/dashboard/needs-wall`

---

## 1. 先講結論

這個 simulator **不應該**被當成一個獨立站重新實作。

最合理的整合方式是：

1. 把 simulator 的功能拆成幾個能力模組
2. 依序掛回主站現有的三個入口
3. 盡量重用主站既有的 `ChatRoom` / `ChatMessage` / `Profile` / `Notification`

三個入口分別是：

- `/{lang}/dashboard/needs-wall`
- `/{lang}/dashboard/forum/*`
- `/{lang}/discuss/*`

也就是說，**needs-wall 是入口頁、forum 是既有聊天室底層、discuss 是新話題體驗層**。

不要再新開第四套資料模型或第四套路由。

---

## 2. 目前主站已經有什麼

### 2.1 我在 2026-04-29 看到的 staging 現況

`https://staging.internx.me/zh-tw/dashboard/needs-wall` 已經不是空白頁，而是一個很明確的「話題入口頁」。

頁面上已經有這些區塊：

- 每週焦點問卷
- 本週話題投票牆
- 你的論壇正熱
- 最新話題
- 我的論壇
- CTA：開一個新話題 / 調整訂閱的論壇

這代表產品方向其實已經和 simulator 非常接近了。  
所以整合的目標不是「把 simulator 整包搬過去」，而是：

- 用 simulator 補齊缺的互動與資料欄位
- 讓 `needs-wall`、`forum`、`discuss` 三者共用同一套資料來源

### 2.2 主站 repo 已經有 discuss 路由

主站 repo 目前已經存在：

- `pages/[lang]/discuss/index.jsx`
- `pages/[lang]/discuss/[topicId].jsx`

也已經存在：

- `pages/[lang]/dashboard/forum/index.jsx`
- `pages/[lang]/dashboard/forum/[chatRoomId].jsx`

另外在 `lib/config.js` 也已經有：

- `TOP_BAR_TABS` 的 `/{lang}/discuss`
- `BOTTOM_BAR_TABS` 的 `/{lang}/discuss`

所以對工程團隊來說，**這不是從 0 到 1 的接案**，而是把現有雛形補完整。

### 2.3 主站底層聊天室模型已可承接大部分需求

主站現有關鍵模型：

- `data/chat.ts`
  - `ChatRoom`
  - `ChatMessage`
  - `Tag`
- `data/profile.ts`
  - `Profile`
  - `RealProfileExtension`
  - `BadgeType`
- `data/notification.ts`
  - 既有通知系統

目前已確認的可直接重用欄位：

- `ChatRoom.communityAdmin`
- `ChatRoom.tags`
- `ChatRoom.parentId`
- `ChatRoom.latestMessage`
- `ChatMessage.senderBadges`
- `Notification.relatedEntityType`

換句話說，simulator 大多數功能都可以建立在既有 forum/chat 架構上，不需要新造一個 parallel backend。

---

## 3. 建議的產品結構

### 3.1 needs-wall 做什麼

`/{lang}/dashboard/needs-wall` 應該是「需求入口 / 話題首頁」。

它負責：

- 問卷入口
- 多題投票牆
- 熱門話題聚合
- 最新話題 feed
- 我的論壇入口
- 推薦論壇 / 推薦話題

它**不負責**承載完整聊天室互動。

### 3.2 discuss 做什麼

`/{lang}/discuss` 應該是「完整話題體驗層」。

它負責：

- 話題列表
- 依行業 / 分類篩選
- 熱門 / 最新排序
- 收藏
- 我的活動
- 推薦話題

### 3.3 forum 做什麼

`/{lang}/dashboard/forum/[chatRoomId]` 仍然是底層聊天室載體。

它負責：

- 真正的訊息串
- 即時更新
- sender / badge / avatar 呈現
- moderator 權限
- 後續可延伸 thread / message-level moderation

### 3.4 最推薦的整合關係

- `needs-wall`：入口頁與流量分發
- `discuss`：導流後的探索與列表 UI
- `forum`：最後的訊息互動與歷史資料承接

如果要更進一步收斂，長期甚至可以讓：

- `discuss/[topicId]` 直接成為一個包裝 `ChatRoom` 的 topic view
- topic reply 底層直接用 `ChatMessage`

---

## 4. Simulator 與主站模型的對應

## 4.1 Topic 對應

Simulator 的 `topic`，建議對應成主站的頂層 `ChatRoom`。

建議 mapping：

| Simulator | 主站 |
|---|---|
| `topic.id` | `chatRoom.id` |
| `topic.title` | `chatRoom.name` |
| `topic.description` | `chatRoom.description` |
| `topic.authorId` | `chatRoom.addedBy` |
| `topic.lastActivityAt` | `chatRoom.updatedAt` 或 `latestMessage.timestamp` |
| `topic.replyCount` | 由 `ChatMessage where to = roomId` 聚合 |
| `topic.pinned` | `chatRoom.pinned`（新增欄位） |
| `topic.locked` | `chatRoom.locked`（新增欄位） |
| `topic.viewCount` | `chatRoom.viewCount`（新增欄位） |

## 4.2 Industry 對應

Simulator 的 `industry`，建議掛在 `ChatRoom` 新欄位：

```ts
industryId?: string;
```

不要只存在 `tags` 裡，因為：

- 需要直接 query
- 需要做聚合
- 需要排序 / filter

`tags` 仍可保留作為展示與 secondary classification。

## 4.3 Category 對應

Simulator 的 category 可先沿用 `tags`：

```ts
{ name: "面試", targetType: "topic", targetId: "interview" }
```

如果之後 query 需求變多，再補一個平鋪欄位：

```ts
categoryId?: string;
```

## 4.4 Reply 對應

Simulator 的 reply 直接對應 `ChatMessage`。

建議只新增少量欄位：

```ts
helpfulCount?: number;
editedAt?: Date;
reactions?: Record<string, string[]>;
senderBrand?: {
  brandId: string;
  role: string;
};
```

其中：

- `senderBadges` 主站已存在
- `senderBrand` 是 post-time snapshot
- `helpfulCount` 可預聚合，避免每次現算

---

## 5. 建議新增的主站欄位

以下是最小集合。

## 5.1 `ChatRoom`

```ts
industryId?: string;
categoryId?: string;
pinned?: boolean;
locked?: boolean;
viewCount?: number;
```

## 5.2 `ChatMessage`

```ts
helpfulCount?: number;
editedAt?: Date;
reactions?: Record<string, string[]>;
senderBrand?: {
  brandId: string;
  role: string;
};
reportCount?: number;
```

## 5.3 `Profile` / `RealProfileExtension`

建議新增：

```ts
followedIndustries?: string[];
painPoints?: { id: string; intensity: number }[];
painPointsSubmittedAt?: Date;
pollVotes?: Record<string, "a" | "b">;
brandAffiliation?: {
  brandId: string;
  role: string;
  years?: number;
};
```

如果要做「我的活動 / 收藏」也可以加：

```ts
savedTopics?: string[];
recentDiscussActivity?: {
  topicId: string;
  role: "author" | "replier";
  at: Date;
}[];
```

---

## 6. Badge 策略

主站目前 `BadgeType` 只有：

- `admin`
- `kol`
- `early-access`
- `business`
- `school-org`

Simulator 需要的 badge 建議這樣處理：

- `verified-creator` 不要新增
  - 直接映射到主站既有 `kol`
- 新增：
  - `brand-expert`
  - `industry-expert`
  - `top-contributor`
  - `moderator`

也就是說，主站只需要補 4 個 badge type，不是 5 個。

---

## 7. 哪些功能可以直接接回現有架構

### 7.1 可以直接接

- 話題列表
- 話題詳細頁
- reply 顯示
- sender badge 顯示
- 行業分類
- 分類 chip
- 熱門 / 最新排序
- 收藏
- 我的活動
- 專家列表
- 品牌專家展示

### 7.2 需要新增資料欄位，但不需要新服務

- helpful
- emoji reactions
- pinned / locked
- report count
- view count
- pain points
- followed industries

### 7.3 建議獨立 collection 的功能

- polls
- pain point aggregate stats
- report records

最小新 collections 建議：

- `polls`
- `pollVotes`
- `messageReports`
- `painPointStats`

---

## 8. 關於 `needs-wall`，最建議的接法

這頁不應該自己維護獨立資料。

它應該是 query layer / composition layer。

建議每個區塊的資料來源如下：

| needs-wall 區塊 | 建議資料來源 |
|---|---|
| 焦點問卷 | `Profile.painPoints` + 問卷 config |
| 話題投票牆 | `polls` collection |
| 你的論壇正熱 | `ChatRoom where industryId in followedIndustries` |
| 最新話題 | `ChatRoom where parentId = null order by updatedAt desc` |
| 我的論壇 | `followedIndustries` + forum topic counts |

這樣 `needs-wall` 只做組裝，不做另一套 topic storage。

---

## 9. 關於 `discuss`，目前主站其實已經在路上

主站已經有：

- `pages/[lang]/discuss/index.jsx`
- `pages/[lang]/discuss/[topicId].jsx`

所以建議：

1. 把 simulator 的 `DiscussList` 接進主站 `discuss/index`
2. 把 simulator 的 `DiscussRoom` 接進主站 `discuss/[topicId]`
3. 底層資料改讀主站 Firestore model

注意：這條線是對外展示層，不一定要直接暴露 simulator 的所有 demo-only 能力。

不應接入主站的 demo-only 東西：

- 身份切換 `DEMO_ROLES`
- simulator 專用 `SimulatorBar`
- in-memory API routes
- localStorage profile 假資料

---

## 10. 實作優先順序

## Phase 1：讓主站資料結構能承接

先做：

1. `ChatRoom` 補 `industryId / pinned / locked / viewCount`
2. `ChatMessage` 補 `helpfulCount / reactions / editedAt / senderBrand`
3. `Profile` 補 `followedIndustries / painPoints / pollVotes / brandAffiliation`
4. `BadgeType` 補 4 個新 badge

這一步完成後，forum / discuss / needs-wall 三邊就能共用同一套語意。

## Phase 2：先把 `needs-wall` 串成真入口

先做：

1. needs-wall 讀真實 polls
2. needs-wall 讀真實熱門 topic
3. needs-wall 讀真實 latest topic
4. needs-wall 讀使用者 followed industries

這一步完成後，staging 上這頁就不再只是 mock page。

## Phase 3：讓 `discuss` 成為完整 topic 體驗

先做：

1. `DiscussList` 接 Firestore
2. `DiscussRoom` 接 Firestore
3. 開新話題
4. 收藏 / 我的活動

## Phase 4：治理與專家機制

最後做：

1. moderator tools
2. report flow
3. helpful
4. top-contributor badge
5. brand expert onboarding

---

## 11. 不建議的做法

以下做法不建議：

- 另外建一套 `discussTopics` / `discussReplies` 平行於 `chatRooms` / `chatMessages`
- 讓 `needs-wall` 自己維護一套獨立 mock payload
- 把 simulator 的 `localStorage profile` 直接搬進主站
- 保留 `DEMO_ROLES`
- 繼續讓 `discuss` 和 `forum` 用兩套完全不同的 message schema

這些都會讓主站之後很難維護。

---

## 12. 這個 simulator repo 可以直接拿來拆什麼

可直接拆：

- `components/Discuss/DiscussList.jsx`
- `components/Discuss/DiscussRoom.jsx`
- `components/Discuss/IndustryForum.jsx`
- `components/Discuss/PollCard.jsx`
- `components/Discuss/PollsList.jsx`
- `components/Discuss/Survey.jsx`
- `components/Discuss/ExpertsList.jsx`
- `components/Badge.jsx`

只可參考，不可直接搬：

- `lib/store.js`
- `lib/profile.js`
- `lib/useUserSession.js`
- `pages/api/discuss/*`
- `components/SimulatorBar.jsx`

---

## 13. 建議技術團隊讀檔順序

如果是主站工程師，建議按這個順序讀：

1. 本文件 `TECH_HANDOFF_NEEDS_WALL.md`
2. `FORUM_INTEGRATION.md`
3. `INTEGRATION.md`
4. simulator 的 `components/Discuss/*`
5. 主站的 `data/chat.ts`
6. 主站的 `data/profile.ts`
7. 主站的 `pages/[lang]/discuss/*`
8. 主站的 `pages/[lang]/dashboard/forum/*`

---

## 14. 最後結論

這個專案最重要的決策不是 UI，而是資料邊界。

正確方向是：

- `needs-wall` 做入口
- `discuss` 做探索與話題列表
- `forum` 做底層聊天室與即時互動
- 資料統一掛在 `ChatRoom` / `ChatMessage` / `Profile`

如果照這個方向做，這個 simulator 可以很自然地融入實習通；  
如果反過來再造一套平行 discuss backend，後面一定會出現雙系統同步問題。
