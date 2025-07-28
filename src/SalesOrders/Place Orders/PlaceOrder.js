import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  Dimensions,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useState, useEffect } from "react";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import axios from "axios";
import BASE_URL from "../../../config";
import { ActivityIndicator } from "react-native-paper";


const {height, width} = Dimensions.get("window");
export default function PlaceOrder({ route }) {
  const navigation = useNavigation();


  const [formData, setFormData] = useState({
    customerNumber: "",
    registerType: "",
    address: "",
    name:"",
    loader:false
  });

  const [errors, setErrors] = useState({
    customerNumber: "",
    registerType: "",
    address_error: "",
    name_error:""
  });

  const [showAddressField, setShowAddressField] = useState(false);
  const [useMarketAddress, setUseMarketAddress] = useState(false);

  useEffect(() => {
    console.log("PlaceOrder route params:", route.params);
  }, []);

  const handleInputChange = (field, value) => {
    setFormData({ ...formData, [field]: value });
    setErrors({ ...errors, [field]: "" });
    if (field === "registerType") {
      if (value === "OFFLINE") {
        setShowAddressField(true);
      } else {
        console.log("Selected register type:", value);
        setShowAddressField(false);
        setUseMarketAddress(false);
        setFormData({ ...formData, address: "", registerType: value });
      }
    }
  };

  const handleSubmit = () => {
    const newErrors = {};
    if (!formData.customerNumber) {
      newErrors.customerNumber = "Number is required";
    } else if (formData.customerNumber.length !== 10) {
      newErrors.customerNumber = "Number is invalid";
    }

    if (!formData.registerType) {
      newErrors.registerType = "Register type is required";
    }

    if (formData.registerType === "OFFLINE" && !formData.address) {
      newErrors.address_error = "Address is required";
    }

    if( formData.registerType === "OFFLINE" && !formData.name) {
      newErrors.name_error = "Name is required";
    }
    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;
setFormData({...formData, loader:true})

    if (formData.registerType == "ONLINE") {
      const requestBody = {
        countryCode: "+91",
        mobileNumber: formData.customerNumber,
        registerFrom: "MARKET",
      };

      axios
        .post(`${BASE_URL}user-service/onlineRegistration`, requestBody)
        .then((response) => {
          console.log("Success onlineRegistration:", response);
          setFormData({...formData, loader:false})

          Alert.alert("Success", "User Registered Successfully", [
            {
              text: "OK",
              onPress: () =>
                navigation.navigate("All Categories", {
                  type: formData.registerType,
                  userId: response.data.userId,
                  mobileNumber: formData.customerNumber,
                  marketName: route?.params?.MarketDetails?.marketName,
                  address: route?.params?.MarketDetails?.address,
                          marketId: route?.params?.MarketDetails?.marketId,

                }),
            },
          ]);
        })
        .catch((error) => {
          setFormData({...formData, loader:false})

          console.log("Error in onlineRegistration:", error.response);
Alert.alert('Sorry', error.response.data.message || "Failed to register user");
          // Alert.alert("Success", "User Registered Successfully", [
          //   {
          //     text: "OK",
          //     onPress: () =>
          //       navigation.navigate("All Categories", {
          //         type: formData.registerType,
          //         userId: "939d875f-af3e-4292-b45e-5ade22366428",
          //         mobileNumber: formData.customerNumber,
          //       }),
          //   },
          // ]);
        });
    } else {
      const requestBody = {
        address: formData.address,
        marketId: route?.params?.MarketDetails?.marketId,
        mobileNumber: formData.customerNumber,
        name: formData.name || "Customer",
        registerFrom: "Market",
        // type: "string",
      };

      console.log("Offline request body:", requestBody,formData.registerType);
  axios
        .post(`${BASE_URL}user-service/offlineSales`, requestBody)
        .then((response) => {
          setFormData({...formData, loader:false})
          console.log("Success offlineRegistration:==========", response.data);
          console.log("Offine user Id",response.data.id)
          console.log("==========")
          Alert.alert("Success", "Record Saved Successfully", [
            {
              text: "OK",
              onPress: () =>
                navigation.navigate("All Categories", {
                  type: formData.registerType, 
                  userId: response.data.id,
                  mobileNumber: formData.customerNumber,
                  address: formData.address,
                  marketName: route?.params?.MarketDetails?.marketName,
                          marketId: route?.params?.MarketDetails?.marketId,

                  // address: route?.params?.MarketDetails?.address,
                }),
            },
          ]);
          // getOfflineUserId()
        })
        .catch((error) => {
          console.log("Error in offlineRegistration:", error.response);
          Alert.alert("Error", error.response.data.error || "Failed to register user");
                    setFormData({...formData, loader:false})

          // Alert.alert("Success", "User Registered Successfully", [
          //   {
          //     text: "OK",
          //     onPress: () =>
          //       navigation.navigate("All Categories", {
          //         type: "Register",
          //         userId: response.data.userId,
          //         mobileNumber: formData.customerNumber,
          //       }),
          //   },
          // ]);
        });
      }
  };

  const getOfflineUserId=()=>{
    setFormData({...formData, loader:true})

    axios({
      method: "get",
      url: `${BASE_URL}user-service/getOfflineUserByMobile/${formData.customerNumber}`,
        headers:{
          "Content-Type": "application/json",
        
      }
    })
      .then((response) => {
        console.log("Offline User ID:", response);
        console.log("=========================")
        setFormData({...formData, loader:false})
        Alert.alert("Success", "Record Saved Successfully", [
          {
            text: "OK",
            onPress: () =>
              navigation.navigate("All Categories", {
                type: formData.registerType,
                userId: response.data.id,
                mobileNumber: formData.customerNumber,
                marketId: route?.params?.MarketDetails?.marketId,
                marketName: route?.params?.MarketDetails?.marketName,
                address: formData.address,
                name: formData.name,
              }),
          },
        ]);
      })
      .catch((error) => {
        setFormData({...formData, loader:false})
        console.error("Error fetching offline user ID:", error.response);
        Alert.alert("Error", error.response.data.error || "Failed to fetch user ID");
    })
  }

  const clearDetailsfunc=()=>{
    setFormData({
      customerNumber: "",
      registerType: "",
      address: "",
      name:"",
    });
    setErrors({
      customerNumber: "",
      registerType: "",
      address_error: "",
      name_error:""
    });
    setShowAddressField(false);
    setUseMarketAddress(false);
    console.log("Details cleared");
    setFormData({...formData, loader:false})

  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.formContainer}>

        <TouchableOpacity style={styles.clearbtn} onPress={()=>clearDetailsfunc()}>
          <Text style={{color:"white"}}>Clear Details</Text>
        </TouchableOpacity>
        {/* Mobile Number Field */}
        <View style={styles.formSection}>
          <Text style={styles.sectionTitle}>Customer Mobile Number</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter mobile number"
            value={formData.customerNumber}
            onChangeText={(value) =>
              handleInputChange("customerNumber", value)
            }
            keyboardType="numeric"
            maxLength={10}
          />
          {errors.customerNumber && (
            <Text style={styles.errorText}>{errors.customerNumber}</Text>
          )}
        </View>

        {/* Register Type Selection */}
        <View style={styles.formSection}>
          <Text style={styles.sectionTitle}>Register Type</Text>
          <View style={styles.toggleContainer}>
            {["ONLINE", "OFFLINE"].map((type) => (
              <TouchableOpacity
                key={type}
                style={[
                  styles.toggleButton,
                  formData.registerType === type && styles.toggleButtonActive,
                ]}
                onPress={() => {handleInputChange("registerType", type)
                  // console.log(`Selected register type: ${type}`);
                  // console.log(`Form data after selection:`, formData);
                  
                }}
              >
                <MaterialCommunityIcons
                  name={
                    type === "ONLINE"
                      ? "arrow-down-bold"
                      : "arrow-up-bold"
                  }
                  size={20}
                  color={
                    formData.registerType === type ? "#fff" : "#555"
                  }
                />
                <Text
                  style={[
                    styles.toggleText,
                    formData.registerType === type && styles.toggleTextActive,
                  ]}
                >
                  {type}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          {errors.registerType && (
            <Text style={styles.errorText}>{errors.registerType}</Text>
          )}
        </View>

        {/* Address Section if OFFLINE */}
        {showAddressField && (
          <View style={styles.formSection}>

            <TextInput
              style={[styles.input, { marginTop: 10 }]}
              placeholder="Enter Name"
              value={formData.name}
              onChangeText={(text) => handleInputChange("name", text)}
              // editable={!useMarketAddress}
            
            />
            {errors.name_error && (
              <Text style={styles.errorText}>{errors.name_error}</Text>
            )}

            <View style={{ flexDirection: "row", alignItems: "center",marginTop:10 }}>
              <TouchableOpacity
                style={styles.checkbox}
                onPress={() => {
                  const checked = !useMarketAddress;
                  setUseMarketAddress(checked);
                  if (checked) {
                    setFormData({
                      ...formData,
                      address: route.params.MarketDetails.address,
                    });
                  } else {
                    setFormData({ ...formData, address: "" });
                  }
                }}
              >
                <MaterialCommunityIcons
                  name={
                    useMarketAddress
                      ? "checkbox-marked"
                      : "checkbox-blank-outline"
                  }
                  size={24}
                  color="#2A6B57"
                />
                <Text style={{ marginLeft: 8 }}>Save as Market Address</Text>
              </TouchableOpacity>
            </View>

            <TextInput
              style={[styles.input, { marginTop: 10 }]}
              placeholder="Enter Address"
              value={formData.address}
              onChangeText={(text) => handleInputChange("address", text)}
              // editable={!useMarketAddress}
              multiline
              numberOfLines={4}
            />
            {errors.address_error && (
              <Text style={styles.errorText}>{errors.address_error}</Text>
            )}
          </View>
        )}

        {/* Action Buttons */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={styles.cancelButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
          {formData.loader==false ? (
          <TouchableOpacity
            style={styles.submitButton}
            onPress={()=>handleSubmit()}
          >
            <Text style={styles.submitButtonText}>Record Movement</Text>
          </TouchableOpacity>
          ):
          <View
            style={styles.submitButton}
            // onPress={handleSubmit}
          >
            <ActivityIndicator size="small" color="#fff" />
          </View>
          }
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  formContainer: {
    padding: 15,
  },
  clearbtn:{
    backgroundColor: "#2A6B57",
    padding: 10,
    borderRadius: 8,
    alignItems: "center",
    margin: 10,
    width:width*0.4,
    alignSelf:"flex-end"
  },
  formSection: {
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 8,
  },
  input: {
    backgroundColor: "#fff",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#e0e0e0",
    fontSize: 16,
    padding: 12,
    // height: 50,
  },
  errorText: {
    color: "red",
    fontSize: 12,
    fontWeight: "bold",
    marginTop: 4,
  },
  toggleContainer: {
    flexDirection: "row",
    backgroundColor: "#e0e0e0",
    borderRadius: 8,
  },
  toggleButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 12,
    flex: 1,
  },
  toggleButtonActive: {
    backgroundColor: "#2A6B57",
  },
  toggleText: {
    marginLeft: 8,
    fontSize: 15,
    fontWeight: "500",
    color: "#555",
  },
  toggleTextActive: {
    color: "#fff",
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginVertical: 20,
  },
  cancelButton: {
    flex: 1,
    padding: 15,
    borderRadius: 8,
    backgroundColor: "#f5f5f5",
    alignItems: "center",
    marginRight: 10,
    borderWidth: 1,
    borderColor: "#ddd",
  },
  cancelButtonText: {
    fontSize: 16,
    color: "#555",
    fontWeight: "500",
  },
  submitButton: {
    flex: 2,
    padding: 15,
    borderRadius: 8,
    backgroundColor: "#2A6B57",
    alignItems: "center",
  },
  submitButtonText: {
    fontSize: 16,
    color: "#fff",
    fontWeight: "500",
  },
  checkbox: {
    flexDirection: "row",
    alignItems: "center",
  },
});
