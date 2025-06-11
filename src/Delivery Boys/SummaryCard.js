// import React, { useEffect, useState } from 'react';
// import { View, Text } from 'react-native';


// const SummaryCard = ({ summaryMessage }) => {
//   const [parsedSummary, setParsedSummary] = useState(null);

//   useEffect(() => {
//     // console.log("Summary Message:", summaryMessage);
//     if (summaryMessage) {
//       const userMatch = summaryMessage.match(/^(.+?) had delivered a total of (\d+) orders/);
//       const codOrders = summaryMessage.match(/Total COD Orders Delivered: (\d+)/);
//       const codAmount = summaryMessage.match(/Total COD Grand Total: ₹([\d.]+)/);
//       const onlineOrders = summaryMessage.match(/Total Online Orders Delivered: (\d+)/);
//       const onlineAmount = summaryMessage.match(/Total Online Grand Total: ₹([\d.]+)/);

//       setParsedSummary({
//         userName: userMatch?.[1] || '',
//         totalOrdersDelivered: userMatch?.[2] || '0',
//         totalCodOrders: codOrders?.[1] || '0',
//         totalCodAmount: codAmount?.[1] || '0.00',
//         totalOnlineOrders: onlineOrders?.[1] || '0',
//         totalOnlineAmount: onlineAmount?.[1] || '0.00',
//       });
//     }
//   }, [summaryMessage]);

//   if (!parsedSummary) return null;

//   return (
//     <View style={{ backgroundColor: "#ffffff", padding: 15, borderRadius: 12, marginBottom: 15, elevation: 3 }}>
//       <Text style={{ fontSize: 16, fontWeight: "bold", color: "#333", marginBottom: 10 }}>
//         {parsedSummary.userName} had delivered a total of {parsedSummary.totalOrdersDelivered} orders.
//       </Text>

//       {/* COD Summary */}
//       <View style={{ backgroundColor: "#e0f7fa", padding: 10, borderRadius: 8, marginBottom: 10 }}>
//         <Text style={{ fontSize: 15, fontWeight: "bold", color: "#00796b", marginBottom: 5 }}>
//           Cash on Delivery Summary :
//         </Text>
//         <Text style={{ color: "#004d40" }}>
//           Total COD Orders Delivered : <Text style={{ fontWeight: "bold" }}>{parsedSummary.totalCodOrders}</Text>
//         </Text>
//         <Text style={{ color: "#004d40" }}>
//           Total COD Grand Total : <Text style={{ fontWeight: "bold" }}>₹{parsedSummary.totalCodAmount}</Text>
//         </Text>
//       </View>

//       {/* Online Summary */}
//       <View style={{ backgroundColor: "#e8f5e9", padding: 10, borderRadius: 8 }}>
//         <Text style={{ fontSize: 15, fontWeight: "bold", color: "#2e7d32", marginBottom: 5 }}>
//           Online Delivery Summary :
//         </Text>
//         <Text style={{ color: "#1b5e20" }}>
//           Total Online Orders Delivered : <Text style={{ fontWeight: "bold" }}>{parsedSummary.totalOnlineOrders}</Text>
//         </Text>
//         <Text style={{ color: "#1b5e20" }}>
//           Total Online Grand Total : <Text style={{ fontWeight: "bold" }}>₹{parsedSummary.totalOnlineAmount}</Text>
//         </Text>
//       </View>
//     </View>
//   );
// };

// export default SummaryCard;
import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

