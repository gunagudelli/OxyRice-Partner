import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Modal,
  Linking,
  Image,
  ActivityIndicator,
  Dimensions,
  SafeAreaView,
  TouchableOpacity,
  TextInput,
  Platform,
  Alert,
} from "react-native";
import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";
import { useSelector } from "react-redux";
import { Dropdown } from "react-native-element-dropdown";
import BASE_URL from '../../config';
import Icon from "react-native-vector-icons/Ionicons";
// Import Image Picker instead of Document Picker
import * as ImagePicker from 'expo-image-picker';

const { height, width } = Dimensions.get("window");

const Userqueries = ({ navigation }) => {
  // State management
  const [queryStatus, setQueryStatus] = useState("PENDING");
  const [tickets, setTickets] = useState([]);
  const [filteredTickets, setFilteredTickets] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [fileUrl, setFileUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [ticketId, setTicketId] = useState();
  const [query, setQuery] = useState();
  const userData = useSelector((state) => state.counter);
  const token = userData.token; // Get token from redux store
  
  // Feedback and search state variables
  const [feedbackModal, setFeedbackModal] = useState(false);
  const [feedbackComments, setFeedbackComments] = useState("");
  const [selectedDocument, setSelectedDocument] = useState(null);
  const [currentTicket, setCurrentTicket] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [showSearch, setShowSearch] = useState(false);
  const [error, setError] = useState("");
  const [pendingSubmission, setPendingSubmission] = useState(false);
  const [resolveSubmission, setResolveSubmission] = useState(false);
  const [feedbackError, setFeedbackError] = useState("");
  const [feedbackSuccess, setFeedbackSuccess] = useState(false);

  // Fetch tickets when status changes
  useEffect(() => {
    fetchTickets();
  }, [queryStatus]);

  // Filter tickets based on search query
  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredTickets(tickets);
    } else {
      const filtered = tickets.filter(ticket => 
        ticket.randomTicketId?.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredTickets(filtered);
    }
  }, [searchQuery, tickets]);

  // Fetch tickets from API
  const fetchTickets = useCallback(() => {
    setLoading(true);
    setError("");
    
    axios
      .post(
        `${BASE_URL}user-service/write/getAllQueries`,
        {
          queryStatus: queryStatus,
          askOxyOfers: "FREESAMPLE",
          projectType: "ASKOXY",
        },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      )
      .then((response) => {
        if (response.data) {
          setTickets(response.data);
          setFilteredTickets(response.data);
        } else {
          setTickets([]);
          setFilteredTickets([]);
        }
        setLoading(false);
      })
      .catch((error) => {
        console.log("Error fetching tickets:", error);
        setError("Failed to load tickets. Please try again.");
        setTickets([]);
        setFilteredTickets([]);
        setLoading(false);
      });
  }, [queryStatus, token]);

  // Filter status options
  const data = [
    { label: "Pending", value: "PENDING" },
    { label: "Completed", value: "COMPLETED" },
    { label: "Cancelled", value: "CANCELLED" },
  ];

  // Handle file opening
  const openFile = (url) => {
    if (!url) {
      Alert.alert("Error", "File URL is missing.");
      return;
    }
    
    const fileExtension = url.split(".").pop().toLowerCase();

    if (["jpeg", "jpg", "png"].includes(fileExtension)) {
      setModalVisible(true);
      setFileUrl(url);
    } else if (fileExtension === "pdf") {
      Linking.openURL(url).catch(err => {
        Alert.alert("Error", "Could not open the PDF file.");
      });
    } else {
      Alert.alert("Error", "Unsupported file format.");
    }
  };

  // Open feedback modal
  const openFeedbackModal = (ticket) => {
    setCurrentTicket(ticket);
    setFeedbackModal(true);
    setFeedbackComments("");
    setSelectedDocument(null);
    setFeedbackError("");
    setFeedbackSuccess(false);
  };

  // Image picking function - Replaced Document Picker with Image Picker
  const pickImage = async () => {
    try {
      // Request permission first
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (status !== 'granted') {
        Alert.alert("Permission Denied", "We need permission to access your photos.");
        return;
      }

      // Launch the image library
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 1,
      });
      
      if (!result.canceled && result.assets && result.assets.length > 0) {
        const selectedAsset = result.assets[0];
        setSelectedDocument({
          uri: selectedAsset.uri,
          name: selectedAsset.uri.split('/').pop(),
          type: `image/${selectedAsset.uri.split('.').pop()}`
        });
      }
    } catch (err) {
      console.log("Image picking error:", err);
      Alert.alert("Error", "Failed to select image. Please try again.");
    }
  };

  // Submit feedback
  const submitFeedback = (value) => {
    if (!feedbackComments.trim()) {
      setFeedbackError("Please enter feedback comments");
      return;
    }

    if (value === "PENDING") {
      setPendingSubmission(true);
    } else {
      setResolveSubmission(true);
    }
    
    setFeedbackError("");

    const data = {
      adminDocumentId: "",
      id: currentTicket.id,
      askOxyOfers: "FREESAMPLE",
      query: currentTicket.query,
      comments: feedbackComments,
      email: currentTicket.email,
      mobileNumber: currentTicket.mobileNumber,
      queryStatus: value,
      userId: currentTicket.userId,
      projectType: "ASKOXY",
      resolvedBy: "admin",
      resolvedOn: new Date().toISOString(),
      status: "",
      userDocumentId: ""
    };

    axios({
      method: "post",
      url: `${BASE_URL}user-service/write/saveData`,
      data: data,
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
    .then((response) => {
      console.log("Feedback submitted successfully:", response.data);
      Alert.alert("Success", "Feedback submitted successfully.");
      // Show success message
      setFeedbackSuccess(true);
      
      // Wait 1 second then close modal and refresh tickets
      setTimeout(() => {
        setFeedbackModal(false);
        fetchTickets();
      }, 1000);
    })
    .catch((error) => {
      console.log("Error submitting feedback:", error);
      setFeedbackError("Failed to submit feedback. Please try again.");
    })
    .finally(() => {
      setPendingSubmission(false);
      setResolveSubmission(false);
    });
  };
  
  // Toggle search visibility
  const toggleSearch = () => {
    setShowSearch(!showSearch);
    if (showSearch) {
      setSearchQuery('');
      setFilteredTickets(tickets);
    }
  };

  // Empty state component
  const renderEmptyComponent = () => (
    <View style={styles.emptyContainer}>
      <Icon name="alert-circle-outline" size={50} color="#AAAAAA" />
      <Text style={styles.emptyText}>
        {error ? error : "No tickets available"}
      </Text>
      {error && (
        <TouchableOpacity 
          style={styles.retryButton} 
          onPress={fetchTickets}
          accessibilityLabel="Retry loading tickets"
          accessibilityRole="button"
        >
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  // Get status badge
  const getStatusBadge = (status) => {
    let badgeStyle = styles.pendingBadge;
    let textStyle = styles.pendingText;
    let statusText = "Pending";
    let iconName = "time-outline";
    
    if (status === "COMPLETED") {
      badgeStyle = styles.completedBadge;
      textStyle = styles.completedText;
      statusText = "Completed";
      iconName = "checkmark-circle-outline";
    } else if (status === "CANCELLED") {
      badgeStyle = styles.cancelledBadge;
      textStyle = styles.cancelledText;
      statusText = "Cancelled";
      iconName = "close-circle-outline";
    }
    
    return (
      <View style={badgeStyle}>
        <Icon name={iconName} size={14} color={textStyle.color} style={{marginRight: 4}} />
        <Text style={textStyle}>{statusText}</Text>
      </View>
    );
  };

  // Render individual ticket item
  const renderTicketItem = ({ item }) => (
    <View style={styles.card} accessible={true} accessibilityRole="button">
      <View style={styles.ticketHeader}>
        <View style={styles.ticketIdContainer}>
          <Text style={styles.ticketIdLabel}>Ticket ID</Text>
          <Text style={styles.ticketIdValue}>{item.randomTicketId || "N/A"}</Text>
        </View>
        
        {getStatusBadge(item.queryStatus || queryStatus)}
      </View>
      
      <View style={styles.divider} />
      
      {/* User Details Section */}
      <View style={styles.userDetailsContainer}>
        <View style={styles.userDetailItem}>
          <Icon name="person" size={16} color="#666" />
          <Text style={styles.userDetailLabel}>Name : </Text>
          <Text style={styles.userDetailValue}>{item.name || "N/A"}</Text>
        </View>
        
        <View style={styles.userDetailItem}>
          <Icon name="call-outline" size={16} color="#666" />
          <Text style={styles.userDetailLabel}>Mobile : </Text>
          <Text style={styles.userDetailValue}>{item.mobileNumber || "N/A"}</Text>
        </View>
      </View>
      
      <View style={styles.divider} />
      
      <View style={styles.row}>
        <Text style={styles.label}>Query :</Text>
        <Text style={styles.value}>{item.query || "N/A"}</Text>
      </View>

      <View style={styles.row}>
        <Text style={styles.label}>Created On :</Text>
        <Text style={styles.value}>
          {item?.createdAt?.substring(0, 10) || "N/A"}
        </Text>
      </View>

      {/* Show admin comments and resolved date for completed tickets */}
      {(item.queryStatus === "COMPLETED" || queryStatus === "COMPLETED") && (
        <>
          <View style={styles.row}>
            <Text style={styles.label}>Comments :</Text>
            <Text style={styles.value}>{item.comments || "No comments"}</Text>
          </View>

          <View style={styles.row}>
            <Text style={styles.label}>Resolved By :</Text>
            <Text style={styles.value}>{item.resolvedBy || "N/A"}</Text>
          </View>

          <View style={styles.row}>
            <Text style={styles.label}>Resolved On :</Text>
            <Text style={styles.value}>
              {item?.resolvedOn?.substring(0, 10) || "N/A"}
            </Text>
          </View>
        </>
      )}

      {/* Cancelled tickets information */}
      {(item.queryStatus === "CANCELLED" || queryStatus === "CANCELLED") && (
        <>
          <View style={styles.row}>
            <Text style={styles.label}>Reason :</Text>
            <Text style={styles.value}>{item.comments || "No reason provided"}</Text>
          </View>

          <View style={styles.row}>
            <Text style={styles.label}>Resolved By :</Text>
            <Text style={styles.value}>{item.resolvedBy || "N/A"}</Text>
          </View>

          <View style={styles.row}>
            <Text style={styles.label}>Resolved On :</Text>
            <Text style={styles.value}>
              {item?.resolvedOn?.substring(0, 10) || "N/A"}
            </Text>
          </View>
        </>
      )}

      {item.userQueryDocumentStatus?.fileName && (
        <View style={styles.row}>
          <Text style={styles.label}>File</Text>
          <TouchableOpacity
            onPress={() =>
              openFile(item.userQueryDocumentStatus?.filePath)
            }
            accessibilityLabel={`View file ${item.userQueryDocumentStatus?.fileName}`}
            accessibilityRole="button"
          >
            <Text style={styles.fileLink}>
              {item.userQueryDocumentStatus?.fileName}
            </Text>
          </TouchableOpacity>
        </View>
      )}

      <View style={styles.actionContainer}>
      <TouchableOpacity
          style={[styles.feedbackButton,{    backgroundColor: 'green',
          }]}
          onPress={() => navigation.navigate("Query Comments", { details: item }) }
          accessibilityLabel="Submit query feedback"
          accessibilityRole="button"
        >
          <Icon name="create-outline" size={16} color="#FFF" />
          <Text style={styles.buttonText}>Query Comments</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.feedbackButton,{    backgroundColor: '#0384d5',
          }]}
          onPress={() => openFeedbackModal(item)}
          accessibilityLabel="Submit query feedback"
          accessibilityRole="button"
        >
          <Icon name="create-outline" size={16} color="#FFF" />
          <Text style={styles.buttonText}>Query Feedback</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
 
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Support Tickets</Text>
        <TouchableOpacity 
          onPress={toggleSearch} 
          style={styles.searchButton}
          accessibilityLabel={showSearch ? "Hide search" : "Show search"}
          accessibilityRole="button"
        >
          <Icon name={showSearch ? "close-outline" : "search-outline"} size={22} color="#666" />
        </TouchableOpacity>
      </View>
      
      {showSearch && (
        <View style={styles.searchContainer}>
          <View style={styles.searchInputContainer}>
            <Icon name="search-outline" size={20} color="#999" style={styles.searchIcon} />
            <TextInput 
              style={styles.searchInput}
              placeholder="Search by Ticket ID"
              value={searchQuery}
              onChangeText={setSearchQuery}
              autoCapitalize="none"
              accessibilityLabel="Search tickets by ID"
              returnKeyType="search"
            />
            {searchQuery !== "" && (
              <TouchableOpacity 
                onPress={() => {
                  setSearchQuery("");
                  setFilteredTickets(tickets);
                }}
                style={styles.clearButton}
                accessibilityLabel="Clear search"
                accessibilityRole="button"
              >
                <Icon name="close-circle" size={18} color="#999" />
              </TouchableOpacity>
            )}
          </View>
        </View>
      )}
      
      <View style={styles.filterContainer}>
        <Dropdown
          style={styles.dropdown}
          data={data}
          labelField="label"
          valueField="value"
          placeholder="Filter by status"
          placeholderStyle={styles.placeholderStyle}
          selectedTextStyle={styles.selectedTextStyle}
          iconStyle={styles.iconStyle}
          value={queryStatus}
          onChange={(item) => {
            setQueryStatus(item.value);
          }}
          renderLeftIcon={() => (
            <Icon name="funnel-outline" size={20} color="#666" style={styles.dropdownIcon} />
          )}
          accessibilityLabel="Filter tickets by status"
        />
      </View>

      {loading ? (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color="#0384d5" />
          <Text style={styles.loaderText}>Loading tickets...</Text>
        </View>
      ) : (
        <FlatList
          showsVerticalScrollIndicator={false}
          data={filteredTickets}
          keyExtractor={(item) => item.id?.toString() || Math.random().toString()}
          renderItem={renderTicketItem}
          ListEmptyComponent={renderEmptyComponent}
          contentContainerStyle={filteredTickets.length === 0 ? styles.emptyListContent : styles.listContent}
          refreshing={loading}
          onRefresh={fetchTickets}
          accessibilityLabel="List of support tickets"
        />
      )}

      {/* Image Preview Modal */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <TouchableOpacity
              onPress={() => setModalVisible(false)}
              style={styles.closeButton}
              accessibilityLabel="Close image preview"
              accessibilityRole="button"
            >
              <Icon name="close-circle" size={36} color="#FFF" />
            </TouchableOpacity>
            <Image source={{ uri: fileUrl }} style={styles.previewImage} resizeMode="contain" />
          </View>
        </View>
      </Modal>

      {/* Query Feedback Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={feedbackModal}
        onRequestClose={() => {
          setFeedbackModal(false);
        }}
      >
        <View style={styles.modalContainer}>
          <View style={styles.feedbackModalContent}>
            <TouchableOpacity
              style={styles.closeModalButton}
              onPress={() => {
                setFeedbackModal(false);
              }}
              accessibilityLabel="Close feedback form"
              accessibilityRole="button"
            >
              <Icon name="close" size={24} color="#333" />
            </TouchableOpacity>
            
            <Text style={styles.feedbackTitle}>Submit Query Feedback</Text>
            
            <View style={styles.divider} />
            
            {feedbackSuccess ? (
              <View style={styles.successContainer}>
                <Icon name="checkmark-circle" size={60} color="#28A745" />
                <Text style={styles.successText}>Feedback submitted successfully!</Text>
              </View>
            ) : (
              <>
                <Text style={styles.feedbackLabel}>Comments</Text>
                <TextInput
                  style={[styles.feedbackInput, feedbackError ? styles.inputError : null]}
                  placeholder="Enter your feedback comments here"
                  placeholderTextColor="#999"
                  value={feedbackComments}
                  numberOfLines={5}
                  multiline
                  onChangeText={(text) => {
                    setFeedbackComments(text);
                    if (text.trim()) setFeedbackError("");
                  }}
                  accessibilityLabel="Feedback comments"
                />
                
                {feedbackError ? (
                  <Text style={styles.errorText}>{feedbackError}</Text>
                ) : null}
                
                <View style={styles.uploadSection}>
                  <Text style={styles.feedbackLabel}>Upload Image (Optional)</Text>
                  
                  <TouchableOpacity 
                    style={styles.uploadButton} 
                    onPress={pickImage}
                    disabled={pendingSubmission || resolveSubmission}
                    accessibilityLabel="Select image to upload"
                    accessibilityRole="button"
                  >
                    <Icon name="image-outline" size={20} color="#FFF" />
                    <Text style={styles.uploadButtonText}>
                      {selectedDocument ? 'Change Image' : 'Select Image'}
                    </Text>
                  </TouchableOpacity>
                  
                  {selectedDocument && (
                    <View style={styles.selectedFileContainer}>
                      <Icon name="image-outline" size={16} color="#0384d5" />
                      <Text style={styles.selectedFileName} numberOfLines={1}>
                        {selectedDocument.name}
                      </Text>
                    </View>
                  )}
                </View>
                
                <View style={styles.divider} />
                
                <View style={styles.feedbackActionContainer}>
                  <TouchableOpacity
                    style={[styles.pendingButton, (pendingSubmission || resolveSubmission) && styles.disabledButton]}
                    onPress={() => submitFeedback("PENDING")}
                    disabled={pendingSubmission || resolveSubmission}
                    accessibilityLabel="Mark ticket as pending"
                    accessibilityRole="button"
                  >
                    {pendingSubmission ? (
                      <ActivityIndicator size="small" color="#FFFFFF" />
                    ) : (
                      <>
                        <Icon name="time-outline" size={16} color="#FFF" />
                        <Text style={styles.actionButtonText}>Mark Pending</Text>
                      </>
                    )}
                  </TouchableOpacity>
                  
                  <TouchableOpacity
                    style={[styles.resolveButton, (pendingSubmission || resolveSubmission) && styles.disabledButton]}
                    onPress={() => submitFeedback("COMPLETED")}
                    disabled={pendingSubmission || resolveSubmission}
                    accessibilityLabel="Mark ticket as resolved"
                    accessibilityRole="button"
                  >
                    {resolveSubmission ? (
                      <ActivityIndicator size="small" color="#FFFFFF" />
                    ) : (
                      <>
                        <Icon name="checkmark-circle-outline" size={16} color="#FFF" />
                        <Text style={styles.actionButtonText}>Resolve</Text>
                      </>
                    )}
                  </TouchableOpacity>
                </View>
              </>
            )}
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

export default Userqueries;
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F7FA",
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333333',
  },
  searchButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#F5F5F5',
  },
  searchContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    paddingHorizontal: 12,
    height: 44,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: '100%',
    fontSize: 14,
    color: '#333333',
  },
  clearButton: {
    padding: 4,
  },
  filterContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
  },
  dropdown: {
    height: 44,
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    paddingHorizontal: 12,
  },
  placeholderStyle: {
    fontSize: 14,
    color: '#999999',
  },
  selectedTextStyle: {
    fontSize: 14,
    color: '#333333',
  },
  iconStyle: {
    width: 20,
    height: 20,
  },
  dropdownIcon: {
    marginRight: 8,
  },
  listContent: {
    padding: 16,
  },
  emptyListContent: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loaderText: {
    marginTop: 16,
    color: '#666666',
    fontSize: 16,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3.84,
    elevation: 3,
    overflow: 'hidden',
  },
  ticketHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#F9FAFC',
  },
  ticketIdContainer: {
    flexDirection: 'column',
  },
  ticketIdLabel: {
    fontSize: 12,
    color: '#666666',
    marginBottom: 4,
  },
  ticketIdValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333333',
  },
  pendingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF4E5',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 50,
  },
  pendingText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FF9800',
  },
  completedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E6F7ED',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 50,
  },
  completedText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#28A745',
  },
  cancelledBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFE8E8',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 50,
  },
  cancelledText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FF6B6B',
  },
  divider: {
    height: 1,
    backgroundColor: '#EEEEEE',
    marginVertical: 8,
  },
  userDetailsContainer: {
    padding: 16,
  },
  userDetailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  userDetailLabel: {
    fontSize: 14,
    color: '#666666',
    marginLeft: 8,
  },
  userDetailValue: {
    fontSize: 14,
    color: '#333333',
    fontWeight: '500',
  },
  row: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 8,
    alignItems: 'flex-start',
  },
  label: {
    fontSize: 14,
    color: '#666666',
    width: 100,
    marginRight: 8,
  },
  value: {
    flex: 1,
    fontSize: 14,
    color: '#333333',
  },
  fileLink: {
    fontSize: 14,
    color: '#0384d5',
    textDecorationLine: 'underline',
  },
  actionContainer: {
    flexDirection: 'row',
    padding: 16,
    justifyContent: 'space-between',
  },
  feedbackButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 16,
    width: width * 0.4
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 6,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '90%',
    height: '80%',
    backgroundColor: '#000',
    borderRadius: 12,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    zIndex: 10,
  },
  previewImage: {
    width: '100%',
    height: '100%',
  },
  feedbackModalContent: {
    width: '90%',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
  },
  closeModalButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    padding: 8,
  },
  feedbackTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 16,
    textAlign: 'center',
  },
  feedbackLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#555555',
    marginBottom: 8,
  },
  feedbackInput: {
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    padding: 12,
    minHeight: 120,
    textAlignVertical: 'top',
    fontSize: 14,
    color: '#333333',
    marginBottom: 16,
  },
  inputError: {
    borderWidth: 1,
    borderColor: '#FF6B6B',
  },
  errorText: {
    color: '#FF6B6B',
    fontSize: 12,
    marginBottom: 16,
  },
  uploadSection: {
    marginBottom: 16,
  },
  uploadButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0384d5',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 16,
  },
  uploadButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 6,
  },
  selectedFileContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginTop: 12,
  },
  selectedFileName: {
    fontSize: 14,
    color: '#333333',
    marginLeft: 8,
    flex: 1,
  },
  feedbackActionContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
  },
  pendingButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FF9800',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    flex: 1,
    marginRight: 8,
  },
  resolveButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#28A745',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    flex: 1,
    marginLeft: 8,
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 6,
  },
  disabledButton: {
    opacity: 0.6,
  },
  successContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  successText: {
    fontSize: 16,
    color: '#28A745',
    fontWeight: '500',
    marginTop: 16,
    textAlign: 'center',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#666666',
    marginTop: 16,
    marginBottom: 16,
    textAlign: 'center',
  },
  retryButton: {
    backgroundColor: '#0384d5',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '500',
  }
});