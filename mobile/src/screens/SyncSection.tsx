import React, { useEffect, useState } from "react";
import { ActivityIndicator, Alert, Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { loadData } from "../core/storage";
import {
  claimPairingCode,
  createPairingCode,
  getServerUrl,
  isLinked,
  runSync,
  unlink,
} from "../core/sync";
import { saveData } from "../core/storage";
import { t } from "../i18n";

interface Props {
  lang: string;
  onSynced: () => void; // 同步/連動狀態改變後通知父層刷新顯示
}

export default function SyncSection({ lang, onSynced }: Props) {
  const s = t(lang);
  const [linked, setLinked] = useState(false);
  const [url, setUrl] = useState("");
  const [code, setCode] = useState("");
  const [issuedCode, setIssuedCode] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    (async () => {
      setLinked(await isLinked());
      const u = await getServerUrl();
      if (u) setUrl(u);
    })();
  }, []);

  const fail = () => Alert.alert(s.sync, s.syncFail);

  const onCreate = async () => {
    if (!url.trim()) return fail();
    setBusy(true);
    try {
      const c = await createPairingCode(url.trim());
      setIssuedCode(c);
      setLinked(true);
      await doSync();
    } catch {
      fail();
    } finally {
      setBusy(false);
    }
  };

  const onJoin = async () => {
    if (!url.trim() || !code.trim()) return fail();
    setBusy(true);
    try {
      await claimPairingCode(url.trim(), code.trim());
      setCode("");
      setLinked(true);
      await doSync();
    } catch {
      fail();
    } finally {
      setBusy(false);
    }
  };

  const doSync = async () => {
    const raw = await loadData();
    const res = await runSync(raw);
    if (res?.settingsToApply) await saveData(res.settingsToApply);
    onSynced();
  };

  const onSyncNow = async () => {
    setBusy(true);
    try {
      await doSync();
    } finally {
      setBusy(false);
    }
  };

  const onUnlink = async () => {
    await unlink();
    setLinked(false);
    setIssuedCode("");
    onSynced();
  };

  return (
    <View style={styles.box}>
      <Text style={styles.title}>🔗 {s.sync}</Text>
      <Text style={styles.desc}>{s.syncDesc}</Text>

      <Text style={styles.label}>{s.syncServerUrl}</Text>
      <TextInput
        style={styles.input}
        value={url}
        onChangeText={setUrl}
        placeholder="https://your-server"
        autoCapitalize="none"
        keyboardType="url"
        editable={!busy}
      />

      {busy && <ActivityIndicator style={{ marginVertical: 8 }} color="#4DA3FF" />}

      {linked ? (
        <>
          {issuedCode ? (
            <View style={styles.codeBox}>
              <Text style={styles.code}>{issuedCode}</Text>
              <Text style={styles.hint}>{s.syncCodeHint}</Text>
            </View>
          ) : null}
          <Text style={styles.linked}>✓ {s.syncLinked}</Text>
          <View style={styles.btnRow}>
            <Pressable style={styles.btn} onPress={onSyncNow} disabled={busy}>
              <Text style={styles.btnText}>{s.syncNow}</Text>
            </Pressable>
            <Pressable style={styles.btnGhost} onPress={onUnlink} disabled={busy}>
              <Text style={styles.btnGhostText}>{s.syncUnlink}</Text>
            </Pressable>
          </View>
          {/* 已連動仍可再產生配對碼，加入更多裝置 */}
          <Pressable style={styles.link} onPress={onCreate} disabled={busy}>
            <Text style={styles.linkText}>+ {s.syncCreate}</Text>
          </Pressable>
        </>
      ) : (
        <>
          <Pressable style={styles.btn} onPress={onCreate} disabled={busy}>
            <Text style={styles.btnText}>{s.syncCreate}</Text>
          </Pressable>
          <Text style={styles.or}>— or —</Text>
          <TextInput
            style={styles.input}
            value={code}
            onChangeText={setCode}
            placeholder={s.syncCodePlaceholder}
            keyboardType="number-pad"
            maxLength={6}
            editable={!busy}
          />
          <Pressable style={styles.btnGhost} onPress={onJoin} disabled={busy}>
            <Text style={styles.btnGhostText}>{s.syncJoin}</Text>
          </Pressable>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  box: { marginTop: 28, padding: 16, backgroundColor: "#F0F7FF", borderRadius: 14, borderWidth: 1, borderColor: "#dceaf8" },
  title: { fontSize: 16, fontWeight: "700", color: "#1B6FC4" },
  desc: { color: "#6b8299", fontSize: 13, marginTop: 4, marginBottom: 8 },
  label: { fontSize: 14, color: "#333", marginTop: 8, marginBottom: 4, fontWeight: "500" },
  input: { borderWidth: 1, borderColor: "#cfe0f0", borderRadius: 8, padding: 10, fontSize: 15, backgroundColor: "#fff" },
  btnRow: { flexDirection: "row", gap: 10, marginTop: 10 },
  btn: { marginTop: 10, backgroundColor: "#4DA3FF", paddingVertical: 11, paddingHorizontal: 18, borderRadius: 22, alignItems: "center" },
  btnText: { color: "#fff", fontSize: 15, fontWeight: "600" },
  btnGhost: { marginTop: 10, borderWidth: 1, borderColor: "#4DA3FF", paddingVertical: 11, paddingHorizontal: 18, borderRadius: 22, alignItems: "center" },
  btnGhostText: { color: "#1B6FC4", fontSize: 15, fontWeight: "500" },
  or: { textAlign: "center", color: "#9bb6cc", marginVertical: 8 },
  codeBox: { marginTop: 12, padding: 12, backgroundColor: "#fff", borderRadius: 10, alignItems: "center" },
  code: { fontSize: 30, fontWeight: "800", letterSpacing: 6, color: "#1B6FC4" },
  hint: { color: "#8aa0b6", fontSize: 12, marginTop: 6, textAlign: "center" },
  linked: { marginTop: 12, color: "#2e9e5b", fontWeight: "600" },
  link: { marginTop: 12, alignItems: "center" },
  linkText: { color: "#1B6FC4", fontSize: 14 },
});
