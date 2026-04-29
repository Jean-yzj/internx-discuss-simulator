# 把 Simulator 功能放進 `/dashboard/needs-wall` 的整合說明

> 給「實習通」工程師看。針對 staging.internx.me/zh-tw/dashboard/needs-wall
> 這個既有頁面，這份文件說明 simulator 哪些功能可以直接放進去、哪些不
> 用做（你已經有了）、哪些需要新建一個 sub-page 串進來。
>
> 跟 [`FORUM_INTEGRATION.md`](./FORUM_INTEGRATION.md) 的差別：那份是
> 「整個論壇要怎麼整合」的全景圖，這份是「needs-wall 這一頁要怎麼改」
> 的短期 action plan。先讀這份再看那份。

---

## 0. 我先看了你 staging 上的 needs-wall

抓出來的可見元素，按上下排序：

```
1. TopBar：論壇 / 人脈 / 活動 / 心得 / 話題牆 (active)
2. Hero：「大家最近在關心什麼？」+「投下你的需求，我們會⋯⋯媒合資源」
3. 每週焦點問卷 CTA：3 分鐘問卷 → 推薦更貼近你的論壇與活動
   - [開始填問卷] [稍後提醒我]
4. 本週話題投票牆（投票 widget，3 個問題打包）
   a. 最近你最想解決的問題是？（職涯方向不明確 / 想學習新技能 / 想了解某個行業真實情況）
   b. 你現在最需要哪種支持？（和前輩聊真實經驗 / 參加工作坊 / 整理好的學習資源清單）
   c. 你希望什麼時候開始改善？（這週就開始 / 這個月內 / 這學期結束後）
5. 你的論壇正熱（trending topic cards，標籤：🔥 熱門 / 公職 / 金融業 / 科技業）
6. 最新話題（topic list + category chips：全部/職涯選擇/實習/面試/技能學習/薪資/校園生活/副業合作）
7. 我的論壇（industry cards：金融業 / 管顧業 / 科技業 / 公職）
8. Footer（已是主站樣式）
```

**結論**：needs-wall 頁面的骨架已經在了，跟 simulator 高度重疊。所以這
份整合 ≠「打造一個新的話題頁」，而是「把 simulator 上面有但 needs-wall
還沒有的東西塞進這個既有頁面 / 它連去的子頁面」。

---

## 1. 哪些不用做（needs-wall 已經有的）

| 功能 | needs-wall 現狀 | Simulator 對應 | 動作 |
|---|---|---|---|
| Hero / 進入點 | ✅ 已有「大家最近在關心什麼？」 | DiscussList hero | **保留 needs-wall 版本**，不要拿 simulator 的覆蓋 |
| 投票（A vs B） | ✅ **已有，且做得比 simulator 更好**（3 題打包、每題 3 選項） | 6 個 A/B polls | **保留 needs-wall 多選版本**；simulator 的 A/B 模型不要 port |
| 趨勢話題 | ✅「你的論壇正熱」 | DiscussList trending | needs-wall 已有，simulator 算法（`replyCount × 2 + viewCount`）可以拿過去當 server query |
| 子分類 chips | ✅ 8 個（全部 / 職涯選擇 / ⋯⋯） | 8 個 CATEGORIES | **完全一致**，已經對齊好 |
| 工業卡片 | ✅「我的論壇」 | DiscussList 我的論壇 | needs-wall 版本即可 |
| 焦點問卷 CTA | ✅ 已有 | Survey CTA banner | needs-wall 版本即可，但**目標問卷頁要新做**（看 §3） |

**簡單說**：needs-wall 的 hero、polls、trending、最新話題、我的論壇這
**五個 section 不要改**，照他現在的設計走。simulator 上對應的那些
section 是參考用，不是要 port 過去。

---

## 2. 公職這個行業要加進 simulator（小事）

needs-wall 出現了「公職」（警政、行政、司法體系）。simulator 的
`INDUSTRIES` 沒有這個。要把 simulator 改得跟主站更貼近的話，加一個：

```js
// lib/store.js INDUSTRIES 加一條
{
    id: "civil",
    label: "公職",
    emoji: "🏛️",
    accent: "#475569",
    description: "警政、行政、司法體系 — 穩定路徑、制度文化、準備策略。",
},
```

順便加一個 seed topic 在公職版（例如 needs-wall 上看到的「輪班制度下，
生活與工作怎麼平衡？」）。

> 但這只是讓 simulator 更全面，**主站的 needs-wall 不需要改任何東西**。

---

## 3. Simulator 有、needs-wall 還沒有的功能 → 整合計畫