const SummaryCard = ({ summaryMessage, orderResponseList }) => {
  const [parsedSummary, setParsedSummary] = useState(null);
  const [showCODBreakdown, setShowCODBreakdown] = useState(false);
  const [showOnlineBreakdown, setShowOnlineBreakdown] = useState(false);
  const [codOrders, setCodOrders] = useState([]);
  const [onlineOrders, setOnlineOrders] = useState([]);

  useEffect(() => {
    // Parse summary message
    if (summaryMessage) {
      const userMatch = summaryMessage.match(/^(.+?) had delivered a total of (\d+) orders/);
      const codOrdersMatch = summaryMessage.match(/Total COD Orders Delivered: (\d+)/);
      const codAmount = summaryMessage.match(/Total COD Grand Total: ₹([\d.]+)/);
      const onlineOrdersMatch = summaryMessage.match(/Total Online Orders Delivered: (\d+)/);
      const onlineAmount = summaryMessage.match(/Total Online Grand Total: ₹([\d.]+)/);

      setParsedSummary({
        userName: userMatch?.[1] || '',
        totalOrdersDelivered: userMatch?.[2] || '0',
        totalCodOrders: codOrdersMatch?.[1] || '0',
        totalCodAmount: codAmount?.[1] || '0.00',
        totalOnlineOrders: onlineOrdersMatch?.[1] || '0',
        totalOnlineAmount: onlineAmount?.[1] || '0.00',
      });
    }

    // Process orderResponseList to separate COD and Online orders
    if (orderResponseList) {
      const cod = orderResponseList
        .filter(order => order.paymentType === 1)
        .map(order => ({
          orderId: order.uniqueId,
          grandTotal: order.grandTotal,
        }));
      const online = orderResponseList
        .filter(order => order.paymentType === 2)
        .map(order => ({
          orderId: order.uniqueId,
          grandTotal: order.grandTotal,
        }));
      setCodOrders(cod);
      setOnlineOrders(online);
    }
  }, [summaryMessage, orderResponseList]);

  if (!parsedSummary) return null;

  return (
    <View style={styles.card}>
      <Text style={styles.header}>
        {parsedSummary.userName} had delivered a total of {parsedSummary.totalOrdersDelivered} orders.
      </Text>

      {/* COD Summary */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Cash on Delivery Summary</Text>
        <Text style={styles.sectionText}>
          Total COD Orders Delivered: <Text style={styles.bold}>{parsedSummary.totalCodOrders}</Text>
        </Text>
        <Text style={styles.sectionText}>
          Total COD Grand Total: <Text style={styles.bold}>₹{parsedSummary.totalCodAmount}</Text>
        </Text>
        {codOrders.length > 0 && (
          <TouchableOpacity
            onPress={() => setShowCODBreakdown(!showCODBreakdown)}
            style={styles.breakdownButton}
          >
            <Text style={styles.breakdownText}>
              {showCODBreakdown ? 'Hide Breakdown' : 'Show Breakdown'}
            </Text>
          </TouchableOpacity>
        )}
        {showCODBreakdown && (
          <View style={styles.breakdownContainer}>
            <Text style={styles.breakdownTitle}>COD Breakdown:</Text>
            {codOrders.map(order => (
              <Text key={order.orderId} style={styles.breakdownItem}>
                 {order.orderId} - ₹{order.grandTotal.toFixed(2)}
              </Text>
            ))}
          </View>
        )}
      </View>

      {/* Online Summary */}
      <View style={styles.section1}>
        <Text style={styles.sectionTitle}>Online Delivery Summary</Text>
        <Text style={styles.sectionText}>
          Total Online Orders Delivered: <Text style={styles.bold}>{parsedSummary.totalOnlineOrders}</Text>
        </Text>
        <Text style={styles.sectionText}>
          Total Online Grand Total: <Text style={styles.bold}>₹{parsedSummary.totalOnlineAmount}</Text>
        </Text>
        {onlineOrders.length > 0 && (
          <TouchableOpacity
            onPress={() => setShowOnlineBreakdown(!showOnlineBreakdown)}
            style={styles.breakdownButton}
          >
            <Text style={styles.breakdownText}>
              {showOnlineBreakdown ? 'Hide Breakdown' : 'Show Breakdown'}
            </Text>
          </TouchableOpacity>
        )}
        {showOnlineBreakdown && (
          <View style={styles.breakdownContainer}>
            <Text style={styles.breakdownTitle}>Online Breakdown:</Text>
            {onlineOrders.map(order => (
              <Text key={order.orderId} style={styles.breakdownItem}>
                {order.orderId} - ₹{order.grandTotal.toFixed(2)}
              </Text>
            ))}
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#ffffff',
    padding: 15,
    borderRadius: 12,
    marginBottom: 15,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  header: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  section: {
    backgroundColor: '#e0f7fa',
    padding: 10,
    borderRadius: 8,
    marginBottom: 10,
  },
  section1: {
    backgroundColor: '#e8f5e9',
    padding: 10,
    borderRadius: 8,
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#00796b',
    marginBottom: 5,
  },
  sectionText: {
    fontSize: 14,
    color: '#004d40',
  },
  bold: {
    fontWeight: 'bold',
  },
  breakdownButton: {
    marginTop: 8,
  },
  breakdownText: {
    color: '#00796b',
    fontSize: 14,
    textDecorationLine: 'underline',
  },
  breakdownContainer: {
    marginTop: 8,
    paddingLeft: 10,
  },
  breakdownTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#00796b',
  },
  breakdownItem: {
    fontSize: 12,
    color: '#004d40',
    marginTop: 4,
  },
});

export default SummaryCard;