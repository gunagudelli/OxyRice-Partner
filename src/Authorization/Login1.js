import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  StyleSheet,
  ActivityIndicator,
  Image,
  KeyboardAvoidingView,
  Platform,
  Dimensions,
} from "react-native";
import axios from "axios";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useDispatch } from "react-redux";
import { AccessToken } from "../Redux/action/index";
import BASE_URL from "../Config";
import Icon from "react-native-vector-icons/Ionicons";

const { height, width } = Dimensions.get("window");

const LoginPage = () => {
  const [mobileNumber, setMobileNumber] = useState("");
  const [isLogin, setIsLogin] = useState(false);
  const [otp, setOtp] = useState("");
  const [responseMessage, setResponseMessage] = useState("");
  const [errors, setErrors] = useState({ mobileNumber: "", otp: "" });
  const [mobileOtpSession, setMobileOtpSession] = useState("");
  const [loading, setLoading] = useState(false);
  const [passwordVisible, setPasswordVisible] = useState(false);
  const navigation = useNavigation();
  const dispatch = useDispatch();

  useFocusEffect(
    React.useCallback(() => {
      setMobileNumber("");
      setOtp("");
      setIsLogin(false);
    }, [])
  );

  useFocusEffect(
    useCallback(() => {
      const checkLoginData = async () => {
        try {
          const loginData = await AsyncStorage.getItem("userData");
          const storedmobilenumber = await AsyncStorage.getItem("mobileNumber");
          setMobileNumber(storedmobilenumber);
          if (loginData) {
            const user = JSON.parse(loginData);
            if (user.accessToken) {
              dispatch(AccessToken(user));
              navigation.navigate("Home");
            }
          }
        } catch (error) {
          console.error("Error fetching login data", error);
        }
      };

      checkLoginData();
    }, [])
  );

  const validateMobileNumber = () => {
    if (!mobileNumber) {
      setErrors({ ...errors, mobileNumber: "Mobile number is required." });
      return false;
    }
    if (!/^[6-9]\d{9}$/.test(mobileNumber)) {
      setErrors({
        ...errors,
        mobileNumber: "Enter a valid 10-digit mobile number.",
      });
      return false;
    }
    setErrors({ ...errors, mobileNumber: "" });
    return true;
  };

  const validateOtp = () => {
    if (!otp) {
      setErrors({ ...errors, otp: "OTP is required." });
      return false;
    }
    if (!/^\d{6}$/.test(otp)) {
      setErrors({ ...errors, otp: "OTP must be 6 digits." });
      return false;
    }
    setErrors({ ...errors, otp: "" });
    return true;
  };

  const handleSendOtp = async () => {
    if (!validateMobileNumber()) return;
    let data = {
      mobileNumber,
      userType: "Login",
    };
    setLoading(true);
    try {
      const response = await axios.post(
        BASE_URL + `erice-service/user/login-or-register`,
        data
      );
      if (response.data.mobileOtpSession) {
        setMobileOtpSession(response.data.mobileOtpSession);
        setIsLogin(true);
        setResponseMessage("OTP sent successfully.");
        setTimeout(() => setResponseMessage(""), 3000);
      } else {
        Alert.alert("Error", "Failed to send OTP. Try again.");
      }
    } catch (error) {
      Alert.alert("Error", "You are not registered, Please signup");
      if (error.response.status == 400) {
        navigation.navigate("Register");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = () => {
    if (!validateOtp()) return;

    setLoading(true);
    let data = {
      mobileNumber,
      mobileOtpSession,
      mobileOtpValue: otp,
      userType: "Login",
    };
    axios({
      method: "post",
      url: BASE_URL + `erice-service/user/login-or-register`,
      data: data,
    })
      .then((response) => {
        setLoading(false);
        if (response.data.accessToken) {
          dispatch(AccessToken(response.data));
          AsyncStorage.setItem("userData", JSON.stringify(response.data));
          Alert.alert("Success", "Login successful!");
          navigation.navigate("Home");
        } else {
          Alert.alert("Error", "Invalid credentials.");
        }
      })
      .catch((error) => {
        setLoading(false);
        console.error(error);
      });
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <Image source={require("../assets/logo1.png")} style={styles.logo} />
      <Text style={styles.title}>Login</Text>

      <View style={styles.mobileContainer}>
        <View style={styles.countryCodeBox}>
          <Text style={styles.countryCode}>+91</Text>
        </View>
        <TextInput
          style={[styles.input, errors.mobileNumber && styles.inputError]}
          placeholder="Enter Mobile Number"
          keyboardType="phone-pad"
          value={mobileNumber}
          onChangeText={setMobileNumber}
        />
      </View>

      {errors.mobileNumber && (
        <Text style={styles.errorText}>{errors.mobileNumber}</Text>
      )}
      {responseMessage && (
        <Text style={styles.successText}>{responseMessage}</Text>
      )}

      {!isLogin ? (
        <TouchableOpacity
          style={[styles.button, loading && styles.disabledButton]}
          onPress={handleSendOtp}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Send OTP</Text>
          )}
        </TouchableOpacity>
      ) : (
        <>
          <TextInput
            style={[styles.input, errors.otp && styles.inputError]}
            placeholder="Enter OTP"
            keyboardType="numeric"
            value={otp}
            maxLength={6}
            onChangeText={setOtp}
          />
          {errors.otp && <Text style={styles.errorText}>{errors.otp}</Text>}

          <TouchableOpacity
            style={{ alignSelf: "flex-end" }}
            onPress={handleSendOtp}
          >
            <Text style={{ color: "orange", fontSize: 17, paddingRight: 15 }}>
              <Icon name="refresh" size={16} />
              Resend OTP
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, loading && styles.disabledButton]}
            onPress={handleVerifyOtp}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Text style={styles.buttonText}>Verify OTP</Text>
            )}
          </TouchableOpacity>
        </>
      )}

      {!isLogin && (
        <View style={{ alignItems: "center" }}>
          <TouchableOpacity
            style={styles.btn}
            onPress={() => navigation.navigate("LoginWithPassword")}
          >
            <Text style={{ color: "white" }}>Login with Password</Text>
          </TouchableOpacity>
          <View>
            <Text style={styles.registerPrompt}>
              Don't have an account?
              <Text
                style={styles.registerLink}
                onPress={() => navigation.navigate("Register")}
              >
                {" Sign up here"}
              </Text>
            </Text>
          </View>
        </View>
      )}
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F5F5F5",
    paddingHorizontal: 20,
  },
  logo: {
    width: 200,
    height: 80,
    marginBottom: 5,
    resizeMode: "contain",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 20,
    textAlign: "center",
  },
  mobileContainer: {
    flexDirection: "row",
    width: "100%",
    alignItems: "center",
  },
  countryCodeBox: {
    borderWidth: 1,
    borderColor: "#CCC",
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 5,
    backgroundColor: "#FFF",
    marginRight: 10,
  },
  countryCode: {
    fontSize: 16,
    fontWeight: "bold",
  },
  input: {
    width: "80%",
    height: 50,
    borderWidth: 1,
    borderColor: "#CCC",
    borderRadius: 8,
    paddingHorizontal: 15,
    backgroundColor: "#FFF",
    marginBottom: 10,
  },
  inputError: {
    borderColor: "red",
  },
  button: {
    width: "100%",
    backgroundColor: "#4CAF50",
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 10,
  },
  disabledButton: {
    backgroundColor: "#A5D6A7",
  },
  buttonText: {
    color: "#FFF",
    fontWeight: "bold",
  },
  errorText: {
    color: "red",
    fontSize: 12,
    marginBottom: 5,
    alignSelf: "flex-start",
  },
  successText: {
    color: "green",
    margin: 5,
    textAlign: "center",
  },
  registerPrompt: {
    fontSize: 14,
    color: "#666",
    marginTop: 20,
  },
  registerLink: {
    color: "#fd7e14",
    fontWeight: "bold",
  },
  btn: {
    marginTop: 20,
    backgroundColor: "orange",
    width: width * 0.9,
    alignItems: "center",
    padding: 10,
    borderRadius: 5,
  },
});

export default LoginPage;
