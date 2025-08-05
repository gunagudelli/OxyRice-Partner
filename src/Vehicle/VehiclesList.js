import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Alert, FlatList, RefreshControl, TouchableOpacity, Modal } from 'react-native';
import { TextInput, Button, ActivityIndicator, Searchbar, FAB } from 'react-native-paper';
import axios from 'axios';
import BASE_URL from '../../config';
import { ViewPagerAndroidComponent } from 'react-native';

const VehiclesList = ({ navigation }) => {
  const [vehiclesList, setVehiclesList] = useState([]);
  const [filteredVehicles, setFilteredVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [error, setError] = useState('');
  
  // Modal states
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [editVehicleName, setEditVehicleName] = useState('');
  const [editVehicleNumber, setEditVehicleNumber] = useState('');
  const [updateLoading, setUpdateLoading] = useState(false);
  const [editErrors, setEditErrors] = useState({
    vehicleName: false,
    vehicleNumber: false
  });
  const [isEditMode, setIsEditMode] = useState(false); // Track if modal is for edit or add

  useEffect(() => {
    fetchVehiclesListfunc();
  }, []);

  useEffect(() => {
    // Filter vehicles based on search query
    if (searchQuery.trim() === '') {
      setFilteredVehicles(vehiclesList);
    } else {
      const filtered = vehiclesList.filter(vehicle =>
        vehicle.vehicleName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        vehicle.vehicleNumber.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredVehicles(filtered);
    }
  }, [searchQuery, vehiclesList]);

  function fetchVehiclesListfunc() {
    setError('');
    
    axios.get(`${BASE_URL}user-service/getVehiclesReports`)
      .then(response => {
        console.log('Vehicles List:', response.data);
        setVehiclesList(response.data || []);
        setFilteredVehicles(response.data || []);
      })
      .catch(error => {
        console.error('Error fetching vehicles list:', error);
        
        let errorMessage = 'Failed to fetch vehicles list. Please try again later.';
        
        if (error.response) {
          if (error.response.status === 404) {
            errorMessage = 'Vehicles service not found.';
          } else if (error.response.status === 500) {
            errorMessage = 'Server error. Please try again later.';
          } else if (error.response.data?.message) {
            errorMessage = error.response.data.message;
          }
        } else if (error.request) {
          errorMessage = 'Network error. Please check your internet connection.';
        }
        
        setError(errorMessage);
        Alert.alert('Error', errorMessage);
      })
      .finally(() => {
        setLoading(false);
        setRefreshing(false);
      });
  }

  const onRefresh = () => {
    setRefreshing(true);
    fetchVehiclesListfunc();
  };

  const handleRetry = () => {
    setLoading(true);
    fetchVehiclesListfunc();
  };

  const openEditModal = (vehicle) => {
    setSelectedVehicle(vehicle);
    setEditVehicleName(vehicle.vehicleName);
    setEditVehicleNumber(vehicle.vehicleNumber);
    setEditErrors({ vehicleName: false, vehicleNumber: false });
    setIsEditMode(true); // Set to edit mode
    setModalVisible(true);
  };

  const openAddModal = () => {
    setSelectedVehicle(null);
    setEditVehicleName('');
    setEditVehicleNumber('');
    setEditErrors({ vehicleName: false, vehicleNumber: false });
    setIsEditMode(false); // Set to add mode
    setModalVisible(true);
  };

  const closeModal = () => {
    setModalVisible(false);
    setSelectedVehicle(null);
    setEditVehicleName('');
    setEditVehicleNumber('');
    setEditErrors({ vehicleName: false, vehicleNumber: false });
    setIsEditMode(false);
  };

  const validateFields = () => {
    const newErrors = {
      vehicleName: !editVehicleName.trim(),
      vehicleNumber: !editVehicleNumber.trim()
    };
    
    setEditErrors(newErrors);
    return !newErrors.vehicleName && !newErrors.vehicleNumber;
  };

  const handleSubmitVehicle = () => {
    if (!validateFields()) {
      return;
    }

    setUpdateLoading(true);

    const vehicleData = {
      vehicleName: editVehicleName.trim().toUpperCase(),
      vehicleNumber: editVehicleNumber.trim().toUpperCase(),
      ...(isEditMode && { id: selectedVehicle.id }) // Include id only in edit mode
    };

    const request=axios.patch(`${BASE_URL}user-service/vehiclesReportUpdate`, vehicleData)

    request
      .then(response => {
        console.log(`${isEditMode ? 'Vehicle updated' : 'Vehicle created'} successfully:`, response.data);
        
        if (isEditMode) {
          // Update the vehicle in the local state
          const updatedVehicles = vehiclesList.map(vehicle => 
            vehicle.id === selectedVehicle.id 
              ? { ...vehicle, ...vehicleData }
              : vehicle
          );
          setVehiclesList(updatedVehicles);
          setFilteredVehicles(updatedVehicles);
        } else {
          // Add new vehicle to the local state
          setVehiclesList([...vehiclesList, response.data]);
          setFilteredVehicles([...vehiclesList, response.data]);
        }
        
        Alert.alert(
          'Success',
          isEditMode ? 'Vehicle updated successfully!' : 'Vehicle created successfully!',
          [{ text: 'OK', onPress: closeModal }]
        );
      })
      .catch(error => {
        console.error(`Error ${isEditMode ? 'updating' : 'creating'} vehicle:`, error);
        
        let errorMessage = `Failed to ${isEditMode ? 'update' : 'create'} vehicle. Please try again.`;
        
        if (error.response) {
          if (error.response.status === 404) {
            errorMessage = 'Vehicle not found.';
          } else if (error.response.status === 409) {
            errorMessage = 'Vehicle number already exists.';
          } else if (error.response.status === 500) {
            errorMessage = 'Server error. Please try again later.';
          } else if (error.response.data?.message) {
            errorMessage = error.response.data.message;
          }
        } else if (error.request) {
          errorMessage = 'Network error. Please check your internet connection.';
        }
        
        Alert.alert(`${isEditMode ? 'Update' : 'Create'} Failed`, errorMessage);
      })
      .finally(() => {
        setUpdateLoading(false);
      });
  };

  const onEditNameChange = (text) => {
    setEditVehicleName(text);
    if (text.trim() && editErrors.vehicleName) {
      setEditErrors(prev => ({ ...prev, vehicleName: false }));
    }
  };

  const onEditNumberChange = (text) => {
    setEditVehicleNumber(text);
    if (text.trim() && editErrors.vehicleNumber) {
      setEditErrors(prev => ({ ...prev, vehicleNumber: false }));
    }
  };

  const renderVehicleItem = ({ item, index }) => (
    <View>
      <View style={[styles.vehicleCard, { marginTop: index === 0 ? 8 : 0 }]}>
        <View style={styles.cardContent}>
          <View style={styles.vehicleHeader}>
            <View style={styles.vehicleInfo}>
              <Text style={styles.vehicleName}>{item.vehicleName}</Text>
              <Text style={styles.vehicleNumber}>{item.vehicleNumber}</Text>
            </View>
            <View style={styles.vehicleActions}>
              <TouchableOpacity
                style={styles.updateButton}
                onPress={() => openEditModal(item)}
                activeOpacity={0.7}
              >
                <Text style={styles.updateButtonText}>Update</Text>
              </TouchableOpacity>
            </View>
          </View>
          <Text style={styles.vehicleId}>ID: {item.id}</Text>
        </View>
      </View>
    </View>
  );

  const renderEmptyComponent = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyTitle}>No Vehicles Found</Text>
      <Text style={styles.emptyMessage}>
        {searchQuery ? 'No vehicles match your search criteria.' : 'No vehicles have been registered yet.'}
      </Text>
      {!searchQuery && (
        <Button
          mode="contained"
          onPress={openAddModal}
          style={styles.addButton}
        >
          Add Your First Vehicle
        </Button>
      )}
    </View>
  );

  const renderHeader = () => (
    <View style={styles.header}>
      <Text style={styles.title}>My Vehicles</Text>
      <Text style={styles.subtitle}>
        {filteredVehicles.length} vehicle{filteredVehicles.length !== 1 ? 's' : ''} found
      </Text>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#2196F3" />
        <Text style={styles.loadingText}>Loading vehicles...</Text>
      </View>
    );
  }

  if (error && vehiclesList.length === 0) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorTitle}>Oops! Something went wrong</Text>
        <Text style={styles.errorMessage}>{error}</Text>
        <Button
          mode="contained"
          onPress={handleRetry}
          style={styles.retryButton}
          icon="refresh"
        >
          Try Again
        </Button>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {renderHeader()}
      
      <Searchbar
        placeholder="Search vehicles..."
        onChangeText={setSearchQuery}
        value={searchQuery}
        style={styles.searchBar}
        inputStyle={styles.searchInput}
        iconColor="#666"
      />

      <FlatList
        data={filteredVehicles}
        renderItem={renderVehicleItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#2196F3']}
            tintColor="#2196F3"
          />
        }
        ListEmptyComponent={renderEmptyComponent}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
      />

      <FAB
        style={styles.fab}
        icon="plus"
        onPress={openAddModal}
        label="Add Vehicle"
      />

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={closeModal}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            {/* Modal Header */}
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{isEditMode ? 'Edit Vehicle' : 'Add Vehicle'}</Text>
              <TouchableOpacity onPress={closeModal}>
                <Text style={styles.closeButtonText}>✕</Text>
              </TouchableOpacity>
            </View>

            {/* Modal Content with Form Fields */}
            <View style={styles.modalContent}>
              <TextInput
                label="Vehicle Name *"
                value={editVehicleName}
                onChangeText={onEditNameChange}
                style={styles.modalInput}
                error={editErrors.vehicleName}
                mode="outlined"
                theme={{ colors: { primary: '#2196F3', error: '#f44336' } }}
              />
              {editErrors.vehicleName && (
                <Text style={styles.modalErrorText}>Vehicle name is required</Text>
              )}

              <TextInput
                label="Vehicle Number *"
                value={editVehicleNumber}
                onChangeText={onEditNumberChange}
                style={styles.modalInput}
                error={editErrors.vehicleNumber}
                mode="outlined"
                theme={{ colors: { primary: '#2196F3', error: '#f44336' } }}
              />
              {editErrors.vehicleNumber && (
                <Text style={styles.modalErrorText}>Vehicle number is required</Text>
              )}

              {/* Modal Buttons */}
              <View style={styles.modalButtons}>
                <TouchableOpacity
                  style={[styles.modalButton, styles.cancelButton]}
                  onPress={closeModal}
                  activeOpacity={0.7}
                >
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.modalButton,
                    styles.saveButton,
                    updateLoading && styles.disabledButton,
                  ]}
                  onPress={handleSubmitVehicle}
                  disabled={updateLoading}
                  activeOpacity={0.7}
                >
                  {updateLoading ? (
                    <View style={styles.loadingContainer}>
                      <ActivityIndicator size="small" color="white" />
                      <Text style={styles.saveButtonText}>{isEditMode ? 'Updating...' : 'Creating...'}</Text>
                    </View>
                  ) : (
                    <Text style={styles.saveButtonText}>{isEditMode ? 'Update Vehicle' : 'Create Vehicle'}</Text>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default VehiclesList;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#f8f9fa',
  },
  header: {
    padding: 20,
    paddingBottom: 10,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
  },
  searchBar: {
    margin: 16,
    elevation: 2,
    borderRadius: 12,
  },
  searchInput: {
    fontSize: 16,
  },
  listContainer: {
    paddingHorizontal: 16,
    paddingBottom: 100,
  },
  vehicleCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    marginBottom: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
  },
  cardContent: {
    padding: 16,
  },
  vehicleHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  vehicleInfo: {
    flex: 1,
  },
  vehicleName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  vehicleNumber: {
    fontSize: 16,
    color: '#2196F3',
    fontWeight: '600',
    letterSpacing: 1,
  },
  vehicleActions: {
    alignItems: 'flex-end',
  },
  updateButton: {
    backgroundColor: '#2196F3',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    elevation: 1,
  },
  updateButtonText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  vehicleId: {
    fontSize: 12,
    color: '#999',
    fontFamily: 'monospace',
  },
  separator: {
    height: 8,
  },
  emptyContainer: {
    alignItems: 'center',
    padding: 40,
    marginTop: 60,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  emptyMessage: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 24,
  },
  addButton: {
    borderRadius: 8,
    paddingHorizontal: 24,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
    textAlign: 'center',
  },
  errorMessage: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 24,
  },
  retryButton: {
    borderRadius: 8,
    paddingHorizontal: 24,
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
    backgroundColor: '#2196F3',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    backgroundColor: 'white',
    borderRadius: 12,
    width: '90%',
    maxWidth: 400,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  closeButtonText: {
    fontSize: 16,
    color: '#666',
    fontWeight: 'bold',
  },
  modalContent: {
    padding: 20,
  },
  modalInput: {
    marginBottom: 8,
    backgroundColor: 'white',
  },
  modalErrorText: {
    color: '#f44336',
    fontSize: 12,
    marginBottom: 16,
    marginLeft: 8,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 24,
    gap: 12,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
  },
  cancelButton: {
    backgroundColor: '#f5f5f5',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  cancelButtonText: {
    color: '#666',
    fontSize: 16,
    fontWeight: '600',
  },
  saveButton: {
    backgroundColor: '#4CAF50',
    elevation: 2,
  },
  saveButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  disabledButton: {
    backgroundColor: '#ccc',
    elevation: 0,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
});