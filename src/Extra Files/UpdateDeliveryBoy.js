import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, Alert, TouchableOpacity } from 'react-native';
import axios from 'axios';

const UpdateDeliveryBoy = ({ route, navigation }) => {
  const { deliveryBoy } = route.params;

  const [deliveryBoyName, setDeliveryBoyName] = useState(deliveryBoy.deliveryBoyName);
  const [deliveryBoyMobile, setDeliveryBoyMobile] = useState(deliveryBoy.deliveryBoyMobile);
  const [deliveryBoyEmail, setDeliveryBoyEmail] = useState(deliveryBoy.deliveryBoyEmail);
  const [deliveryBoyAddress, setDeliveryBoyAddress] = useState(deliveryBoy.deliveryBoyAddress);
  const [isActive, setIsActive] = useState(deliveryBoy.isActive === "true");

  const handleUpdateDeliveryBoy = async () => {
    const updatedData = {
      id: deliveryBoy.id,
      deliveryBoyName,
      deliveryBoyMobile,
      deliveryBoyEmail,
      deliveryBoyAddress,
      deliveryBoyAltContact: deliveryBoy.deliveryBoyAltContact || '',
      isActive: isActive ? "true" : "false",
      deliveryBoyPhoto: '',
      deliveryBoyPhotoId: '',
    };

    try {
      const response = await axios.patch('https://meta.oxyloans.com/api/erice-service/deliveryboy/update', updatedData);
      if (response.status === 200 && response.data) {
        Alert.alert('Success', response.data.message || 'Delivery boy updated successfully!');
        navigation.goBack();
      } else {
        Alert.alert('Update Failed', response.data.message || 'No message received from the server. Please try again.');
      }
    } catch (error) {
      console.error('Update error:', error.response || error); // Log the error for debugging
      Alert.alert('Error', error.response?.data?.message || 'Failed to update delivery boy. Please try again.');
    }
  };

  const handleUpdateStatus = async () => {
    const newStatus = !isActive;
    const statusData = {
      id: deliveryBoy.id,
      isActive: newStatus ? "true" : "false",
    };

    try {
      const response = await axios.patch('https://meta.oxyloans.com/api/erice-service/deliveryboy/status', statusData);
      if (response.status === 200 && response.data) {
        setIsActive(newStatus);
        Alert.alert('Success', 'Delivery Boy status updated to ' + (newStatus ? "Active" : "Inactive"));
      } else {
        Alert.alert('Update Failed', response.data.message || 'No message received from the server. Please try again.');
      }
    } catch (error) {
      console.error('Status update error:', error.response || error); // Log the error for debugging
      Alert.alert('Error', error.response?.data?.message || 'Failed to update delivery boy status. Please try again.');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.headerText}>Update Delivery Boy</Text>

      <TextInput
        style={styles.input}
        placeholder="Delivery Boy Name"
        value={deliveryBoyName}
        onChangeText={setDeliveryBoyName}
        placeholderTextColor="#aaa"
      />

      <TextInput
        style={styles.input}
        placeholder="Mobile"
        value={deliveryBoyMobile}
        onChangeText={setDeliveryBoyMobile}
        keyboardType="numeric"
        placeholderTextColor="#aaa"
      />

      <TextInput
        style={styles.input}
        placeholder="Email"
        value={deliveryBoyEmail}
        onChangeText={setDeliveryBoyEmail}
        placeholderTextColor="#aaa"
      />

      <TextInput
        style={styles.input}
        placeholder="Address"
        value={deliveryBoyAddress}
        onChangeText={setDeliveryBoyAddress}
        placeholderTextColor="#aaa"
      />

      <Text style={[styles.statusText, { color: isActive ? '#4CAF50' : '#F44336' }]} >
        Status: {isActive ? "Active" : "Inactive"}
      </Text>

      <TouchableOpacity style={styles.greenButton} onPress={handleUpdateDeliveryBoy}>
        <Text style={styles.buttonText}>Update Delivery Boy</Text>
      </TouchableOpacity>

      <TouchableOpacity style={[styles.button, styles.statusButton]} onPress={handleUpdateStatus}>
        <Text style={styles.buttonText}>
          {isActive ? "Deactivate Delivery Boy" : "Activate Delivery Boy"}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
    backgroundColor: '#E9F1F5',
  },
  headerText: {
    fontSize: 30,
    fontWeight: 'bold',
    marginBottom: 30,
    textAlign: 'center',
    color: '#333',
  },
  input: {
    height: 50,
    borderColor: '#B0BEC5',
    borderWidth: 1,
    borderRadius: 10,
    marginBottom: 20,
    paddingHorizontal: 15,
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  statusText: {
    fontSize: 22,
    fontWeight: '600',
    marginBottom: 25,
    textAlign: 'center',
  },
  button: {
    backgroundColor: '#1976D2', // Blue color
    borderRadius: 10,
    paddingVertical: 15,
    marginBottom: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 5,
  },
  statusButton: {
    backgroundColor: '#FF9800', // Orange color for status toggle
  },
  greenButton: {
    backgroundColor: '#4CAF50', // Green color
    borderRadius: 10,
    paddingVertical: 15,
    marginBottom: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 5,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default UpdateDeliveryBoy;
