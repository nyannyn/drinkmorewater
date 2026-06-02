import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import Cup from "../components/Cup";
import WeeklyChart from "../components/WeeklyChart";
import { AppData, DayLog } from "../core/types";
import { t } from "../i18n";

interface Props {
  data: AppData;
  weekly: { log: DayLog[]; dailyGoalMl: number };
  onDrink: () => void;
}

export default function HomeScreen({ data, weekly, onDrink }: Props) {
  const s = t(data.lang);
  const progress = data.dailyGoalMl > 0 ? data.todayMl / data.dailyGoalMl : 0;
  const reached = data.todayMl >= data.dailyGoalMl;

  return (
    <View style={styles.container}>
      <Cup progress={progress} label={`${data.todayMl} / ${data.dailyGoalMl} ml`} />

      <Text style={styles.cups}>
        {s.today} {data.todayCups} {s.cups}
        {reached ? `　${s.goalReached}` : ""}
      </Text>

      <Pressable style={styles.btn} onPress={onDrink}>
        <Text style={styles.btnText}>＋ {s.drink}（{data.drinkMl}ml）</Text>
      </Pressable>

      <Text style={styles.section}>{s.weekly}</Text>
      <WeeklyChart log={weekly.log} dailyGoalMl={weekly.dailyGoalMl} lang={data.lang} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: "center", paddingTop: 24, paddingHorizontal: 20 },
  cups: { marginTop: 18, fontSize: 16, color: "#444" },
  btn: {
    marginTop: 24,
    backgroundColor: "#4DA3FF",
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 28,
  },
  btnText: { color: "#fff", fontSize: 18, fontWeight: "600" },
  section: { alignSelf: "flex-start", marginTop: 32, fontSize: 16, fontWeight: "600", color: "#333" },
});
