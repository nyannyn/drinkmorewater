# Drink Water Reminder

結合實體喝水動作的沈浸式 Chrome 擴充功能。定時提醒你喝水，不喝就搗亂。

## 運作方式

1. 背景計時到期後，網頁游標變為枯萎黃色，右下角出現搖晃的空玻璃杯
2. 左手拿實體水杯喝水，右手長按螢幕上的杯子（按滿 3 秒 = 300ml，按比例計算）
3. 放開後顯示 +Xml 飄字，記錄飲水量，游標恢復正常，重新計時
4. 1 分鐘不理會，杯子自動碎裂消失

## 安裝

```bash
git clone https://github.com/nyannyn/drinkmorewater.git
```

1. Chrome 前往 `chrome://extensions/`
2. 開啟「開發人員模式」
3. 「載入未封裝項目」選擇此資料夾

修改程式碼後需回到此頁面點擊擴充功能的重新整理按鈕，並重新整理測試網頁。

## License

MIT
