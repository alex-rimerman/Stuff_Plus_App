import { useRouter } from "expo-router";
import { Button, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { usePitch } from "../../lib/pitch_context";

export default function Visualizer() {
  const { pitches, clearPitches, removePitch } = usePitch();
  const router = useRouter();

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Pitch Visualizer</Text>

      {pitches.length === 0 ? (
        <Text style={styles.noPitches}>No pitches added yet.</Text>
      ) : (
        pitches.map((pitch) => (
          <View key={pitch.id} style={styles.pitchCard}>
            <View style={styles.cardHeader}>
            <Text style={styles.pitchName}>
                {pitch.name} ({pitch.pitchType})
            </Text>

            <View style={styles.actions}>
                <TouchableOpacity
                onPress={() =>
                    router.push({
                    pathname: "/(tabs)/add-pitch",
                    params: { id: pitch.id },
                    })
                }
                >
                <Text style={styles.editButton}>Edit</Text>
                </TouchableOpacity>

                <TouchableOpacity onPress={() => removePitch(pitch.id)}>
                <Text style={styles.removeButton}>✕</Text>
                </TouchableOpacity>
            </View>
          </View>

            <Text>Handedness: {pitch.handedness}</Text>
            <Text>Velo: {pitch.release_speed.toFixed(1)} mph</Text>
            <Text>IVB: {pitch.pfx_z.toFixed(1)} in</Text>
            <Text>HMOV: {pitch.pfx_x.toFixed(1)} in</Text>
            <Text>Spin: {pitch.release_spin_rate.toFixed(0)} rpm</Text>
            <Text>Extension: {pitch.release_extension.toFixed(2)} ft</Text>
            <Text>Stuff+: {pitch.stuffPlus.toFixed(1)}</Text>
            <Text>Percentile: {pitch.percentile}</Text>
          </View>
        ))
      )}

        <Button
        title="Add Another Pitch"
        onPress={() =>
            router.push({
            pathname: "/(tabs)/add-pitch",
            params: { id: null }, // 👈 explicitly say "fresh add"
            })
        }
        />

      {pitches.length > 0 && (
        <Button
          title="Clear Pitches"
          color="red"
          onPress={clearPitches}
        />
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: "#fff",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
  },
  noPitches: {
    textAlign: "center",
    fontSize: 16,
    marginBottom: 20,
    color: "#888",
  },
  pitchCard: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    backgroundColor: "#f9f9f9",
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
  },
  pitchName: {
    fontSize: 18,
    fontWeight: "bold",
  },
  removeButton: {
    color: "red",
    fontSize: 20,
    fontWeight: "bold",
    paddingHorizontal: 5,
  },
  actions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8, // space between Edit + X
  },
  editButton: {
    color: "blue",
    fontWeight: "bold",
  },  
});
