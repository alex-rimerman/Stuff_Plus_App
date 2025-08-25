import { useRouter } from "expo-router";
import React from "react";
import { Button, StyleSheet, Text, View } from "react-native";

export default function Index() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>⚾ Stuff+ Analyzer</Text>
      <Text style={styles.subtitle}>Welcome! Choose an option below:</Text>

      <Button title="➕ Add Pitch" onPress={() => router.push("/add-pitch")} />
      <Button title="📊 Visualizer" onPress={() => router.push("/visualizer")} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center" },
  title: { fontSize: 28, fontWeight: "bold", marginBottom: 10 },
  subtitle: { fontSize: 16, marginBottom: 30 },
});
