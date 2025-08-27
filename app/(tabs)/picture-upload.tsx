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
      name: file.fileName || "screenshot.jpg",
      type: "image/jpeg",
    } as any);

    formData.append("pitchType", pitchType);
    formData.append("handedness", handedness);
    formData.append("fb_velo", fbVelo);
    formData.append("fb_ivb", fbIVB);
    formData.append("fb_hmov", fbHMOV);

    try {
      const res = await fetch("https://stuff-plus-app.onrender.com/upload_screenshot/", {
        method: "POST",
        body: formData,
        headers: { "Content-Type": "multipart/form-data" },
      });
      const data = await res.json();
      Alert.alert("Result", `Stuff+: ${data.stuffPlus}\nPercentile: ${data.percentile}`);
    } catch (error) {
      console.error(error);
      Alert.alert("Error", "Failed to upload and calculate Stuff+.");
    }
  };

  return (
    <KeyboardAvoidingView
    style={{ flex: 1, backgroundColor: "#fff" }} // force light mode
    behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
    <ScrollView
        contentContainerStyle={{ 
        padding: 16, 
        paddingBottom: 50 // extra padding so the button is reachable 
        }}
        keyboardShouldPersistTaps="handled"
    >
        <Text style={{ fontSize: 20, fontWeight: "bold", marginBottom: 12 }}>
        Upload Trackman Screenshot
        </Text>

        {file && (
        <Image
            source={{ uri: file.uri }}
            style={{ width: "100%", height: 200, marginBottom: 12, borderRadius: 8 }}
            resizeMode="contain"
        />
        )}

        <Button
        title={file ? `Selected: ${file.fileName || "Screenshot"}` : "Choose Screenshot"}
        onPress={handlePickFile}
        />

        {/* Pitch Type */}
        <Text style={{ marginTop: 16, marginBottom: 4 }}>Pitch Type</Text>
        <View style={{ borderWidth: 1, borderColor: "#ccc", borderRadius: 6, marginBottom: 12 }}>
        <Picker selectedValue={pitchType} onValueChange={setPitchType}>
            <Picker.Item label="Four-Seam Fastball" value="FF" color="#000" />
            <Picker.Item label="Sinker" value="SI" color="#000" />
            <Picker.Item label="Cutter" value="FC" color="#000" />
            <Picker.Item label="Slider" value="SL" color="#000" />
            <Picker.Item label="Curveball" value="CU" color="#000" />
            <Picker.Item label="Changeup" value="CH" color="#000" />
        </Picker>
        </View>

        {/* Handedness */}
        <Text style={{ marginTop: 16, marginBottom: 4 }}>Pitcher Handedness</Text>
        <View style={{ borderWidth: 1, borderColor: "#ccc", borderRadius: 6, marginBottom: 12 }}>
        <Picker selectedValue={handedness} onValueChange={setHandedness}>
            <Picker.Item label="Right-Handed" value="R" color="#000" />
            <Picker.Item label="Left-Handed" value="L" color="#000" />
        </Picker>
        </View>

        {/* Fastball Inputs */}
        {["Velo", "IVB", "HB"].map((field) => (
        <View key={field} style={{ marginBottom: 12 }}>
            <Text style={{ marginBottom: 4 }}>Fastball {field}</Text>
            <TextInput
            style={{ borderWidth: 1, borderRadius: 6, padding: 8 }}
            keyboardType="numbers-and-punctuation"
            value={field === "Velo" ? fbVelo : field === "IVB" ? fbIVB : fbHMOV}
            onChangeText={field === "Velo" ? setFbVelo : field === "IVB" ? setFbIVB : setFbHMOV}
            />
        </View>
        ))}

        <Button title="Calculate Stuff+" onPress={handleSubmit} />
    </ScrollView>
    </KeyboardAvoidingView>
  );
}