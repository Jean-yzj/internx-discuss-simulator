# Agent Handoff — InternX Discuss Simulator

> **誰看這份**：接手這個專案的下一個 AI agent。
> **目標**：讀完這份就能繼續迭代，不用問「這個東西在哪」「為什麼這樣做」。

---

## 1. 是什麼、不是什麼

### 是什麼
這是「實習通」（InternX，台灣大學生的實習／職涯平台）**「話題討論」功能的獨立 demo / simulator**。給該公司的工程師預覽用，看完之後再決定要怎麼整合進主站。

### 不是什麼
- **不是**「實習通」主站的一部分
- **不是**主站的功能分支
- **不會**碰到主站任何資料、Firestore、認證、使用者
- **不應該**動到主站任何程式碼

### 為什麼這樣設計
使用者（Jean）非常明確要求：「不要把它跟原本的平臺混在一起」、「千萬不要動到原本的網站」。這個 simulator 完全獨立，目的是在不影響正式產品的前提下，讓 Jean 可以把功能 demo 給技術團隊看，**整合是技術團隊自己未來的事**。

我們提供 `INTEGRATION.md` 跟 `FORUM_INTEGRATION.md` 兩份手冊告訴他們怎麼接，但**我們不負責真的接**。

---

## 2. 三個地方

| 名稱 | 位置 | 用途 |
|---|---|---|
| **本機資料夾** | `/Users/jean/Desktop/internx-discuss-demo` | 開發 |
| **GitHub repo** | `git@github.com:Jean-yzj/internx-discuss-simulator.git` | 版控（在 Jean 個人帳號下，不在 internx-me org 下） |
| **Zeabur 專案** | `69f0c13bd031c5f63487f4d9` (`internx-discuss-simulator-osompt`) | 部署 |
| **線上 URL** | https://internx-discuss-sim.zeabur.app | 給人看 |

**Zeabur 是 Git-based 自動部署** — 你 push 到 GitHub `main` 分支，Zeabur 約 4–5 分鐘後自動重新部署。不需要手動 `npx zeabur deploy`。

---

## 3. 主站位置（**只讀**，不要動）

主站「實習通」的 frontend 程式碼在使用者的另一個資料夾：

- 主 repo: `~/Desktop/frontend`（worktree 在 `~/Desktop/frontend/.claude/worktrees/competent-mirzakhani-fb39c3`）
- 主 repo GitHub: `git@github.com:internx-me/frontend.git`
- 主 repo 線上：staging.internx.me（猜的；使用者沒有正式網址給我）

**進去這個資料夾的目的只有一個：抄設計、看資料模型、確認 BadgeType 有哪些**。**任何時候都不要修改主 repo 的檔案**。

主站的關鍵檔案在 `FORUM_INTEGRATION.md` 第二節有對照表。最常需要看的：
- `data/chat.ts` — `ChatRoom` / `ChatMessage` 模型
- `data/profile.ts` — `Profile` / `BadgeType`
- `lib/config.js` — `BADGES_CONFIG` / `FOOTER_COLUMNS` / `INDUSTRIES`（沒有，你不要新增到那裡）
- `components/Chat/ChatMessage.module.css` — 我們的 chat bubble 完全照抄這裡
- `components/Footer/` — Footer 完全照抄

---

## 4. 技術 stack

```
Next.js 14.2.34 (pages router)
React 18.3.1
JavaScript (no TypeScript)
CSS Modules
Remix Icon
```

**沒有任何外部 backend** — 這是它的核心架構決定：
- 後端：純 in-memory，全部在 `lib/store.js`
- 使用者狀態：純 localStorage，`lib/profile.js`
- 重啟伺服器資料會回到 seed

這個架構不是 bug，是 feature。Simulator 不該有真正的後端，因為它是 demo，不是 prod。**請保持這個架構，不要加 Firestore、不要加真的資料庫**。

---

## 5. 架構地圖

