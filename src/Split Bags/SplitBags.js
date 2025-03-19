import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Dimensions,
  Modal,
  Alert,
  TextInput,
  ActivityIndicator,
} from "react-native";
import React, { useState } from "react";
import BarCodeScannerScreen from "./BarCode";
import Checkbox from "expo-checkbox";
import axios from "axios";
import { useSelector } from "react-redux";
import BASE_URL from "../../config";

const { height, width } = Dimensions.get("window");

const SplitBags = () => {
  const accessToken = useSelector((state) => state.counter);
  const [barCode, setBarCode] = useState(false);
  const [selectedOptions, setSelectedOptions] = useState({});
  const [inputValues, setInputValues] = useState({});
  const [showScanner, setShowScanner] = useState(false);
  const [reason, setReason] = useState("");
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  function handleValue(value, itemBarCode) {
    // Alert.alert("Sreeja", value);
    // console.log("Labhi", serialNumbers,quantity);
    console.log("itemBarCode API", value);
    setBarCode(value);
    // console.log("itemBarCode getting", value.substring(0, 6));
  }

  const handleCheckboxChange = (item) => {
    setSelectedOptions((prev) => {
      const updated = { ...prev, [item]: !prev[item] };
      if (!updated[item]) {
        delete inputValues[item]; // Remove input if checkbox is unchecked
      }
      return updated;
    });
  };

  const handleInputChange = (item, value) => {
    setInputValues((prev) => ({ ...prev, [item]: value }));
  };

  const validateForm = () => {
    let newErrors = {};
    Object.keys(selectedOptions).forEach((item) => {
      if (
        selectedOptions[item] &&
        (!inputValues[item] || inputValues[item].trim() === "")
      ) {
        newErrors[item] = "Required!";
      }
    });

    if (!reason || reason.trim() === "") {
      newErrors.reason = "Reason is required!";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    // if (!validateForm()) {
    //   // Log each selected item's quantity to different consoles

    //   return false;
    // }
    if (inputValues["Sample Rice (1kg)"]) {
        console.log("1kg quantity:", inputValues["Sample Rice (1kg)"]);
      }

      if (inputValues["Sample Rice (5kgs)"]) {
        console.log("5kgs quantity:", inputValues["Sample Rice (5kgs)"]);
      }

      if (inputValues["Sample Rice (10kgs)"]) {
        console.log("10kgs quantity:", inputValues["Sample Rice (10kgs)"]);
      }

    const data = {
      barCode: barCode,
      oncesCount: inputValues["Sample Rice (1kg)"] || "0",
      fivesCount: inputValues["Sample Rice (5kgs)"] || "0",
      tensCount: inputValues["Sample Rice (10kgs)"] || "0",
      reason: reason,
    };
    console.log({ data });
    setLoading(true);

    axios({
      method: "post",
      url: BASE_URL + `product-service/splitBags`,
      data: data,
    })
      .then((response) => {
        setLoading(false);
        console.log(response.data);
        Alert.alert("Success", "Bags splitted successfully");
      })
      .catch((error) => {
        setLoading(false);
        console.log(error.response);
        Alert.alert("Failed", "Failed to split bags");
      });
  };

  if (showScanner) {
    return (
      <BarCodeScanner
        onBarCodeScanned={scanned ? undefined : handleBarCodeScanned}
        style={{ flex: 1 }}
      />
    );
  }

  return (
    <View style={{ flex: 1 }}>
      <BarCodeScannerScreen onValue={(value) => handleValue(value)} />

      {barCode ? (
        <View style={{ margin: 20 }}>
          <Text style={styles.barCodeTxt}>{barCode}</Text>
          <Text style={{ fontSize: 16, fontWeight: "bold", marginBottom: 10 }}>
            Select Items:
          </Text>

          {/* {["Sample Rice (1kg)", "Sample Rice (5kgs)", "Sample Rice (10kgs)"].map((item) => (
          <View key={item} style={{ flexDirection: "row", alignItems: "center", marginBottom: 10 }}>
            <Checkbox
              value={selectedOptions[item] || false}
              onValueChange={() => handleCheckboxChange(item)}
            />
            <Text style={{ marginLeft: 10 }}>{item}</Text>
          </View>
        ))} */}

          {[
            "Sample Rice (1kg)",
            "Sample Rice (5kgs)",
            "Sample Rice (10kgs)",
          ].map((item) => (
            <View
              key={item}
              style={{
                flexDirection: "row",
                alignItems: "center",
                marginBottom: 10,
              }}
            >
              <Checkbox
                value={selectedOptions[item] || false}
                onValueChange={() => handleCheckboxChange(item)}
              />
              <Text style={{ marginLeft: 10, flex: 1 }}>{item}</Text>

              {selectedOptions[item] && (
                <View style={{ flex: 1 }}>
                  <TextInput
                    placeholder={`Count`}
                    style={{
                      borderWidth: 1,
                      borderColor: errors[item] ? "red" : "#ccc",
                      padding: 10,
                      borderRadius: 5,
                    }}
                    onChangeText={(value) => handleInputChange(item, value)}
                    value={inputValues[item] || ""}
                    keyboardType="numeric"
                  />
                  {errors[item] && (
                    <Text style={{ color: "red" }}>{errors[item]}</Text>
                  )}
                </View>
              )}
            </View>
          ))}

          <View style={{ margin: 20 }}>
            <Text
              style={{ fontSize: 16, fontWeight: "bold", marginBottom: 10 }}
            >
              Reason:
            </Text>
            <TextInput
              placeholder="Enter reason for split"
              style={{
                borderWidth: 1,
                borderColor: errors.reason ? "red" : "#ccc",
                padding: 10,
                borderRadius: 5,
                marginBottom: 5,
              }}
              onChangeText={(text) => {
                setReason(text);

                // Clear the error message for reason when text is entered
                if (text.trim() !== "" && errors.reason) {
                  setErrors((prev) => {
                    const newErrors = { ...prev };
                    delete newErrors.reason;
                    return newErrors;
                  });
                }
              }}
              value={reason}
              multiline={true}
              numberOfLines={3}
            />
            {errors.reason && (
              <Text style={{ color: "red" }}>{errors.reason}</Text>
            )}
          </View>

          {loading ? (
            <TouchableOpacity
              style={styles.submitbtn}
              onPress={() => handleSubmit()}
            >
              <Text style={styles.submitbtnTxt}>Submit</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={styles.submitbtn}
            //   onPress={() => handleSubmit()}
            >
              <ActivityIndicator
                size="medium"
                color="#0384d5"
                style={{ marginTop: 20 }}
              />
            </TouchableOpacity>
          )}
        </View>
      ) : null}
    </View>
  );
};

export default SplitBags;

const styles = StyleSheet.create({
  barCodeTxt: {
    fontSize: 20,
    fontWeight: "bold",
    color: "black",
    textAlign: "center",
    marginTop: 10,
  },
  submitbtn: {
    backgroundColor: "#0384d5",
    padding: 10,
    width: width * 0.5,
    alignItems: "center",
    alignSelf: "center",
    marginTop: 20,
  },
  submitbtnTxt: {
    color: "white",
  },
});
