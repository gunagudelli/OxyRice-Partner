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
  Dimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import BASE_URL from "../../config";
import { useSelector } from "react-redux";

const { height, width } = Dimensions.get("window");


export default function CustomerFeedback() {
  const [searchQuery, setSearchQuery] = useState("")
  const [filteredFeedbacks, setFilteredFeedbacks] = useState([]);
  const [loading,setLoading] = useState(false);
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
      setFilteredFeedbacks(feedbacks); // Save a copy for filtering

      // Fetch user details for each feedback item
      const userDetailsPromises = feedbacks.map(async (item) => {
        const details = await getUserDetails(item.feedback_user_id);
        return { userId: item.feedback_user_id, ...details };
      });
  
      const userDetailsArray = await Promise.all(userDetailsPromises);
  
      // Convert array to object for easy lookup
      const userDetailsDict = {};
      userDetailsArray.forEach(({ userId, name, number,email }) => {
        userDetailsDict[userId] = { name, number ,email};
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
    // console.log({ data });
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
      email:user?.email || 'N/A'
    };
    } catch (error) {
        console.log('Error:', error.message); // Log error message
      }
      
    
      
  };

 
  const handleSearch = () => {
    if (searchQuery.trim() === "") {
      setFilteredFeedbacks(FeedbackDetails); // Reset to all if empty
    } else {
      const filtered = FeedbackDetails.filter((item) =>
        item.orderid.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredFeedbacks(filtered);
    }
  };

  
  const renderItem = ({ item }) => {
    const user = userDetailsMap[item.feedback_user_id] || { name: 'Loading...', number: '...' };

return(

    <View style={styles.card}>
      <View style={styles.rowBetween}>
        <Text style={styles.date}>{item.submittedAt.split("T")[0]}</Text>
        <Text style={styles.orderId}>#{item.orderid.slice(-4)}</Text>
      </View>

      <View style={styles.userSection}>
        <Ionicons name="person-outline" size={16} color="#555" />
        <Text style={styles.userText}>
          {user.name}
        </Text>
      </View>

      <View style={styles.userSection}>
        <Ionicons name="mail-outline" size={16} color="#555" />
        <Text style={styles.userText}>{user.email}</Text>
      </View>

      <View style={styles.userSection}>
        <Ionicons name="call-outline" size={16} color="#555" />
        <Text style={styles.userText}>
          {user.number}
        </Text>      
        </View>

      <View
        style={{
          borderBottomWidth: 0.3,
          marginVertical: 10,
          borderColor: "#808080",
        }}
      />
      <Text style={styles.feedbackText}>
        {item.comments != null ? item.comments : "No Comments"}{" "}
      </Text>
    </View>
)
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />

      {/* <Text style={styles.header}>Customer Feedbacks</Text> */}

      {loading ? (
        <ActivityIndicator size="large" color="#3B82F6" style={styles.loader} />
      ) : (
<>
      <View style={styles.stats}>
        <Ionicons
          name="chatbubble-ellipses-outline"
          size={20}
          color="#3B82F6"
        />
        <Text style={styles.statsText}>
  Total Feedbacks: {FeedbackDetails.length}
</Text>

      </View>

      <View style={styles.searchBar}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search by Order ID"
          value={searchQuery}
          onChangeText={setSearchQuery}

        />
        <TouchableOpacity style={styles.searchButton} onPress={()=>handleSearch()}>
          <Ionicons name="search" size={20} color="white" />
        </TouchableOpacity>
      </View>

   
        <FlatList
          data={filteredFeedbacks}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={{ paddingBottom: 100 }}
          ListEmptyComponent={
            <View style={styles.emptyBox}>
              <Text style={styles.emptyText}>No feedbacks found</Text>
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
    backgroundColor: "#F7F9FC",
    paddingHorizontal: 16,
    marginVertical:10
  },
  header: {
    fontSize: 24,
    fontWeight: "700",
    marginVertical: 16,
    color: "#111827",
  },
  stats: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  statsText: {
    fontSize: 18,
    color: "#3B82F6",
    marginLeft: 6,
  },
  searchBar: {
    flexDirection: "row",
    marginBottom: 16,
  },
  searchInput: {
    flex: 1,
    backgroundColor: "#fff",
    borderRadius: 10,
    paddingHorizontal: 12,
    fontSize: 16,
    height: 45,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  searchButton: {
    backgroundColor: "#3B82F6",
    padding: 12,
    borderRadius: 10,
    marginLeft: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1,
  },
  rowBetween: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  date: {
    fontSize: 14,
    color: "#6B7280",
  },
  orderId: {
    fontSize: 14,
    color: "#111827",
    fontWeight: "500",
  },
  userSection: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  userText: {
    marginLeft: 6,
    fontSize: 14,
    color: "#374151",
  },
  feedbackText: {
    marginTop: 8,
    fontStyle: "italic",
    color: "#111",
    fontSize: 15,
  },
  emptyBox: {
    alignItems: "center",
    marginTop: 40,
  },
  emptyText: {
    fontSize: 16,
    color: "#6B7280",
  },
  loader: {
    marginTop: 20,
  },
});
