import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useState } from 'react';
import { FontAwesome5, MaterialIcons } from '@expo/vector-icons';
import { Picker } from '@react-native-picker/picker';

export default function CreateOrderScreen() {
  const navigation = useNavigation();
  const [market, setMarket] = useState('');
  const [deliveryDate, setDeliveryDate] = useState('');
  const [selectedRiceTypes, setSelectedRiceTypes] = useState([
    { type: 'Premium Basmati', quantity: '', price: '30' }
  ]);
  const [notes, setNotes] = useState('');
  
  // Sample data
  const markets = [
    'Central Market',
    'Eastern Market',
    'Western Market',
    'Northern Market',
    'Southern Market',
  ];
  
  const riceTypes = [
    { name: 'Premium Basmati', price: 30 },
    { name: 'Special Jasmine', price: 32 },
    { name: 'Brown Rice', price: 28 },
    { name: 'Wild Rice', price: 35 },
    { name: 'White Rice', price: 25 },
    { name: 'Arborio Rice', price: 33 },
    { name: 'Sushi Rice', price: 31 },
    { name: 'Black Rice', price: 37 },
  ];

  const addRiceType = () => {
    setSelectedRiceTypes([
      ...selectedRiceTypes, 
      { type: riceTypes[0].name, quantity: '', price: riceTypes[0].price.toString() }
    ]);
  };

  const removeRiceType = (index) => {
    const updatedTypes = [...selectedRiceTypes];
    updatedTypes.splice(index, 1);
    setSelectedRiceTypes(updatedTypes);
  };

  const updateRiceTypeSelection = (index, value) => {
    const updatedTypes = [...selectedRiceTypes];
    updatedTypes[index].type = value;
    
    // Update price based on selection
    const selectedRice = riceTypes.find(rice => rice.name === value);
    if (selectedRice) {
      updatedTypes[index].price = selectedRice.price.toString();
    }
    
    setSelectedRiceTypes(updatedTypes);
  };

  const updateRiceQuantity = (index, value) => {
    const updatedTypes = [...selectedRiceTypes];
    updatedTypes[index].quantity = value;
    setSelectedRiceTypes(updatedTypes);
  };

  // Calculate total
  const calculateTotal = () => {
    return selectedRiceTypes?.reduce?.((total, item) => {
      const quantity = parseInt(item.quantity) || 0;
      const price = parseFloat(item.price) || 0;
      return total + (quantity * price);
    }, 0).toFixed(2);
  };

  // Calculate total bags
  const calculateTotalBags = () => {
    return selectedRiceTypes?.reduce?.((total, item) => {
      return total + (parseInt(item.quantity) || 0);
    }, 0);
  };

  const handleSubmit = () => {
    // Here we would save the order data
    // Then navigate back to orders screen
    navigation.goBack();
  };

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Create New Order</Text>
        <Text style={styles.headerSubtitle}>Place an order for a market</Text>
      </View>

      <View style={styles.formContainer}>
        {/* Market Selection */}
        <View style={styles.formSection}>
          <Text style={styles.sectionTitle}>Market</Text>
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={market}
              onValueChange={setMarket}
              style={styles.picker}
            >
              <Picker.Item label="Select a market" value="" />
              {markets.map((item, index) => (
                <Picker.Item key={index} label={item} value={item} />
              ))}
            </Picker>
          </View>
        </View>

        {/* Delivery Date */}
        <View style={styles.formSection}>
          <Text style={styles.sectionTitle}>Delivery Date</Text>
          <TouchableOpacity style={styles.inputContainer}>
            <View style={styles.datePickerField}>
              <TextInput
                style={styles.input}
                placeholder="Select delivery date"
                value={deliveryDate}
                onChangeText={setDeliveryDate}
              />
              <FontAwesome5 name="calendar-alt" size={20} color="#777" />
            </View>
          </TouchableOpacity>
        </View>

        {/* Rice Type Selection */}
        <View style={styles.formSection}>
          <Text style={styles.sectionTitle}>Rice Types</Text>
          
          {selectedRiceTypes.map((item, index) => (
            <View key={index} style={styles.riceTypeContainer}>
              <View style={styles.riceTypeHeader}>
                <Text style={styles.riceItemTitle}>Item {index + 1}</Text>
                {index > 0 && (
                  <TouchableOpacity 
                    onPress={() => removeRiceType(index)}
                    style={styles.removeButton}
                  >
                    <FontAwesome5 name="trash" size={16} color="#e74c3c" />
                  </TouchableOpacity>
                )}
              </View>
              
              <View style={styles.riceTypeRow}>
                <View style={[styles.pickerContainer, styles.riceTypePicker]}>
                  <Picker
                    selectedValue={item.type}
                    onValueChange={(value) => updateRiceTypeSelection(index, value)}
                    style={styles.picker}
                  >
                    {riceTypes.map((rice, idx) => (
                      <Picker.Item key={idx} label={rice.name} value={rice.name} />
                    ))}
                  </Picker>
                </View>
                
                <View style={[styles.inputContainer, styles.quantityInput]}>
                  <TextInput
                    style={styles.input}
                    placeholder="Bags"
                    value={item.quantity}
                    onChangeText={(value) => updateRiceQuantity(index, value)}
                    keyboardType="numeric"
                  />
                </View>
              </View>
              
              <View style={styles.priceContainer}>
                <Text style={styles.priceLabel}>Price per bag:</Text>
                <Text style={styles.priceValue}>${item.price}</Text>
                {item.quantity ? (
                  <Text style={styles.totalValue}>
                    Total: ${(parseFloat(item.price) * parseInt(item.quantity)).toFixed(2)}
                  </Text>
                ) : null}
              </View>
            </View>
          ))}
          
          <TouchableOpacity 
            style={styles.addRiceButton}
            onPress={addRiceType}
          >
            <FontAwesome5 name="plus" size={14} color="#2A6B57" />
            <Text style={styles.addRiceButtonText}>Add Another Rice Type</Text>
          </TouchableOpacity>
        </View>

        {/* Order Total */}
        <View style={styles.totalSection}>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Total Bags:</Text>
            <Text style={styles.totalBags}>{calculateTotalBags()}</Text>
          </View>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Order Total:</Text>
            <Text style={styles.orderTotal}>${calculateTotal()}</Text>
          </View>
        </View>

        {/* Notes Field */}
        <View style={styles.formSection}>
          <Text style={styles.sectionTitle}>Notes (Optional)</Text>
          <View style={styles.inputContainer}>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Add any additional information or special instructions"
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
            <Text style={styles.submitButtonText}>Create Order</Text>
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
  datePickerField: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
  },
  input: {
    fontSize: 16,
    padding: 12,
    flex: 1,
  },
  textArea: {
    height: 100,
  },
  riceTypeContainer: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 15,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  riceTypeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  riceItemTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#333',
  },
  removeButton: {
    padding: 5,
  },
  riceTypeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  riceTypePicker: {
    flex: 2,
    marginRight: 10,
  },
  quantityInput: {
    flex: 1,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  priceLabel: {
    fontSize: 14,
    color: '#555',
  },
  priceValue: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
    marginLeft: 5,
  },
  totalValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#2A6B57',
    marginLeft: 'auto',
  },
  addRiceButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    backgroundColor: 'rgba(42, 107, 87, 0.1)',
    borderRadius: 8,
    marginTop: 5,
  },
  addRiceButtonText: {
    fontSize: 14,
    color: '#2A6B57',
    fontWeight: '500',
    marginLeft: 8,
  },
  totalSection: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 15,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  totalLabel: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  totalBags: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  orderTotal: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2A6B57',
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