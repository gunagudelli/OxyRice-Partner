import React, { useEffect, useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  ActivityIndicator,
  Switch,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import axios from "axios";
import BASE_URL from "../../config";
import { useSelector } from "react-redux";

export default function PaymentStatusScreen () {
  const [loading, setLoading] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [paymentOptions, setPaymentOptions] = useState([]);
  const accessToken = useSelector((state) => state.counter);

  useEffect(() => {
    fetchPaymentStatus();
  }, []);

  const fetchPaymentStatus = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        BASE_URL + `order-service/getCodAndOnlinePaymetStatus`,
        {
          headers: {
            Authorization: `Bearer ${accessToken.token}`,
          },
        }
      );
      setLoading(false);
      setPaymentOptions(response.data);
    } catch (error) {
      setLoading(false);
      console.log("Error fetching payment status:", error.response || error);
      Alert.alert("Error", "Failed to load payment status options");
    }
  };

  const togglePaymentStatus = async (id, paymentStatus, newStatus) => {
    try {
      setUpdating(true);
      
      const requestBody = {
        id: id,
        paymentStatus: paymentStatus,
        status: newStatus
      };
      
      await axios.patch(
        BASE_URL + `order-service/onlineAndCodAtiveAndInactive`,
        requestBody,
        {
          headers: {
            Authorization: `Bearer ${accessToken.token}`,
          },
        }
      );
      
      // Update local state after successful update
      setPaymentOptions(paymentOptions.map(option => 
        option.id === id ? { ...option, status: newStatus } : option
      ));
      
      setUpdating(false);
      Alert.alert("Success", `${paymentStatus} payment has been ${newStatus ? "enabled" : "disabled"}`);
    } catch (error) {
      setUpdating(false);
      console.log("Error updating payment status:", error.response || error);
      Alert.alert("Error", "Failed to update payment status");
    }
  };

  const getIconName = (paymentStatus) => {
    return paymentStatus === "COD" ? "cash-outline" : "card-outline";
  };
  
  // Show only last 4 digits of ID
  const formatId = (id) => {
    if (!id) return "";
    const idStr = id.toString();
    return idStr.length > 4 ? `...${idStr.slice(-4)}` : idStr;
  };

  const renderPaymentOption = (option) => {
    return (
      <View key={option.id} style={styles.card}>
        <View style={styles.cardContent}>
          <View style={styles.iconContainer}>
            <Ionicons 
              name={getIconName(option.paymentStatus)} 
              size={24} 
              color="#3B82F6" 
            />
          </View>
          
          <View style={styles.textContainer}>
            <Text style={styles.paymentMethod}>
              {option.paymentStatus === "COD" ? "Cash On Delivery" : "Online Payment"}
            </Text>
            <View style={styles.metaContainer}>
              <Text style={styles.statusText}>
                {option.status ? "Active" : "Inactive"}
              </Text>
              <Text style={styles.idText}>ID: {formatId(option.id)}</Text>
            </View>
          </View>
          
          <Switch
            trackColor={{ false: "#CBD5E0", true: "#BEE3F8" }}
            thumbColor={option.status ? "#3B82F6" : "#A0AEC0"}
            ios_backgroundColor="#CBD5E0"
            onValueChange={(newValue) => 
              togglePaymentStatus(option.id, option.paymentStatus, newValue)
            }
            value={option.status}
            disabled={updating}
          />
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#F7F9FC" />
      <View style={styles.header}>
  <View style={styles.headerLeft}>
    <Ionicons name="settings-outline" size={24} color="#3B82F6" />
    <Text style={styles.headerText}>Payment Methods</Text>
  </View>
</View>

      {loading ? (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color="#3B82F6" />
          <Text style={styles.loadingText}>Loading payment options...</Text>
        </View>
      ) : (
        <>
          <Text style={styles.description}>
            Enable or disable payment methods using the toggles below
          </Text>
          
          <View style={styles.cardsContainer}>
            {paymentOptions.map(option => renderPaymentOption(option))}
          </View>
          
          {updating && (
            <View style={styles.updatingContainer}>
              <ActivityIndicator size="small" color="#3B82F6" />
              <Text style={styles.updatingText}>Updating...</Text>
            </View>
          )}
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
    paddingTop: 16,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 20,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  headerText: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1F2937",
    marginLeft: 8,
  },
  description: {
    fontSize: 15,
    color: "#6B7280",
    marginBottom: 16,
    lineHeight: 20,
  },
  cardsContainer: {
    flex: 1,
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
    borderWidth: 1,
    borderColor: "#F3F4F6",
  },
  cardContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  iconContainer: {
    width: 40,
    height: 40,
    backgroundColor: "#EBF5FF",
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  textContainer: {
    flex: 1,
    marginLeft: 12,
  },
  paymentMethod: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1F2937",
  },
  metaContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
  },
  statusText: {
    fontSize: 14,
    color: "#6B7280",
  },
  idText: {
    fontSize: 12,
    color: "#9CA3AF",
    marginLeft: 8,
  },
  refreshButton: {
    backgroundColor: "#3B82F6",
    borderRadius: 8,
    width: 32,
    height: 32,
    justifyContent: "center",
    alignItems: "center",
  },
  updatingContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(235, 245, 255, 0.9)",
    padding: 8,
    borderRadius: 8,
    marginBottom: 16,
  },
  updatingText: {
    marginLeft: 8,
    color: "#3B82F6",
    fontSize: 14,
    fontWeight: "500",
  },
  loaderContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: "#6B7280",
  },
});

//  import React from "react";

//  const PaymentStatusScreen = () => {
//   return (
//     <View>
//       <Text>Payment Status Screen</Text>
//     </View>
//   );
//  }

//  export default PaymentStatusScreen;