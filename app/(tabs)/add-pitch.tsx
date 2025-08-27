import { useFocusEffect } from "@react-navigation/native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useCallback, useState } from "react";
import {
    Button,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    View,
} from "react-native";
import { usePitch } from "../../lib/pitch_context";
import { getStuffPlusAPI, PitchInput } from "../../lib/shared";

export default function AddPitch() {
  const { pitches, addPitch, updatePitch } = usePitch();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id?: string }>();

  const [editing, setEditing] = useState(false);

  // form states
  const [name, setName] = useState("");
  const [pitchType, setPitchType] = useState("");
  const [handedness, setHandedness] = useState("");
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

  // Only pre-fill if editing with a valid id
  useFocusEffect(
    useCallback(() => {
      if (id) {
        const existingPitch = pitches.find((p) => p.id === id);
        if (existingPitch) {
          setEditing(true);
          setName(existingPitch.name);
          setPitchType(existingPitch.pitchType);
          setHandedness(existingPitch.handedness);
          setReleaseSpeed(existingPitch.release_speed.toString());
          setPfxX(existingPitch.pfx_x.toString());
          setPfxZ(existingPitch.pfx_z.toString());
          setReleaseExtension(existingPitch.release_extension.toString());
          setSpinRate(existingPitch.release_spin_rate.toString());
          setSpinAxis(existingPitch.spin_axis.toString());
          setReleasePosX(existingPitch.release_pos_x.toString());
          setReleasePosZ(existingPitch.release_pos_z.toString());
          setFbVelo(existingPitch.fb_velo.toString());
          setFbIvb(existingPitch.fb_ivb.toString());
          setFbHmov(existingPitch.fb_hmov.toString());
        }
      } else {
        setEditing(false);
        clearForm(); // 👈 always reset on fresh add
      }
    }, [id, pitches])
  );
  

  const handleSubmit = async () => {
    try {
      const type = (pitchType || "").trim().toUpperCase();
      const hand = handedness.trim().toUpperCase() === "L" ? "L" : "R";

      const v_release_speed = parseFloat(release_speed) || 0;
      const v_pfx_x = parseFloat(pfx_x) || 0;
      const v_pfx_z = parseFloat(pfx_z) || 0;
      const v_release_pos_x = parseFloat(release_pos_x) || 0;
      const v_release_pos_z = parseFloat(release_pos_z) || 0;

      const v_fb_velo = parseFloat(fb_velo) || (type === "FF" ? v_release_speed : 0);
      const v_fb_ivb = parseFloat(fb_ivb) || (type === "FF" ? v_pfx_z : 0);
      const v_fb_hmov = parseFloat(fb_hmov) || (type === "FF" ? v_pfx_x : 0);

      const apiInput: PitchInput = {
        pitchType: type,
        handedness: hand,
        release_speed: v_release_speed,
        pfx_x: v_pfx_x,
        pfx_z: v_pfx_z,
        release_extension: parseFloat(release_extension) || 0,
        release_spin_rate: parseFloat(release_spin_rate) || 0,
        spin_axis: parseFloat(spin_axis) || 0,
        release_pos_x: v_release_pos_x,
        release_pos_z: v_release_pos_z,
        fb_velo: v_fb_velo,
        fb_ivb: v_fb_ivb,
        fb_hmov: v_fb_hmov,
      };

      const result = await getStuffPlusAPI(apiInput);

      if (editing && id) {
        updatePitch(id, {
          id,
          name,
          ...apiInput,
          stuffPlus: result.stuffPlus,
          percentile: result.percentile,
        });
      } else {
        addPitch({
          id: Date.now().toString(),
          name,
          ...apiInput,
          stuffPlus: result.stuffPlus,
          percentile: result.percentile,
        });
      }

      clearForm();
      router.push("/(tabs)/visualizer");
    } catch (err) {
      console.error("Error submitting pitch:", err);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.title}>{editing ? "Update Pitch" : "Add Pitch"}</Text>

        {/* General Info */}
        <TextInput
          style={styles.input}
          placeholder="Pitch Name (e.g. Wheeler FF)"
          placeholderTextColor="#444"
          value={name}
          onChangeText={setName}
        />
        <TextInput
          style={styles.input}
          placeholder="Pitch Type (FF, SL, CH, CU, SI, KC, ST)"
          placeholderTextColor="#444"
          value={pitchType}
          onChangeText={setPitchType}
        />
        <TextInput
          style={styles.input}
          placeholder="Pitcher Handedness (L or R)"
          placeholderTextColor="#444"
          value={handedness}
          onChangeText={setHandedness}
        />

        {/* Release / Movement */}
        <TextInput
          style={styles.input}
          placeholder="Release Speed"
          placeholderTextColor="#444"
          keyboardType="numbers-and-punctuation"
          value={release_speed}
          onChangeText={setReleaseSpeed}
        />
        <TextInput
          style={styles.input}
          placeholder="Horizontal Break (pfx_x)"
          placeholderTextColor="#444"
          keyboardType="numbers-and-punctuation"
          value={pfx_x}
          onChangeText={setPfxX}
        />
        <TextInput
          style={styles.input}
          placeholder="Induced Vert. Break (pfx_z)"
          placeholderTextColor="#444"
          keyboardType="numbers-and-punctuation"
          value={pfx_z}
          onChangeText={setPfxZ}
        />
        <TextInput
          style={styles.input}
          placeholder="Release Extension"
          placeholderTextColor="#444"
          keyboardType="numbers-and-punctuation"
          value={release_extension}
          onChangeText={setReleaseExtension}
        />
        <TextInput
          style={styles.input}
          placeholder="Spin Rate"
          placeholderTextColor="#444"
          keyboardType="numbers-and-punctuation"
          value={release_spin_rate}
          onChangeText={setSpinRate}
        />
        <TextInput
          style={styles.input}
          placeholder="Spin Axis (12:00: 180, 3:00: 270, 6:00: 360/0, 9:00: 90)"
          placeholderTextColor="#444"
          keyboardType="numbers-and-punctuation"
          value={spin_axis}
          onChangeText={setSpinAxis}
        />
        <TextInput
          style={styles.input}
          placeholder="Release Side (X)"
          placeholderTextColor="#444"
          keyboardType="numbers-and-punctuation"
          value={release_pos_x}
          onChangeText={setReleasePosX}
        />
        <TextInput
          style={styles.input}
          placeholder="Release Height (Z)"
          placeholderTextColor="#444"
          keyboardType="numbers-and-punctuation"
          value={release_pos_z}
          onChangeText={setReleasePosZ}
        />

        {/* Fastball / Auto FF */}
        <TextInput
          style={styles.input}
          placeholder="FB Velo (auto FF)"
          placeholderTextColor="#444"
          keyboardType="numbers-and-punctuation"
          value={fb_velo}
          onChangeText={setFbVelo}
        />
        <TextInput
          style={styles.input}
          placeholder="FB IVB (auto FF)"
          placeholderTextColor="#444"
          keyboardType="numbers-and-punctuation"
          value={fb_ivb}
          onChangeText={setFbIvb}
        />
        <TextInput
          style={styles.input}
          placeholder="FB HMOV (auto FF)"
          placeholderTextColor="#444"
          keyboardType="numbers-and-punctuation"
          value={fb_hmov}
          onChangeText={setFbHmov}
        />

        <Button title={editing ? "Update Pitch" : "Add Pitch"} onPress={handleSubmit} />

        <View style={{ height: 100 }} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: "#fff",
    flexGrow: 1,
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
