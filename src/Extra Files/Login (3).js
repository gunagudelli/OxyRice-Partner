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
const { height, width } = Dimensions.get("window");

const Login = () => {
  const [formData, setFormData] = useState({
    mobileNumber: "",
    mobileNumber_error: false,
    validMobileNumber_error: false,
    otp: "",
    otp_error: false,
    validOtpError: false,
    // showOtp: false,
    loading: false,
    // mobileOtpSession: "",
  });
  const[mobileOtpSession,setMobileOtpSession]=useState()
  const [showOtp, setShowOtp] = useState(false);
  const navigation = useNavigation();
  const dispatch = useDispatch();

  const handleSendOtp = async () => {
    // if (!validateMobileNumber()) return;
    if (formData.mobileNumber == "" || formData.mobileNumber == null) {
      setFormData({ ...formData, mobileNumber_error: true });
      return;
    }
    if (formData.mobileNumber.length != 10) {
      setFormData({ ...formData, validMobileNumber_error: true });
      return;
    }
    console.log("mobileNumber", formData.mobileNumber);
    let data = {
      mobileNumber: formData.mobileNumber,
      userType: "Login",
    };
    console.log({ data });
    setFormData({ ...formData, loading: true });
    try {
      const response = await axios.post(
        BASE_URL + `erice-service/user/login-or-register`,
        data
      );
      console.log("Send Otp", response.data);

      if (response.data.mobileOtpSession!=null) {
         setMobileOtpSession(response.data.mobileOtpSession);
        setFormData({
          ...formData,
          // showOtp: true,
          // mobileOtpSession: response.data.mobileOtpSession,
          loading: false,
        });
        setShowOtp(true);
        //  setIsLogin(true);
        //  setResponseMessage("OTP sent successfully.");
        // setTimeout(() => setResponseMessage(""), 3000);
      } else {
        Alert.alert("Error", "Failed to send OTP. Try again.");
        // setFormData({ formData, loading: false });
      }
    } catch (error) {
      Alert.alert("Sorry", "You not register,Please signup");
      //   setFormData({ formData, loading: false });

      if (error.response.status == 400) {
        navigation.navigate("Register");
      }
    } finally {
      setFormData({ ...formData, loading: false });
    }
  };

  const handleVerifyOtp = () => {
    // if (!validateOtp()) return;
    if (formData.otp == "" || formData.otp == null) {
      setFormData({ ...formData, otp_error: true });
      return false;
    }
    if (formData.otp.length != 6) {
      setFormData({ ...formData, validOtpError:true });
      return false;
    }
    //  setLoading(true);
    setFormData({ formData, loading: true });

    let data = {
      mobileNumber: formData.mobileNumber,
      mobileOtpSession: mobileOtpSession,
      mobileOtpValue: formData.otp,
      userType: "Login",
      // primaryType: "CUSTOMER",
    };
    console.log({ data });
    axios({
      method: "post",
      url: BASE_URL + `erice-service/user/login-or-register`,
      data: data,
    })
      .then((response) => {
        console.log("response", response.data);
        setFormData({ formData, loading: false });

        if (response.data.accessToken != null) {
          if (response.data.primaryType == "DELIVERYBOY") {
            dispatch(AccessToken(response.data));
            AsyncStorage.setItem("userData", JSON.stringify(response.data));
            // await AsyncStorage.setItem('mobileNumber',mobileNumber)
            // await AsyncStorage.setItem("userData", JSON.stringify(response.data));
            Alert.alert("Success", "Login successful!");
            navigation.navigate("Home");
          } else {
            Alert.alert(
              `You have logged in as ${response.data.primaryType} , Please login as Delivery Boy`
            );
          }
        } else {
          Alert.alert("Error", "Invalid credentials.");
        }
      })
      .catch((error) => {
        setFormData({ formData, loading: false });
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
              {/* <TextInput
                style={styles.input}
                placeholder="Enter Mobile Number"
                mode="outlined"
                value={formData.mobileNumber}
                dense={true}
                autoFocus
                activeOutlineColor="#e87f02"
                onChangeText={(text) => {
                  setFormData({
                    ...formData,
                    mobileNumber: text,
                    mobileNumber_error: false,
                  });
                }}
                left={<TextInput.Icon icon="eye" />}
              /> */}
              <TextInput
                style={styles.input}
                mode="outlined"
                placeholder="Enter Mobile Number"
                keyboardType="numeric"
                dense={true}
                // autoFocus
                error={formData.mobileNumber_error}
                activeOutlineColor={
                  formData.mobileNumber_error ? "red" : "#e87f02"
                }
                value={formData.mobileNumber}
                maxLength={10}
                onChangeText={(text) => {
                  setFormData({
                    ...formData,
                    mobileNumber: text,
                    mobileNumber_error: false,
                    validMobileNumber_error: false,
                  });
                }}
              />
              {formData.mobileNumber_error ? (
                <Text
                  style={{
                    color: "red",
                    fontSize: 16,
                    fontWeight: "bold",
                    alignSelf: "center",
                  }}
                >
                  Mobile Number is mandatory
                </Text>
              ) : null}

              {formData.validMobileNumber_error ? (
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

              {/* Fixed Indian flag and +91 prefix */}
              <View style={styles.fixedPrefix}>
                <Image
                  source={{
                    uri: "https://upload.wikimedia.org/wikipedia/en/thumb/4/41/Flag_of_India.svg/1200px-Flag_of_India.svg.png",
                  }}
                  style={styles.flag}
                />
                <View style={styles.divider} />
                <Text style={styles.countryCode}>+91</Text>
              </View>

              {showOtp == false ? (
                <View>
                  {formData.loading == false ? (
                    <View>
                      <TouchableOpacity
                        style={styles.otpbtn}
                        onPress={() => handleSendOtp()}
                      >
                        <Text style={styles.Otptxt}>Send OTP</Text>
                      </TouchableOpacity>
                      <View
                        style={{ flexDirection: "row", alignSelf: "center" }}
                      >
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
                            onPress={() =>
                              navigation.navigate("LoginWithPassword")
                            }
                          >
                            {/* <Text>Email</Text> */}
                            <Icon name="mail-outline" color="green" size={24} />
                          </TouchableOpacity>
                        </View>
                      </View>

                      {/* <View style={{}} /> */}
                      {/* Not yet Register */}
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
                  ) : (
                    <View style={styles.otpbtn}>
                      <ActivityIndicator size="small" color="#fff" />
                    </View>
                  )}
                </View>
              ) : (
                <View>
                  <TextInput
                    style={styles.input1}
                    placeholder="Enter OTP"
                    mode="outlined"
                    value={formData.otp}
                    dense={true}
                    maxLength={6}
                    activeOutlineColor="#e87f02"
                    autoFocus
                    onChangeText={(text) => {
                      setFormData({
                        ...formData,
                        otp: text,
                        otp_error: false,
                      });
                    }}
                  />

                  {formData.otp_error ? (
                    <Text
                      style={{
                        color: "red",
                        fontSize: 16,
                        fontWeight: "bold",
                        alignSelf: "center",
                      }}
                    >
                      OTP is mandatory
                    </Text>
                  ) : null}

                  {formData.validOtpError ? (
                    <Text
                      style={{
                        color: "red",
                        fontSize: 16,
                        fontWeight: "bold",
                        alignSelf: "center",
                      }}
                    >
                      Invalid OTP
                    </Text>
                  ) : null}

                  {formData.loading == false ? (
                    <TouchableOpacity
                      style={styles.otpbtn}
                      onPress={() => handleVerifyOtp()}
                    >
                      <Text style={styles.Otptxt}>Verify OTP</Text>
                    </TouchableOpacity>
                  ) : (
                    <View style={styles.otpbtn}>
                      <ActivityIndicator size="small" color="#fff" />
                    </View>
                  )}
                </View>
              )}
            </View>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default Login;

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
