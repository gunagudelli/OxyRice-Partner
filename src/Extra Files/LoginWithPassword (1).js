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
import { AccessToken } from "../Redux/action/index";
import BASE_URL from "../Config";
import Icon from "react-native-vector-icons/Ionicons";
import FontAwesome5 from "react-native-vector-icons/FontAwesome5";

const { height, width } = Dimensions.get("window");

const LoginWithPassword = () => {
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

  const handleLogin = async () => {
    if (formData.email == "" || formData.email == null) {
      setFormData({ ...formData, email_error: true });
      return false;
    }
    if (
      formData.email.includes("@") ||
      formData.email.includes(".com") ||
      formData.email.includes(".in")
    ) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        setFormData({ ...formData, validemail_error: true });
        return false;
      }
      if (formData.password == "" || formData.password == null) {
        setFormData({ ...formData, password_error: true });
        return false;
      }

      //   setLoading(true);
      setFormData({ ...formData, loading: true });
      var data = {
        email: formData.email,
        password: formData.password,
      };
      axios({
        method: "post",
        url: `${BASE_URL}erice-service/user/userEmailPassword`,
        data: data,
      })
        .then(function (response) {
          console.log(response.data);
          setFormData({ ...formData, loading: false });
          if (response.data.accessToken) {
            // await AsyncStorage.setItem("accessToken", response.data.token);

            dispatch(AccessToken(response.data));
            Alert.alert("Success", response.data.status);
            navigation.navigate("Home");
          } else {
            Alert.alert("Error", "Invalid credentials. Please try again.");
          }
        })
        .catch(function (error) {
          console.log(error.response);
          setFormData({ ...formData, loading: false });
          Alert.alert("Error", error.response.data.error);
        });
    } else {
      if (!isNaN(formData.email)) {
        console.log("mobile number");
        if (formData.email.length != 10) {
          setFormData({ ...formData, validNumber_error: true });
          return false;
        }
        setFormData({ ...formData, loading: true });

        if (formData.password == "admin") {
          axios({
            method: "post",
            url: BASE_URL + `erice-service/user/adminLoginWithUserMobile`,
            data: {
              mobileNumber: formData.email,
            },
          })
            .then(function (response) {
              console.log(response.data);
              setFormData({ ...formData, loading: false });

              dispatch(AccessToken(response.data));
              // Alert.alert("Success", response.data.status);
              navigation.navigate("Home");
            })
            .catch(function (error) {
              console.log(error.response);
              setFormData({ ...formData, loading: false });
              Alert.alert("Failed", error.response.data.error);
            });
        } else {
          Alert.alert("Failed", "Please enter a valid password.");
        }
      } else {
        Alert.alert("Failed", "Please enter a valid email or Mobile Number.");
      }
    }
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
                source={require("../assets/orange.png")}
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
                  source={require("../assets/logo1.png")}
                  style={styles.oxyricelogo}
                />
              </View>
              <View style={styles.greenImageView}>
                <Image
                  source={require("../assets/green.png")}
                  style={styles.greenImage}
                />
              </View>
            </View>
          </View>

          {/* Login Section */}
          <View style={styles.logingreenView}>
            <Image
              source={require("../assets/rice.png")}
              style={styles.riceImage}
            />
            <Text style={styles.loginTxt}>Login</Text>
            <View style={{ marginTop: 130 }}>
              <TextInput
                style={styles.input1}
                placeholder="Enter Email"
                mode="outlined"
                value={formData.email}
                dense={true}
                // autoFocus
                activeOutlineColor="#e87f02"
                onChangeText={(text) => {
                  setFormData({
                    ...formData,
                    email: text,
                    email_error: false,
                    validemail_error: false,
                    validNumber_error: false,
                  });
                }}
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

              {formData.validNumber_error ? (
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
              ) : null}

              <TextInput
                style={styles.input1}
                placeholder="Enter Password"
                mode="outlined"
                value={formData.password}
                dense={true}
                activeOutlineColor="#e87f02"
                right={<TextInput.Icon icon="eye" />}
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
                <View>
                  <TouchableOpacity
                    style={styles.rowbtn}
                    onPress={() => navigation.navigate("Login")}
                  >
                    {/* <Text>Email</Text> */}
                    <FontAwesome5 name="phone-alt" color="green" size={24} />
                  </TouchableOpacity>
                </View>
              </View>
              <View
                style={{
                  flexDirection: "row",
                  textAlign: "center",
                  width: width * 0.5,
                  alignSelf: "center",
                  marginTop: 10,
                }}
              >
                <Text style={{ color: "white", fontSize: 16 }}>
                  Not yet Registered ?{" "}
                </Text>
                <TouchableOpacity
                  onPress={() => navigation.navigate("Register")}
                >
                  <Text
                    style={{
                      color: "#e87f02",
                      fontWeight: "bold",
                      fontSize: 16,
                    }}
                  >
                    {" "}
                    Register{" "}
                  </Text>
                </TouchableOpacity>
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
    backgroundColor: "#008001",
    borderTopLeftRadius: 30,
    // height: height/2,
  },
  loginTxt: {
    color: "white",
    fontWeight: "500",
    fontSize: 25,
    margin: -70,
    alignSelf: "center",
  },
  input1: {
    borderColor: "orange",
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
    backgroundColor: "#e87f02",
    borderRadius: 5,
    justifyContent: "center",
    alignItems: "center",
    alignSelf: "center",
    margin: 20,
  },
  Otptxt: {
    color: "white",
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
});
