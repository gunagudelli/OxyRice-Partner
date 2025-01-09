import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import axios from 'axios';

const AddDeliveryExecutive = ({ navigation }) => {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');
  const [altMobileNumber, setAltMobileNumber] = useState('');
  const [address, setAddress] = useState('');

  // Simple email validation function
  const validateEmail = (email) => {
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailPattern.test(email);
  };

  const handleAddDeliveryExecutive = async () => {
    // Input validation
    if (!fullName || !email || !mobileNumber || !address) {
      Alert.alert('Error', 'Please fill in all required fields.');
      return;
    }

    if (!validateEmail(email)) {
      Alert.alert('Error', 'Please enter a valid email address.');
      return;
    }

    // Prepare the data to send to the API
    const deliveryBoyData = {
      deliveryBoyName: fullName,
      deliveryBoyMobile: mobileNumber,
      deliveryBoyEmail: email,
      deliveryBoyAltContact: altMobileNumber,
      deliveryBoyAddress: address,
      isActive: true,
    };

    try {
      // Send a POST request to the API
      const response = await axios.post('https://meta.oxyloans.com/api/erice-service/deliveryboy/save', deliveryBoyData);

      // Check the response for success message
      if (response.status === 200 && response.data.message) {
        Alert.alert('Success', response.data.message || 'New Delivery Executive added successfully!');
        navigation.goBack(); // Navigate back to the DeliveryBoysScreen
      } else {
        Alert.alert('Error', response.data.message || 'Failed to add delivery executive. Please try again.');
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || 'An error occurred while adding the delivery executive.';
      console.error('Error adding delivery executive:', errorMessage);
      Alert.alert('Error', errorMessage);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Add New Delivery Executive</Text>
      <Text style={styles.label}>Please fill all required fields to add a new delivery executive</Text>

      <TextInput
        style={styles.input}
        placeholder="Full Name"
        value={fullName}
        onChangeText={setFullName}
        placeholderTextColor="#aaa"
      />
      <TextInput
        style={styles.input}
        placeholder="E-mail"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        placeholderTextColor="#aaa"
      />
      <TextInput
        style={styles.input}
        placeholder="Mobile Number"
        value={mobileNumber}
        onChangeText={setMobileNumber}
        keyboardType="phone-pad"
        placeholderTextColor="#aaa"
      />
      <TextInput
        style={styles.input}
        placeholder="Alternative Mobile"
        value={altMobileNumber}
        onChangeText={setAltMobileNumber}
        keyboardType="phone-pad"
        placeholderTextColor="#aaa"
      />
      <TextInput
        style={styles.input}
        placeholder="Address"
        value={address}
        onChangeText={setAddress}
        placeholderTextColor="#aaa"
      />

      <TouchableOpacity style={styles.button} onPress={handleAddDeliveryExecutive}>
        <Text style={styles.buttonText}>ADD</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
  },
  heading: {
    fontSize: 22,
    color: '#333',
    marginBottom: 10,
    fontWeight: 'bold',
  },
  label: {
    color: '#666',
    marginBottom: 20,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    color: '#333',
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  button: {
    backgroundColor: '#4CAF50',
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 8,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default AddDeliveryExecutive;
