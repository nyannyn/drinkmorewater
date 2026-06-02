import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { DayLog } from "../core/types";
import { t } from "../i18n";

interface Props {
  log: DayLog[];
  dailyGoalMl: number;
  lang: string;
}

// 過去 7 天長條圖（純 View 高度表示，無第三方圖表庫）。
export default function WeeklyChart({ log, dailyGoalMl, lang }: Props) {
  const s = t(lang);
  const days = log.slice(-7);
  const max = Math.max(dailyGoalMl, ...days.map((d) => d.ml), 1);

  return (
    <View style={styles.row}>
      {days.map((d, i) => {
        const h = Math.max(4, (d.ml / max) * 100);
        const reached = d.ml >= dailyGoalMl;
        const wd = s.days[new Date(d.date).getDay()];
        return (
          <View key={i} style={styles.col}>
            <View style={styles.barArea}>
              <View
                style={[styles.bar, { height: `${h}%`, backgroundColor: reached ? "#3FB950" : "#4DA3FF" }]}
              />
            </View>
            <Text style={styles.ml}>{d.ml}</Text>
            <Text style={styles.wd}>{wd}</Text>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: "row", justifyContent: "space-between", height: 150, marginTop: 8 },
  col: { flex: 1, alignItems: "center" },
  barArea: { flex: 1, width: 18, justifyContent: "flex-end" },
  bar: { width: 18, borderRadius: 4 },
  ml: { fontSize: 10, color: "#666", marginTop: 4 },
  wd: { fontSize: 11, color: "#999" },
});
