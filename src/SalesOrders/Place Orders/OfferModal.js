// OfferModal.js
import axios from 'axios';
import React, { useRef } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  Animated,
  StyleSheet,
  Dimensions,
  Image,
  ScrollView,
  Alert
} from 'react-native';
import { useSelector } from 'react-redux';
// import { handleUserAddorIncrementCart } from '../../../../ApiService';
const { height, width } = Dimensions.get('window');
import BASE_URL from "../../../config"

export default function OfferModal({ visible, onClose, comboOffers ,customerId}) {
  // console.log('Combo Offers:', comboOffers);
  // console.log('Customer ID:', customerId);
  // console.log('Modal Visibility:', visible);
  
  const slideAnim = useRef(new Animated.Value(height)).current;
  // const userData = useSelector((state) => state.counter);
  // const customerId = userData?.userId;
  React.useEffect(() => {
    // console.log({itemId})
    // console.log({comboOffers})

    if (visible) {
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(slideAnim, {
        toValue: height,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  }, [visible]);

  const handleAddItem = async(item) => {
    console.log('Item added to cart:', item,customerId);
    // Add your logic to add item to cart here
    const data = {
        customerId: customerId,
        itemId: item.individualItemId,
        status:"COMBO"
    };
    console.log({data})

   axios.post(BASE_URL+`cart-service/cart/addAndIncrementCart`,data)
    .then((response) => {
      console.log('Item added to cart successfully:', response.data);
      Alert.alert('Success', 'Item added to cart successfully');
    })
    .catch((error) => {
      console.error('Error adding item to cart:', error);
      Alert.alert('Error', 'Failed to add item to cart');
    });
   
  }

  return (
    <Modal
      transparent={true}
      visible={visible}
      // animationType="none"
      onRequestClose={onClose}
    >
      <TouchableOpacity
        style={styles.overlay}
        activeOpacity={1}
        onPress={onClose}
      >
        <Animated.View style={[styles.modal]}>
          <View style={styles.header}>
            <Text style={styles.headerText}>Combo Offers</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Text style={styles.closeButtonText}>×</Text>
            </TouchableOpacity>
          </View>
          
          <ScrollView contentContainerStyle={styles.scrollContent}>
           {comboOffers?.items?.map((offer, index) => (
              <View key={index} style={styles.offerItem}>
                <Image 
                  source={{ uri: offer.imageUrl }} 
                  style={styles.itemImage}
                  resizeMode="contain"
                />
                <View style={styles.itemDetails}>
                  <Text style={styles.itemName}>{offer.itemName}</Text>
                  <View style={styles.priceContainer}>
                    {/* <Text style={styles.discountedPrice}>₹{offer.discountedPrice}</Text> */}
                    <Text style={styles.discountedPrice}>₹{offer.itemPrice}</Text>
                    <Text style={styles.originalPrice}> ₹{offer.itemMrp}  </Text>
                     <Text style={styles.mrpPrice}> ₹{offer.discountedPrice} Off </Text>
                  </View>
                  <Text style={styles.weightText}>
                    {offer.itemWeight} {offer.units}
                  </Text>
                </View>
                <TouchableOpacity 
                  style={styles.addButton}
                  onPress={() => {handleAddItem(offer),onClose()}}
                  
                >
                  <Text style={styles.addButtonText}>ADD</Text>
                </TouchableOpacity>
              </View>
   ))}
          </ScrollView>
        </Animated.View>
      </TouchableOpacity>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modal: {
    backgroundColor: '#fff',
    maxHeight: height * 0.8,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 15,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  headerText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  closeButton: {
    padding: 5,
  },
  closeButtonText: {
    fontSize: 24,
    color: '#666',
  },
  scrollContent: {
    paddingBottom: 20,
  },
  offerItem: {
    flexDirection: 'row',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    alignItems: 'center',
  },
  itemImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    marginRight: 15,
  },
  itemDetails: {
    flex: 1,
  },
  itemName: {
    fontSize: 14,
    color: '#333',
    marginBottom: 5,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },
  discountedPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FF6B6B',
    marginRight: 10,
  },
  originalPrice: {
    fontSize: 14,
    textDecorationLine: 'line-through',
    color: '#999',
    marginRight: 10,
  },
  mrpPrice: {
    fontSize: 12,
    color: '#999',
  },
  weightText: {
    fontSize: 12,
    color: '#666',
  },
  addButton: {
    backgroundColor: '#FF6B6B',
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 5,
  },
  addButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
  },
});