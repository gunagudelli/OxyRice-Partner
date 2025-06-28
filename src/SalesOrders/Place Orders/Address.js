import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Alert } from 'react-native';
import { Dropdown } from 'react-native-element-dropdown';
import { SafeAreaView } from 'react-native-safe-area-context';

const addressOptions = [
  { label: 'Residence', value: 'residence' },
  { label: 'Home', value: 'home' },
  { label: 'PG', value: 'pg' },
  { label: 'Villa', value: 'villa' },
  { label: 'Gated Community', value: 'gated' },
];

export default function AddressForm() {
  const [selectedType, setSelectedType] = useState(null);
  const [fields, setFields] = useState({});
  const [errors, setErrors] = useState({});

  const handleChange = (key, value) => {
    setFields((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: value ? '' : prev[key] }));
  };

  const getDynamicFields = () => {
    switch (selectedType) {
      case 'residence':
        return [
          { key: 'residenceName', label: 'Residence Name' },
          { key: 'residenceNo', label: 'Residence No.' },
        ];
      case 'home':
        return [
          { key: 'homeName', label: 'Home Name' },
          { key: 'homeNo', label: 'Home No.' },
        ];
      case 'pg':
        return [
          { key: 'pgName', label: 'PG Name' },
          { key: 'pgNo', label: 'PG No.' },
        ];
      case 'villa':
        return [
          { key: 'villaName', label: 'Villa Name' },
          { key: 'villaNo', label: 'Villa No.' },
        ];
      case 'gated':
        return [
          { key: 'communityName', label: 'Community Name' },
          { key: 'flatNo', label: 'Flat No.' },
        ];
      default:
        return [];
    }
  };

  const permanentFields = [
    { key: 'Land Mark', label: 'Land Mark' },
    { key: 'Full Address', label: 'Full address' },
    // { key: 'city', label: 'City' },
    // { key: 'state', label: 'State' },
    { key: 'pincode', label: 'Pincode' },
  ];

  const handleSubmit = () => {
    let newErrors = {};
    let hasError = false;

    // Validate permanent fields
    permanentFields.forEach(({ key }) => {
      if (!fields[key]) {
        newErrors[key] = 'This field is required';
        hasError = true;
      }
    });

    // Validate dynamic fields based on selected type
    if (selectedType) {
      getDynamicFields().forEach(({ key }) => {
        if (!fields[key]) {
          newErrors[key] = 'This field is required';
          hasError = true;
        }
      });
    } else {
      Alert.alert('Error', 'Please select address type');
      return;
    }

    setErrors(newErrors);

    if (hasError) {
      Alert.alert('Error', 'Please fill all fields properly');
    } else {
      console.log('Submitted Data:', { addressType: selectedType, ...fields });
      Alert.alert('Success', 'Address Saved!');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        <Text style={styles.heading}>Select Address Type</Text>
        <Dropdown
          data={addressOptions}
          labelField="label"
          valueField="value"
          placeholder="Select Address Type"
          value={selectedType}
          onChange={(item) => {
            setSelectedType(item.value);
            setFields((prev) => ({ ...prev }));
            setErrors({});
          }}
          style={styles.dropdown}
        />

         {/* Dynamic Fields: show only if type is selected */}
        {selectedType &&
          getDynamicFields().map(({ key, label }) => (
            <View key={key} style={{ marginBottom: 16 }}>
              <Text style={styles.label}>{label}</Text>
              <TextInput
                placeholder={`Enter ${label}`}
                value={fields[key] || ''}
                onChangeText={(text) => handleChange(key, text)}
                style={[styles.input, errors[key] ? styles.inputError : null]}
                
              />
              {errors[key] && <Text style={styles.errorText}>{errors[key]}</Text>}
            </View>
          ))}

        {/* Permanent Address Fields */}
        {permanentFields.map(({ key, label }) => (
          <View key={key} style={{ marginBottom: 16 }}>
            <Text style={styles.label}>{label}</Text>
            <TextInput
              placeholder={`Enter ${label}`}
              value={fields[key] || ''}
              onChangeText={(text) => handleChange(key, text)}
              style={[styles.input, errors[key] ? styles.inputError : null]}
            />
            {errors[key] && <Text style={styles.errorText}>{errors[key]}</Text>}
          </View>
        ))}

       

        <TouchableOpacity onPress={handleSubmit} style={styles.saveBtn}>
          <Text style={styles.saveBtnText}>Save Address</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {  padding: 20, backgroundColor: '#fff',marginTop:-20 },
  heading: { fontSize: 18, fontWeight: 'bold' },
  dropdown: {
    borderWidth: 1,
    borderColor: '#aaa',
    borderRadius: 8,
    paddingHorizontal: 10,
    height: 50,
    marginBottom: 20,
  },
  label: { fontSize: 14, marginBottom: 4 },
  input: {
    height: 45,
    borderWidth: 1,
    borderColor: '#aaa',
    borderRadius: 8,
    paddingHorizontal: 10,
    backgroundColor: '#f9f9f9',
  },
  inputError: { borderColor: 'red' },
  errorText: { color: 'red', fontSize: 12, marginTop: 4 },
  saveBtn: {
    backgroundColor: '#007AFF',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  saveBtnText: { color: '#fff', fontSize: 16 },
});
