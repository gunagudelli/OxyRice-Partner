import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Alert,
  StyleSheet,
  ActivityIndicator,
  Image,
  KeyboardAvoidingView,
  Platform,
  ImageBackground,
  // TextInput
} from "react-native";
import { TextInput } from "react-native-paper";
import axios from "axios";
import { useNavigation } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Icon from "react-native-vector-icons/Ionicons";
import BASE_URL from "../../config";
import { useDispatch } from 'react-redux';
import { AccessToken } from '../../Redux/action';

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const [showPassword, setShowPassword] = useState(false);

 useEffect(() => {
   const fetchEmail = async () => {
     if (await AsyncStorage.getItem("email")) {
       setEmail(await AsyncStorage.getItem("email"));
       setPassword(await AsyncStorage.getItem("password"));
     }
     else {
      setEmail("");
      setPassword("");
     }
   }
  }, []);


  const validateEmail = () => {
    if (!email) {
      setErrors({ ...errors, email: "Email is required." });
      return false;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setErrors({ ...errors, email: "Enter a valid email address." });
      return false;
    }
    setErrors({ ...errors, email: "" });
    return true;
  };

  const validatePassword = () => {
    if (!password) {
      setErrors({ ...errors, password: "Password is required." });
      return false;
    }
    setErrors({ ...errors, password: "" });
    return true;
  };

  const handleLogin = async () => {
    if (!validateEmail() || !validatePassword()) return;

    setLoading(true);
    try {
      console.log("login");
      console.log({ email, password });

      const response = await axios.post(
        `${BASE_URL}erice-service/user/userEmailPassword`,
        { email, password }
      );

      console.log(response.data);
      if (response.data.token) {
        await AsyncStorage.setItem("accessToken", response.data.token);
        await AsyncStorage.setItem("email", email);
        await AsyncStorage.setItem("password", password);
        
        dispatch(AccessToken(response.data));
        Alert.alert("Success", response.data.status);
        navigation.navigate("Home");
      } else {
        Alert.alert("Error", "Invalid credentials. Please try again.");
      }
    } catch (error) {
      Alert.alert("Login Failed", error.response?.data?.message || "Invalid credentials. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ImageBackground
      source={require("../../assets/OXYRICE.png")}
      style={styles.background}
    >
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <View style={styles.formContainer}>
          <Image
            source={require("../../assets/logo1.png")}
            style={styles.logo}
          />
          <Text style={styles.title}>LOGIN</Text>

          <TextInput
            style={[styles.input, errors.email && styles.inputError]}
            label="Enter Email"
            placeholderTextColor={"#c0c0c0"}
            keyboardType="email-address"
            dense={true}
            value={email}
            mode="outlined"
            activeOutlineColor="orange"
            onChangeText={(text)=>{setEmail(text),setErrors({ ...errors, email: false })}}
          />
          {errors.email && (
            <Text style={styles.errorText}>{errors.email}</Text>
          )}

          <View style={[styles.passwordContainer]}>
            <TextInput
              style={[errors.password && styles.inputError,styles.input, { flex: 1 }]}
              label="Enter Password"
              secureTextEntry={!showPassword}
              value={password}
              dense={true}
              mode="outlined"
              activeOutlineColor="orange"
              // onChangeText={setPassword}
              onChangeText={(text)=>{setPassword(text),setErrors({ ...errors, password: false })}}
              right={
                <TextInput.Icon
                  icon={showPassword ? "eye-off" : "eye"}
                  onPress={() => setShowPassword(!showPassword)}
                />
              }
            />
            {/* <TouchableOpacity
              // style={styles.eyeIcon}
              onPress={() => setShowPassword(!showPassword)}
            >
              <Icon
                name={showPassword ? 'eye-off' : 'eye'}
                size={24}
                color="#666"
                style={{ marginRight: 10 }}
              />
            </TouchableOpacity> */}
          </View>
          {errors.password && (
            <Text style={styles.errorText}>{errors.password}</Text>
          )}

          <TouchableOpacity
            style={[styles.button, loading && styles.disabledButton]}
            onPress={handleLogin}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Text style={styles.buttonText}>Login
              </Text>
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  background: {
    flex: 1,
    justifyContent: "center",
    resizeMode: "cover",
  },
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  formContainer: {
    width: "100%",
    maxWidth: 400,
    padding: 20,
    backgroundColor: "#fff",
    borderRadius: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
  },
  logo: {
    alignSelf: "center",
    width: 200,
    height: 80,
    marginBottom: 20,
    resizeMode: "contain",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 20,
    textAlign: "center",
  },
  input: {
    width: "100%",
    height: 50,
    // borderWidth: 1,
    // borderColor: "#CCC",
    borderRadius: 8,
    paddingHorizontal: 15,
    backgroundColor: "#FFF",
    marginBottom: 10,
  },
  inputError: {
    borderColor: "red",
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  eyeIcon: {
    marginLeft: -25,
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
});

export default LoginPage;
