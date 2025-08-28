// app/(tabs)/picture-upload.tsx
import { Picker } from "@react-native-picker/picker";
import * as ImagePicker from "expo-image-picker";
import { useState } from "react";
import {
    Alert,
    Button,
    Image,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    Text,
    TextInput,
    View,
} from "react-native";

export default function PictureUpload() {
  const [file, setFile] = useState<ImagePicker.ImagePickerAsset | null>(null);
  const [pitchType, setPitchType] = useState("FF");
  const [handedness, setHandedness] = useState("R");
  const [fbVelo, setFbVelo] = useState("");
  const [fbIVB, setFbIVB] = useState("");
  const [fbHMOV, setFbHMOV] = useState("");

  const handlePickFile = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permissionResult.granted) {
      Alert.alert("Permission required", "Permission to access photos is required.");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 1,
    });

    if (!result.canceled && result.assets.length > 0) {
      setFile(result.assets[0]);
    } else {
      console.log("User cancelled image picker");
    }
  };

  const handleSubmit = async () => {
    if (!file) {
      Alert.alert("Error", "Please select a screenshot first.");
      return;
    }

    const formData = new FormData();
    formData.append("file", {
      uri: file.uri,
      name: file.fileName ?? "screenshot.jpg",
      type: "image/jpeg",
    } as any);

    formData.append("pitchType", pitchType);
    formData.append("handedness", handedness);
    formData.append("fb_velo", fbVelo || "0");
    formData.append("fb_ivb", fbIVB || "0");
    formData.append("fb_hmov", fbHMOV || "0");

    try {
      const res = await fetch("https://stuff-plus-api.onrender.com/upload_screenshot", {
        method: "POST",
        body: formData,
      });

      const text = await res.text();
      let data;
      try {
        data = JSON.parse(text);
      } catch {
        console.error("Failed to parse JSON:", text);
        Alert.alert("Server Error", `Invalid response:\n${text}`);
        return;
      }

      if (data.error) {
        Alert.alert("API Error", data.error);
        return;
      }

      Alert.alert(
        "Result",
        `Stuff+: ${data.stuffPlus ?? "N/A"}\nPercentile: ${data.percentile ?? "N/A"}`
      );
    } catch (error: any) {
      console.error(error);
      Alert.alert("Network Error", error.message || "Failed to upload and calculate Stuff+.");
    }
  };

  const fastballFields = [
    { label: "Velo", value: fbVelo, setter: setFbVelo },
    { label: "IVB", value: fbIVB, setter: setFbIVB },
    { label: "HB", value: fbHMOV, setter: setFbHMOV },
  ];

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: "#fff" }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView
        contentContainerStyle={{ padding: 16, paddingBottom: 50 }}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={{ fontSize: 20, fontWeight: "bold", marginBottom: 12 }}>
          Upload Trackman Screenshot
        </Text>

        {file && (
          <Image
            source={{ uri: file.uri }}
            style={{
              width: "100%",
              height: 200,
              marginBottom: 12,
              borderRadius: 8,
            }}
            resizeMode="contain"
          />
        )}

        <Button
          title={file ? `Selected: ${file.fileName ?? "Screenshot"}` : "Choose Screenshot"}
          onPress={handlePickFile}
        />

        {/* Pitch Type */}
        <Text style={{ marginTop: 16, marginBottom: 4 }}>Pitch Type</Text>
        <View
          style={{
            borderWidth: 1,
            borderColor: "#ccc",
            borderRadius: 6,
            marginBottom: 12,
          }}
        >
          <Picker selectedValue={pitchType} onValueChange={setPitchType}>
            {[
              { label: "Four-Seam Fastball", value: "FF" },
              { label: "Sinker", value: "SI" },
              { label: "Cutter", value: "FC" },
              { label: "Slider", value: "SL" },
              { label: "Curveball", value: "CU" },
              { label: "Changeup", value: "CH" },
            ].map((item) => (
              <Picker.Item
                key={item.value}
                label={item.label}
                value={item.value}
                color="#444"
              />
            ))}
          </Picker>
        </View>

        {/* Handedness */}
        <Text style={{ marginTop: 16, marginBottom: 4 }}>Pitcher Handedness</Text>
        <View
          style={{
            borderWidth: 1,
            borderColor: "#ccc",
            borderRadius: 6,
            marginBottom: 12,
          }}
        >
          <Picker selectedValue={handedness} onValueChange={setHandedness}>
            <Picker.Item label="Right-Handed" value="R" color="#444" />
            <Picker.Item label="Left-Handed" value="L" color="#444" />
          </Picker>
        </View>

        {/* Fastball Inputs */}
        {fastballFields.map((field) => (
          <View key={field.label} style={{ marginBottom: 12 }}>
            <Text style={{ marginBottom: 4 }}>Fastball {field.label}</Text>
            <TextInput
              style={{ borderWidth: 1, borderRadius: 6, padding: 8 }}
              keyboardType="numeric"
              value={field.value}
              onChangeText={field.setter}
            />
          </View>
        ))}

        <Button title="Calculate Stuff+" onPress={handleSubmit} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
