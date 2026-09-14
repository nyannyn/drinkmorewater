import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  AppState,
  AppStateStatus,
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import * as Notifications from "expo-notifications";

import HomeScreen from "./src/screens/HomeScreen";
import SettingsScreen from "./src/screens/SettingsScreen";
import { getRawItem, loadData, saveData } from "./src/core/storage";
import { handleDrinkComplete, padToWeek, resetDailyIfNeeded, resetData } from "./src/core/tracking";
import { getDisplayTracking, markSettingsChanged, runSync } from "./src/core/sync";
import { buildDemoData } from "./src/core/demo";
import { AppData, DEFAULTS, DayLog } from "./src/core/types";
import {
  ACTION_DRANK,
  configureForegroundHandler,
  registerCategory,
  requestPermissions,
  rescheduleReminders,
  sendTestNotification,
} from "./src/notifications/notify";
import { t } from "./src/i18n";

configureForegroundHandler();

type Tab = "home" | "settings";

export default function App() {
  const [ready, setReady] = useState(false);
  const [data, setData] = useState<AppData>(DEFAULTS);
  const [weekly, setWeekly] = useState<{ log: DayLog[]; dailyGoalMl: number }>({ log: [], dailyGoalMl: DEFAULTS.dailyGoalMl });
  const [scheduled, setScheduled] = useState(0);
  const [tab, setTab] = useState<Tab>("home");
  const appState = useRef(AppState.currentState);

  // 重新載入畫面資料（不重排通知）。顯示值疊加其他裝置的貢獻（未連動時與本機相同）。
  const reload = useCallback(async () => {
    const raw = await loadData();
    const disp = await getDisplayTracking(raw);
    setData({ ...raw, todayMl: disp.todayMl, todayCups: disp.todayCups, weeklyLog: disp.weeklyLog, lastDate: disp.lastDate });
    setWeekly({
      log: padToWeek([...disp.weeklyLog, { date: disp.lastDate, ml: disp.todayMl, cups: disp.todayCups }], disp.lastDate),
      dailyGoalMl: raw.dailyGoalMl,
    });
  }, []);

  // 與伺服器同步（若已連動）：拉回其他裝置數據、套用較新的遠端設定，再刷新畫面。
  const doSync = useCallback(async () => {
    const raw = await loadData();
    const res = await runSync(raw);
    if (res?.settingsToApply) await saveData(res.settingsToApply);
    await reload();
  }, [reload]);

  // 重排通知 + 更新畫面
  const reschedule = useCallback(async () => {
    const n = await rescheduleReminders();
    setScheduled(n);
    await reload();
  }, [reload]);

  // 啟動：權限、類別、跨日重設、首次排程
  useEffect(() => {
    (async () => {
      await registerCategory();
      // 截圖模式（EXPO_PUBLIC_SCREENSHOT=1，僅 CI 截圖 build 設定）跳過權限請求，
      // 避免系統權限對話框擋住畫面，使自動截圖能拍到實際 UI；並在儲存為空時
      // 寫入示範資料，讓 App Store 截圖有內容。正式 build 不受影響。
      if (process.env.EXPO_PUBLIC_SCREENSHOT === "1") {
        // 每次啟動都重寫示範資料（不只在空儲存時）：截圖 job 會連續重啟 8 次，
        // 若跨過午夜，resetDailyIfNeeded 會把示範資料歸零，各語言截圖內容就不一致。
        await saveData(buildDemoData());
        // CI 在兩次啟動之間直接改 AsyncStorage 的 manifest.json 寫入 screenshot-config，
        // 決定這次啟動要用的語言與分頁（simctl openurl 會跳「Open in…?」確認框，走不通）。
        const cfg = JSON.parse((await getRawItem("screenshot-config")) ?? "{}") as { lang?: string; tab?: Tab };
        if (cfg.lang) await saveData({ lang: cfg.lang });
        if (cfg.tab === "settings") setTab("settings");
      } else {
        const granted = await requestPermissions();
        if (!granted) {
          const s = t(DEFAULTS.lang);
          console.warn(s.permDenied);
        }
      }
      await resetDailyIfNeeded();
      await reschedule();
      await doSync();
      setReady(true);
    })();
  }, [reschedule, doSync]);

  // 進前景：跨日重設並重排（補上背景期間消耗掉的通知）
  useEffect(() => {
    const sub = AppState.addEventListener("change", async (next: AppStateStatus) => {
      if (appState.current.match(/inactive|background/) && next === "active") {
        await resetDailyIfNeeded();
        await reschedule();
        await doSync();
      }
      appState.current = next;
    });
    return () => sub.remove();
  }, [reschedule, doSync]);

  // 通知互動：按「我喝了」動作鈕或點通知 → 記錄並重排
  useEffect(() => {
    const sub = Notifications.addNotificationResponseReceivedListener(async (response) => {
      if (response.actionIdentifier === ACTION_DRANK) {
        await handleDrinkComplete();
      }
      await reschedule(); // 喝水後（或點開後）重排下一輪
      await doSync();
      setTab("home");
    });
    return () => sub.remove();
  }, [reschedule, doSync]);

  const onDrink = useCallback(async () => {
    await handleDrinkComplete();
    await reschedule();
    await doSync();
  }, [reschedule, doSync]);

  const onPatch = useCallback(
    async (patch: Partial<AppData>) => {
      await saveData(patch);
      await markSettingsChanged(); // 標記設定變更，下次同步以較新時間戳覆蓋其他裝置
      await reschedule();
      await doSync();
    },
    [reschedule, doSync]
  );

  const onReset = useCallback(async () => {
    await resetData();
    await reload();
  }, [reload]);

  const onTest = useCallback(async () => {
    await sendTestNotification();
  }, []);

  const s = t(data.lang);

  if (!ready) {
    return (
      <SafeAreaView style={styles.center}>
        <ActivityIndicator size="large" color="#4DA3FF" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar style="dark" />
      <Text style={styles.header}>💧 {s.appTitle}</Text>

      <View style={styles.body}>
        {tab === "home" ? (
          <HomeScreen data={data} weekly={weekly} onDrink={onDrink} />
        ) : (
          <SettingsScreen data={data} scheduledCount={scheduled} onPatch={onPatch} onReset={onReset} onTest={onTest} onSynced={reload} />
        )}
      </View>

      <View style={styles.tabbar}>
        {/* testID → iOS accessibilityIdentifier，CI 截圖腳本靠它跨語言定位分頁 */}
        <Pressable style={styles.tab} onPress={() => setTab("home")} testID="tab-home">
          <Text style={[styles.tabText, tab === "home" && styles.tabOn]}>{s.home}</Text>
        </Pressable>
        <Pressable style={styles.tab} onPress={() => setTab("settings")} testID="tab-settings">
          <Text style={[styles.tabText, tab === "settings" && styles.tabOn]}>{s.settings}</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#F7FBFF" },
  center: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#F7FBFF" },
  header: { fontSize: 22, fontWeight: "700", color: "#1B6FC4", textAlign: "center", paddingVertical: 14 },
  body: { flex: 1 },
  tabbar: { flexDirection: "row", borderTopWidth: 1, borderTopColor: "#e3eef7", backgroundColor: "#F7FBFF" },
  tab: { flex: 1, paddingVertical: 14, alignItems: "center" },
  tabText: { fontSize: 16, color: "#9bb6cc" },
  tabOn: { color: "#1B6FC4", fontWeight: "700" },
});
