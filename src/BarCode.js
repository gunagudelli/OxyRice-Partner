import React, { useState, useEffect } from "react";
import { Text, View, StyleSheet, Button, TouchableOpacity, Dimensions ,Modal,Alert} from "react-native";
import { CameraView, Camera } from "expo-camera";
import Icon from "react-native-vector-icons/Ionicons"
const{height,width}=Dimensions.get('window')
 
export default function BarCodeScannerScreen({ onValue }) {
  const [hasPermission, setHasPermission] = useState(null);
  const [scanned, setScanned] = useState(false);
  const [isScanning, setIsScanning] = useState(false); // New state to control scanning
  const [scanModal, setScanModal] = useState(false);
// console.log("onValue",onValue) 
  useEffect(() => {
    const getCameraPermissions = async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === "granted");
    };
    getCameraPermissions();
  }, []);

  const handleBarcodeScanned = ({ type, data }) => {
    setScanned(true);
    setIsScanning(false); // Stop scanning after a barcode is scanned
    // Alert.alert(
    //   "Barcode Scanned",
    //   `Type: ${type}\nData: ${data}`,
    //   [{ text: "OK", onPress: () => setScanned(false) }],
    //   { cancelable: false }
    // );
    console.log("Type:", type);
      console.log("Data:", data);
      setScanModal(false)
      onValue(data)
    return data;
  };

  const startScanning = () => {
    setScanModal(true);
    setIsScanning(true);
    setScanned(false);
  };

  if (hasPermission === null) {
    return <Text>Requesting for camera permission</Text>;
  }
  if (hasPermission === false) {
    return <Text>No access to camera</Text>;
  }

  return (
    <>
      <View style={styles.container}>
        {!isScanning ? (
          // <Button title="Scan Barcode" onPress={startScanning} />
          <TouchableOpacity onPress={startScanning} style={styles.scanButton}>
            {/* <Text>Scan</Text> */}
            <Icon name="scan" size={20} color="white" />
          </TouchableOpacity>
        ) : null}

        {isScanning && (
          <TouchableOpacity
            style={styles.stopButton}
            onPress={() => {
              setIsScanning(false), setScanModal(false);
            }}
          >
            <Icon name="stop" size={20} color="red" />
          </TouchableOpacity>
        )}
      </View>
      <Modal
        visible={scanModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setScanModal(false)}
      >
        <View style={styles.modalContainer}>
          {/* <Text style={styles.modalTitle}>Scan Bar Code</Text> */}

          <View style={styles.modalContent}>
            <CameraView
              style={StyleSheet.absoluteFillObject}
              onBarcodeScanned={scanned ? undefined : handleBarcodeScanned}
              barcodeScannerSettings={{
                barcodeTypes: [
                  "code128",
                  "ean13",
                  "ean8",
                  "qr",
                  "pdf417",
                  "upc_e",
                  "datamatrix",
                  "code39",
                  "code93",
                  "itf14",
                  "codabar",
                  "upc_a",
                  "aztec",
                ],
              }}
            />
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: "column",
    justifyContent: "center",
    marginTop: 20,
  },
  scanButton: {
    backgroundColor: "#0384d5",
    padding: 10,
    // width: width * 0.3,
    borderRadius: 5,
    alignItems: "center",
    // justifyContent: "flex-end",
    alignSelf: "flex-end",
    marginRight: 10,
  },
  stopButton: {
    backgroundColor: "white",
    padding: 10,
    // width: width * 0.3,
    borderRadius: 5,
    alignItems: "center",
    // justifyContent: "flex-end",
    alignSelf: "flex-end",
    marginRight: 10,
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    // backgroundColor: "white",
    height: "auto",
  },
  modalContent: {
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 10,
    width: 300,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 10,
    color: "red",
  },
});
