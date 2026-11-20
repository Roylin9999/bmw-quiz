# BMW 題庫練習

403 題選擇題（數位智能、電能生活、配備及功能、售後流程）。

## 功能
- 練習模式（每題對答案）／模擬考（交卷才計分，可前後翻題）
- 範圍、題數、出題來源（全部／沒做過的／錯題本／收藏）
- 計時、成績紀錄、分數走勢圖、各分類掌握度圓環、連續練習天數
- 檢討頁：錯題本、收藏、有筆記、全部題庫搜尋；每題可寫檢討筆記
- 同步代碼：多台裝置共用紀錄、錯題、收藏、筆記

## 檔案
- `index.html`：整個練習網頁（題目資料內嵌）
- `functions/api/sync.js`：同步 API（Cloudflare Pages Functions + D1）

## 部署（Cloudflare 後台操作）
1. **建立 D1**：Cloudflare 後台 → Storage & Databases → D1 → Create，名稱例如 `bmw-quiz-db`。
2. **建立 Pages**：Workers & Pages → Create → Pages → Connect to Git → 選 `bmw-quiz`。
   - Framework preset：None
   - Build command：留空
   - Build output directory：`/`
3. **綁定 D1**：Pages 專案 → Settings → Bindings → Add → D1 database，Variable name 填 **`DB`**，選剛建立的資料庫。
4. 回到 Deployments → 最新一筆 → Retry deployment（讓綁定生效）。

資料表會在第一次同步時自動建立。

## 使用同步
在首頁「練習紀錄」區輸入同步代碼（至少 4 字），每台裝置輸入同一組代碼即可共用紀錄與錯題本。
