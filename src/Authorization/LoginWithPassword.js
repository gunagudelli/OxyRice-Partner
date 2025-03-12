import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Alert,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Image,
  KeyboardAvoidingView,
  Platform,
  Dimensions,
} from "react-native";
import axios from "axios";
import { TextInput } from "react-native-paper";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useDispatch } from "react-redux";
import { AccessToken, UserID } from "../../Redux/action/index";
import BASE_URL, { userStage } from "../../config";
import Icon from "react-native-vector-icons/Ionicons";
import FontAwesome5 from "react-native-vector-icons/FontAwesome5";
import { Dropdown } from "react-native-element-dropdown";

const { height, width } = Dimensions.get("window");

const LoginWithPassword = () => {
  // console.log({userStage})
  const [formData, setFormData] = useState({
    email: "",
    email_error: false,
    validemail_error: false,
    validNumber_error: false,
    password: "",
    password_error: false,
    // showOtp: false,
    loading: false,
  });
  const [showOtp, setShowOtp] = useState(false);
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const [secureText, setSecureText] = useState(true);
  const toggleSecureText = () => {
    setSecureText(!secureText);
  };

  const data = [
    { label: "Choose", value: "" },
    { label: "Live", value: "Live" },
    { label: "Test", value: "Test" },
  ];

  const [selectedValue, setSelectedValue] = useState("");
  const [selected_error, setSelectedError] = useState(false);
  const [dropLoading, setDropLoading] = useState(false);
  const BASE_URL =
    selectedValue === "Live"
      ? "https://meta.oxyloans.com/api/"
      : "https://meta.oxyglobal.tech/api/";

  const checkAutoLogin = async () => {
    try {
      const token = await AsyncStorage.getItem("accessToken");
      console.log("accessToken", token);
      if (token) {
        dispatch(AccessToken(JSON.parse(token)));
        navigation.navigate("Home");
      } else {
      }
    } catch (error) {
      console.error(error);
    }
  };

  // Run checkAutoLogin when the app starts
  useEffect(() => {
    checkAutoLogin();
  }, []);

  const handleLogin = async () => {
    if (selectedValue == "") {
      setSelectedError(true);
      return false;
    }
    if (formData.email == "" || formData.email == null) {
      setFormData({ ...formData, email_error: true });
      return false;
    }
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(formData.email)) {
      setFormData({ ...formData, validemail_error: true });
      return false;
    }
    if (formData.password == "" || formData.password == null) {
      setFormData({ ...formData, password_error: true });
      return false;
    }
    setFormData({ ...formData, loading: true });

    console.log("formData details", formData.email, formData.password);
    console.log(BASE_URL + "user-service/userEmailPassword");
    axios({
      method: "post",
      url: BASE_URL + "user-service/userEmailPassword",
      data: {
        email: formData.email,
        password: formData.password,
      },
    })
      .then((response) => {
        console.log(response);
        setFormData({ ...formData, loading: false });

        if (response.data.accessToken != null) {
          console.log("response", response.data);
          // await AsyncStorage.setItem("accessToken",JSON.stringify(response.data));
          // await AsyncStorage.setItem("email", formData.email);
          // await AsyncStorage.setItem("password", formData.password);
          dispatch(AccessToken(response.data));
          dispatch(UserID(selectedValue));

          Alert.alert("Success", response.data.status, [
            {
              text: "OK",
              onPress: () => {
                navigation.navigate("Home");
              },
            },
          ]);
          // navigation.navigate("Home");
        } else {
          Alert.alert("Error", "Invalid credentials. Please try again.");
        }
      })
      .catch((error) => {
        setFormData({ ...formData, loading: false });
        Alert.alert("Failed", error.response.data.message);
        console.log(error.response);
      });
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: "#fff" }}
      behavior="padding"
    >
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <View style={{ backgroundColor: "#fff", flex: 1 }}>
          {/* Top Images */}
          <View>
            <View>
              <Image
                source={require("../../assets/orange.png")}
                style={styles.orangeImage}
              />
            </View>
            <View
              style={{
                flexDirection: "row",
                alignSelf: "flex-end",
                marginBottom: 100,
                justifyContent: "space-between",
              }}
            >
              <View style={styles.oxylogoView}>
                <Image
                  source={require("../../assets/askoxy.png")}
                  style={styles.oxyricelogo}
                />
              </View>
              <View style={styles.greenImageView}>
                <Image
                  source={require("../../assets/green.png")}
                  style={styles.greenImage}
                />
              </View>
            </View>
          </View>

          {/* Login Section */}
          <View style={styles.logingreenView}>
            {/* <Image
              source={require("../../assets/green.png")}
              style={styles.riceImage}
            /> */}
            <Text style={styles.loginTxt}>LOGIN</Text>
            <View style={{ marginTop: 10 }}>
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <Text style={{ color: "white" }}>Select Environment</Text>
                <Dropdown
                  style={styles.dropdown}
                  data={data}
                  labelField="label"
                  valueField="value"
                  placeholder="Select an option"
                  value={selectedValue}
                  onChange={(item) => {
                    setSelectedValue(item.value),
                      async () => {
                        await AsyncStorage.setItem("userStage", item.value);
                      };
                  }}
                />
              </View>
              {selected_error ? (
                <Text
                  style={{
                    color: "red",
                    fontSize: 16,
                    fontWeight: "bold",
                    alignSelf: "center",
                  }}
                >
                  Please select an environment
                </Text>
              ) : null}
              {/* {selectedValue && (
        <Text style={styles.selectedText}>
          Selected: ${selectedValue}
        </Text>
      )} */}
              <TextInput
                style={styles.input1}
                placeholder="Enter Email"
                mode="outlined"
                value={formData.email.replace(/^\s+|\s+$/g, "")}
                dense={true}
                placeholderTextColor="#808080"
                // autoFocus
                autoCapitalize="none"
                activeOutlineColor="#f9b91a"
                onChangeText={(text) => {
                  setFormData({
                    ...formData,
                    email: text,
                    email_error: false,
                    validemail_error: false,
                    // validNumber_error: false,
                  });
                }}
                left={
                  <TextInput.Icon
                    icon="email"
                    style={{ opacity: 0.8 }}
                    // onPress={toggleSecureText}
                    // forceTextInputFocus={false}
                  />
                }
              />

              {formData.email_error ? (
                <Text
                  style={{
                    color: "red",
                    fontSize: 16,
                    fontWeight: "bold",
                    alignSelf: "center",
                  }}
                >
                  Email is mandatory
                </Text>
              ) : null}

              {formData.validemail_error ? (
                <Text
                  style={{
                    color: "red",
                    fontSize: 16,
                    fontWeight: "bold",
                    alignSelf: "center",
                  }}
                >
                  Invalid Email
                </Text>
              ) : null}

              {/* {formData.validNumber_error ? (
                <Text
                  style={{
                    color: "red",
                    fontSize: 16,
                    fontWeight: "bold",
                    alignSelf: "center",
                  }}
                >
                  Invalid Mobile Number
                </Text>
              ) : null} */}

              <TextInput
                style={styles.input1}
                placeholder="Enter Password"
                mode="outlined"
                value={formData.password.replace(/^\s+|\s+$/g, "")}
                dense={true}
                activeOutlineColor="#f9b91a"
                secureTextEntry={secureText}
                placeholderTextColor="#808080"
                left={
                  <TextInput.Icon
                    icon="lock"
                    style={{ opacity: 0.8 }}
                    // onPress={toggleSecureText}
                    // forceTextInputFocus={false}
                  />
                }
                right={
                  <TextInput.Icon
                    icon={secureText ? "eye-off" : "eye"}
                    onPress={toggleSecureText}
                    forceTextInputFocus={false}
                  />
                }
                onChangeText={(text) => {
                  setFormData({
                    ...formData,
                    password: text,
                    password_error: false,
                  });
                }}
              />

              {formData.password_error ? (
                <Text
                  style={{
                    color: "red",
                    fontSize: 16,
                    fontWeight: "bold",
                    alignSelf: "center",
                  }}
                >
                  Password is mandatory
                </Text>
              ) : null}

              {formData.loading == false ? (
                <TouchableOpacity
                  style={styles.otpbtn}
                  onPress={() => handleLogin()}
                >
                  <Text style={styles.Otptxt}>Login</Text>
                </TouchableOpacity>
              ) : (
                <View style={styles.otpbtn}>
                  <ActivityIndicator size="small" color="#fff" />
                </View>
              )}

              <View style={{ flexDirection: "row", alignSelf: "center" }}>
                <View>
                  {/* <TouchableOpacity style={styles.rowbtn}>
                        <Icon
                        name="logo-whatsapp"
                        color="green"
                        size={24}
                        />
                    </TouchableOpacity> */}
                </View>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default LoginWithPassword;

