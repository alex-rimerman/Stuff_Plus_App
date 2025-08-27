import { useRouter } from "expo-router";
import { Button, StyleSheet, Text, View } from "react-native";

export default function Index() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>⚾ Stuff+ Analyzer</Text>
      <Text style={styles.subtitle}>Welcome! Choose an option below:</Text>

      <View style={styles.buttonContainer}>
        <Button title="➕ Add Pitch" onPress={() => router.push("/add-pitch")} />
      </View>
      <View style={styles.buttonContainer}>
        <Button title="📊 Visualizer" onPress={() => router.push("/visualizer")} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    justifyContent: "center", 
    alignItems: "center", 
    backgroundColor: "#fff", // fixed light background
  },
  title: { 
    fontSize: 28, 
    fontWeight: "bold", 
    marginBottom: 10, 
    color: "#000", // always black
  },
  subtitle: { 
    fontSize: 16, 
    marginBottom: 30, 
    color: "#333", // fixed dark gray
  },
  buttonContainer: {
    marginVertical: 8, // spacing between buttons
    width: 200, // fixed width for consistency
  },
});
