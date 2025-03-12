import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Alert,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  KeyboardAvoidingView,
  Dimensions,
} from "react-native";
import axios from "axios";
import { TextInput } from "react-native-paper";
import { useNavigation } from "@react-navigation/native";
import BASE_URL, { userStage } from "../../config";

const { width } = Dimensions.get("window");

const Register = () => {
  const [formData, setFormData] = useState({
    email: "",
    email_error: false,
    validemail_error: false,
    emailOtp: "",
    password: "",
    password_error: false,
    confirmPassword: "",
    confirmPassword_error: false,
    emailOtpSession: "",
    salt: "",
    otpSent: false,
    loading: false,
    timeInMilliSeconds: "",
  });

  const navigation = useNavigation();

  const handleSendOtp = async () => {
    if (!formData.email) {
      setFormData({ ...formData, email_error: true });
      return;
    }

    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(formData.email)) {
      setFormData({ ...formData, validemail_error: true });
      return;
    }

    setFormData((prev) => ({ ...prev, loading: true }));
    // console.log("email request  "+formData.email);

    try {
      const response = await axios.post(
        `${BASE_URL}user-service/userEmailPassword`,
        {
          email: formData.email,
        }
      );

      if (response.status === 500) {
        // Move error handling here, as 500 errors are not considered successful responses
        Alert.alert("Error", "You are already registered, please login now!");
        navigation.navigate("LoginWithPassword");
      } else {
        console.log("response", response.data);
        setFormData({
          ...formData,
          emailOtpSession: response.data.emailOtpSession,
          salt: response.data.salt,
          otpSent: true,
          loading: false,
          email_error: false,
          validemail_error: false,
          timeInMilliSeconds: response.data.timeInMilliSeconds,
        });
        Alert.alert("Success", "OTP has been sent to your email.");
      }
    } catch (error) {
      console.error("OTP Error:", error.response?.data || error.message);

      if (error.response?.status === 500) {
        Alert.alert("Error", "You are already registered, please login now!");
        navigation.navigate("LoginWithPassword");
      } else {
        Alert.alert(
          "Error",
          error.response?.data?.message ||
            error.message ||
            "Failed to send OTP."
        );
      }
      setFormData((prev) => ({ ...prev, loading: false }));
    }
  };

  const handleRegister = async () => {
    if (!formData.emailOtp) {
      Alert.alert("Error", "Please enter the OTP sent to your email.");
      return;
    }
    if (!formData.password) {
      setFormData({ ...formData, password_error: true });
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      setFormData({ ...formData, confirmPassword_error: true });
      return;
    }

    setFormData((prev) => ({ ...prev, loading: true }));

    try {
      const response = await axios.post(
        `${BASE_URL}user-service/userEmailPassword`,
        {
          email: formData.email,
          emailOtp: formData.emailOtp,
          emailOtpSession: formData.emailOtpSession,
          salt: formData.salt,
          password: formData.password,
          timeInMilliSeconds: formData.timeInMilliSeconds,
        }
      );

      if (response.data.status === "Registration Successful") {
        Alert.alert("Success", "Registration successful!");
        navigation.navigate("LoginWithPassword");
      }
    } catch (error) {
      console.error(
        "Registration Error:",
        error.response?.data || error.message
      );
      Alert.alert(
        "Error",
        error.response?.data?.message ||
          error.message ||
          "Something went wrong."
      );
    } finally {
      setFormData((prev) => ({ ...prev, loading: false }));
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: "#fff" }}
      behavior="padding"
    >
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <View style={styles.container}>
          <Text style={styles.header}>REGISTER</Text>

          <TextInput
            style={styles.input}
            placeholder="Enter Email"
            mode="outlined"
            value={formData.email}
            onChangeText={(text) =>
              setFormData({
                ...formData,
                email: text,
                email_error: false,
                validemail_error: false,
              })
            }
            autoCapitalize="none"
            activeOutlineColor="#f9b91a"
            left={<TextInput.Icon icon="email" />}
            error={formData.email_error || formData.validemail_error}
          />
          {formData.email_error && (
            <Text style={styles.errorText}>Email is required</Text>
          )}
          {formData.validemail_error && (
            <Text style={styles.errorText}>Invalid Email</Text>
          )}

          {formData.otpSent && (
            <>
              <TextInput
                style={styles.input}
                placeholder="Enter OTP"
                mode="outlined"
                value={formData.emailOtp}
                onChangeText={(text) =>
                  setFormData({ ...formData, emailOtp: text })
                }
                activeOutlineColor="#f9b91a"
                left={<TextInput.Icon icon="key" />}
              />
              <TextInput
                style={styles.input}
                placeholder="Password"
                mode="outlined"
                secureTextEntry
                value={formData.password}
                onChangeText={(text) =>
                  setFormData({
                    ...formData,
                    password: text,
                    password_error: false,
                  })
                }
                activeOutlineColor="#f9b91a"
                left={<TextInput.Icon icon="lock" />}
                error={formData.password_error}
              />
              <TextInput
                style={styles.input}
                placeholder="Confirm Password"
                mode="outlined"
                secureTextEntry
                value={formData.confirmPassword}
                onChangeText={(text) =>
                  setFormData({
                    ...formData,
                    confirmPassword: text,
                    confirmPassword_error: false,
                  })
                }
                activeOutlineColor="#f9b91a"
                left={<TextInput.Icon icon="lock" />}
                error={formData.confirmPassword_error}
              />
            </>
          )}

          <TouchableOpacity
            style={[styles.button, formData.loading && styles.buttonDisabled]}
            onPress={formData.otpSent ? handleRegister : handleSendOtp}
            disabled={formData.loading}
          >
            {formData.loading ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Text style={styles.buttonText}>
                {formData.otpSent ? "Register" : "Send OTP"}
              </Text>
            )}
          </TouchableOpacity>

          {formData.otpSent && (
            <TouchableOpacity
              style={styles.link}
              onPress={() =>
                setFormData((prev) => ({ ...prev, otpSent: false }))
              }
            >
              <Text style={styles.linkText}>Change Email</Text>
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: "center",
  },
  header: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
    alignSelf: "center",
  },
  input: {
    marginBottom: 10,
    backgroundColor: "#fff",
  },
  errorText: {
    color: "red",
    marginBottom: 10,
    marginLeft: 10,
  },
  button: {
    backgroundColor: "#f9b91a",
    padding: 15,
    borderRadius: 5,
    alignItems: "center",
    marginTop: 20,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  link: {
    marginTop: 15,
    alignSelf: "center",
  },
  linkText: {
    color: "#f9b91a",
    fontWeight: "500",
  },
});

export default Register;
