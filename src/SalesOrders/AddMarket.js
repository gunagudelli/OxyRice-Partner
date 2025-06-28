import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, Alert ,ActivityIndicator} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useState } from 'react';
import axios from 'axios';
import BASE_URL from '../../config';

export default function AddMarket() {
  const navigation = useNavigation();
  const [formData, setFormData] = useState({
    fullAddress: '',
    leadName: '',
    marketName: '',
  });
  const [errors, setErrors] = useState({
    fullAddress: '',
    leadName: '',
    marketName: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const GOOGLE_MAPS_API_KEY = 'AIzaSyAM29otTWBIAefQe6mb7f617BbnXTHtN0M';

  const getCoordinatesFromAddress = async (address) => {
    try {
      const encodedAddress = encodeURIComponent(address);
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?address=${encodedAddress}&key=${GOOGLE_MAPS_API_KEY}`
      );
      const data = await response.json();
      
      if (data.status === 'OK' && data.results.length > 0) {
        const { geometry: { location }, formatted_address } = data.results[0];
        return {
          latitude: location.lat,
          longitude: location.lng,
          formattedAddress: formatted_address
        };
      }
      throw new Error('Geocoding failed');
    } catch (error) {
      throw new Error('Failed to get coordinates');
    }
  };

  const handleInputChange = (field, value) => {
    setFormData({ ...formData, [field]: value });
    if (value.trim()) {
      setErrors({ ...errors, [field]: '' });
    }
  };

  const validateForm = () => {
    const newErrors = {};
    let isValid = true;
    
    Object.keys(formData).forEach((field) => {
      if (!formData[field].trim()) {
        newErrors[field] = 'This field is required';
        isValid = false;
      }
    });

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      const locationData = await getCoordinatesFromAddress(formData.fullAddress);
      const submissionData = {
        ...formData,
        coordinates: {
          latitude: locationData.latitude,
          longitude: locationData.longitude
        },
        formattedAddress: locationData.formattedAddress,
        timestamp: new Date().toISOString()
      };

      Alert.alert(
        'Success',
        `Visit scheduled!\nAddress: ${submissionData.formattedAddress}\nCoordinates: ${submissionData.coordinates.latitude}, ${submissionData.coordinates.longitude}`,
        [{ text: 'OK', onPress: () => addDailyMarket(submissionData) }]
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to schedule visit');
    } finally {
      setIsLoading(false);
    }
  };

  const addDailyMarket = (data) => {
    const requestBody = {
      address: data.fullAddress,
      latitude: data.coordinates.latitude,
      leadName: data.leadName,
      longitude: data.coordinates.longitude,
      marketName: data.marketName
    };

    axios.post(`${BASE_URL}product-service/addDailyMarket`, requestBody)
      .then(() => {
        Alert.alert('Success', 'Market details added', [
          { text: 'OK', onPress: () => {
            setFormData({ fullAddress: '', leadName: '', marketName: '' });
            navigation.navigate('Market Visits');
          }}
        ]);
      })
      .catch((error) => {
        console.error('Error adding market:', error);
        Alert.alert('Error', 'Failed to add market details');
      });
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.formContainer}>
        {[
          { label: 'Full Address *', field: 'fullAddress', multiline: true, lines: 3 },
          { label: 'Who is visiting market Today *', field: 'leadName' },
          { label: 'Market Name *', field: 'marketName' }
        ].map(({ label, field, multiline, lines }) => (
          <View key={field} style={styles.formSection}>
            <Text style={styles.sectionTitle}>{label}</Text>
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                placeholder={`Enter ${label.toLowerCase().replace(' *', '')}`}
                value={formData[field]}
                onChangeText={(value) => handleInputChange(field, value)}
                multiline={multiline}
                numberOfLines={lines}
                textAlignVertical={multiline ? 'top' : 'center'}
              />
            </View>
            {errors[field] ? <Text style={styles.errorText}>{errors[field]}</Text> : null}
          </View>
        ))}

        <TouchableOpacity
          style={[styles.submitButton, isLoading && styles.submitButtonDisabled]}
          onPress={handleSubmit}
          disabled={isLoading}
        >
          <Text style={styles.submitButtonText}>
            {isLoading ? 'Processing...' : 'Submit'}
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5'
  },
  formContainer: {
    padding: 15
  },
  formSection: {
    marginBottom: 15
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8
  },
  inputContainer: {
    backgroundColor: '#fff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0'
  },
  input: {
    fontSize: 16,
    padding: 12,
    minHeight: 50
  },
  errorText: {
    color: 'red',
    fontSize: 12,
    marginTop: 4
  },
  submitButton: {
    padding: 15,
    borderRadius: 8,
    backgroundColor: '#2A6B57',
    alignItems: 'center',
    marginBottom: 20
  },
  submitButtonDisabled: {
    backgroundColor: '#a0a0a0'
  },
  submitButtonText: {
    fontSize: 16,
    color: '#fff',
    fontWeight: '500'
  }
});