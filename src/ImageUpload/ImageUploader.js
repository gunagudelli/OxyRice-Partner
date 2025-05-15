import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  SafeAreaView,
  ScrollView
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import axios from 'axios';
import { MaterialIcons } from '@expo/vector-icons';

// You'll need to configure this with your actual API base URL
import BASE_URL from "../../config";
import { useSelector } from "react-redux";
const ImageUploader = () => {
  const [image, setImage] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);

  const requestPermission = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (!permissionResult.granted) {
      Alert.alert(
        "Permission Required", 
        "This app needs access to your photo library to upload images.",
        [{ text: "OK" }]
      );
      return false;
    }
    return true;
  };

  const selectImage = async () => {
    // Reset states
    setUploadSuccess(false);
    
    // Check permissions first
    const hasPermission = await requestPermission();
    if (!hasPermission) return;

    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets.length > 0) {
        const selectedAsset = result.assets[0];
        setImage(selectedAsset.uri);
      }
    } catch (error) {
      console.error("Error selecting image:", error);
      Alert.alert("Error", "Failed to select image");
    }
  };

  const uploadImage = async () => {
    if (!image) {
      Alert.alert("No Image", "Please select an image first");
      return;
    }

    setUploading(true);

    try {
      const fileName = image.split('/').pop();
      const fileType = fileName.split('.').pop().toLowerCase() === 'png' ? 'image/png' : 'image/jpeg';

      const formData = new FormData();
      formData.append("multiPart", {
        uri: image,
        type: fileType,
        name: fileName,
      });
      formData.append("fileType", "kyc");

      const response = await axios.post(
        `${BASE_URL}product-service/offerImageUpload`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
          timeout: 30000, // 30 seconds timeout
        }
      );

      console.log("Upload success:", response.data);
      setUploadSuccess(true);
      Alert.alert("Success", "Image uploaded successfully");
    } catch (error) {
      console.error("Upload error:", error);
      let errorMessage = "Failed to upload image. Please try again.";
      
      if (error.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        errorMessage = error.response.data?.message || 
                       `Server error: ${error.response.status}`;
        console.error("Error response data:", error.response.data);
      } else if (error.request) {
        // The request was made but no response was received
        errorMessage = "No response from server. Please check your connection.";
      }
      
      Alert.alert("Upload Failed", errorMessage);
    } finally {
      setUploading(false);
    }
  };

  const takePhoto = async () => {
    // Reset states
    setUploadSuccess(false);
    
    // Request camera permissions
    const cameraPermission = await ImagePicker.requestCameraPermissionsAsync();
    
    if (!cameraPermission.granted) {
      Alert.alert("Permission Required", "Camera access is needed to take photos");
      return;
    }

    try {
      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets.length > 0) {
        const capturedAsset = result.assets[0];
        setImage(capturedAsset.uri);
      }
    } catch (error) {
      console.error("Error taking photo:", error);
      Alert.alert("Error", "Failed to capture photo");
    }
  };

  const clearImage = () => {
    setImage(null);
    setUploadSuccess(false);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.title}>Image Upload</Text>
          <Text style={styles.subtitle}>Select or take a photo to upload</Text>
        </View>

        <View style={styles.imageContainer}>
          {image ? (
            <View style={styles.imageWrapper}>
              <Image source={{ uri: image }} style={styles.image} />
              <TouchableOpacity 
                style={styles.clearButton} 
                onPress={clearImage}
                disabled={uploading}
              >
                <MaterialIcons name="close" size={20} color="#FFF" />
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.placeholderContainer}>
              <MaterialIcons name="image" size={60} color="#ccc" />
              <Text style={styles.placeholderText}>No image selected</Text>
            </View>
          )}
        </View>

        <View style={styles.actionContainer}>
          <TouchableOpacity 
            style={[styles.button, styles.galleryButton]} 
            onPress={selectImage}
            disabled={uploading}
          >
            <MaterialIcons name="photo-library" size={22} color="#FFF" />
            <Text style={styles.buttonText}>Gallery</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.button, styles.cameraButton]} 
            onPress={takePhoto}
            disabled={uploading}
          >
            <MaterialIcons name="camera-alt" size={22} color="#FFF" />
            <Text style={styles.buttonText}>Camera</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity 
          style={[
            styles.uploadButton, 
            !image && styles.disabledButton,
            uploadSuccess && styles.successButton
          ]} 
          onPress={uploadImage}
          disabled={!image || uploading || uploadSuccess}
        >
          {uploading ? (
            <ActivityIndicator color="#FFF" size="small" />
          ) : uploadSuccess ? (
            <>
              <MaterialIcons name="check" size={22} color="#FFF" />
              <Text style={styles.buttonText}>Uploaded</Text>
            </>
          ) : (
            <>
              <MaterialIcons name="cloud-upload" size={22} color="#FFF" />
              <Text style={styles.buttonText}>Upload Image</Text>
            </>
          )}
        </TouchableOpacity>

        {uploadSuccess && (
          <Text style={styles.successText}>
            Image uploaded successfully!
          </Text>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollContent: {
    padding: 20,
  },
  header: {
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
  },
  imageContainer: {
    width: '100%',
    height: 250,
    marginBottom: 20,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#e1e1e1',
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageWrapper: {
    width: '100%',
    height: '100%',
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  clearButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: 'rgba(0,0,0,0.6)',
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  placeholderText: {
    color: '#999',
    marginTop: 10,
    fontSize: 16,
  },
  actionContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 8,
    flex: 0.48,
  },
  galleryButton: {
    backgroundColor: '#5e6ad2',
  },
  cameraButton: {
    backgroundColor: '#4caf50',
  },
  uploadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#2196f3',
    paddingVertical: 14,
    borderRadius: 8,
    marginTop: 10,
  },
  disabledButton: {
    backgroundColor: '#b0bec5',
    opacity: 0.7,
  },
  successButton: {
    backgroundColor: '#43a047',
  },
  buttonText: {
    color: '#FFF',
    fontWeight: '600',
    fontSize: 16,
    marginLeft: 8,
  },
  successText: {
    textAlign: 'center',
    marginTop: 16,
    color: '#43a047',
    fontSize: 16,
    fontWeight: '500',
  },
});

export default ImageUploader;