const styles = StyleSheet.create({
  orangeImage: {
    height: 150,
    width: 150,
    marginBottom: -20,
  },
  oxyricelogo: {
    width: 200,
    height: 100,
    resizeMode: "contain",
    marginRight: width / 6,
  },
  oxylogoView: {
    height: 1,
  },
  greenImage: {
    height: 100,
    width: 50,
  },
  riceImage: {
    height: 180,
    width: 180,
    alignSelf: "flex-end",
    marginTop: -95,
  },
  logingreenView: {
    flex: 2,

    backgroundColor: "#3d2a71",
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    // height: height/2,
  },
  loginTxt: {
    color: "white",
    fontWeight: "500",
    fontSize: 25,
    marginTop: 60,
    marginBottom: 20,
    alignSelf: "center",
  },
  input1: {
    borderColor: "#f9b91a",
    width: width * 0.8,
    alignSelf: "center",
    height: 45,
    paddingLeft: 10,
    margin: 10,
  },
  input: {
    height: 45,
    borderWidth: 1,
    borderColor: "orange",
    borderRadius: 5,
    paddingLeft: width * 0.22, // Add padding to accommodate prefix
    fontSize: 16,
    alignSelf: "center",
    width: width * 0.8,
  },
  fixedPrefix: {
    position: "absolute",
    left: width / 7,
    top: 13,
    flexDirection: "row",
    alignItems: "center",
  },
  flag: {
    width: 24,
    height: 16,
    marginRight: 5,
  },
  divider: {
    width: 1,
    height: 20,
    backgroundColor: "#ccc",
    marginHorizontal: 8,
  },
  countryCode: {
    fontSize: 16,
    fontWeight: "bold",
  },
  otpbtn: {
    width: width * 0.8,
    height: 45,
    backgroundColor: "#f9b91a",
    borderRadius: 5,
    justifyContent: "center",
    alignItems: "center",
    alignSelf: "center",
    margin: 20,
  },
  Otptxt: {
    // color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
  rowbtn: {
    //   width: width * 0.35,
    //   height: 45,
    padding: 5,
    backgroundColor: "white",
    borderRadius: 5,
    justifyContent: "center",
    alignItems: "center",
    alignSelf: "center",
    margin: 10,
  },
  dropdown: {
    height: 50,
    borderColor: "#ccc",
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    backgroundColor: "#fff",
    width: width * 0.4,
    marginLeft: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 10,
  },
  selectedText: {
    marginTop: 10,
    fontSize: 16,
    color: "#333",
  },
});