```
~/Desktop/internx-discuss-demo/
├── pages/                          ← Next.js routes
│   ├── _app.jsx                    全域 wrapper：Footer + BottomBar
│   ├── index.jsx                   /  首頁
│   ├── experts.jsx                 /experts  認證專家總覽
│   ├── polls/index.jsx             /polls
│   ├── survey.jsx                  /survey
│   ├── saved.jsx                   /saved
│   ├── settings.jsx                /settings
│   ├── forums/[industry].jsx       /forums/finance, /forums/consulting...
│   ├── topics/[id].jsx             /topics/t_xxx
│   ├── u/[userId].jsx              /u/u_lin_hangtuo
│   ├── brands/[brandId].jsx        /brands/hangtuo
│   └── api/discuss/                ← 22 個 API endpoints (in-memory)
│       ├── topics, topics/[id], topics/[id]/replies, topics/[id]/pin
│       ├── replies/[id], replies/[id]/helpful, replies/[id]/edit,
│       │  replies/[id]/react, replies/[id]/report
│       ├── industries, brands, brands/[brandId]
│       ├── users, users/[userId]
│       ├── polls, polls/[id], polls/[id]/vote
│       ├── pain-points, pain-points/stats
│       ├── recommendations, search
│
├── components/
│   ├── Footer.{jsx,module.css}     主站風格的黑底 footer
│   ├── BottomBar.{jsx,module.css}  手機底部導航
│   ├── SimulatorBar.{jsx,module.css} 頂部 bar（含搜尋 / 通知 / 切換身份 / 使用者 pill）
│   ├── SearchOverlay.{jsx,module.css} ⌘K 搜尋
│   ├── Onboarding.{jsx,module.css} 首次進站的「註冊」彈窗
│   ├── UserPopover.{jsx,module.css} 點作者名出現的浮層
│   ├── Badge.{jsx,module.css}      Badge / BadgeRow / BrandCallout / IconBadge
│   └── Discuss/
│       ├── DiscussList.{jsx,module.css} 首頁主元件
│       ├── DiscussRoom.{jsx,module.css} 話題詳細頁（聊天室風格）
│       ├── IndustryForum.{jsx,module.css} 單一行業論壇頁
│       ├── ExpertsList.{jsx,module.css} /experts 頁
│       ├── UserProfile.{jsx,module.css} /u/[userId] 頁
│       ├── BrandPage.{jsx,module.css}   /brands/[brandId] 頁
│       ├── PollsList.{jsx,module.css}   /polls 頁
│       ├── PollCard.{jsx,module.css}    投票卡片
│       ├── Survey.{jsx,module.css}      困擾調查
│       └── NewTopicModal.jsx            開新話題
│
├── lib/
│   ├── store.js                    ★ 後端：所有資料、所有 mutation 都在這
│   ├── profile.js                  localStorage 存取 + DEMO_ROLES 表
│   ├── useUserSession.js           React hook，包裝 profile 給頁面用
│
├── styles/globals.css              主站抄來的 CSS variables
├── public/
│   ├── internx-logo-{long-black,long-white,square}.svg  從主站 public/img/branding 抄來
│   └── favicon.svg
│
├── Dockerfile                      Node 20 alpine, multi-stage（給 Zeabur 用）
├── package.json
├── next.config.mjs
│
├── README.md
├── INTEGRATION.md                  通用 port-back 手冊
├── FORUM_INTEGRATION.md            ★ 給「實習通」工程師：每個 feature 怎麼接到既有 ChatRoom/ChatMessage/Profile
└── HANDOFF.md                      你正在看的這份
```

---

## 6. 資料模型（in-memory）

`lib/store.js` 開頭有 4 個 `export const` 常數：

```js
INDUSTRIES        // 8 個行業，每個有 id/label/emoji/accent/description
CATEGORIES        // 8 個子分類（職涯/實習/面試/技能/薪資/校園/副業/全部）
BRANDS            // 1 個合作品牌：航拓 (Hangtuo)
BADGE_DEFINITIONS // 5 種 badge：brand-expert/verified-creator/industry-expert/top-contributor/moderator
PAIN_POINTS       // 14 種困擾
REACTION_EMOJIS   // 5 個 reaction emojis: 👍❤️🤔😮💡
```

`makeStore()` 在模組載入時初始化：
- 19 個 seed topics（散在 8 個行業）
- 每個 topic 帶 2-3 個 seed replies
- 6 個 seed polls（含已預設票數讓百分比看起來活）
- 12 個 seed pain-point responses（讓「全站 X% 學生跟你一樣」看起來有資料）
- 6 個 seed users（4 位是 brand expert / industry expert / verified creator / moderator；2 位 top contributor）

State 是模組級單例 `STATE`。所有 API 都直接讀寫它。重啟 = reset。

