import React, { useEffect, useState, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Dimensions, TouchableOpacity } from 'react-native';
import NetInfo from '@react-native-community/netinfo';

const { width } = Dimensions.get('window');

const NetworkAlert = () => {
  const [networkStatus, setNetworkStatus] = useState('connected');
  const [networkType, setNetworkType] = useState('wifi');
  const [networkSpeed, setNetworkSpeed] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const scaleAnim = useState(new Animated.Value(0))[0];
  const prevStatusRef = useRef('connected');

  useEffect(() => {
    // Initial network check
    NetInfo.fetch().then(checkNetworkStatus);
    
    // Continuous monitoring
    const unsubscribe = NetInfo.addEventListener(checkNetworkStatus);
  
    return () => unsubscribe();
  }, []);
  
  // Separated network checking logic for better organization and debugging
  const checkNetworkStatus = (state) => {
    console.log('Network state:', state);
    
    // Update network type (wifi or mobile)
    setNetworkType(state.type);
    
    // Get network speed info
    let speedInfo = '';
    if (state.type === 'cellular' && state.details && state.details.cellularGeneration) {
      speedInfo = state.details.cellularGeneration.toUpperCase();
    } else if (state.type === 'wifi' && state.details && state.details.strength) {
      const strength = state.details.strength;
      if (strength > 70) speedInfo = 'Strong';
      else if (strength > 40) speedInfo = 'Good';
      else if (strength > 20) speedInfo = 'Weak';
      else speedInfo = 'Very Weak';
    }
    setNetworkSpeed(speedInfo);
    
    // More reliable detection of network states
    const isDisconnected = state.isConnected === false || state.isInternetReachable === false;
    
    // Improved slow network detection
    let isSlow = false;
    if (state.type === 'cellular' && 
        state.details && 
        state.details.cellularGeneration && 
        ['2g', '3g'].includes(state.details.cellularGeneration)) {
      isSlow = true;
    } else if (state.type === 'wifi' && 
               state.details && 
               state.details.strength !== null && 
               state.details.strength < 30) {
      isSlow = true;
    }
    
    console.log('Network analysis:', { isDisconnected, isSlow, prevStatus: prevStatusRef.current });
    
    const prevStatus = prevStatusRef.current;

    if (isDisconnected) {
      if (prevStatus !== 'disconnected') {
        console.log('Setting status to disconnected');
        setNetworkStatus('disconnected');
        prevStatusRef.current = 'disconnected';
        setModalVisible(true);
      }
    } else if (isSlow) {
      if (prevStatus !== 'slow') {
        console.log('Setting status to slow');
        setNetworkStatus('slow');
        prevStatusRef.current = 'slow';
        setModalVisible(true);
      }
    } else if (prevStatus === 'disconnected' || prevStatus === 'slow') {
      // We were offline/slow before, now we're back
      console.log('Setting status to restored');
      setNetworkStatus('restored');
      prevStatusRef.current = 'connected';
      setModalVisible(true);

      // Auto-dismiss after 3 seconds
      setTimeout(() => {
        setModalVisible(false);
        setNetworkStatus('connected');
      }, 3000);
    }
  };
  
  useEffect(() => {
    if (modalVisible) {
      Animated.spring(scaleAnim, {
        toValue: 1,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(scaleAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }).start();
    }
  }, [modalVisible]);

  const hideModal = () => {
    setModalVisible(false);
    setNetworkStatus('connected');
  };

  if (!modalVisible) return null;

  const getContent = () => {
    const isWifi = networkType === 'wifi';
    const connectionType = isWifi ? 'WiFi' : 'Mobile data';
    const speedText = networkSpeed ? ` (${networkSpeed})` : '';
    
    switch (networkStatus) {
      case 'slow':
        return {
          emoji: isWifi ? '📶' : '📱',
          emojiSize: 60,
          title: 'Slow Internet Connection',
          description: `Your ${connectionType}${speedText} connection is slow. Some features may not work properly.`,
          button: 'Dismiss',
          canDismiss: true,
        };
      case 'disconnected':
        return {
          emoji: '📴',
          emojiSize: 65,
          title: 'No Internet Connection',
          description: `Your ${connectionType} is disconnected. Please check your connection settings.`,
          button: 'Try Again',
          canDismiss: true,
        };
      case 'restored':
        return {
          emoji: isWifi ? '✅' : '🔄',
          emojiSize: 60,
          title: 'Connection Restored',
          description: `Your ${connectionType}${speedText} connection is back online!`,
          button: '',
          canDismiss: false,
        };
      default:
        return {
          emoji: '✅',
          emojiSize: 60,
          title: '',
          description: '',
          button: '',
          canDismiss: true,
        };
    }
  };

  const { emoji, emojiSize, title, description, button, canDismiss } = getContent();

  return (
    <View style={styles.overlay}>
      <Animated.View style={[styles.modalContainer, { transform: [{ scale: scaleAnim }] }]}>
        {canDismiss && (
          <TouchableOpacity 
            style={styles.closeButton} 
            onPress={hideModal}
            hitSlop={{ top: 15, bottom: 15, left: 15, right: 15 }}
          >
            <Text style={styles.closeButtonText}>✕</Text>
          </TouchableOpacity>
        )}
        
        <View style={styles.emojiContainer}>
          <Text style={[styles.emoji, { fontSize: emojiSize }]}>{emoji}</Text>
        </View>
        
        <Text style={[styles.title, 
          networkStatus === 'disconnected' ? styles.titleError : 
          networkStatus === 'slow' ? styles.titleWarning : 
          styles.titleSuccess]}>{title}</Text>
        
        <Text style={styles.networkType}>
          {networkType === 'wifi' ? 'WiFi' : 'Mobile Data'}
          {networkSpeed ? ` (${networkSpeed})` : ''}
        </Text>
        
        <Text style={styles.description}>{description}</Text>

        {button && (
          <TouchableOpacity 
            style={[styles.button, 
              networkStatus === 'disconnected' ? styles.buttonError : 
              networkStatus === 'slow' ? styles.buttonWarning : 
              styles.buttonSuccess]} 
            onPress={networkStatus === 'disconnected' ? 
              () => {
                NetInfo.fetch().then(checkNetworkStatus);
              } : hideModal}
          >
            <Text style={styles.buttonText}>{button}</Text>
          </TouchableOpacity>
        )}
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 999,
  },
  modalContainer: {
    width: width * 0.85,
    padding: 24,
    borderRadius: 16,
    backgroundColor: '#fff',
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    position: 'relative',
    minHeight: 280,
    justifyContent: 'center',
  },
  closeButton: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#f2f2f2',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  closeButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#555',
  },
  emojiContainer: {
    width: width * 0.3,
    height: 90,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  emoji: {
    marginBottom: 10,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 8,
    textAlign: 'center',
  },
  networkType: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 12,
    textAlign: 'center',
    color: '#666',
  },
  titleError: {
    color: '#E53935',
  },
  titleWarning: {
    color: '#FB8C00',
  },
  titleSuccess: {
    color: '#43A047',
  },
  description: {
    fontSize: 16,
    color: '#555',
    marginBottom: 24,
    textAlign: 'center',
    lineHeight: 24,
  },
  button: {
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 25,
    elevation: 2,
  },
  buttonError: {
    backgroundColor: '#E53935',
  },
  buttonWarning: {
    backgroundColor: '#FB8C00',
  },
  buttonSuccess: {
    backgroundColor: '#43A047',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default NetworkAlert;