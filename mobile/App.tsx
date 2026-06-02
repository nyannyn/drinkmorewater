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
import { loadData, saveData } from "./src/core/storage";
import { getWeeklyStats, handleDrinkComplete, resetDailyIfNeeded, resetData } from "./src/core/tracking";
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

  // 重新載入畫面資料（不重排通知）
  const reload = useCallback(async () => {
    setData(await loadData());
    setWeekly(await getWeeklyStats());
  }, []);

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
      const granted = await requestPermissions();
      if (!granted) {
        const s = t(DEFAULTS.lang);
        console.warn(s.permDenied);
      }
      await resetDailyIfNeeded();
      await reschedule();
      setReady(true);
    })();
  }, [reschedule]);

  // 進前景：跨日重設並重排（補上背景期間消耗掉的通知）
  useEffect(() => {
    const sub = AppState.addEventListener("change", async (next: AppStateStatus) => {
      if (appState.current.match(/inactive|background/) && next === "active") {
        await resetDailyIfNeeded();
        await reschedule();
      }
      appState.current = next;
    });
    return () => sub.remove();
  }, [reschedule]);

  // 通知互動：按「我喝了」動作鈕或點通知 → 記錄並重排
  useEffect(() => {
    const sub = Notifications.addNotificationResponseReceivedListener(async (response) => {
      if (response.actionIdentifier === ACTION_DRANK) {
        await handleDrinkComplete();
      }
      await reschedule(); // 喝水後（或點開後）重排下一輪
      setTab("home");
    });
    return () => sub.remove();
  }, [reschedule]);

  const onDrink = useCallback(async () => {
    await handleDrinkComplete();
    await reschedule();
  }, [reschedule]);

  const onPatch = useCallback(
    async (patch: Partial<AppData>) => {
      await saveData(patch);
      await reschedule();
    },
    [reschedule]
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
          <SettingsScreen data={data} scheduledCount={scheduled} onPatch={onPatch} onReset={onReset} onTest={onTest} />
        )}
      </View>

      <View style={styles.tabbar}>
        <Pressable style={styles.tab} onPress={() => setTab("home")}>
          <Text style={[styles.tabText, tab === "home" && styles.tabOn]}>{s.home}</Text>
        </Pressable>
        <Pressable style={styles.tab} onPress={() => setTab("settings")}>
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
  tabbar: { flexDirection: "row", borderTopWidth: 1, borderTopColor: "#e3eef7" },
  tab: { flex: 1, paddingVertical: 14, alignItems: "center" },
  tabText: { fontSize: 16, color: "#9bb6cc" },
  tabOn: { color: "#1B6FC4", fontWeight: "700" },
});
