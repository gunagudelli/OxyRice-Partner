import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useSelector } from 'react-redux';
import axios from 'axios';
import Icon from 'react-native-vector-icons/MaterialIcons';
import BASE_URL from '../../config';

const { width, height } = Dimensions.get('window');

const AddstoreScreen = ({ navigation }) => {
  const [formData, setFormData] = useState({
    referBy: '',
    storeName: '',
    ownerName: '',
    mobileNumber: '',
    address: '',
    description: '',
    isavailable: true,
  });
  
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  // Get access token from Redux store
  const accessToken = useSelector((state) => state.auth?.accessToken);

  // Debug logging function
  const debugLog = (message, data = null) => {
    console.log(`🐛 [AddStore Debug] ${message}`);
    if (data) {
      console.log('📊 Data:', JSON.stringify(data, null, 2));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.storeName.trim()) {
      newErrors.storeName = 'Store name is required';
    }
    
    if (!formData.ownerName.trim()) {
      newErrors.ownerName = 'Owner name is required';
    }
    
    if (!formData.mobileNumber.trim()) {
      newErrors.mobileNumber = 'Mobile number is required';
    } else if (!/^\d{10}$/.test(formData.mobileNumber.replace(/\s/g, ''))) {
      newErrors.mobileNumber = 'Please enter a valid 10-digit mobile number';
    }
    
    if (!formData.address.trim()) {
      newErrors.address = 'Address is required';
    }
    
    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    }

    setErrors(newErrors);
    debugLog('Form validation', { hasErrors: Object.keys(newErrors).length > 0, errors: newErrors });
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: null
      }));
    }
  };

 const handleSubmit = async () => {
  debugLog('Submit button pressed');

  if (!validateForm()) {
    Alert.alert('Validation Error', 'Please fill in all required fields correctly.');
    return;
  }

  setLoading(true);

  try {
    const storeApiUrl = `${BASE_URL}product-service/addStore`;

    debugLog('Store API Configuration', {
      baseUrl: BASE_URL,
      fullUrl: storeApiUrl,
      hasAccessToken: !!accessToken?.token,
      tokenPreview: accessToken?.token ? `${accessToken.token.substring(0, 20)}...` : 'No token',
      formData: formData,
    });

    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...(accessToken?.token && { 'Authorization': `Bearer ${accessToken.token}` }),
      },
      timeout: 30000,
    };

    debugLog('Making first API request (Add Store) to:', storeApiUrl);
    const storeResponse = await axios.post(storeApiUrl, formData, config);

    debugLog('Store API Response Success', {
      status: storeResponse.status,
      data: storeResponse.data,
    });

    if (storeResponse.status === 200 || storeResponse.status === 201) {
      const registrationApiUrl = `${BASE_URL}user-service/onlineRegistration`;
      const registrationData = {
        mobileNumber: formData.mobileNumber,
        countryCode: '+91',
        registerFrom: 'KIRANA',
      };

      debugLog('Making second API request (Online Registration) to:', registrationApiUrl);
      const registrationResponse = await axios.post(registrationApiUrl, registrationData, config);

      debugLog('Registration API Response Success', {
        status: registrationResponse.status,
        data: registrationResponse.data,
      });

      Alert.alert(
        'Success',
        'Store added and user registered successfully!',
        [
          {
            text: 'OK',
            onPress: () => {
              setFormData({
                referBy: '',
                storeName: '',
                ownerName: '',
                mobileNumber: '',
                address: '',
                description: '',
                isavailable: true,
              });
              navigation.goBack();
            },
          },
        ]
      );
    }
  } catch (error) {
    console.error('❌ API Error:', error);

    let errorMessage = 'Something went wrong. Please try again.';

    if (error.response?.data?.message) {
      errorMessage = error.response.data.message;
    } else if (error.message?.includes('Network Error')) {
      errorMessage = 'Network error. Please check your connection.';
    } else if (error.code === 'ECONNABORTED') {
      errorMessage = 'Request timeout. Please try again.';
    }

    Alert.alert('Error', errorMessage);
  } finally {
    setLoading(false);
    debugLog('Request completed, loading set to false');
  }
};


  return (
    // <SafeAreaView style={styles.container}>
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#F5F5F5" />
      
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
       <View style={styles.sectionHeader}>
  <Text style={styles.sectionHeaderText}>Please provide Store Information</Text>
</View>
        <View style={styles.formContainer}>
          
          {/* Store Name and Owner Name Row */}
          <View style={styles.row}>
            <View style={styles.halfWidth}>
              <Text style={styles.label}>
                Store Name <Text style={styles.required}>*</Text>
              </Text>
              <TextInput
                style={[styles.input, errors.storeName && styles.inputError]}
                placeholder="Store name"
                placeholderTextColor="#A0A0A0"
                value={formData.storeName}
                onChangeText={(value) => handleInputChange('storeName', value)}
                editable={!loading}
              />
              {errors.storeName && (
                <Text style={styles.errorText}>{errors.storeName}</Text>
              )}
            </View>
            
            <View style={styles.halfWidth}>
              <Text style={styles.label}>
                Owner Name <Text style={styles.required}>*</Text>
              </Text>
              <TextInput
                style={[styles.input, errors.ownerName && styles.inputError]}
                placeholder="Owner name"
                placeholderTextColor="#A0A0A0"
                value={formData.ownerName}
                onChangeText={(value) => handleInputChange('ownerName', value)}
                editable={!loading}
              />
              {errors.ownerName && (
                <Text style={styles.errorText}>{errors.ownerName}</Text>
              )}
            </View>
          </View>

          {/* Mobile Number and Referred By Row */}
          <View style={styles.row}>
            <View style={styles.halfWidth}>
              <Text style={styles.label}>
                Mobile Number <Text style={styles.required}>*</Text>
              </Text>
              <TextInput
                style={[styles.input, errors.mobileNumber && styles.inputError]}
                placeholder="Mobile number"
                placeholderTextColor="#A0A0A0"
                value={formData.mobileNumber}
                onChangeText={(value) => handleInputChange('mobileNumber', value)}
                keyboardType="phone-pad"
                editable={!loading}
              />
              {errors.mobileNumber && (
                <Text style={styles.errorText}>{errors.mobileNumber}</Text>
              )}
            </View>
            
            <View style={styles.halfWidth}>
              <Text style={styles.label}>Referred By</Text>
              <TextInput
                style={styles.input}
                placeholder="Referrer name"
                placeholderTextColor="#A0A0A0"
                value={formData.referBy}
                onChangeText={(value) => handleInputChange('referBy', value)}
                editable={!loading}
              />
            </View>
          </View>

          {/* Address */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>
              Address <Text style={styles.required}>*</Text>
            </Text>
            <TextInput
              style={[styles.textArea, errors.address && styles.inputError]}
              placeholder="Enter complete address"
              placeholderTextColor="#A0A0A0"
              value={formData.address}
              onChangeText={(value) => handleInputChange('address', value)}
              multiline={true}
              numberOfLines={3}
              textAlignVertical="top"
              editable={!loading}
            />
            {errors.address && (
              <Text style={styles.errorText}>{errors.address}</Text>
            )}
          </View>

          {/* Description */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>
              Description <Text style={styles.required}>*</Text>
            </Text>
            <TextInput
              style={[styles.textArea, errors.description && styles.inputError]}
              placeholder="Describe your store and services"
              placeholderTextColor="#A0A0A0"
              value={formData.description}
              onChangeText={(value) => handleInputChange('description', value)}
              multiline={true}
              numberOfLines={3}
              textAlignVertical="top"
              editable={!loading}
            />
            {errors.description && (
              <Text style={styles.errorText}>{errors.description}</Text>
            )}
          </View>

          {/* Store Available */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>
              Store Available <Text style={styles.required}>*</Text>
            </Text>
            
            <View style={styles.toggleContainer}>
              <TouchableOpacity
                style={[
                  styles.toggleButton,
                  formData.isavailable && styles.toggleActive
                ]}
                onPress={() => handleInputChange('isavailable', true)}
                disabled={loading}
              >
                <Text style={[
                  styles.toggleText,
                  formData.isavailable && styles.toggleTextActive
                ]}>
                  Yes
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[
                  styles.toggleButton,
                  !formData.isavailable && styles.toggleInactive
                ]}
                onPress={() => handleInputChange('isavailable', false)}
                disabled={loading}
              >
                <Text style={[
                  styles.toggleText,
                  !formData.isavailable && styles.toggleTextActive
                ]}>
                  No
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Submit Button */}
          <TouchableOpacity
            style={[styles.submitButton, loading && styles.submitButtonDisabled]}
            onPress={handleSubmit}
            disabled={loading}
          >
            {loading ? (
              <View style={styles.buttonContent}>
                <ActivityIndicator color="#FFFFFF" size="small" />
                <Text style={styles.buttonText}>Processing...</Text>
              </View>
            ) : (
              <Text style={styles.buttonText}>Add Store</Text>
            )}
          </TouchableOpacity>

        </View>
      </ScrollView>
    {/* </SafeAreaView> */}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },

  scrollView: {
    flex: 1,
  },
  // scrollContent: {
  //   paddingBottom: 10,
  // },
  formContainer: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  halfWidth: {
    width: '48%',
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333333',
    marginBottom: 8,
  },
  required: {
    color: '#FF0000',
  },
  input: {
    height: 50,
    borderWidth: 1,
    borderColor: '#DDDDDD',
    borderRadius: 8,
    paddingHorizontal: 15,
    fontSize: 16,
    color: '#333333',
    backgroundColor: '#FFFFFF',
  },
  textArea: {
    height: 100,
    borderWidth: 1,
    borderColor: '#DDDDDD',
    borderRadius: 8,
    paddingHorizontal: 15,
    paddingTop: 15,
    fontSize: 16,
    color: '#333333',
    backgroundColor: '#FFFFFF',
  },
  inputError: {
    borderColor: '#FF0000',
  },
  errorText: {
    color: '#FF0000',
    fontSize: 12,
    marginTop: 5,
  },
  toggleContainer: {
    flexDirection: 'row',
    borderRadius: 8,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#DDDDDD',
    backgroundColor: '#FFFFFF',
  },
  toggleButton: {
    flex: 1,
    paddingVertical: 15,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
  },
  toggleActive: {
    backgroundColor: '#4CAF50',
  },
  toggleInactive: {
    backgroundColor: '#F44336',
  },
  toggleText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#666666',
  },
  toggleTextActive: {
    color: '#FFFFFF',
  },
  submitButton: {
    backgroundColor: '#2196F3',
    borderRadius: 8,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 20,
  },
  submitButtonDisabled: {
    backgroundColor: '#CCCCCC',
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sectionHeader: {
  backgroundColor: '#FFFFFF',
  paddingHorizontal: 20,
  paddingVertical: 16,
  borderBottomWidth: 1,
  borderBottomColor: '#E5E5E7',
  marginTop:10
},

sectionHeaderText: {
  fontSize: 18,
  fontWeight: '600',
  color: '#333333',
},
  buttonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 8,
  },
});

export default AddstoreScreen;