按 needs-wall 的閱讀順序排，每一項都標清楚「放在哪裡」「需要哪個新檔案」「估計工時」。

### 3.1 焦點問卷的目標頁面（高優先）

needs-wall 上的「開始填問卷」按鈕現在點下去⋯⋯（需要查主站，但根據
我看到的 HTML，沒有對應的 page route）。**這個 page 要新做**。

| 動作 | 檔案 |
|---|---|
| 新做問卷頁 | `pages/[lang]/dashboard/needs-wall/survey.jsx` |
| 問卷 component | port simulator `components/Discuss/Survey.jsx` |
| 結果頁（看自己 + 全站對比） | 同個 component 內的 `step="done"` 階段 |
| 資料 storage | `RealProfileExtension.painPoints: { id, intensity }[]` |
| 聚合統計 | Cloud Function 跑 / Firestore aggregation |
| Pain-point 定義 | port simulator `PAIN_POINTS` 14 條到 `lib/config.js` |

**估工時：1 天**

### 3.2 推薦引擎讓問卷有意義（高優先）

填完問卷後，needs-wall 上的「最新話題」section 應該根據答案重新排序。
simulator 已經做好這個邏輯：

```js
// data/chat.ts 或新 lib/recommendation.ts
function scoreRoom(room, profile) {
    let score = 0;
    if (profile.industries?.includes(room.industryId)) score += 5;
    if (room.tags.some((t) => boostedCategories(profile).has(t.name))) score += 3;
    score += room.replyCount * 0.05;
    return score;
}
```

| 動作 | 檔案 |
|---|---|
| Server-side 推薦 helper | `data/chat.ts` 加 `loadRecommendedRoomsForUser` |
| 在 needs-wall 加「為你推薦」section | 介於「投票牆」跟「最新話題」之間 |
| 推薦原因 chip | port `t.recReasons` 邏輯到主站 |

**估工時：半天**

### 3.3 Badge 系統（高優先 — 為了航拓）

這是 simulator 的核心 demo feature，**needs-wall 必須要看到 badge**，
不然航拓的曝光就無感。

| 動作 | 檔案 |
|---|---|
| 加 badge type | `data/profile.ts` `BadgeType` union 加 `brand-expert` `industry-expert` `top-contributor` `moderator` |
| BADGES_CONFIG 加 4 條 | `lib/config.js`（icon + color + description） |
| 既有 `ProfileBadge.tsx` 不用改 | 它讀 `BADGES_CONFIG[badgeType]` |
| Trending 卡片顯示 badge | `pages/[lang]/dashboard/needs-wall.jsx` 或對應的 trending component 加一行：`{topic.authorBadges?.length > 0 && <BadgeRow ...>}` |

**估工時：半天**

### 3.4 品牌（航拓） — 跟 needs-wall 是 sibling 頁

航拓的 marketing 主場應該是**獨立的 page**，不擠進 needs-wall：

| 動作 | 檔案 |
|---|---|
| Brand model | `data/brand.ts`（id / name / fullName / emoji / color / accent / tagline / description / websiteUrl） |
| Brand collection | Firestore `brands` collection（手動放航拓那一筆） |
| Profile 加品牌欄位 | `RealProfileExtension.brandAffiliation: { brandId, role, years }` |
| 品牌頁 | `pages/[lang]/dashboard/brands/[brandId].jsx` — port simulator `BrandPage.jsx` |
| 個人頁 | `pages/[lang]/dashboard/u/[userId].jsx` — port simulator `UserProfile.jsx`（主站可能已經有 `pages/[lang]/user/[profileId].jsx`，可以直接擴充那一個，不要重做） |
| 認證專家總覽 | `pages/[lang]/dashboard/forum/experts.jsx` — port simulator `ExpertsList.jsx` |
| **needs-wall 怎麼接** | 在 trending section 旁加一個小 sidebar block「🌟 認證專家｜航拓」 |
| **trending card 怎麼變** | 如果該 topic 的最熱回覆來自 brand-expert，卡片右下角顯示「⛵航拓專家已回覆」chip |

**估工時：1.5 天**

### 3.5 版主治理 — 在話題詳細頁，不在 needs-wall

needs-wall 是 dashboard，治理工具不在這裡。在 `/dashboard/forum/[chatRoomId]`：

