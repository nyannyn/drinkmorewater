import React, { useEffect, useRef } from "react";
import { Animated, StyleSheet, Text, View } from "react-native";

interface Props {
  progress: number; // 0~1（今日 / 目標）
  label: string;
}

// 簡易水杯：水位高度依進度動畫上升。
export default function Cup({ progress, label }: Props) {
  const fill = useRef(new Animated.Value(0)).current;
  const clamped = Math.max(0, Math.min(1, progress));

  useEffect(() => {
    Animated.timing(fill, {
      toValue: clamped,
      duration: 600,
      useNativeDriver: false,
    }).start();
  }, [clamped, fill]);

  const height = fill.interpolate({ inputRange: [0, 1], outputRange: ["0%", "100%"] });

  return (
    <View style={styles.wrap}>
      <View style={styles.cup}>
        <Animated.View style={[styles.water, { height }]} />
        <Text style={styles.pct}>{Math.round(clamped * 100)}%</Text>
      </View>
      <Text style={styles.label}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: "center" },
  cup: {
    width: 140,
    height: 200,
    borderWidth: 4,
    borderColor: "#4DA3FF",
    borderTopWidth: 0,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    overflow: "hidden",
    justifyContent: "flex-end",
    backgroundColor: "rgba(77,163,255,0.06)",
  },
  water: { width: "100%", backgroundColor: "rgba(77,163,255,0.55)" },
  pct: {
    position: "absolute",
    alignSelf: "center",
    top: "42%",
    fontSize: 26,
    fontWeight: "700",
    color: "#1B6FC4",
  },
  label: { marginTop: 16, fontSize: 18, color: "#333" },
});
