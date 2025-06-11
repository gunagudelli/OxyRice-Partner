import React, { useEffect, useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  FlatList,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import axios from "axios";
import BASE_URL from "../../config";
import { useSelector } from "react-redux";

export default function CustomerFeedback() {
  const [searchQuery, setSearchQuery] = useState("")
  const [filteredFeedbacks, setFilteredFeedbacks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [userDetailsMap, setUserDetailsMap] = useState({});
  const [FeedbackDetails, setFeedbackDetails] = useState([]);
  const accessToken = useSelector((state) => state.counter);

  useEffect(() => {
    getCustomerFeedback();
  }, []);

  const getCustomerFeedback = async () => {
    try {
      setLoading(true)
      const response = await axios.get(BASE_URL + `order-service/getAllfeedback`, {
        headers: {
          Authorization: `Bearer ${accessToken.token}`,
        },
      });
      setLoading(false)

      const feedbacks = response.data;
      setFeedbackDetails(feedbacks);
      setFilteredFeedbacks(feedbacks);

      const userDetailsPromises = feedbacks.map(async (item) => {
        const details = await getUserDetails(item.feedback_user_id);
        return { userId: item.feedback_user_id, ...details };
      });
  
      const userDetailsArray = await Promise.all(userDetailsPromises);
      const userDetailsDict = {};
      userDetailsArray.forEach(({ userId, name, number, email }) => {
        userDetailsDict[userId] = { name, number, email };
      });
      setUserDetailsMap(userDetailsDict);
    } catch (error) {
      setLoading(false)
      console.log(error.response);
    }
  };
  
  const getUserDetails = async(FeedbackId) => {
    let requestBody = {
      number: null,
      userId: FeedbackId,
    };
    try {
      const response = await axios.post(
        BASE_URL + `user-service/getDataWithMobileOrWhatsappOrUserId`,
        requestBody,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );
       
      const user = response.data.activeUsersResponse[0]
      return {
        name: user?.userName || 'N/A',
        number: user?.mobileNumber || 'N/A',
        email: user?.email || 'N/A'
      };
    } catch (error) {
      console.log('Error:', error.message);
    }
  };

  const handleSearch = () => {
    if (searchQuery.trim() === "") {
      setFilteredFeedbacks(FeedbackDetails);
    } else {
      const filtered = FeedbackDetails.filter((item) =>
        item.orderid.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredFeedbacks(filtered);
    }
  };

  const renderItem = ({ item }) => {
    const user = userDetailsMap[item.feedback_user_id] || { 
      name: 'Loading...', 
      number: '...', 
      email: '...' 
    };

    return(
      <View style={styles.card}>
        <View style={styles.header}>
          <Text style={styles.orderId}>#{item.orderid.slice(-4)}</Text>
          <Text style={styles.date}>{item.submittedAt.split("T")[0]}</Text>
        </View>
        
        <Text style={styles.name}>{user.name}</Text>
        <Text style={styles.contact}>{user.email}</Text>
        <Text style={styles.contact}>{user.number}</Text>
        
        <Text style={styles.feedback}>
          {item.comments || "No feedback"}
        </Text>
      </View>
    )
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFF" />

      {loading ? (
        <View style={styles.loading}>
          <ActivityIndicator size="large" color="#007AFF" />
        </View>
      ) : (
        <>
          <View style={styles.topSection}>
            <Text style={styles.title}>Feedback ({FeedbackDetails.length})</Text>
            
            <View style={styles.searchBox}>
              <TextInput
                style={styles.input}
                placeholder="Search order ID..."
                value={searchQuery}
                onChangeText={setSearchQuery}
                onSubmitEditing={handleSearch}
              />
              <TouchableOpacity onPress={handleSearch} style={styles.searchBtn}>
                <Ionicons name="search" size={18} color="#FFF" />
              </TouchableOpacity>
            </View>
          </View>

          <FlatList
            data={filteredFeedbacks}
            keyExtractor={(item, index) => item.id?.toString() || index.toString()}
            renderItem={renderItem}
            contentContainerStyle={styles.list}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={
              <View style={styles.empty}>
                <Text style={styles.emptyText}>No feedback found</Text>
              </View>
            }
          />
        </>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F5F5",
  },
  loading: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  topSection: {
    backgroundColor: "#FFF",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#E0E0E0",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 16,
  },
  searchBox: {
    flexDirection: "row",
    gap: 8,
  },
  input: {
    flex: 1,
    backgroundColor: "#F8F8F8",
    borderRadius: 8,
    paddingHorizontal: 12,
    height: 40,
    fontSize: 16,
  },
  searchBtn: {
    backgroundColor: "#007AFF",
    width: 40,
    height: 40,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  list: {
    padding: 16,
  },
  card: {
    backgroundColor: "#FFF",
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
    
  },
  orderId: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#007AFF",
  },
  date: {
    fontSize: 14,
    color: "#666",
  },
  name: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 4,
  },
  contact: {
    fontSize: 14,
    color: "#666",
    marginBottom: 2,
  },
   feedback: {
    fontSize: 14,
    color: "Black",
    marginTop: 8,
    fontWeight: "bold",
    fontStyle: "italic",
    backgroundColor: "#F8F8F8",
    padding: 8,
    borderRadius: 4,
    lineHeight: 20,
    textAlign: "left",
  },
  empty: {
    alignItems: "center",
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 16,
    color: "#666",
  },
});