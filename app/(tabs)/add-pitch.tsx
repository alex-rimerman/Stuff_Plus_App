import { useRouter } from "expo-router";
import { useState } from "react";
import { Button, ScrollView, StyleSheet, Text, TextInput } from "react-native";
import { usePitch } from "../../lib/pitch_context";
import { getStuffPlusAPI, PitchInput } from "../../lib/shared";

export default function AddPitch() {
  const { addPitch } = usePitch();
  const router = useRouter();

  const [name, setName] = useState("");
  const [pitchType, setPitchType] = useState("");
  const [handedness, setHandedness] = useState(""); // "L" or "R"

  const [release_speed, setReleaseSpeed] = useState("");
  const [pfx_x, setPfxX] = useState("");
  const [pfx_z, setPfxZ] = useState("");
  const [release_extension, setReleaseExtension] = useState("");
  const [release_spin_rate, setSpinRate] = useState("");
  const [spin_axis, setSpinAxis] = useState("");
  const [release_pos_x, setReleasePosX] = useState("");
  const [release_pos_z, setReleasePosZ] = useState("");
  const [fb_velo, setFbVelo] = useState("");
  const [fb_ivb, setFbIvb] = useState("");
  const [fb_hmov, setFbHmov] = useState("");

  const clearForm = () => {
    setName("");
    setPitchType("");
    setHandedness("");
    setReleaseSpeed("");
    setPfxX("");
    setPfxZ("");
    setReleaseExtension("");
    setSpinRate("");
    setSpinAxis("");
    setReleasePosX("");
    setReleasePosZ("");
    setFbVelo("");
    setFbIvb("");
    setFbHmov("");
  };

  const handleSubmit = async () => {
    try {
      const type = (pitchType || "").trim().toUpperCase();
      const hand = handedness.trim().toUpperCase() === "L" ? "L" : "R";

      // Parse numeric values once
      const v_release_speed = parseFloat(release_speed) || 0;
      const v_pfx_x = parseFloat(pfx_x) || 0;
      const v_pfx_z = parseFloat(pfx_z) || 0;

      const v_fb_velo = parseFloat(fb_velo) || (type === "FF" ? v_release_speed : 0);
      const v_fb_ivb = parseFloat(fb_ivb) || (type === "FF" ? v_pfx_z : 0);
      const v_fb_hmov = parseFloat(fb_hmov) || (type === "FF" ? v_pfx_x : 0);

      // --- Create API input ---
      const apiInput: PitchInput = {
        pitchType: type,
        handedness: hand,
        release_speed: v_release_speed,
        pfx_x: v_pfx_x,
        pfx_z: v_pfx_z,
        release_extension: parseFloat(release_extension) || 0,
        release_spin_rate: parseFloat(release_spin_rate) || 0,
        spin_axis: parseFloat(spin_axis) || 0,
        release_pos_x: parseFloat(release_pos_x) || 0,
        release_pos_z: parseFloat(release_pos_z) || 0,
        fb_velo: v_fb_velo,
        fb_ivb: v_fb_ivb,
        fb_hmov: v_fb_hmov,
      };

      const result = await getStuffPlusAPI(apiInput);

      // --- Add pitch with Stuff+ and percentile ---
      addPitch({
        id: Date.now().toString(),
        name,
        ...apiInput,
        stuffPlus: result.stuffPlus,
        percentile: result.percentile,
      });

      clearForm();
      router.push("/(tabs)/visualizer");
    } catch (err) {
      console.error("Error submitting pitch:", err);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Add Pitch</Text>

      <TextInput
        style={styles.input}
        placeholder="Pitch Name (e.g. Wheeler FF)"
        value={name}
        onChangeText={setName}
      />
      <TextInput
        style={styles.input}
        placeholder="Pitch Type (FF, SL, CH, CB, SI)"
        value={pitchType}
        onChangeText={setPitchType}
      />
      <TextInput
        style={styles.input}
        placeholder="Pitcher Handedness (L or R)"
        value={handedness}
        onChangeText={setHandedness}
      />
      <TextInput
        style={styles.input}
        placeholder="Release Speed"
        keyboardType="numeric"
        value={release_speed}
        onChangeText={setReleaseSpeed}
      />
      <TextInput
        style={styles.input}
        placeholder="Horizontal Break (pfx_x)"
        keyboardType="numeric"
        value={pfx_x}
        onChangeText={setPfxX}
      />
      <TextInput
        style={styles.input}
        placeholder="Induced Vert. Break (pfx_z)"
        keyboardType="numeric"
        value={pfx_z}
        onChangeText={setPfxZ}
      />
      <TextInput
        style={styles.input}
        placeholder="Release Extension"
        keyboardType="numeric"
        value={release_extension}
        onChangeText={setReleaseExtension}
      />
      <TextInput
        style={styles.input}
        placeholder="Spin Rate"
        keyboardType="numeric"
        value={release_spin_rate}
        onChangeText={setSpinRate}
      />
      <TextInput
        style={styles.input}
        placeholder="Spin Axis"
        keyboardType="numeric"
        value={spin_axis}
        onChangeText={setSpinAxis}
      />
      <TextInput
        style={styles.input}
        placeholder="Release Side (X)"
        keyboardType="numeric"
        value={release_pos_x}
        onChangeText={setReleasePosX}
      />
      <TextInput
        style={styles.input}
        placeholder="Release Height (Z)"
        keyboardType="numeric"
        value={release_pos_z}
        onChangeText={setReleasePosZ}
      />
      <TextInput
        style={styles.input}
        placeholder="FB Velo (auto FF)"
        keyboardType="numeric"
        value={fb_velo}
        onChangeText={setFbVelo}
      />
      <TextInput
        style={styles.input}
        placeholder="FB IVB (auto FF)"
        keyboardType="numeric"
        value={fb_ivb}
        onChangeText={setFbIvb}
      />
      <TextInput
        style={styles.input}
        placeholder="FB HMOV (auto FF)"
        keyboardType="numeric"
        value={fb_hmov}
        onChangeText={setFbHmov}
      />

      <Button title="Add Pitch" onPress={handleSubmit} />
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
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 10,
    marginBottom: 12,
    fontSize: 16,
  },
});
