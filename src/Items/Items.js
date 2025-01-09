import React, { useEffect, useState,useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Image,
  Dimensions,
  Alert,
  Modal,
  TextInput,
  Button,
  ActivityIndicator,
  Switch
} from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import BASE_URL from "../../config";
import { useSelector } from "react-redux";

const { width } = Dimensions.get('window');

const Items = () => {
  const [items, setItems] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [price, setPrice] = useState();
  const [mrp ,setMrp]=useState()
// const [itemprice, setItemprice]=useState('') 
  const [loading, setLoading] = useState(false);
    const accessToken = useSelector((state) => state.counter);
  // console.log("Items",accessToken)
  // const [accessToken, setAccessToken] = useState(null)
  const [userId, setUserId] = useState(null)

  // useEffect(() => {
  //   fetchItems();
  // }, []);



  useFocusEffect(
    useCallback(() => {
        // Functions to run when the screen is focused
        const getdata = async () => {
            await fetchItems();
        };

        getdata();
        console.log('AccessToken:', accessToken.token);

        // Cleanup function (if needed) to run when the screen is unfocused
        return () => {
            console.log('Screen is unfocused');
        };
    }, [])
);

useEffect(()=>{
  fetchItems()
},[])


  const fetchItems = async () => {
    setLoading(true);
    try {
      // const accessToken = await AsyncStorage.getItem('accessToken');
      const userData = await AsyncStorage.getItem("userData");
      // if (userData) {
      //     const parsedData = JSON.parse(userData);
      //     console.log("User ID:", parsedData.userId);
      //     setUserId(parsedData.userId);
      //     console.log("Access Token:", parsedData.accessToken);
      //     setAccessToken(parsedData.accessToken);

      const response = await axios.get(
          BASE_URL+`erice-service/selleritems/ItemsGetTotal`,
        {
          headers: {
            'Authorization': `Bearer ${accessToken.token}`,
          },
        }
      );
      setItems(response.data);
      
    
      
    // } 
    // else{
    //   console.log("Please check")
    // }
  }
  catch (error) {
      console.error('Error fetching items:', error.response?.data || error.message);
      // Alert.alert('Error', 'Failed to fetch items.');
    } finally {
      setLoading(false);
    }
  };

  const openUpdatePriceModal = (item) => {
    setSelectedItem(item);
    setModalVisible(true);
    setMrp(item.itemMrp);
    setPrice(item.itemPrice);
   
    
  };

  const submitUpdatePrice = async () => {
    try {
      // const accessToken = await AsyncStorage.getItem('accessToken');
      if (!price) {
        Alert.alert('Error', 'Please enter a new price.');
        return;
      }

// const userData = await AsyncStorage.getItem("userData");
// if (userData) {
//     const parsedData = JSON.parse(userData);
//     console.log("User ID:", parsedData.userId);
//     setUserId(parsedData.userId);
//     console.log("Access Token:", parsedData.accessToken);
//     setAccessToken(parsedData.accessToken);

    let data={
      sellerId: accessToken.id,
      itemMrp:  mrp,
      active: selectedItem.active,
      itemId: selectedItem.itemId,
      itemPrice:price
    }

console.log({data})
      const response = await axios.patch(
          BASE_URL+'erice-service/selleritems/sellerItemPriceFix',
        data,
        {
          headers: {
            'Authorization': `Bearer ${accessToken.token}`,
            'Content-Type': 'application/json',
          },
        }
      );
    
      
      if (response.status === 200) {
        Alert.alert('Success', 'Price updated successfully!');
        setModalVisible(false);
        setPrice('');
        fetchItems();
      } else {
        Alert.alert('Error', `Failed to update price. Status: ${response.status}`);
      }
    // }
    } 
    catch (error) {
      console.error('Error updating price:', error.response || error.message);
      Alert.alert('Error', 'Failed to update price.');
    }
  };

  const toggleActiveStatus = async (item) => {
    try {
      // const accessToken = await AsyncStorage.getItem('accessToken');

      const userData = await AsyncStorage.getItem("userData");
      // if (userData) {
      //     const parsedData = JSON.parse(userData);
      //     console.log("User ID:", parsedData.userId);
      //     setUserId(parsedData.userId);
      //     console.log("Access Token:", parsedData.accessToken);
      //     setAccessToken(parsedData.accessToken);

      const newStatus = !item.active;
      const response = await axios.patch(
          BASE_URL+'erice-service/selleritems/sellerItemStatusToggle',
        {
          sellerId: accessToken.id,
          itemId: item.itemId,
          active: newStatus,
        },
        {
          headers: {
            'Authorization': `Bearer ${accessToken.token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (response.status === 200) {
        fetchItems(); // Refresh the list
      } else {
        Alert.alert('Error', 'Failed to toggle active status.');
      }
    // } 
  }catch (error) {
      console.error('Error toggling active status:', error.response?.data || error.message);
      Alert.alert('Error', 'Failed to toggle active status.');
    }
  };

  return (
    <View style={styles.container}>
      {loading && (
        <View style={styles.loader}>
          <ActivityIndicator color="green" size="large" />
        </View>
      )}
      <FlatList
        data={items}
        keyExtractor={(item) => item.itemId.toString()}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={styles.row}>
              {/* Left: Item Image */}
              {item.itemImage ? (
                <Image source={{ uri: item.itemImage }} style={styles.itemImage} resizeMode="cover" />
              ) : (
                <View style={styles.placeholderImage} />
              )}

              {/* Center: Item Details */}
              <View style={styles.detailsContainer}>
                <Text style={styles.itemName}>{item.itemName}</Text>
                {/* <Text style={styles.itemDescription}>
                  {item.itemDescription || 'No description available.'}
                </Text> */}
                <Text style={styles.itemPrice1}>ItemMrp:<Text style={styles.itemPrice}> ₹{item.itemMrp}</Text></Text>
                <Text style={styles.itemPrice1}>ItemPrice: ₹{item.itemPrice}</Text>

                <Text style={styles.itemQuantity}>
                  Quantity: {item.quantity} {item.units}
                </Text>
              </View>

              {/* Right: Active Button */}
              <View style={styles.actionContainer}>
                <View style={styles.switchContainer}>
                  {/* <Text style={styles.switchLabel}>{item.active ? 'Active' : 'Inactive'}</Text> */}
                  <Switch
                    value={item.active}
                    disabled={true}
                    onValueChange={() => toggleActiveStatus(item)}
                    thumbColor={item.active ? 'white' : 'white'}
                    trackColor={{ true: '#28a745', false: 'red' }}
                  />
                </View>

                {/* Update Price Button */}
                <TouchableOpacity
                  style={styles.updateButton}
                  onPress={() => openUpdatePriceModal(item)}
                >
                  <Text style={styles.updateButtonText}>Update Price</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        )}
      />
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Enter New Price</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter new Mrp"
              keyboardType="numeric"
              maxLength={5}
              value={String(mrp)}
              onChangeText={setMrp}
            />
             <TextInput
              style={styles.input}
              placeholder="Enter new price"
              keyboardType="numeric"
              maxLength={5}
              value={String(price)}
              onChangeText={setPrice}
            />
            
            <View style={styles.modalButtons}>
              <Button
                title="Close"
                onPress={() => {
                  setModalVisible(false);
                  setPrice('');
                }}
                color="red"
              />
              <Button title="Submit" onPress={submitUpdatePrice} />
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
    padding: 16,
    backgroundColor: '#f5f5f5',
  },
  loader: {
    position: 'absolute',
    top: '50%',
    left: '50%',
  },
  card: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 10,
    backgroundColor: '#fff',
    marginBottom: 10,
    padding: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 3,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  itemImage: {
    width: 70,
    height: 70,
    borderRadius: 5,
    marginRight: 10,
    alignSelf:"center"
  },
  placeholderImage: {
    width: 70,
    height: 70,
    backgroundColor: '#ccc',
    borderRadius: 5,
    marginRight: 10,
  },
  detailsContainer: {
    flex: 1,
  },
  itemName: {
    fontSize: 16,
    fontWeight: 'bold',
    width:width*0.5
  },
  itemDescription: {
    color: '#666',
    marginVertical: 5,
    width:width*0.5
  },
  itemPrice: {
    fontSize: 14,
    color: 'red',
    fontWeight: 'bold',
    textDecorationLine: 'line-through',
  },
  itemPrice1: {
    fontSize: 14,
    color: 'green',
    fontWeight: 'bold',
    
  },
  itemQuantity: {
    color: '#333',
    fontWeight: 'bold',
  },
  actionContainer: {
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  switchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  switchLabel: {
    fontSize: 16,
    marginRight: 10,
  },
  updateButton: {
    backgroundColor: 'orange',
    paddingVertical: 8,
    paddingHorizontal:4,
    borderRadius: 5,
  },
  updateButtonText: {
    color: 'white',
    textAlign: 'center',
    fontWeight: 'bold',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    width: 300,
    padding: 20,
    backgroundColor: '#fff',
    borderRadius: 10,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  input: {
    width: '100%',
    height: 40,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    marginBottom: 20,
    paddingLeft: 10,
    fontSize: 16,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
});

export default Items;
