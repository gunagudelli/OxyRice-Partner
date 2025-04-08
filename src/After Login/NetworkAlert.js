import React, { useEffect, useState, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Dimensions, TouchableOpacity } from 'react-native';
import NetInfo from '@react-native-community/netinfo';

const { width, height } = Dimensions.get('window');

const NetworkAlert = () => {
  const [networkStatus, setNetworkStatus] = useState('connected'); // 'connected', 'slow', 'disconnected', 'restored'
  const [modalVisible, setModalVisible] = useState(false);
  const scaleAnim = useState(new Animated.Value(0))[0];
  const timeoutRef = useRef(null);
  const prevStatusRef = useRef('connected');

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(state => {
      const isDisconnected = !state.isConnected || !state.isInternetReachable;
      const isSlow = 
        state.type === 'cellular' &&
        (state.details.cellularGeneration === '2g' || state.details.cellularGeneration === '3g');

      if (isDisconnected) {
        setNetworkStatus('disconnected');
        prevStatusRef.current = 'disconnected';
        setModalVisible(true);
        
        // Clear any existing timeout when disconnected
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
          timeoutRef.current = null;
        }
      } else if (isSlow) {
        setNetworkStatus('slow');
        prevStatusRef.current = 'slow';
        setModalVisible(true);
        
        // Clear any existing timeout when slow
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
          timeoutRef.current = null;
        }
      } else if (prevStatusRef.current === 'disconnected' || prevStatusRef.current === 'slow') {
        // Connection was restored
        setNetworkStatus('restored');
        setModalVisible(true);
        
        // Do not auto-dismiss when connection is restored
        // User must click the OK button
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
          timeoutRef.current = null;
        }
      } else {
        setNetworkStatus('connected');
        setModalVisible(false);
      }
    });

    return () => {
      unsubscribe();
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (modalVisible) {
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 5,
        tension: 40,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(scaleAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  }, [modalVisible]);

  const hideModal = () => {
    Animated.timing(scaleAnim, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      setModalVisible(false);
      setNetworkStatus('connected');
    });
  };

  if (!modalVisible) return null;

  const getIconAndColor = () => {
    switch (networkStatus) {
      case 'slow':
        return { icon: '⚠️', color: '#f39c12', bgColor: '#fff9e6' };
      case 'disconnected':
        return { icon: '❌', color: '#e74c3c', bgColor: '#fde9e7' };
      case 'restored':
        return { icon: '✅', color: '#2ecc71', bgColor: '#e8f8f0' };
      default:
        return { icon: '🔔', color: '#3498db', bgColor: '#e6f3fb' };
    }
  };

  const { icon, color, bgColor } = getIconAndColor();

  const getMessage = () => {
    switch (networkStatus) {
      case 'slow':
        return 'Slow Network Detected';
      case 'disconnected':
        return 'No Internet Connection';
      case 'restored':
        return 'Connection Restored!';
      default:
        return 'Network Status';
    }
  };
 
  // Get button text based on network status
  const getButtonText = () => {
    if (networkStatus === 'restored') {
      return 'OK';
    }
    return 'Dismiss';
  };

  return (
    <View style={styles.overlay}>
      <Animated.View 
        style={[
          styles.modalContainer, 
          { backgroundColor: bgColor, borderColor: color },
          { transform: [{ scale: scaleAnim }] }
        ]}
      >
        <View style={styles.iconContainer}>
          <Text style={styles.icon}>{icon}</Text>
        </View>
        <Text style={[styles.title, { color }]}>{getMessage()}</Text>
        {/* <Text style={styles.description}>{getDescription()}</Text> */}
        
        {/* Only show button for restored connection or slow network */}
        {(networkStatus === 'restored' || networkStatus === 'slow') && (
          <TouchableOpacity 
            style={[styles.button, { backgroundColor: color }]} 
            onPress={hideModal}
          >
            <Text style={styles.buttonText}>{getButtonText()}</Text>
          </TouchableOpacity>
        )}
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 9999,
  },
  modalContainer: {
    width: width * 0.85,
    padding: 20,
    borderRadius: 15,
    backgroundColor: '#fff',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.27,
    shadowRadius: 4.65,
    elevation: 6,
    borderWidth: 2,
  },
  iconContainer: {
    marginBottom: 15,
  },
  icon: {
    fontSize: 50,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  description: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
    color: '#555',
    lineHeight: 22,
  },
  button: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 25,
    marginTop: 5,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  }
});

export default NetworkAlert;