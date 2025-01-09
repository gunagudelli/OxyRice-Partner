import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, StyleSheet, ActivityIndicator, Image } from 'react-native';
import axios from 'axios';
import { useNavigation } from '@react-navigation/native';

const Register = () => {
  const [mobileNumber, setMobileNumber] = useState('');
  const [otp, setOtp] = useState('');
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [mobileOtpSession, setMobileOtpSession] = useState('');
  const [loading, setLoading] = useState(false);
  const [otpSending, setOtpSending] = useState(false);
  const navigation = useNavigation();

  
  const handleSendOtp = async () => {
    setOtpSending(true);
    setLoading(true);

    if (!/^\d{10}$/.test(mobileNumber)) {
      setOtpSending(false);
      setLoading(false);
      Alert.alert('Error', 'Please enter a valid 10-digit mobile number.');
      return;
    }

    try {
      const response = await axios.post('https://meta.oxyloans.com/api/erice-service/user/login-or-register', {
        mobileNumber,
        userType: "Register",
      });
      if (response.data.mobileOtpSession == null) {
        Alert.alert("You are already registered, Please login")
        navigation.navigate("Login")
      }
        else if(response.data.mobileOtpSession){
        setMobileOtpSession(response.data.mobileOtpSession);
        setIsOtpSent(true);
        Alert.alert('Success', 'OTP sent successfully!');
        }
        else{
          // Alert.alert('Success', 'OTP sent successfully!');
         } 
    } catch (error) {
      Alert.alert(
        'Failed',
        'You are already registered, Please login',
        [
          {
            text: 'Ok',
            onPress: () => navigation.navigate("Login"),
            style: 'cancel',
          },
        ]
      );
    } finally {
      setOtpSending(false);
      setLoading(false);
    }
  };

  // Step 2 & 3: Handle verifying OTP and completing registration
  const handleRegisterOtp = async () => {
    setLoading(true);
    try {
      const response = await axios.post('https://meta.oxyloans.com/api/erice-service/user/login-or-register', {
        mobileNumber,
        mobileOtpSession,
        mobileOtpValue: otp,
        primaryType: "SELLER",
        userType: "Register",
      });

      if (response.status === 200) {
        Alert.alert('Success', 'Mobile verified! Please log in.');
        navigation.navigate('Login');
      } else {
        Alert.alert('Error', 'OTP verification failed. Please try again.');
      }
    } catch (error) {
      // Alert.alert('Error', 'Failed to verify OTP.');
      if (error.response && error.response.status === 400) {
        navigation.navigate("Login");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
     
      <Image source={require('../../assets/splash.png')} style={styles.logo} />

     
      <Text style={styles.title}>Register on OxyRice</Text>

    
      <TextInput
        style={styles.input}
        placeholder="Enter mobile number"
        keyboardType="phone-pad"
        value={mobileNumber}
        onChangeText={setMobileNumber}
        editable={!isOtpSent}
        // editable = {true}
      />

      {!isOtpSent && (
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={styles.button}
            onPress={()=>handleSendOtp()}
            disabled={otpSending}
            activeOpacity={0.7}
          >
            <Text style={styles.buttonText}>SEND OTP</Text>
          </TouchableOpacity>
          {otpSending && <ActivityIndicator size="small" color="#fff" style={styles.loader} />}
        </View>
      )}

      {/* Step 2: OTP input and registration button */}
      {isOtpSent && (
        <>
          <TextInput
            style={styles.input}
            placeholder="Enter OTP"
            keyboardType="numeric"
            value={otp}
            onChangeText={setOtp}
          />
          <TouchableOpacity
            style={styles.button}
            onPress={handleRegisterOtp}
            activeOpacity={0.7}
          >
            <Text style={styles.buttonText}>REGISTER</Text>
          </TouchableOpacity>
        </>
      )}

      {/* Prompt to log in if the user already has an account */}
      {!isOtpSent && (
        <TouchableOpacity onPress={() => navigation.navigate('Login')}>
          <Text style={styles.linkText}>Already registered? Login here</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#F8F8F8',
  },
  logo: {
    width: 200,
    height: 80,
    marginBottom: 20,
    resizeMode: 'contain',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    width: '100%',
    padding: 15,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 10,
    marginBottom: 15,
    backgroundColor: '#FFF',
  },
  button: {
    backgroundColor: '#4CAF50',
    padding: 15,
    borderRadius: 10,
    width: '100%',
    alignItems: 'center',
    marginBottom: 10,
  },
  buttonText: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: 16,
  },
  linkText: {
    color: '#4CAF50',
    marginVertical: 10,
    textDecorationLine: 'underline',
    fontSize: 16,
    fontWeight: 'bold',
  
  },
  buttonContainer: {
    width: '100%',
    alignItems: 'center',
  },
  loader: {
    marginTop: 10,
  },
});

export default Register;