| 動作 | 檔案 |
|---|---|
| Reuse 既有 `ChatRoom.communityAdmin` | 不新建欄位 |
| 加 mod menu 在 ChatMessage | `components/Chat/ChatMessage.tsx` 加「⋯⋯」popup（檢舉 / 版主刪除） |
| 加 mod toolbar 在 ChatRoom header | 「置頂 / 鎖定」 |
| API endpoints | `pages/api/chat/messages/[id]/delete.ts`、`/api/chat/rooms/[id]/pin.ts`、`/api/chat/messages/[id]/report.ts` — server-side 一律 verify `communityAdmin` |
| Mod 標籤同步 | 用既有 `Profile.badges.includes('moderator')` 判定有沒有 mod 入口 |

**估工時：1 天**

### 3.6 反應（reactions）— 跟版主治理同地點

同樣放在 `/dashboard/forum/[chatRoomId]`，是 ChatMessage 的擴充：

| 動作 | 檔案 |
|---|---|
| Reactions storage | 新 collection `chatMessageReactions` 或 `ChatMessage.reactions: Record<emoji, userId[]>` |
| API | `POST /api/chat/messages/[id]/react` |
| UI | port simulator 的 reactionsRow + reactionPicker |

**估工時：半天**

### 3.7 Helpful 投票 + 編輯／刪除（自己留言）

跟 reactions 同一地點，邏輯類似：

| 動作 | 檔案 |
|---|---|
| `ChatMessage.helpfulCount` + voters | 新欄位 |
| `POST /api/chat/messages/[id]/helpful` | 一人一票 toggle |
| `POST /api/chat/messages/[id]/edit` | 只允許 `senderId === uid` |
| `DELETE /api/chat/messages/[id]` | 自己 OR 版主 |
| UI | port simulator `replyActions` row |

**估工時：半天**

### 3.8 我的活動 / 我的收藏 — 是 dashboard 子頁，不是 needs-wall section

| 功能 | 路由 | 怎麼接 needs-wall |
|---|---|---|
| 我的活動 | `pages/[lang]/dashboard/me/activity.jsx` | needs-wall 上完全不顯示。從 TopBar 使用者選單進入 |
| 我的收藏 | `pages/[lang]/dashboard/me/saved.jsx` | 同上 |
| 在 ChatMessage 上的「收藏」按鈕 | message footer | 跟 helpful 同列 |

**估工時：1 天**（兩個 page + 一個收藏 toggle）

### 3.9 ⌘K 搜尋 + 通知整合

| 功能 | 主站既有 | 動作 |
|---|---|---|
| ⌘K 搜尋 | ✅ `components/Popup/SearchOverlay.tsx` 已存在 | 加新 result types：`topic` `expert` `brand` |
| 通知中心 | ✅ `components/NotificationPopup/` + `data/notification.ts` 已存在 | 加新 event types：`new_reply_to_my_topic`、`brand_expert_replied`、`industry_trending` |

**估工時：半天**（純擴充既有元件）

---

## 4. 具體檔案改動清單（按 needs-wall 為起點）

如果要排成 PR 系列，建議分 5 個 PR：

### PR #1：needs-wall 補上 Badge 顯示（最小破壞）
1. `data/profile.ts`：加 4 個 BadgeType
2. `lib/config.js`：BADGES_CONFIG 加 4 條
3. `pages/[lang]/dashboard/needs-wall.jsx` trending section：把
   `<BadgeRow badges={topic.authorBadges} />` 渲染進去
4. backfill：給航拓的 2 位顧問的 Profile 加 `badges: ["brand-expert", "kol"]`
5. （Optional）給活躍的回覆者加 `top-contributor` badge

→ **看起來的效果**：needs-wall 上「你的論壇正熱」每張卡片，如果該話題
的熱門回覆來自帶 badge 的人，名稱旁會出現 badge icon。航拓開始有
曝光，這是最低成本的「demo to integration」。

### PR #2：問卷頁面 + 推薦排序
1. `pages/[lang]/dashboard/needs-wall/survey.jsx`
2. `data/profile.ts` `RealProfileExtension.painPoints` 欄位
3. `data/chat.ts` `loadRecommendedRoomsForUser`
4. needs-wall 加「為你推薦」section（trending 跟最新之間）

### PR #3：品牌 + 個人頁
1. `data/brand.ts` 新 model
2. Firestore `brands` collection 手動放航拓
3. `pages/[lang]/dashboard/brands/[brandId].jsx`
4. `pages/[lang]/dashboard/forum/experts.jsx`
5. needs-wall 加 sidebar block「🌟 認證專家」（連到 `/forum/experts`）

### PR #4：話題詳細頁的 reactions / helpful / edit / delete / mod
1. ChatMessage 加 `reactions`、`helpfulCount` 欄位
2. 五個新 API endpoints
3. ChatMessage UI 加 reactions row + helpful btn + ⋯⋯ menu
4. ChatRoom header 加 mod toolbar（pin / lock）

