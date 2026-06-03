import React, { useState } from "react";
import {
  Alert,
  Pressable,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
} from "react-native";
import { AppData, DRINK_OPTIONS, INTERVAL_OPTIONS } from "../core/types";
import { LANGUAGES, t } from "../i18n";
import SyncSection from "./SyncSection";

interface Props {
  data: AppData;
  scheduledCount: number;
  onPatch: (patch: Partial<AppData>) => void;
  onReset: () => void;
  onTest: () => void;
  onSynced: () => void;
}

export default function SettingsScreen({ data, scheduledCount, onPatch, onReset, onTest, onSynced }: Props) {
  const s = t(data.lang);
  const [goal, setGoal] = useState(String(data.dailyGoalMl));
  const [start, setStart] = useState(data.activeStart);
  const [end, setEnd] = useState(data.activeEnd);

  const confirmReset = () => {
    Alert.alert(s.reset, s.resetConfirm, [
      { text: s.cancel, style: "cancel" },
      { text: s.confirm, style: "destructive", onPress: onReset },
    ]);
  };

  return (
    <View style={styles.container}>
      {/* 啟用提醒 */}
      <View style={styles.row}>
        <Text style={styles.label}>{s.enabled}</Text>
        <Switch value={data.enabled} onValueChange={(v) => onPatch({ enabled: v })} />
      </View>

      {/* 間隔 */}
      <Text style={styles.label}>{s.interval}</Text>
      <View style={styles.chips}>
        {INTERVAL_OPTIONS.map((m) => (
          <Pressable
            key={m}
            style={[styles.chip, data.intervalMin === m && styles.chipOn]}
            onPress={() => onPatch({ intervalMin: m })}
          >
            <Text style={[styles.chipText, data.intervalMin === m && styles.chipTextOn]}>
              {m} {s.minutes}
            </Text>
          </Pressable>
        ))}
      </View>

      {/* 活躍時段 */}
      <Text style={styles.label}>{s.activeWindow}</Text>
      <View style={styles.timeRow}>
        <TextInput
          style={styles.timeInput}
          value={start}
          onChangeText={setStart}
          onEndEditing={() => onPatch({ activeStart: start })}
          placeholder="08:00"
          keyboardType="numbers-and-punctuation"
        />
        <Text style={styles.dash}>～</Text>
        <TextInput
          style={styles.timeInput}
          value={end}
          onChangeText={setEnd}
          onEndEditing={() => onPatch({ activeEnd: end })}
          placeholder="22:00"
          keyboardType="numbers-and-punctuation"
        />
      </View>
      <Text style={styles.hint}>{s.activeHint}</Text>

      {/* 每日目標 */}
      <Text style={styles.label}>{s.dailyGoal}</Text>
      <TextInput
        style={styles.input}
        value={goal}
        onChangeText={setGoal}
        onEndEditing={() => onPatch({ dailyGoalMl: parseInt(goal, 10) || data.dailyGoalMl })}
        keyboardType="number-pad"
      />

      {/* 每次飲水量 */}
      <Text style={styles.label}>{s.drinkAmount}</Text>
      <View style={styles.chips}>
        {DRINK_OPTIONS.map((ml) => (
          <Pressable
            key={ml}
            style={[styles.chip, data.drinkMl === ml && styles.chipOn]}
            onPress={() => onPatch({ drinkMl: ml })}
          >
            <Text style={[styles.chipText, data.drinkMl === ml && styles.chipTextOn]}>{ml}</Text>
          </Pressable>
        ))}
      </View>

      {/* 語言 */}
      <Text style={styles.label}>{s.language}</Text>
      <View style={styles.chips}>
        {LANGUAGES.map((l) => (
          <Pressable
            key={l.code}
            style={[styles.chip, data.lang === l.code && styles.chipOn]}
            onPress={() => onPatch({ lang: l.code })}
          >
            <Text style={[styles.chipText, data.lang === l.code && styles.chipTextOn]}>{l.label}</Text>
          </Pressable>
        ))}
      </View>

      {/* 音效 */}
      <View style={styles.row}>
        <Text style={styles.label}>{s.sound}</Text>
        <Switch value={data.soundEnabled} onValueChange={(v) => onPatch({ soundEnabled: v })} />
      </View>

      {/* 跨裝置同步 */}
      <SyncSection lang={data.lang} onSynced={onSynced} />

      <Text style={styles.scheduled}>{s.scheduled(scheduledCount)}</Text>

      <Pressable style={styles.testBtn} onPress={onTest}>
        <Text style={styles.testText}>🔔 {s.testNotif}</Text>
      </Pressable>

      <Pressable style={styles.resetBtn} onPress={confirmReset}>
        <Text style={styles.resetText}>{s.reset}</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  row: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginVertical: 10 },
  label: { fontSize: 16, color: "#333", marginTop: 10, marginBottom: 6, fontWeight: "500" },
  chips: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  chip: { paddingVertical: 8, paddingHorizontal: 16, borderRadius: 20, borderWidth: 1, borderColor: "#4DA3FF" },
  chipOn: { backgroundColor: "#4DA3FF" },
  chipText: { color: "#4DA3FF" },
  chipTextOn: { color: "#fff" },
  timeRow: { flexDirection: "row", alignItems: "center", gap: 12 },
  timeInput: { borderWidth: 1, borderColor: "#ccc", borderRadius: 8, padding: 10, width: 90, textAlign: "center", fontSize: 16 },
  dash: { fontSize: 16, color: "#666" },
  input: { borderWidth: 1, borderColor: "#ccc", borderRadius: 8, padding: 10, fontSize: 16 },
  hint: { color: "#999", fontSize: 12, marginTop: 4 },
  scheduled: { marginTop: 24, color: "#1B6FC4", fontSize: 14 },
  testBtn: {
    marginTop: 14,
    alignSelf: "flex-start",
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: "#4DA3FF",
  },
  testText: { color: "#1B6FC4", fontSize: 15, fontWeight: "500" },
  resetBtn: { marginTop: 16, alignSelf: "flex-start" },
  resetText: { color: "#E5534B", fontSize: 15 },
});
