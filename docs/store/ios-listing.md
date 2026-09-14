# App Store 上架文案（iOS）

草稿 2026-09-15。欄位長度上限依 App Store Connect：名稱 30、副標 30、宣傳文字 170、描述 4000、關鍵字 100（逗號分隔、不含空格）、更新說明 4000。
改完跑 `node docs/store/check-lengths.js` 確認沒超限。各語言的「名稱」若在 App Store Connect 建 App 時被佔用，改用「備用名稱」。

## 共通欄位（不分語言）

- 分類：主要 Health & Fitness；次要 Productivity
- 年齡分級問卷：全部 None → 4+
- App Privacy（隱私標籤）：Data Not Collected（不收集任何資料）
- 支援網址：https://github.com/nyannyn/drinkmorewater/issues
- 行銷網址：https://nyannyn.github.io/drinkmorewater/
- 隱私權政策網址：https://nyannyn.github.io/drinkmorewater/privacy.html
- 版權：2026 nyannyn
- 審核備註（Notes for Review，英文）：
  > No account or sign-in. All data stays on device. "Cross-device sync" is optional and requires the user's own self-hosted server — it can be skipped during review. To test notifications: Settings tab → "Send test notification" (fires in ~5 seconds); regular reminders are scheduled local notifications at the chosen interval within the active hours.

---

## zh-Hant

- name: 喝水提醒
- name_backup: 喝水提醒 - Drink Water
- subtitle: 定時提醒、追蹤每日飲水
- promo: 時間到就提醒你喝水，通知上直接按「我喝了」；每日、每週飲水量一目了然。無帳號、無廣告，資料只留在你手機。
- keywords: 喝水,提醒,飲水,水杯,補水,健康,習慣,追蹤,water,reminder,hydration,drink

### description
喝水提醒是一個安靜、沒有負擔的喝水小幫手：設定間隔，時間到手機會提醒你；喝了就在通知上按「我喝了」，不必打開 App。

功能
• 定時提醒：15 分鐘到數小時任你設定，只在你指定的活躍時段內提醒，睡覺時不吵你
• 一鍵記錄：通知上直接按「我喝了」，或打開 App 按「喝一杯」
• 每日目標：自訂目標與每次飲水量，進度用水杯畫給你看，達標會慶祝
• 過去 7 天：長條圖看這週喝得夠不夠，達標的日子會變綠
• 四種語言：繁體中文、簡體中文、English、日本語，通知文字也跟著換
• 跨裝置同步（選用）：與桌面版或另一支手機共享紀錄，用 6 位配對碼連動，不需帳號

隱私
所有飲水紀錄與設定只存在你的手機上。沒有帳號、沒有廣告、沒有追蹤或分析。除非你主動啟用跨裝置同步並填入自己架設的伺服器網址，App 不會連網。

原始碼完全公開，歡迎檢視：github.com/nyannyn/drinkmorewater

### whatsnew
首次上架。

---

## zh-Hans

- name: 喝水提醒
- name_backup: 喝水提醒 - Drink Water
- subtitle: 定时提醒、追踪每日饮水
- promo: 时间到就提醒你喝水，通知上直接按「我喝了」；每日、每周饮水量一目了然。无账号、无广告，数据只留在你手机。
- keywords: 喝水,提醒,饮水,水杯,补水,健康,习惯,追踪,water,reminder,hydration,drink

### description
喝水提醒是一个安静、没有负担的喝水小帮手：设定间隔，时间到手机会提醒你；喝了就在通知上按「我喝了」，不必打开 App。

功能
• 定时提醒：15 分钟到数小时任你设定，只在你指定的活跃时段内提醒，睡觉时不吵你
• 一键记录：通知上直接按「我喝了」，或打开 App 按「喝一杯」
• 每日目标：自定义目标与每次饮水量，进度用水杯画给你看，达标会庆祝
• 过去 7 天：柱状图看这周喝得够不够，达标的日子会变绿
• 四种语言：繁体中文、简体中文、English、日本語，通知文字也跟着换
• 跨设备同步（可选）：与桌面版或另一部手机共享记录，用 6 位配对码联动，不需账号

隐私
所有饮水记录与设置只存在你的手机上。没有账号、没有广告、没有追踪或分析。除非你主动启用跨设备同步并填入自己搭建的服务器地址，App 不会联网。

源代码完全公开，欢迎查阅：github.com/nyannyn/drinkmorewater

### whatsnew
首次上架。

---

## en

- name: Drink Water Reminder
- name_backup: Drink Water Reminder: Hydrate
- subtitle: Hydration reminders & tracking
- promo: Get reminded to drink on schedule and log it right from the notification. Daily and weekly intake at a glance. No account, no ads — your data stays on your phone.
- keywords: water,drink,reminder,hydration,hydrate,intake,tracker,health,habit,daily,goal,cup

### description
Drink Water Reminder is a quiet, no-fuss hydration companion: pick an interval, get a nudge when it's time, and tap "I drank" on the notification — no need to open the app.

Features
• Scheduled reminders: from 15 minutes to several hours, only within the active hours you set, so it stays silent while you sleep
• One-tap logging: tap "I drank" on the notification, or "Drink a cup" in the app
• Daily goal: set your goal and cup size; progress fills a cup, and reaching the goal gets a small celebration
• Last 7 days: a bar chart shows how the week went, with goal-reached days in green
• Four languages: Traditional Chinese, Simplified Chinese, English, Japanese — notifications follow your choice
• Cross-device sync (optional): share your log with the desktop app or another phone using a 6-digit pairing code, no account needed

Privacy
All records and settings live only on your phone. No account, no ads, no tracking or analytics. The app makes no network requests unless you turn on cross-device sync and enter the address of a server you host yourself.

Fully open source: github.com/nyannyn/drinkmorewater

### whatsnew
Initial release.

---

## ja

- name: 水分補給リマインダー
- name_backup: 水分補給リマインダー - Drink Water
- subtitle: 定時リマインドと飲水記録
- promo: 時間になったら通知でお知らせ。通知の「飲んだ」を押すだけで記録完了。今日と今週の飲水量がひと目でわかります。アカウント不要・広告なし。
- keywords: 水分補給,水,リマインダー,飲水,記録,健康,習慣,water,reminder,hydration,drink

### description
水分補給リマインダーは、静かで手間のかからない飲水サポートアプリです。間隔を決めておけば時間になったら通知でお知らせ。通知の「飲んだ」を押すだけで、アプリを開かずに記録できます。

機能
• 定時リマインド：15 分から数時間まで自由に設定。指定した活動時間帯の中だけ通知するので、睡眠中は静かです
• ワンタップ記録：通知の「飲んだ」か、アプリの「一杯飲む」をタップ
• 1 日の目標：目標量と 1 回の量を設定。進み具合はコップの水位で表示、達成するとお祝い
• 過去 7 日間：棒グラフで今週の飲水量を確認。目標達成日は緑で表示
• 4 言語対応：繁体字中国語・簡体字中国語・英語・日本語。通知文も切り替わります
• デバイス間同期（任意）：デスクトップ版や別のスマートフォンと記録を共有。6 桁のペアリングコードで連携、アカウント不要

プライバシー
飲水記録と設定はすべてお使いの端末にのみ保存されます。アカウントも広告もトラッキングもありません。ご自身で用意したサーバーの URL を入力してデバイス間同期を有効にしない限り、アプリは通信を行いません。

ソースコードは完全公開：github.com/nyannyn/drinkmorewater

### whatsnew
初回リリース。
