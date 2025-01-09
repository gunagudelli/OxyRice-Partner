import React, { useEffect, useState,useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, TextInput, FlatList, ActivityIndicator, Alert ,Linking} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import Icon from 'react-native-vector-icons/FontAwesome';
import BASE_URL from "../../config";
import { useFocusEffect } from '@react-navigation/native';
import { useSelector } from "react-redux";



const DeliveryBoys = ({ navigation }) => {
  const [deliveryBoys, setDeliveryBoys] = useState([]);
  const [loading, setLoading] = useState(true);
  const[newload,setNewLoad]=useState(null)
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedDeliveryBoy, setSelectedDeliveryBoy] = useState(null);
  const [userId, setUserId] = useState(null)
  const accessToken = useSelector((state) => state.counter);

console.log({accessToken})
  const [formData, setFormData] = useState({
    deliveryBoyName: '',
    deliveryBoyMobile: '',
    deliveryBoyEmail: '',
    deliveryBoyAddress: '',
    isActive: false,
  });

  useEffect(() => {
    fetchDeliveryBoys();
  }, []);

  const fetchDeliveryBoys = async () => {
    try {
      // const token = await AsyncStorage.getItem('accessToken');

      // const userData = await AsyncStorage.getItem("userData");
      // if (userData) {
      //     const parsedData = JSON.parse(userData);
      //     console.log("User ID:", parsedData.userId);
      //     setUserId(parsedData.userId);
      //     console.log("Access Token:", parsedData.accessToken);
      //     setAccessToken(parsedData.accessToken);



      const response = await fetch(BASE_URL+'erice-service/deliveryboy/list', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${accessToken.token}`,
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();
// console.log("deliveryboy list",data)
      if (response.ok) {
        setDeliveryBoys(data.filter(item => item.deliveryBoyName || item.deliveryBoyMobile));
      } else {
        throw new Error(data.message || 'Failed to load delivery boys.');
      }
    // } 
  }catch (error) {
      // Alert.alert('Error', error.message || 'Failed to load delivery boys.');
    } finally {
      setLoading(false);
    }
  };

  const updateDeliveryBoyStatus = async (id, userId, isActive) => {
    setNewLoad(id);
    try {
      // const token = await AsyncStorage.getItem('accessToken');

      // const userData = await AsyncStorage.getItem("userData");
      // if (userData) {
      //     const parsedData = JSON.parse(userData);
      //     console.log("User ID:", parsedData.userId);
      //     setUserId(parsedData.userId);
      //     console.log("Access Token:", parsedData.accessToken);
      //     setAccessToken(parsedData.accessToken);


      const response = await axios.patch(
        BASE_URL+'erice-service/deliveryboy/status',
        { "id": userId, "isActive": isActive },
        { headers: { 'Authorization': `Bearer ${accessToken.token}` } }
      );

      if (response.status === 200) {
        setDeliveryBoys(prev => prev.map(boy => boy.id === id ? { ...boy, isActive } : boy));
        Alert.alert('Success!', 'Deliveryboy status updated successfully.');
      } else {
        throw new Error(response.data.message || 'Failed to update status.');
      }
    // } 
  }catch (error) {
      Alert.alert('Error', error.message || 'Failed to update status.');
    }
    finally {
      setNewLoad(null); 
    }
  };



  const makeCall = (phoneNumber) => {
    const phoneUrl = `tel:${phoneNumber}`;
    Linking.openURL(phoneUrl)
      .then(() => {
        console.log('Dialer opened successfully.');
      })
      .catch((error) => {
        Alert.alert('Error', 'Failed to open the phone dialer.');
        console.error('Error:', error);
      });
  };


  const navigateToEdit = (deliveryBoy) => {
    setIsModalVisible(true);
    setSelectedDeliveryBoy(deliveryBoy);
    setFormData({
      id: deliveryBoy.userId,
      deliveryBoyName: deliveryBoy.deliveryBoyName,
      deliveryBoyMobile: deliveryBoy.deliveryBoyMobile,
      deliveryBoyEmail: deliveryBoy.deliveryBoyEmail,
      deliveryBoyAddress: deliveryBoy.deliveryBoyAddress,
      isActive: deliveryBoy.isActive,
    });
  };
  
  const validateFormData = () => {
    const { deliveryBoyName, deliveryBoyMobile, deliveryBoyEmail, deliveryBoyAddress } = formData;
    if (deliveryBoyMobile.length!=10) {
      Alert.alert("Error","Mobile Number must be 10 digits...!")
      return false;
  }
    if (!deliveryBoyName || !deliveryBoyMobile || !deliveryBoyEmail || !deliveryBoyAddress ) {
      Alert.alert('Error', 'All fields are required.');
      return false;
    }
    return true;
  };

  const saveChanges = async () => {
    if (!validateFormData()) return;

    // const token = await AsyncStorage.getItem('accessToken');
    const userData = await AsyncStorage.getItem("userData");
    // if (userData) {
    //     const parsedData = JSON.parse(userData);
    //     console.log("User ID:", parsedData.userId);
    //     setUserId(parsedData.userId);
    //     console.log("Access Token:", parsedData.accessToken);
    //     setAccessToken(parsedData.accessToken);
    
    axios({
      method: "patch",
      url:BASE_URL+'erice-service/deliveryboy/update',
      data: formData,
      headers: {
        'Authorization': `Bearer ${accessToken.token}`,
      }
    })
      .then((response) => {
        
        Alert.alert("Success!",response.data.message);
        setIsModalVisible(false);
        // Update the specific delivery boy data in the list
        setDeliveryBoys(prev => prev.map(boy => boy.userId === formData.id ? { ...boy, ...formData } : boy));
      })
      .catch((error) => {
        Alert.alert(error.response.data.error);
        setIsModalVisible(false);
      });
    // }
  };
  const renderItem = ({ item }) => (
    <View style={styles.item}>
      {/* <Text style={styles.itemText}>
        <Text style={styles.boldText}>Name: </Text>{item.id || 'N/A'}
      </Text> */}
      <Text style={styles.itemText}>
        <Text style={styles.boldText}>Name: </Text>{item.deliveryBoyName || 'N/A'}
      </Text>
      <Text style={styles.itemText}>
        <Text style={styles.boldText}>Mobile: </Text>{item.deliveryBoyMobile || 'N/A'}
      </Text>
      <Text style={styles.itemText}>
        <Text style={styles.boldText}>Email: </Text>{item.deliveryBoyEmail || 'N/A'}
      </Text>
      <Text style={styles.itemText}>
        <Text style={styles.boldText}>Address: </Text>{item.deliveryBoyAddress || 'N/A'}
      </Text>

      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[styles.statusButton, { backgroundColor: !item.isActive ? '#f44336' : '#4CAF50' },
            newload===item.id && styles.disabledButton,
          ]}
          onPress={() => updateDeliveryBoyStatus(item.id, item.userId, !item.isActive)}
        >
          {newload===item.id ? <ActivityIndicator color="#fff"/>:<Text style={styles.statusButtonText}>{item.isActive ? 'Activate' : 'Deactivate'}</Text>}
       
        </TouchableOpacity>

        {item.deliveryBoyMobile && (
          <TouchableOpacity style={styles.callIconContainer} onPress={() => makeCall(item.deliveryBoyMobile)}>
            <Icon name="phone" size={18} color="#fff" />
          </TouchableOpacity>
        )}
      </View>

      <TouchableOpacity style={styles.editButton} onPress={() => navigateToEdit(item)}>
        <Icon name="edit" size={26} color="black" />
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      {loading ? (
        <ActivityIndicator size="large" color="#4CAF50" />
      ) : (
        <FlatList
          data={deliveryBoys}
          // keyExtractor={item => item.userId.toString()}
          renderItem={renderItem}
          ListEmptyComponent={<Text style={styles.emptyText}>No Delivery Boys available.</Text>}
        />
      )}

      <Modal
        visible={isModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setIsModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <TextInput
              style={styles.input}
              placeholder="Name"
              value={formData.deliveryBoyName}
              onChangeText={text => setFormData({ ...formData, deliveryBoyName: text })}
            />
            <TextInput
              style={styles.input}
              placeholder="Mobile"
              keyboardType="number-pad"
              maxLength={10}
              value={formData.deliveryBoyMobile}
              onChangeText={number => setFormData({ ...formData, deliveryBoyMobile: number })}
            />
            <TextInput
              style={styles.input}
              placeholder="Email"
              value={formData.deliveryBoyEmail}
              onChangeText={text => setFormData({ ...formData, deliveryBoyEmail: text })}
            />
            <TextInput
              style={styles.input}
              placeholder="Address"
              value={formData.deliveryBoyAddress}
              onChangeText={text => setFormData({ ...formData, deliveryBoyAddress: text })}
            />

            <View style={styles.buttonContainer}>
              <TouchableOpacity style={styles.cancelButton} onPress={() => setIsModalVisible(false)}>
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.saveButton} onPress={saveChanges}>
                <Text style={styles.saveButtonText}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#F9F9F9',
  },
  item: {
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    marginBottom: 15,
    padding: 15,
    elevation: 5,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 5,
  },
  itemText: {
    fontSize: 18,
    marginBottom: 4,
    color: '#333',
  },
  boldText: {
    fontWeight: 'bold',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 14,
  },
  statusButton: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 5,
  },
  statusButtonText: {
    color: '#000',
    fontSize: 16,
  },
  callIconContainer: {
    backgroundColor: '#4CAF50',
    padding: 10,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  editButton: {
    position: 'absolute',
    top: 10,
    right: 18,
  },
  emptyText: {
    textAlign: 'center',
    fontSize: 18,
    color: '#999',
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
  },
  modalContent: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 8,
    width: '80%',
  },
  input: {
    height: 50,
    borderColor: '#ddd',
    borderWidth: 1,
    marginBottom: 15,
    paddingLeft: 10,
    borderRadius: 5,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  cancelButton: {
    backgroundColor: '#FF6347',
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 5,
  },
  cancelButtonText: {
    color: '#fff',
    fontSize: 16,
  },
  saveButton: {
    backgroundColor: '#4CAF50',
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 5,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
  },
  disabledButton: {
    opacity: 0.6, // Visual indication of disabled state
  },
});

export default DeliveryBoys;