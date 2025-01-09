import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert } from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const AddNewItem = ({ navigation }) => {
  const [itemName, setItemName] = useState('');
  const [categoryId, setCategoryId] = useState(0); // Default category ID
  const [itemLogo, setItemLogo] = useState(''); // Placeholder for item logo URL
  const [itemQty, setItemQty] = useState(''); // Placeholder for item quantity
  const [itemDescription, setItemDescription] = useState(''); // Placeholder for item description

  const handleAddItem = async () => {
    if (itemName.trim() && itemLogo.trim() && itemQty) {
      try {
        const accessToken = await AsyncStorage.getItem('accessToken');
        
        if (!accessToken) {
          Alert.alert('Error', 'No access token found. Please log in again.');
          return;
        }

        const newItem = {
          itemName,
          categoryId,
          itemLogo,
          itemDescription,
          itemQty: parseFloat(itemQty), // Parse to float to match API requirements
        };

        console.log('Sending data to API:', newItem); // Log data being sent

        const response = await axios.post(
          'https://meta.oxyloans.com/api/erice-service/items/item',
          newItem,
          {
            headers: {
              'Authorization': `Bearer ${accessToken}` // Use the retrieved access token
            }
          }
        );

        Alert.alert('Success', `Item "${response.data.itemName}" added successfully!`);

        // Reset fields after successful submission
        setItemName('');
        setCategoryId(0);
        setItemLogo('');
        setItemQty('');
        setItemDescription('');

        // Optionally navigate back
        // navigation.goBack();

      } catch (error) {
        console.error("Error adding item:", error.response ? error.response.data : error.message);
        Alert.alert('Error', 'Failed to add item. Please try again.');
      }
    } else {
      Alert.alert('Error', 'Please fill in all required fields.');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.headerText}>Add New Item</Text>
      
      <TextInput
        style={styles.input}
        placeholder="Enter item name"
        value={itemName}
        onChangeText={setItemName}
      />

      <TextInput
        style={styles.input}
        placeholder="Enter item logo URL"
        value={itemLogo}
        onChangeText={setItemLogo}
      />

      <TextInput
        style={styles.input}
        placeholder="Enter item description"
        value={itemDescription}
        onChangeText={setItemDescription}
      />

      <TextInput
        style={styles.input}
        placeholder="Enter item quantity"
        value={itemQty}
        keyboardType="numeric"
        onChangeText={setItemQty}
      />

      <TouchableOpacity style={styles.addButton} onPress={handleAddItem}>
        <Text style={styles.addButtonText}>Add Item</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 16,
    backgroundColor: '#f4f4f8', // Light background for better contrast
  },
  headerText: {
    fontSize: 26,
    fontWeight: 'bold',
    marginBottom: 24,
    textAlign: 'center',
    color: '#333', // Darker text color
  },
  input: {
    height: 45,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 8, // Rounded corners for input fields
    marginBottom: 16,
    paddingHorizontal: 12,
    fontSize: 16,
    backgroundColor: '#fff', // White background for input fields
  },
  addButton: {
    backgroundColor: '#28a745', // Green color for the button
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
  },
  addButtonText: {
    color: '#fff', // White text color for better contrast
    fontSize: 18,
    fontWeight: '600',
  },
});

export default AddNewItem;
