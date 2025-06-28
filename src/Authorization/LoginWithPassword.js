import React, { useState, useEffect } from "react";
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
import { useNavigation } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useDispatch } from "react-redux";
import { AccessToken, UserID } from "../../Redux/action/index";
import Icon from "react-native-vector-icons/Ionicons";
import BASE_URL from "../../config";
import { useSelector } from "react-redux";
const { height, width } = Dimensions.get("window");

// Set fixed BASE_URL for Live environment
// const BASE_URL = "https://meta.oxyloans.com/api/";

const LoginWithPassword = () => {
  const [formData, setFormData] = useState({
    email: "",
    email_error: false,
    validemail_error: false,
    password: "",
    password_error: false,
    loading: false,
  });

  const navigation = useNavigation();
  const dispatch = useDispatch();
  const [secureText, setSecureText] = useState(true);

  const toggleSecureText = () => {
    setSecureText(!secureText);
  };

  // Enhanced auto-login check
 const checkAutoLogin = async () => {
  try {
    const tokenString = await AsyncStorage.getItem("userData");

    if (tokenString) {
      const token = JSON.parse(tokenString); // ✅ Now it's an object

      dispatch(AccessToken(token)); // store in Redux
      dispatch(UserID("Live"));

      console.log("Auto login with saved token:", token);

      // Now navigation will work
      if (token.primaryType === "SELLER") {
        navigation.navigate("Home");
      } else if (token.primaryType === "SALESEXECUTIVE") {
        navigation.navigate("Market Visits");
      } else {
        navigation.navigate("Store Details");
      }

    } else {
      console.log("No saved token found");
    }

  } catch (error) {
    console.error("Auto-login error:", error);
  }
};


  useEffect(() => {
    checkAutoLogin();
  }, []);

  const handleLogin = async () => {
    // Form validation
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

    try {
      // Check if the endpoint is correct - this is where the error is happening
      const loginUrl = `${BASE_URL}user-service/userEmailPassword`;

      const response = await axios({
        method: "post",
        url: loginUrl,
        data: {
          email: formData.email,
          password: formData.password,
        },
        timeout: 10000, // Set a timeout
      });

      console.log("Login response:", response.data);

      if (response.data && response.data.accessToken) {
        dispatch(AccessToken(response.data));
        dispatch(UserID("Live"));
        await AsyncStorage.setItem("userData", JSON.stringify(response.data));
        const isSeller = response.data.primaryType === "SELLER";

        // Show success greeting popup
        Alert.alert(
          "Login Successful! 🎉",
          `Welcome back to AskOxy.AI ${response.data.primaryType}! We're glad to see you again.`,
          [
            {
              text: "Continue",
              onPress: () => {
                if (response.data.primaryType == "SELLER") {
                  navigation.navigate("Home");
                }  else if(response.data.primaryType == "SALESEXECUTIVE") {
                navigation.navigate("Market Visits");
                }else {
                navigation.navigate("Store Details");
                }
              },
            },
          ]
        );
      } else {
        Alert.alert("Login Failed", "Invalid credentials or server error");
      }
    } catch (error) {
      console.log("Login error details:", error);

      // Handle specific error cases
      if (error.response) {
        // The server responded with a status code outside the 2xx range
        console.log("Error response data:", error.response.data);
        console.log("Error response status:", error.response.status);

        if (error.response.status === 500) {
          Alert.alert(
            "Server Error",
            "The server encountered an internal error. Please try again later or contact support."
          );
        } else {
          Alert.alert(
            "Login Failed",
            error.response.data?.message ||
              "Unable to log in. Please check your credentials."
          );
        }
      } else if (error.request) {
        // The request was made but no response was received
        Alert.alert(
          "Connection Error",
          "Unable to connect to the server. Please check your internet connection."
        );
      } else {
        // Something happened in setting up the request
        Alert.alert("Error", "An unexpected error occurred. Please try again.");
      }
    } finally {
      setFormData({ ...formData, loading: false });
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <View style={{ flex: 1 }}>
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
            <Text style={styles.loginTxt}>LOGIN</Text>
            <View style={{ marginTop: 10 }}>
              <TextInput
                style={styles.input1}
                placeholder="Enter Email"
                mode="outlined"
                value={formData.email.replace(/^\s+|\s+$/g, "")}
                dense={true}
                placeholderTextColor="#808080"
                autoCapitalize="none"
                activeOutlineColor="#f9b91a"
                onChangeText={(text) => {
                  setFormData({
                    ...formData,
                    email: text,
                    email_error: false,
                    validemail_error: false,
                  });
                }}
                left={<TextInput.Icon icon="email" style={{ opacity: 0.8 }} />}
              />

              {formData.email_error ? (
                <Text style={styles.errorText}>Email is mandatory</Text>
              ) : null}

              {formData.validemail_error ? (
                <Text style={styles.errorText}>Invalid Email</Text>
              ) : null}

              <TextInput
                style={styles.input1}
                placeholder="Enter Password"
                mode="outlined"
                value={formData.password.replace(/^\s+|\s+$/g, "")}
                dense={true}
                activeOutlineColor="#f9b91a"
                secureTextEntry={secureText}
                placeholderTextColor="#808080"
                left={<TextInput.Icon icon="lock" style={{ opacity: 0.8 }} />}
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
                <Text style={styles.errorText}>Password is mandatory</Text>
              ) : null}

              {formData.loading ? (
                <View style={styles.otpbtn}>
                  <ActivityIndicator size="small" color="#fff" />
                </View>
              ) : (
                <TouchableOpacity
                  style={styles.otpbtn}
                  onPress={() => handleLogin()}
                >
                  <Text style={styles.Otptxt}>Login</Text>
                </TouchableOpacity>
              )}
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
  greenImageView: {
    // Add any specific styles needed
  },
  logingreenView: {
    flex: 2,
    backgroundColor: "#3d2a71",
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
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
  errorText: {
    color: "red",
    fontSize: 16,
    fontWeight: "bold",
    alignSelf: "center",
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
    fontSize: 16,
    fontWeight: "bold",
  },
});