### 重要：seed reply 怎麼接到 expert
看 `REPLY_AUTHOR_MAP`（lib/store.js 約 line 620）。它寫死「每個行業第一個 topic 的某幾則 reply 是哪個 user 寫的」。這樣航拓顧問的回覆會自然出現在管顧/金融/FMCG 的熱門 thread 裡，產生品牌曝光效果。

---

## 7. 使用者 / Profile / Demo Role

**沒有真的登入**。所有「使用者狀態」都在 `lib/profile.js` 的 `loadProfile()` / `saveProfile()` 操作 localStorage：

```js
{
    userId: "me_xxx",       // 隨機產生，永久綁這個瀏覽器
    displayName: "",
    industries: [...],      // 訂閱的行業
    onboardedAt: null,
    painPoints: null,       // 困擾調查回應
    pollVotes: {},          // pollId → 'a' | 'b'
    myActivity: [],         // 開過/回過的話題
    savedTopics: [],        // 收藏
    demoRole: "student",    // 見下
    badges: [], brand: null, moderates: [],  // 從 demoRole 算出來
}
```

### Demo Role（重要）
`DEMO_ROLES` 表有 7 種「假身份」（student / top-contributor / verified-creator / industry-expert / hangtuo-consultant / consulting-mod / tech-mod）。**這是 simulator-only 的測試工具**，讓 Jean 能切換不同 badge 看 UI 效果，**正式整合進主站後要拿掉**。

切換 role 時，`profile.badges` / `profile.brand` / `profile.moderates` 會從表格重算，但既有貼文上的 badge 是 post-time snapshot，不會跟著變（這是正確行為）。

---

## 8. 功能列表（完整）

> 這份是給你「我已經做了什麼」的清單。看完就知道哪些不用再做了。

### 已完成
- ✅ Onboarding（顯示名稱 + 多選行業）
- ✅ 8 個行業論壇（金融/管顧/科技/行銷/消費品/媒體/生技/製造）
- ✅ 話題列表 + 子分類 filter + 排序（最新/最多回覆/最多瀏覽）+「只看專家」 toggle
- ✅ 話題詳細頁（聊天室風格，照抄主站 ChatMessage 樣式）
- ✅ 開新話題（modal，必選行業 + 子分類）
- ✅ 回覆 + 自動 5 秒輪詢（模擬 live update）
- ✅ Helpful 投票 ❤️（一人一票）
- ✅ Reactions（5 種 emoji，可多選但同 emoji 一人一票）
- ✅ 自己留言可編輯／刪除（顯示「已編輯」）
- ✅ 檢舉留言（任何人）
- ✅ 5 種 badge：brand-expert（航拓）/ verified-creator / industry-expert / top-contributor / moderator
- ✅ 版主工具：刪別人留言、置頂話題、鎖定話題（依 demoRole 授權）
- ✅ 6 個 A vs B 投票 + 投票結果百分比
- ✅ 困擾調查（14 種 × 1-5 強度）
- ✅ 推薦引擎（行業 +5 / 困擾 +3 / 投票 +1 / replyCount × 0.05）
- ✅ ⌘K 搜尋 overlay（搜話題/專家/品牌）
- ✅ 通知中心（從 profile 狀態合成 5 種事件）
- ✅ 我的活動（記錄發起 + 回覆）
- ✅ 收藏話題 + `/saved` 頁
- ✅ 切換身份 demo（7 種角色）
- ✅ 個人頁 `/u/[userId]`
- ✅ 品牌頁 `/brands/[brandId]`（航拓有完整 marketing hero）
- ✅ 認證專家總覽 `/experts`
- ✅ 設定頁 `/settings`（改名、Demo 身份、重置）
- ✅ 手機底部 BottomBar（5 tabs，≤850px 顯示）
- ✅ Footer（深色，主站 1:1）
- ✅ INTEGRATION.md（通用整合手冊）
- ✅ FORUM_INTEGRATION.md（針對既有 forum 的整合手冊）

### 還沒做（候選清單）
這些還沒做。如果使用者要求，可以挑著做：

- 🔲 Reply 引用 / @mentions
- 🔲 圖片附件（demo 模式可只用 placeholder）
- 🔲 Markdown 格式（粗體/斜體/連結）
- 🔲 留言已讀標記（per-user）
- 🔲 「想當版主」申請流程
- 🔲 版主面板：列出本版被檢舉留言
- 🔲 真的多語系（目前只有繁中）
- 🔲 SEO meta tags（per page）
- 🔲 影片/連結 embed
- 🔲 多選投票（A vs B vs C）
- 🔲 milestone badges（你已經回 X 個話題！）
- 🔲 Welcome tour（onboarding 後的 4-step 介紹）

