import React, { useState, useEffect, useRef } from "react";
import { View, Text, Button, StyleSheet, TouchableOpacity, Image } from "react-native";
import { Camera } from "expo-camera";
import * as FaceDetector from "expo-face-detector";

export default function App() {
  const [hasPermission, setHasPermission] = useState(null);
  const [cameraReady, setCameraReady] = useState(false);
  const [capturedPhoto, setCapturedPhoto] = useState(null);
  const [result, setResult] = useState(null);
  const cameraRef = useRef(null);

  useEffect(() => {
    (async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === "granted");
    })();
  }, []);

  const handleFacesDetected = ({ faces }) => {
    if (faces.length > 0) {
      console.log("Face detected ✅");
    } else {
      console.log("No face detected ❌");
    }
  };

  const takePicture = async () => {
    if (cameraRef.current) {
      const photo = await cameraRef.current.takePictureAsync({ quality: 0.5 });
      setCapturedPhoto(photo.uri);
      setResult({
        risk: "Low Risk",
        likelyConditions: ["Dry Skin", "Mild Acne"],
        recommendation: "Moisturize daily and wear sunscreen."
      });
    }
  };

  if (hasPermission === null) return <View />;
  if (hasPermission === false) return <Text>No access to camera</Text>;

  return (
    <View style={styles.container}>
      {!capturedPhoto ? (
        <Camera
          style={styles.camera}
          type={Camera.Constants.Type.front}
          ref={cameraRef}
          onCameraReady={() => setCameraReady(true)}
          onFacesDetected={handleFacesDetected}
          faceDetectorSettings={{
            mode: FaceDetector.FaceDetectorMode.fast,
            detectLandmarks: FaceDetector.FaceDetectorLandmarks.none,
            runClassifications: FaceDetector.FaceDetectorClassifications.none,
          }}
        >
          <View style={styles.buttonContainer}>
            <TouchableOpacity style={styles.button} onPress={takePicture} disabled={!cameraReady}>
              <Text style={styles.text}> Capture </Text>
            </TouchableOpacity>
          </View>
        </Camera>
      ) : (
        <View style={styles.resultContainer}>
          <Image source={{ uri: capturedPhoto }} style={styles.preview} />
          {result && (
            <View style={styles.resultBox}>
              <Text style={styles.resultTitle}>Assessment Result</Text>
              <Text>Risk Level: {result.risk}</Text>
              <Text>Likely Conditions: {result.likelyConditions.join(", ")}</Text>
              <Text>Recommendation: {result.recommendation}</Text>
            </View>
          )}
          <Button title="Retake" onPress={() => { setCapturedPhoto(null); setResult(null); }} />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#000" },
  camera: { flex: 1, justifyContent: "flex-end" },
  buttonContainer: { backgroundColor: "transparent", alignSelf: "center", marginBottom: 20 },
  button: { backgroundColor: "#fff", padding: 15, borderRadius: 10 },
  text: { fontSize: 18, color: "#000" },
  resultContainer: { flex: 1, backgroundColor: "#fff", alignItems: "center", justifyContent: "center", padding: 20 },
  preview: { width: 250, height: 250, borderRadius: 15, marginBottom: 20 },
  resultBox: { marginBottom: 20, alignItems: "center" },
  resultTitle: { fontSize: 20, fontWeight: "bold", marginBottom: 10 },
});
