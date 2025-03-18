
import React, { useEffect, useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  Modal, 
  TextInput, 
  FlatList, 
  ActivityIndicator, 
  Alert, 
  Linking, 
  Dimensions,
  SafeAreaView,
  StatusBar,
  RefreshControl
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import Icon from 'react-native-vector-icons/FontAwesome';
import BASE_URL from '../../config';
import { useSelector } from "react-redux";

const { width, height } = Dimensions.get('window');

const DeliveryBoys = ({ navigation }) => {
  //const { BASE_URL, userStage } = config(); // Get values
// console.log({BASE_URL})
  const [deliveryBoys, setDeliveryBoys] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [updatingId, setUpdatingId] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedDeliveryBoy, setSelectedDeliveryBoy] = useState(null);
  const [updateLoading, setUpdateLoading] = useState(false);
  const accessToken = useSelector((state) => state.counter);

  const [formData, setFormData] = useState({
    userFirstName: '',
    userLastName:'',
    name_error:false,
    lastName_error:false,
    whatsappNumber: '',
    alterMobileNumber: '',
    customerEmail: '',
    email_error:false,
    id: '',
    isActive: 'false'
  });

  useEffect(() => {
    fetchDeliveryBoys();
  }, []);

  const fetchDeliveryBoys = async () => {
    try {
      setLoading(true);
      const response = await fetch(BASE_URL+'user-service/deliveryBoyList', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${accessToken.token}`,
          'Content-Type': 'application/json',
        },
      });
      // console.log("response",response)
      const data = await response.json();
      // console.log("respomnse",data)

      if (response.ok) {
        const formattedData = data.map(item => ({
          id: item.userId,
          userId: item.userId,
          deliveryBoyName: item.firstName +" "+ item.lastName || 'N/A',
          deliveryBoyMobile: item.whatsappNumber || 'N/A',
          deliveryBoyEmail: item.email || 'N/A',
          deliveryBoyAddress: item.address || 'N/A',
          isActive: item.isActive === "true",
          alterMobileNumber: item.alterMobileNumber || '',
          lastName: item.lastName || ''
        }));
        setDeliveryBoys(formattedData);
      } else {
        throw new Error(data.message || 'Failed to load delivery boys.');
      }
    } catch (error) {
      Alert.alert('Error', error.message || 'Failed to load delivery boys.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchDeliveryBoys();
  };

  const updateDeliveryBoyStatus = async (id, userId, isActive) => {
    setUpdatingId(id);
    try {
      const response = await axios.patch(
        BASE_URL+'user-service/status',
        {
          id: id,
          isActive: isActive.toString()
        },
        {
          headers: {
            'Authorization': `Bearer ${accessToken.token}`,
            'Content-Type': 'application/json'
          }
        }
      );
console.log("updateDeliveryBoyStatus",response)
      if (response.status === 200) {
        setDeliveryBoys(prev => 
          prev.map(boy => boy.id === id ? { ...boy, isActive } : boy)
        );
        Alert.alert('Success!', 'Delivery Boy status updated.');
        await fetchDeliveryBoys();
      } else {
        throw new Error(response.data.message || 'Failed to update status.');
      }
    } catch (error) {
      Alert.alert('Error', error.message || 'Failed to update status.');
    } finally {
      setUpdatingId(null);
    }
  };

  const handleUpdate = (deliveryBoy) => {
    setIsModalVisible(true);

    console.log("Handle Submit");
    
    setSelectedDeliveryBoy(deliveryBoy);
    setFormData({
      userFirstName: deliveryBoy.firstName,
      userLastName: deliveryBoy.lastName,
      whatsappNumber: deliveryBoy.deliveryBoyMobile,
      alterMobileNumber: deliveryBoy.alterMobileNumber || '',
      customerEmail: deliveryBoy.deliveryBoyEmail,
      id: deliveryBoy.id,
    });
  };

  const saveUpdates = async () => { 
    
    if(formData.userFirstName=="" || formData.userFirstName==null){
      setFormData({...formData,name_error:true})
      return false
    }
    if(formData.userLastName=="" || formData.userLastName==null){
      setFormData({...formData,lastName_error:true})
      return false
    }
    if(formData.customerEmail=="" || formData.customerEmail==null){
      setFormData({...formData,email_error:true})
      return false
    }
    try {
      setUpdateLoading(true);
      const response = await axios.patch(
        BASE_URL+'user-service/update',
        formData,
        {
          headers: {
            'Authorization': `Bearer ${accessToken.token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      console.log("response",response.data)
      if (response.status === 200) {
        Alert.alert('Success', 'Delivery boy details updated successfully');
        setIsModalVisible(false);
        await fetchDeliveryBoys();
      } else {
        throw new Error('Failed to update delivery boy details');
      }
    } catch (error) {
      Alert.alert('Error', error.message || 'Failed to update delivery boy details');
    } finally {
      setUpdateLoading(false);
    }
  };

  const makeCall = (phoneNumber) => {
    const cleanedNumber = phoneNumber.replace(/\D/g, '');
    const phoneUrl = `tel:${cleanedNumber}`;
    
    Linking.openURL(phoneUrl)
      .catch((error) => {
        Alert.alert('Error', 'Failed to open the phone dialer.');
        console.error('Error:', error);
      });
  };

  const renderItem = ({ item }) => (
    <View style={styles.item}>
      <View style={styles.itemHeader}>
        <Text style={styles.itemName}>{item.deliveryBoyName} </Text>
        <View style={styles.itemActions}>
          <TouchableOpacity 
            style={styles.iconButton}
            onPress={() => navigation.navigate('Delivery Boy Orders', { id: item.userId })}
          >
            <Icon name="info-circle" size={24} color="grey" />
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.iconButton}
            onPress={() => handleUpdate(item)}
          >
            <Icon name="edit" size={24} color="#FFA500" />
          </TouchableOpacity>
        </View>
      </View>
      
      <View style={styles.detailsContainer}>
        <View style={styles.detailItem}>
          <Icon name="phone" size={16} color="#555" />
          <Text style={styles.itemDetail}>{item.deliveryBoyMobile}</Text>
        </View>
        
        <View style={styles.detailItem}>
          <Icon name="envelope" size={16} color="#555" />
          <Text style={styles.itemDetail}>{item.deliveryBoyEmail}</Text>
        </View>
        
        {item.deliveryBoyAddress && item.deliveryBoyAddress !== 'N/A' && (
          <View style={styles.detailItem}>
            <Icon name="map-marker" size={16} color="#555" />
            <Text style={styles.itemDetail}>{item.deliveryBoyAddress}</Text>
          </View>
        )}
      </View>
      
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[
            styles.statusButton, 
            { backgroundColor: item.isActive ? '#4CAF50' : '#f44336' }
          ]}
          onPress={() => updateDeliveryBoyStatus(item.id, item.userId, !item.isActive)}
          disabled={updatingId === item.id}
        >
          {updatingId === item.id ? (
            <ActivityIndicator color="#fff" size="small" />
          ) : (
            <>
              <Icon 
                name={item.isActive ? "toggle-on" : "toggle-off"} 
                size={18} 
                color="#fff" 
                style={styles.buttonIcon} 
              />
              <Text style={styles.statusButtonText}>
                {item.isActive ? 'Active' : 'Inactive'}
              </Text>
            </>
          )}
        </TouchableOpacity>
        
        {item.deliveryBoyMobile && (
          <TouchableOpacity 
            style={styles.callButton} 
            onPress={() => makeCall(item.deliveryBoyMobile)}
          >
            <Icon name="phone" size={18} color="#fff" style={styles.buttonIcon} />
            <Text style={styles.callButtonText}>Call</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );

  const renderEmptyComponent = () => (
    <View style={styles.emptyContainer}>
      <Icon name="users" size={50} color="#ccc" />
      <Text style={styles.emptyText}>No Delivery Boys available</Text>
      <TouchableOpacity style={styles.refreshButton} onPress={fetchDeliveryBoys}>
        <Icon name="refresh" size={16} color="#fff" style={styles.buttonIcon} />
        <Text style={styles.refreshButtonText}>Refresh</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* <StatusBar backgroundColor="#4CAF50" barStyle="light-content" /> */}
      
       
      
      {loading ? (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color="#4CAF50" />
          <Text style={styles.loadingText}>Loading delivery boys...</Text>
        </View>
      ) : (
        <FlatList
          data={deliveryBoys}
          renderItem={renderItem}
          keyExtractor={(item) => item.userId.toString()}
          ListEmptyComponent={renderEmptyComponent}
          contentContainerStyle={styles.listContainer}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={["#4CAF50"]}
            />
          }
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
            <Text style={styles.modalTitle}>Update Delivery Boy</Text>
            
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Name</Text>
              <TextInput
                style={styles.input}
                placeholder="First Name"
                value={formData.userFirstName}
                onChangeText={(text) => setFormData({ ...formData, userFirstName: text,name_error:false })}
              />
            </View>

            {formData.name_error==true?
            <Text style={{color:"red",alignSelf:"center"}}>First Name is required</Text>:null}


<View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Last name</Text>
              <TextInput
                style={styles.input}
                placeholder="Last Name"
                value={formData.userLastName}
                onChangeText={(text) => setFormData({ ...formData, userLastName: text,lastName_error:false })}
              />
            </View>

            {formData.lastName_error==true?
            <Text style={{color:"red",alignSelf:"center"}}>Last Name is required</Text>:null}

            
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Whatsapp Number</Text>
              <TextInput
                style={styles.input}
                placeholder="WhatsApp Number"
                value={formData.whatsappNumber}
                onChangeText={(text) => setFormData({ ...formData, whatsappNumber: text })}
                keyboardType="phone-pad"
                editable={false}
              />
            </View>
            
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Email</Text>
              <TextInput
                style={styles.input}
                placeholder="Email"
                value={formData.customerEmail}
                onChangeText={(text) => setFormData({ ...formData, customerEmail: text,email_error:false})}
                keyboardType="email-address"
              />
            </View>
            
{formData.email_error==true?
            <Text style={{color:"red",alignSelf:"center"}}>Email is required</Text>:null}

            <View style={styles.modalButtonContainer}>
              <TouchableOpacity 
                style={styles.cancelButton} 
                onPress={() => setIsModalVisible(false)}
                disabled={updateLoading}
              >
                <Text style={styles.buttonText}>Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.saveButton} 
                onPress={()=>saveUpdates()}
                disabled={updateLoading}
              >
                {updateLoading ? (
                  <ActivityIndicator color="#fff" size="small" />
                ) : (
                  <Text style={styles.buttonText}>Update</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#4CAF50',
    paddingVertical: 15,
    paddingHorizontal: 20,
    elevation: 4,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
  },
  listContainer: {
    padding: 12,
    paddingBottom: 30,
  },
  item: {
    backgroundColor: '#fff',
    borderRadius: 10,
    marginBottom: 12,
    padding: 16,
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 2 },
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    paddingBottom: 8,
    
  },
  itemName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    width:width*0.65
  },
  itemActions: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingRight:10
  },
  iconButton: {
    padding: 8,
    marginLeft: 5,
  },
  detailsContainer: {
    marginBottom: 10,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  itemDetail: {
    fontSize: 16,
    color: '#555',
    marginLeft: 10,
  },
  boldText: {
    fontWeight: 'bold',
  },
  buttonContainer: {
    flexDirection: 'row',
    marginTop: 10,
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    paddingTop: 12,
  },
  statusButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 6,
    flex: 1,
    marginRight: 10,
  },
  statusButtonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
  },
  callButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 6,
    backgroundColor: '#4CAF50',
  },
  callButtonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
  },
  buttonIcon: {
    marginRight: 6,
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#555',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  emptyText: {
    fontSize: 18,
    color: '#777',
    marginTop: 10,
    marginBottom: 20,
  },
  refreshButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#4CAF50',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 6,
  },
  refreshButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 12,
    width: '90%',
    maxWidth: 400,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
    color: '#333',
  },
  inputContainer: {
    marginBottom: 15,
  },
  inputLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
    fontWeight: '500',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#fafafa',
  },
  modalButtonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  cancelButton: {
    backgroundColor: '#f44336',
    padding: 12,
    borderRadius: 8,
    flex: 1,
    marginRight: 10,
    alignItems: 'center',
  },
  saveButton: {
    backgroundColor: '#4CAF50',
    padding: 12,
    borderRadius: 8,
    flex: 1,
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  }
});

export default DeliveryBoys