### PR #5：搜尋 + 通知擴充
1. SearchOverlay 加 topic / expert / brand result types
2. Notification model 加新 event types
3. Cloud Function 觸發新通知

---

## 5. needs-wall 改完後的 mockup 預覽

```
┌─────────────────────────────────────────────────────────────┐
│  TopBar：論壇 / 人脈 / 活動 / 心得 / 話題牆                  │
├─────────────────────────────────────────────────────────────┤
│  Hero：大家最近在關心什麼？                                  │
│  [現有不變]                                                   │
├─────────────────────────────────────────────────────────────┤
│  📋 每週焦點問卷                                              │
│  [開始填問卷 → /needs-wall/survey] [稍後提醒我]              │
│  [現有保留，按鈕導向 PR#2 的新頁]                             │
├─────────────────────────────────────────────────────────────┤
│  📊 本週話題投票牆（3 題）                                    │
│  [現有不變，比 simulator 的 A/B 更好]                         │
├─────────────────────────────────────────────────────────────┤
│  ★ 為你推薦  ← PR#2 新加                                      │
│  「你訂閱了金融業」「跟你的困擾相關」chip + 4 張卡片           │
├─────────────────────────────────────────────────────────────┤
│  ┌──────────────────────────────┬────────────────────┐       │
│  │  🔥 你的論壇正熱             │  🌟 認證專家       │       │
│  │  [現有 trending list]        │  ⛵ 航拓策略顧問   │       │
│  │  + 卡片右下加 ⛵航拓 chip    │  · 林顧問 · 陳顧問 │       │
│  │  + author 名旁加 BadgeRow    │  → 看品牌頁        │       │
│  │  ↑ PR#1 + PR#3                │  ↑ PR#3 sidebar    │       │
│  └──────────────────────────────┴────────────────────┘       │
├─────────────────────────────────────────────────────────────┤
│  📝 最新話題                                                  │
│  [現有不變] + 卡片上加 BadgeRow ← PR#1                        │
├─────────────────────────────────────────────────────────────┤
│  🏛️ 我的論壇                                                  │
│  [現有不變]                                                   │
└─────────────────────────────────────────────────────────────┘

→ 點任何 trending card 進入 /dashboard/forum/{chatRoomId}
   chat 頁有：reactions, helpful, edit/delete, mod tools
   ↑ PR#4

→ 點任何作者名字進入 popover → /dashboard/u/{userId}
   ↑ PR#3

→ ⌘K 全站搜尋話題 / 專家 / 品牌
   通知中心多新類型
   ↑ PR#5
```

---

## 6. 哪些 simulator 的東西不要 port

這些是 simulator-only 的工具，**不要進主站**：

- `lib/store.js` 整個（用 Firestore 取代）
- `DEMO_ROLES` 切換身份按鈕（純測試工具）
- `SimulatorBar` 的 SIMULATOR chip
- `Onboarding` 的「2 / 2」步驟設計（主站可能已有 onboarding flow）
- `pages/settings.jsx` 中「重置 Demo」紅色 zone
- A/B 投票模型（needs-wall 已有更好的多選版本）
- HANDOFF.md、INTEGRATION.md、FORUM_INTEGRATION.md（這些是給工程師看的，不是 prod 內容）

---

## 7. 推薦執行順序

如果你只能做一個 PR，做 **PR#1（badge 顯示）**。3-4 小時，視覺
變化最有感（航拓開始出現在 needs-wall trending 卡片上），對既有
資料零破壞。

如果你能做兩個，加 **PR#3（品牌 + 個人頁）**。讓「點進去看完整
航拓介紹」這個 demo 動線打通。

如果有一週，按順序 PR#1 → PR#3 → PR#2 → PR#4 → PR#5。

---

## 8. 跟 simulator 對照的指令

```bash
# 看 simulator 上 needs-wall 對應的內容怎麼長
open https://internx-discuss-sim.zeabur.app

# 看主站既有 needs-wall
open https://staging.internx.me/zh-tw/dashboard/needs-wall

# 看 simulator badge / brand 怎麼做
cat ~/Desktop/internx-discuss-demo/components/Badge.jsx
cat ~/Desktop/internx-discuss-demo/components/Discuss/BrandPage.jsx

# 看 simulator API 介面（可作主站 API 設計參考）
ls ~/Desktop/internx-discuss-demo/pages/api/discuss/
```

整合決策權在你（實習通工程師）。simulator 提供的是 UI 設計 + API
shape + 互動行為的參考，你完全可以挑著用、改著用。
