import * as Notifications from "expo-notifications";
import * as Device from "expo-device";
import { Platform } from "react-native";
import { loadData } from "../core/storage";
import { computeReminderTimes } from "../core/schedule";

export const CATEGORY_ID = "drink-reminder";
export const ACTION_DRANK = "DRANK";

// 通知前景顯示行為：App 在前景時也跳橫幅。
export function configureForegroundHandler() {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowBanner: true,
      shouldShowList: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
    }),
  });
}

// 註冊通知類別：附「我喝了 💧」動作鈕，點了不必開 App 即可記錄。
export async function registerCategory() {
  await Notifications.setNotificationCategoryAsync(CATEGORY_ID, [
    {
      identifier: ACTION_DRANK,
      buttonTitle: "我喝了 💧",
      options: { opensAppToForeground: false },
    },
  ]);
}

// 請求通知權限（iOS 首次啟動會彈窗）。回傳是否取得授權。
export async function requestPermissions(): Promise<boolean> {
  if (!Device.isDevice) {
    // 模擬器無法收到排程通知，但權限 API 仍可呼叫。
    console.warn("本地通知需在實機測試才能可靠送達。");
  }
  const settings = await Notifications.getPermissionsAsync();
  let status = settings.status;
  if (status !== "granted") {
    const req = await Notifications.requestPermissionsAsync({
      ios: { allowAlert: true, allowSound: true, allowBadge: false },
    });
    status = req.status;
  }
  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync(CATEGORY_ID, {
      name: "喝水提醒",
      importance: Notifications.AndroidImportance.HIGH,
    });
  }
  return status === "granted";
}

// 核心：依設定重排未來一批提醒。先清掉舊的，再排新的。
// 在 App 啟動、進前景、喝水後、改設定後都應呼叫。
export async function rescheduleReminders(): Promise<number> {
  await Notifications.cancelAllScheduledNotificationsAsync();

  const data = await loadData();
  if (!data.enabled) return 0;

  const times = computeReminderTimes({
    now: new Date(),
    intervalMin: data.intervalMin,
    activeStart: data.activeStart,
    activeEnd: data.activeEnd,
  });

  for (const date of times) {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: "💧 該喝水了！",
        body: "你已經很久沒喝水了，記得補充水分哦！",
        sound: data.soundEnabled,
        categoryIdentifier: CATEGORY_ID,
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DATE,
        date,
      },
    });
  }
  return times.length;
}

export async function cancelAllReminders() {
  await Notifications.cancelAllScheduledNotificationsAsync();
}
