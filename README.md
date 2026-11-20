# BMW 題庫練習

403 題選擇題（數位智能、電能生活、配備及功能、售後流程）。

## 功能
- 練習模式（每題對答案）／模擬考（交卷才計分，可前後翻題）
- 範圍、題數、出題來源（全部／沒做過的／錯題本／收藏）
- 計時、成績紀錄、分數走勢圖、各分類掌握度圓環、連續練習天數
- 檢討頁：錯題本、收藏、有筆記、全部題庫搜尋；每題可寫檢討筆記
- 同步代碼：多台裝置共用紀錄、錯題、收藏、筆記

## 檔案
- `public/index.html`：整個練習網頁（題目資料內嵌）
- `src/worker.js`：Cloudflare Worker，提供 `/api/sync` 同步 API（D1）
- `wrangler.jsonc`：Worker 設定（名稱、靜態檔資料夾、D1 綁定）

## 部署（Cloudflare Workers + Git）
1. D1 建立資料庫（例如 `bmw-quiz-db`），名稱填進 `wrangler.jsonc` 的 `database_name`。
2. Workers & Pages → bmw-quiz → Settings → Build：連結這個 repo，Deploy command 用 `npx wrangler deploy`。
3. push 到 main 就會自動部署。資料表會在第一次同步時自動建立。

## 使用同步
首頁最下方輸入同步代碼（至少 4 字），每台裝置輸入同一組代碼即可共用紀錄、錯題、收藏與筆記。
