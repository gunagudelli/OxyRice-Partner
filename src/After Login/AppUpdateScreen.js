import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  ActivityIndicator,
  SafeAreaView,
  ScrollView,
  Alert,
  Linking,
  Platform
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import BASE_URL from "../../config";
import axios from 'axios';
import { useNavigation } from '@react-navigation/native';

const json = require('../../app.json');

const AppUpdateScreen = () => {
  const navigation = useNavigation();
  const [checking, setChecking] = useState(true);
  const [updateStatus, setUpdateStatus] = useState(null);
  const [currentVersion, setCurrentVersion] = useState("");
  const [displayVersion, setDisplayVersion] = useState("");
  const [platform, setPlatform] = useState("");
  const [lastChecked, setLastChecked] = useState("");
  const [error, setError] = useState(null);

  // Automatically check for updates when component mounts
  useEffect(() => {
    // Set platform and store appropriate version identifiers
    console.log("Checking for updates...");
    if (Platform.OS === "ios") {
      setPlatform("IOS");
      // For iOS, store the build number as an integer
      setCurrentVersion(parseInt(json.expo?.ios?.buildNumber || "1", 10));
    } else {
      setPlatform("ANDROID");
      // For Android, store the version code as an integer
      setCurrentVersion(parseInt(json.expo?.android?.versionCode || "1", 10));
    }
    
    // Store display version (semantic version like 1.0.14)
    setDisplayVersion(json.expo?.version || "1.0.0");
    
    
  }, []);

  useEffect(() => {
    // Then check for updates
    checkForUpdates();
  }, [platform]);

  const checkForUpdates = async () => {
    // Don't check if platform is not set yet
    if (!platform) return;
    console.log("Checking for updates...");
    setChecking(true);
    setError(null);
    
    try {
      const response = await axios.get(
        `${BASE_URL}product-service/getAllVersions?userType=SELLER&versionType=${platform}`
      );
  
      const data = response.data;
      
      console.log("Update data:", data);
      console.log("Current version (local):", currentVersion);
      
      // Set the current time as last checked
      const now = new Date();
      setLastChecked(now.toLocaleTimeString() + ", " + now.toLocaleDateString());
      
      // Process the update data - handle both array and single object response
      if (data) {
        let latestVersion;
        
        // Check if data is an array or a single object
        if (Array.isArray(data) && data.length > 0) {
          // Find the latest version in the array by version code/build number
          latestVersion = data.reduce((latest, current) => {
            const currentVersionNum = parseInt(current.version, 10);
            const latestVersionNum = parseInt(latest.version, 10);
            return (currentVersionNum > latestVersionNum) ? current : latest;
          }, data[0]);
        } else {
          // Single object response
          latestVersion = data;
        }
        
        // Parse the server version as integer for proper comparison
        const latestVersionNum = parseInt(latestVersion.version, 10);
        
        // console.log("Latest version from server:", latestVersionNum);
        
        // Convert timestamp to readable date if it exists
        let releaseDate = "Unknown";
        if (latestVersion.createdOn) {
          const date = new Date(parseInt(latestVersion.createdOn));
          releaseDate = date.toLocaleDateString();
        }
        
        // Compare numeric values to determine if update is needed
        const needsUpdate = latestVersionNum > currentVersion;
        
        console.log("Update needed:", needsUpdate, 
                   "Latest:", latestVersionNum, 
                   "Current:", currentVersion);
        
        setUpdateStatus({
          available: needsUpdate,
          currentBuild: currentVersion.toString(),
          newBuild: latestVersion.version,
          displayVersion: displayVersion,
          versionType: latestVersion.versionType,
          createdOn: releaseDate,
          userType: latestVersion.userType
        });
        
        // Navigate to Login screen if no update is needed
        if (!needsUpdate) {
          // Use a short timeout to allow the UI to update before navigating
          setTimeout(() => {
            navigation.navigate('LoginWithPassword');
          }, 1000); // 1 second delay for visual feedback
        }
      } else {
        setUpdateStatus({ available: false });
        // Navigate to Login screen as no update data means no update needed
        setTimeout(() => {
          navigation.navigate('LoginWithPassword');
        }, 1000);
      }
    } catch (err) {
      console.error("Error checking for updates:", err);
      setError(err.message);
      setUpdateStatus({ available: false });
    } finally {
      setChecking(false);
    }
  };

  const handleUpdate = () => {
    if (!updateStatus || !updateStatus.newBuild) return;
    
    Alert.alert(
      "Update Available",
      `Would you like to update to the latest version?`,
      [
        {
          text: "Update Now", 
          onPress: () => {
            // Link to the appropriate store based on platform
            let storeUrl = '';
            if (Platform.OS === 'ios') {
              // Using iOS bundle identifier
              // storeUrl = 'https://apps.apple.com/in/app/askoxy-ai-rice-delivery/id6738732000';
            } else {
              // Using Android package name
              storeUrl = 'market://details?id=com.oxyrice.pantner';
              // Fallback for devices without Play Store
              const playStoreUrl = 'https://play.google.com/store/apps/details?id=com.oxyrice.pantner';
              
              Linking.canOpenURL(storeUrl).then(supported => {
                return Linking.openURL(supported ? storeUrl : playStoreUrl);
              }).catch(err => {
                console.error('Error opening store:', err);
                Alert.alert('Error', 'Could not open app store.');
              });
              return;
            }
            
            Linking.openURL(storeUrl).catch(err => {
              console.error('Error opening store:', err);
              Alert.alert('Error', 'Could not open app store.');
            });
          }
        },
        {
          text: "Later",
          style: "cancel",
          onPress: () => {
            // Navigate to Login screen even if user chooses "Later"
            navigation.navigate('LoginWithPassword');
          }
        }
      ]
    );
  };

  const handleLater = () => {
    // Navigate to Login screen
    navigation.navigate('LoginWithPassword');
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="auto" />
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.content}>
          <Text style={styles.title}>App Update</Text>
          
          <View style={styles.infoCard}>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Current Version:</Text>
              <Text style={styles.infoValue}>{displayVersion}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Build Number:</Text>
              <Text style={styles.infoValue}>{currentVersion}</Text>
            </View>
            {lastChecked ? (
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Last Checked:</Text>
                <Text style={styles.infoValue}>{lastChecked}</Text>
              </View>
            ) : null}
          </View>
          
          {checking ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#4287f5" />
              <Text style={styles.loadingText}>Checking for updates...</Text>
            </View>
          ) : error ? (
            <View style={styles.errorCard}>
              <Text style={styles.errorTitle}>Update Check Failed</Text>
              <Text style={styles.errorText}>{error}</Text>
              <TouchableOpacity style={styles.retryButton} onPress={checkForUpdates}>
                <Text style={styles.buttonText}>Retry</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.downloadButton, { marginTop: 12 }]} 
                onPress={() => navigation.navigate('LoginWithPassword')}>
                <Text style={styles.buttonText}>Continue to Login</Text>
              </TouchableOpacity>
            </View>
          ) : updateStatus && updateStatus.available ? (
            <View style={styles.updateCard}>
              <Text style={styles.updateAvailableTitle}>Update Available!</Text>
              <Text style={styles.updateText}>A new version is ready to download.</Text>
              
              <View style={styles.divider} />
              
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Current Build:</Text>
                <Text style={styles.infoValue}>{updateStatus.currentBuild}</Text>
              </View>
              
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>New Build:</Text>
                <Text style={styles.infoValue}>{updateStatus.newBuild}</Text>
              </View>
              
              {updateStatus.versionType && (
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Platform:</Text>
                  <Text style={styles.infoValue}>{updateStatus.versionType}</Text>
                </View>
              )}
              
              {updateStatus.createdOn && updateStatus.createdOn !== "Unknown" && (
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Released On:</Text>
                  <Text style={styles.infoValue}>{updateStatus.createdOn}</Text>
                </View>
              )}
              
              {updateStatus.userType && (
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>User Type:</Text>
                  <Text style={styles.infoValue}>{updateStatus.userType}</Text>
                </View>
              )}
              
              <TouchableOpacity style={styles.downloadButton} onPress={handleUpdate}>
                <Text style={styles.buttonText}>Update Now</Text>
              </TouchableOpacity>
              
              {/* <TouchableOpacity style={styles.laterButton} onPress={handleLater}>
                <Text style={styles.laterButtonText}>Later</Text>
              </TouchableOpacity> */}
            </View>
          ) : (
            <View style={styles.upToDateCard}>
              <Text style={styles.upToDateText}>Your app is up to date</Text>
              <Text style={styles.versionText}>Version: {displayVersion}</Text>
              <Text style={styles.versionText}>Build: {currentVersion}</Text>
              <Text style={styles.versionText}>Redirecting to login...</Text>
            </View>
          )}
          
          {/* {!checking && (
            <TouchableOpacity style={styles.checkAgainButton} onPress={checkForUpdates}>
              <Text style={styles.checkAgainText}>Check Again</Text>
            </TouchableOpacity>
          )} */}

          {/* DEBUG VIEW - Remove in production */}
          {/* <View style={styles.debugCard}>
            <Text style={styles.debugTitle}>Debug Information</Text>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Platform:</Text>
              <Text style={styles.infoValue}>{platform}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Current Build Number:</Text>
              <Text style={styles.infoValue}>{currentVersion}</Text>
            </View>
            {updateStatus && (
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Server Latest Build:</Text>
                <Text style={styles.infoValue}>{updateStatus.newBuild}</Text>
              </View>
            )}
            {updateStatus && (
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Update Needed:</Text>
                <Text style={styles.infoValue}>{updateStatus.available ? "Yes" : "No"}</Text>
              </View>
            )}
          </View> */}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
    marginTop: 30,
    // alignItems: 'center',
    // alignSelf: 'center',
  },
  scrollContainer: {
    flexGrow: 1,
  },
  content: {
    flex: 1,
    padding: 16,
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 24,
    color: '#333',
  },
  infoCard: {
    width: '100%',
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
    elevation: 2,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  infoLabel: {
    color: '#666',
  },
  infoValue: {
    fontWeight: '500',
  },
  loadingContainer: {
    marginTop: 20,
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#555',
  },
  updateCard: {
    width: '100%',
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 20,
    marginTop: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.23,
    shadowRadius: 2.62,
    elevation: 4,
  },
  updateAvailableTitle: {
    color: '#4287f5',
    fontWeight: 'bold',
    fontSize: 20,
    marginBottom: 8,
    textAlign: 'center',
  },
  updateText: {
    marginBottom: 8,
    fontSize: 16,
    textAlign: 'center',
  },
  divider: {
    height: 1,
    backgroundColor: '#e0e0e0',
    width: '100%',
    marginVertical: 15,
  },
  downloadButton: {
    backgroundColor: '#4287f5',
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 16,
    marginBottom: 10,
  },
  laterButton: {
    padding: 12,
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 16,
  },
  laterButtonText: {
    color: '#666',
    fontSize: 15,
  },
  upToDateCard: {
    width: '100%',
    backgroundColor: '#e6f7e6',
    borderRadius: 8,
    padding: 20,
    marginTop: 10,
    alignItems: 'center',
  },
  upToDateText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2e8b57',
    marginBottom: 8,
  },
  versionText: {
    fontSize: 14,
    color: '#555',
    marginBottom: 4,
  },
  errorCard: {
    width: '100%',
    backgroundColor: '#ffecec',
    borderRadius: 8,
    padding: 20,
    marginTop: 10,
    alignItems: 'center',
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#e74c3c',
    marginBottom: 8,
  },
  errorText: {
    fontSize: 14,
    color: '#555',
    marginBottom: 16,
    textAlign: 'center',
  },
  retryButton: {
    backgroundColor: '#e74c3c',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    width: '80%',
  },
  checkAgainButton: {
    marginTop: 24,
    padding: 10,
  },
  checkAgainText: {
    color: '#4287f5',
    fontSize: 16,
  },
  debugCard: {
    width: '100%',
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 16,
    marginTop: 24,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  debugTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#555',
  }
});

export default AppUpdateScreen;