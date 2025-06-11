import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, Switch } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useState } from 'react';
import { FontAwesome5, MaterialCommunityIcons } from '@expo/vector-icons';
import { Picker } from '@react-native-picker/picker';

export default function RecordInventoryScreen() {
  const navigation = useNavigation();
  const [movementType, setMovementType] = useState('OUT');
  const [selectedStore, setSelectedStore] = useState('Main Warehouse');
  const [selectedRiceType, setSelectedRiceType] = useState('Premium Basmati');
  const [quantity, setQuantity] = useState('');
  const [notes, setNotes] = useState('');
  const [destination, setDestination] = useState('');
  
  // Sample data
  const stores = [
    'Main Warehouse',
    'Eastern Depot',
    'Western Depot',
    'Northern Depot'
  ];
  
  const riceTypes = [
    'Premium Basmati',
    'Special Jasmine',
    'Brown Rice',
    'Wild Rice',
    'White Rice',
    'Arborio Rice',
    'Sushi Rice',
    'Black Rice',
  ];
  
  const markets = [
    'Central Market',
    'Eastern Market',
    'Western Market',
    'Northern Market',
    'Southern Market',
  ];

  const handleSubmit = () => {
    // Here we would save the movement data
    // Then navigate back to inventory screen
    navigation.goBack();
  };

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Record Inventory Movement</Text>
        <Text style={styles.headerSubtitle}>Track rice bag distribution</Text>
      </View>

      <View style={styles.formContainer}>
        {/* Movement Type Selection */}
        <View style={styles.formSection}>
          <Text style={styles.sectionTitle}>Movement Type</Text>
          <View style={styles.toggleContainer}>
            <TouchableOpacity 
              style={[
                styles.toggleButton, 
                movementType === 'IN' && styles.toggleButtonActive
              ]}
              onPress={() => setMovementType('IN')}
            >
              <MaterialCommunityIcons 
                name="arrow-down-bold" 
                size={20} 
                color={movementType === 'IN' ? '#fff' : '#555'} 
              />
              <Text style={[
                styles.toggleText,
                movementType === 'IN' && styles.toggleTextActive
              ]}>IN (Received)</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[
                styles.toggleButton, 
                movementType === 'OUT' && styles.toggleButtonActive
              ]}
              onPress={() => setMovementType('OUT')}
            >
              <MaterialCommunityIcons 
                name="arrow-up-bold" 
                size={20} 
                color={movementType === 'OUT' ? '#fff' : '#555'} 
              />
              <Text style={[
                styles.toggleText,
                movementType === 'OUT' && styles.toggleTextActive
              ]}>OUT (Released)</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Store Selection */}
        <View style={styles.formSection}>
          <Text style={styles.sectionTitle}>Select Store</Text>
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={selectedStore}
              onValueChange={(itemValue) => setSelectedStore(itemValue)}
              style={styles.picker}
            >
              {stores.map((store, index) => (
                <Picker.Item key={index} label={store} value={store} />
              ))}
            </Picker>
          </View>
        </View>

        {/* Rice Type Selection */}
        <View style={styles.formSection}>
          <Text style={styles.sectionTitle}>Rice Type</Text>
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={selectedRiceType}
              onValueChange={(itemValue) => setSelectedRiceType(itemValue)}
              style={styles.picker}
            >
              {riceTypes.map((type, index) => (
                <Picker.Item key={index} label={type} value={type} />
              ))}
            </Picker>
          </View>
        </View>

        {/* Quantity Field */}
        <View style={styles.formSection}>
          <Text style={styles.sectionTitle}>Quantity (Bags)</Text>
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder="Enter number of bags"
              value={quantity}
              onChangeText={setQuantity}
              keyboardType="numeric"
            />
          </View>
        </View>

        {/* Destination/Source Field (depends on movement type) */}
        {movementType === 'OUT' ? (
          <View style={styles.formSection}>
            <Text style={styles.sectionTitle}>Destination Market</Text>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={destination}
                onValueChange={(itemValue) => setDestination(itemValue)}
                style={styles.picker}
              >
                <Picker.Item label="Select destination market" value="" />
                {markets.map((market, index) => (
                  <Picker.Item key={index} label={market} value={market} />
                ))}
              </Picker>
            </View>
          </View>
        ) : (
          <View style={styles.formSection}>
            <Text style={styles.sectionTitle}>Source</Text>
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                placeholder="Enter source of inventory"
                value={destination}
                onChangeText={setDestination}
              />
            </View>
          </View>
        )}

        {/* Notes Field */}
        <View style={styles.formSection}>
          <Text style={styles.sectionTitle}>Notes (Optional)</Text>
          <View style={styles.inputContainer}>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Add any additional information"
              value={notes}
              onChangeText={setNotes}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity 
            style={styles.cancelButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.submitButton}
            onPress={handleSubmit}
          >
            <Text style={styles.submitButtonText}>Record Movement</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#2A6B57',
    padding: 20,
    paddingBottom: 25,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#fff',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#E0E0E0',
    marginTop: 5,
  },
  formContainer: {
    padding: 15,
  },
  formSection: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  toggleContainer: {
    flexDirection: 'row',
    backgroundColor: '#E0E0E0',
    borderRadius: 8,
    overflow: 'hidden',
  },
  toggleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 15,
    flex: 1,
  },
  toggleButtonActive: {
    backgroundColor: '#2A6B57',
  },
  toggleText: {
    marginLeft: 8,
    fontSize: 15,
    fontWeight: '500',
    color: '#555',
  },
  toggleTextActive: {
    color: '#fff',
  },
  pickerContainer: {
    backgroundColor: '#fff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    overflow: 'hidden',
  },
  picker: {
    height: 50,
  },
  inputContainer: {
    backgroundColor: '#fff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  input: {
    fontSize: 16,
    padding: 12,
    height: 50,
  },
  textArea: {
    height: 100,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
    marginBottom: 30,
  },
  cancelButton: {
    flex: 1,
    padding: 15,
    borderRadius: 8,
    backgroundColor: '#f5f5f5',
    alignItems: 'center',
    marginRight: 10,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  cancelButtonText: {
    fontSize: 16,
    color: '#555',
    fontWeight: '500',
  },
  submitButton: {
    flex: 2,
    padding: 15,
    borderRadius: 8,
    backgroundColor: '#2A6B57',
    alignItems: 'center',
  },
  submitButtonText: {
    fontSize: 16,
    color: '#fff',
    fontWeight: '500',
  },
});