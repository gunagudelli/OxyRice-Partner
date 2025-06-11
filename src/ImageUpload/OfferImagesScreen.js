import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  SafeAreaView,
  FlatList,
  Switch,
  RefreshControl,
  Dimensions,
  Modal
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';
// import * as Clipboard from 'expo-clipboard';  
import BASE_URL from "../../config";

const { width } = Dimensions.get('window');

const OfferImagesScreen = ({ navigation }) => {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);

  useEffect(() => {
    fetchOfferImages();
  }, []);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      fetchOfferImages();
    });
    return unsubscribe;
  }, [navigation]);

  const fetchOfferImages = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${BASE_URL}product-service/getOfferImages`);
      setImages(response.data);
    } catch (error) {
      Alert.alert("Error", "Failed to load offer images.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchOfferImages();
  };

  const toggleImageStatus = async (imageUrl, id, currentStatus) => {
    try {
      setUpdatingStatus(id);
      const requestBody = { imageUrl, status: !currentStatus, id: id || null };
      await axios.patch(`${BASE_URL}product-service/imageinactiveAndActive`, requestBody);
      setImages(images.map(img => 
        img.id === id ? { ...img, status: !currentStatus } : img
      ));
    } catch (error) {
      Alert.alert("Error", "Failed to update image status.");
    } finally {
      setUpdatingStatus(null);
    }
  };

  const copyImageUrl = async (url) => {
    try {
      await Clipboard.setStringAsync(url);
      Alert.alert("Success", "Image URL copied to clipboard!");
    } catch (error) {
      Alert.alert("Error", "Failed to copy URL to clipboard");
    }
  };

  const getIdDisplay = (id) => {
    if (!id) return "ID not available";
    return id;
  };

  const openImageModal = (imageUrl) => {
    setSelectedImage(imageUrl);
    setModalVisible(true);
  };

  const renderItem = ({ item }) => (
    <View style={styles.imageCard}>
      <View style={styles.cardHeader}>
        <Text style={styles.imageId}>
          <Text style={styles.idValue}>ID: {getIdDisplay(item.id)}</Text>
        </Text>
        <View style={styles.statusContainer}>
          <Text style={[styles.statusText, item.status ? styles.activeText : styles.inactiveText]}>
            {item.status ? "Active" : "Inactive"}
          </Text>
          {updatingStatus === item.id ? (
            <ActivityIndicator size="small" color="#4a90e2" style={{ marginLeft: 10 }} />
          ) : (
            <Switch
              value={item.status}
              onValueChange={() => toggleImageStatus(item.imageUrl, item.id, item.status)}
              trackColor={{ false: "#ffcdd2", true: "#c8e6c9" }}
              thumbColor={item.status ? "#4CAF50" : "#F44336"}
            />
          )}
        </View>
      </View>
      
      <View style={styles.cardBody}>
        <TouchableOpacity
          onPress={() => openImageModal(item.imageUrl)}
          style={styles.thumbnailContainer}
        >
        <Image
  source={{ uri: item.imageUrl || "https://via.placeholder.com/70" }}
  style={styles.thumbnail}
  resizeMode="cover"
  onError={(e) => {
    console.log('Image loading error:', e.nativeEvent.error);
  }}
/>
          <View style={styles.previewOverlay}>
            <Ionicons name="eye" size={18} color="#fff" />
            <Text style={styles.previewText}>Preview</Text>
          </View>
        </TouchableOpacity>
        
        <View style={styles.itemDetails}>
          <View style={styles.urlPreview}>
            <Text numberOfLines={2} ellipsizeMode="middle" style={styles.urlText}>
              {item.imageUrl}
            </Text>
          </View>
          
          <View style={styles.actionButtons}>
            <TouchableOpacity 
              style={styles.copyButton}
              onPress={() => copyImageUrl(item.imageUrl)}
            >
              <Ionicons name="copy-outline" size={16} color="#4a90e2" />
              <Text style={styles.actionButtonText}>Copy URL</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </View>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="images-outline" size={80} color="#e0e0e0" />
      <Text style={styles.emptyTitle}>No Offer Images</Text>
      <Text style={styles.emptySubtitle}>Upload promotional images for your offers</Text>
      <TouchableOpacity 
        style={styles.emptyUploadButton}
        onPress={() => navigation.navigate('ImageUploader')}
      >
        <Ionicons name="cloud-upload-outline" size={22} color="#FFF" />
        <Text style={styles.emptyUploadButtonText}>Upload Image</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerTitleContainer}>
          <Ionicons name="images" size={24} color="#4a90e2" />
          <Text style={styles.headerTitle}>Promotional Images</Text>
        </View>
        <TouchableOpacity 
          style={styles.uploadButton}
          onPress={() => navigation.navigate('ImageUploader')}
        >
          <Ionicons name="cloud-upload-outline" size={18} color="#FFF" />
          <Text style={styles.uploadButtonText}>Upload</Text>
        </TouchableOpacity>
      </View>

      {loading && !refreshing ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4a90e2" />
          <Text style={styles.loadingText}>Loading images...</Text>
        </View>
      ) : images.length === 0 ? (
        renderEmptyState()
      ) : (
        <FlatList
          data={images}
          renderItem={renderItem}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.listContainer}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={["#4a90e2"]}
            />
          }
        />
      )}

      <Modal
        animationType="fade"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <TouchableOpacity
            style={styles.closeButtonContainer}
            onPress={() => setModalVisible(false)}
          >
            <Ionicons name="close-circle" size={36} color="#fff" />
          </TouchableOpacity>
          {selectedImage && (
            <Image
              source={{ uri: selectedImage }}
              style={styles.fullImage}
              resizeMode="contain"
            />
          )}
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#ffffff',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  headerTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginLeft: 8,
  },
  uploadButton: {
    backgroundColor: '#4a90e2',
    padding: 10,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  uploadButtonText: {
    color: '#ffffff',
    fontWeight: '600',
    marginLeft: 6,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    color: '#757575',
  },
  listContainer: {
    padding: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
    marginTop: 16,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#757575',
    marginTop: 8,
    textAlign: 'center',
  },
  emptyUploadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#4a90e2',
    padding: 12,
    borderRadius: 8,
    marginTop: 24,
  },
  emptyUploadButtonText: {
    color: '#FFF',
    fontWeight: '600',
    marginLeft: 8,
  },
  imageCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    marginBottom: 16,
    padding: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusText: {
    fontSize: 14,
    fontWeight: '500',
    marginRight: 8,
  },
  activeText: {
    color: '#4CAF50',
  },
  inactiveText: {
    color: '#F44336',
  },
  cardBody: {
    flexDirection: 'row',
    gap: 12,
  },
  thumbnailContainer: {
    width: 100,
    height: 100,
    borderRadius: 8,
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: '#f0f0f0', // Background for when image is loading
  },
  thumbnail: {
    width: '100%',
    height: '100%',
  },
  previewOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 6,
  },
  previewText: {
    color: '#fff',
    fontSize: 12,
    marginLeft: 4,
  },
  itemDetails: {
    flex: 1,
    justifyContent: 'space-between',
  },
  urlPreview: {
    maxHeight: 40,
    overflow: 'hidden',
  },
  urlText: {
    fontSize: 13,
    color: '#555',
  },
  actionButtons: {
    flexDirection: 'row',
    marginTop: 8,
  },
  copyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#e0f2f1',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
  },
  actionButtonText: {
    marginLeft: 6,
    color: '#00796b',
    fontWeight: '500',
  },
  imageId: {
    fontSize: 14,
    color: '#444',
  },
  idValue: {
    fontWeight: '700',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  fullImage: {
    width: width * 0.9,
    height: width * 0.9,
    borderRadius: 12,
  },
  closeButtonContainer: {
    position: 'absolute',
    top: 40,
    right: 20,
    zIndex: 10,
  },
});

export default OfferImagesScreen;