---

## 9. 怎麼開發

```bash
cd ~/Desktop/internx-discuss-demo

# 開發
npm run dev          # http://localhost:3000，hot reload

# 確認沒打壞
npm run build        # 失敗就不要 push

# 部署
git add -A
git commit -m "..."
git push             # Zeabur 自動 redeploy
```

### 觀察 Zeabur deploy
```bash
npx zeabur@latest deployment list \
    --service-id 69f0c1451d59e2e93bd66d85 \
    -i=false --json | grep -E '"status"|"commitSHA"' | head -2
```

`status` 會經過 `BUILDING` → `DEPLOYING` → `RUNNING`。約 4-5 分鐘。

### 看 build log（部署失敗時）
```bash
npx zeabur@latest deployment log \
    --service-id 69f0c1451d59e2e93bd66d85 \
    -t build -i=false 2>&1 | tail -50
```

---

## 10. Commit message 風格

看 `git log --oneline -10` 就知道。每個 commit message 用 imperative + 詳細的 body 解釋「做了什麼」「為什麼這樣做」「相對於之前的差別」。Body 通常 20-50 行，分小標題。Jean 看了會開心。

不需要 `Co-Authored-By: Claude` — 那是別的工具的慣例。

---

## 11. 視覺準則

讓 simulator **看起來像主站**，不像 demo。具體：

| Token | 值 | 規則 |
|---|---|---|
| `--theme-color` | `#0182fd` | 主要藍，主站同色 |
| `--theme-color-dark` | `#1861a8` | hover |
| `--theme-white` | `#deefff` | 淺藍底（avatar、tag 用） |
| `--complementary-color` | `#e2a200` | 黃，僅次要強調用 |
| `--border-radius` | `10px` | 全站圓角統一 |
| `--font-size` | `120px` (mobile `110px`) | base，所有字體用 `calc(/N)` 縮放 |
| `--top-bar-height` | `64px` | TopBar 固定高度 |
| Card border | `1px solid #e5e5e5` | 卡片邊框統一 |
| Card hover | `border-color: var(--theme-color); background: #fafcff` | 統一 hover |
| Footer | `#222` 黑底白字 | 主站 1:1 |
| Button primary | 48px 高、`var(--border-radius)`、`var(--theme-color)` 填色 | 不要 999px 圓角 |
| 聊天泡泡 | 自己 `#bfdbfe` 12/12/12/6，別人白底 6/12/12/12 + 淡 shadow | 抄主站 |
| 自己 avatar | `--theme-color` 底 + 白字 | 32px |
| 別人 avatar | `--theme-white` 底 + `--theme-color` 字 | 32px |

**禁忌**：誇張的漸層 hero（除了品牌頁 `/brands/[brandId]` 例外，那是航拓的行銷主場可以放）、999px capsule 主按鈕、彩色 emoji avatar。

---

## 12. 跟使用者互動的潛規則

從十幾輪對話歸納出來的 Jean 偏好：

1. **講中文**（繁體）。技術名詞混英文 OK。
2. **動作要果斷**。「繼續」「做完」這類短指令通常代表「你決定要做什麼，做就對了」。
3. **要實作就要部署**。每次寫完功能 → local build → push → 等 Zeabur → 驗證 → 回報。不要寫完就停。
4. **不要動主站**。再怎麼貼近主站視覺、再怎麼想 port 回去，都不行。simulator 是 simulator。
5. **品牌曝光很重要**。航拓（Hangtuo）的合作是真實的，他們是我們在做這個 demo 的關鍵原因之一。任何跟 brand expert 相關的功能都要做得「能被 demo 出去」。
6. **完成度 > 完美**。先把 8 個功能各做 80% 比把 1 個功能做到 100% 更有價值。
7. **整合手冊很重要**。Jean 會把這個 demo 給技術人員看，技術人員會看 `FORUM_INTEGRATION.md` 知道怎麼接。所以那份手冊跟程式碼一樣重要。
8. **驗證要明確**。每次部署完用 `curl` 測幾個關鍵 endpoint + `deployment list` 確認 RUNNING，列表格回報。
9. **不要主動加新依賴**。Next + React + Remix Icon 就夠了。要加東西先想想能不能用既有的。

---

## 13. 你最常會被問到的事

| 問題 | 怎麼處理 |
|---|---|
| 「再多做一點」 | 看 §8「還沒做」清單挑 5-8 個合理的功能，分波次做 |
| 「這個介面太醜」 | 先看 §11 視覺準則，再對照主站對應頁面看怎麼抄 |
| 「整合到實習通」 | 看 `FORUM_INTEGRATION.md`，但**不要動主站**，只能更新文件 |
| 「驗證一下」 | `curl` 一輪 + `deployment list`，列表格回報 |
| 「加一個 X」 | 1) 想清楚 X 是 simulator-only 還是要 port 回主站；2) 改 `lib/store.js` 加 model + helper；3) 加 API route；4) 加 UI；5) 改 `FORUM_INTEGRATION.md` 寫怎麼整合；6) build + push |
| 「換 brand」 | 改 `lib/store.js` 的 `BRANDS` 陣列 + `SEED_USERS` 加新顧問 + `REPLY_AUTHOR_MAP` 把 seed reply 接到他們 |

---

## 14. 已知限制 / 故意不修的東西

- 🔁 **重啟資料 reset** — 故意。simulator 不存資料庫。
- 🔒 **沒有真的權限** — 版主刪文、檢舉這些都只在 client + in-memory state 檢查。Production 真的接時要 server-side 驗證。`FORUM_INTEGRATION.md` §6 有寫。
- 📡 **沒有 WebSocket** — 用 5 秒 polling 模擬 live update。Demo 夠用。
- 🌐 **沒有多語系** — 只有繁中。主站本來就支援 zh-tw / en，port 回去時再加 INTL key。
- 🖼️ **沒有圖片上傳** — composer 只有純文字。
- 🔍 **搜尋是 substring match** — 不是 fuzzy 不是 indexed。資料量小夠用。

這些都不要改成「正確版本」，會讓 simulator 變得太重、不再是 simulator。要改的話先問使用者。

---

## 15. 緊急聯絡 / 常用 ID

```
GitHub repo:       Jean-yzj/internx-discuss-simulator
GitHub repo ID:    1223642015
Zeabur project:    69f0c13bd031c5f63487f4d9 (internx-discuss-simulator-osompt)
Zeabur service:    69f0c1451d59e2e93bd66d85 (discuss-sim)
Zeabur env:        69f0c13b1e7c7466bb9d10f8
Zeabur server:     69c8c404726b92873462484f (Singapore, Tencent)
Live URL:          https://internx-discuss-sim.zeabur.app
SSH key:           Jean-yzj GitHub SSH 已驗證可推 (使用 git@github.com:Jean-yzj/...)
```

---

## 16. 我留下的 sample queries

如果你需要測試：

```bash
# 服務狀態
npx zeabur@latest deployment list --service-id 69f0c1451d59e2e93bd66d85 -i=false --json | grep -E '"status"|"commitSHA"' | head -2

# 主站抄 chat 樣式時參考
~/Desktop/frontend/.claude/worktrees/competent-mirzakhani-fb39c3/components/Chat/ChatMessage.module.css

# 主站抄 footer 時參考
~/Desktop/frontend/.claude/worktrees/competent-mirzakhani-fb39c3/components/Footer/

# 看主站 BadgeType 全部有哪些
grep -A2 "BadgeType" ~/Desktop/frontend/.claude/worktrees/competent-mirzakhani-fb39c3/data/profile.ts | head -3

# 主站 lib/config.js 的 INDUSTRIES 一定要新增（沒有的話）
grep -n "INDUSTRIES" ~/Desktop/frontend/.claude/worktrees/competent-mirzakhani-fb39c3/lib/config.js
```

---

## 17. 給你的提醒

1. 開始前先 `git log --oneline -20` 看看最近做了什麼。
2. 看 `INTEGRATION.md` + `FORUM_INTEGRATION.md` 一遍，理解整合策略。
3. 每次大改之前先 `git status` 確認沒有 uncommitted 變動會被你蓋掉。
4. **永遠要 build 才推**。Next.js 14 + module CSS 偶爾會在 build 時抓到本機沒看到的問題（例如 `:global` selector 不純）。
5. push 後**等 Zeabur**，不要自己手動 deploy（Git deploy 已經 wired 好）。
6. 改完後寫 commit message 像第 §10 寫的那樣詳細。
7. 給使用者報告時用表格 + emoji + 連結。Jean 看得懂中文也看得懂英文，混用沒事。

歡迎接手 🫡 — 這個專案很有趣，你會玩得開心。
