import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ImageBackground } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { FontAwesome5, MaterialCommunityIcons, FontAwesome, Ionicons } from '@expo/vector-icons';
import { useState } from 'react';

export default function DashboardScreen() {
  const navigation = useNavigation();
  const [totalBags, setTotalBags] = useState(248);
  const [weeklyOrders, setWeeklyOrders] = useState(35);
  const [fieldTeam, setFieldTeam] = useState(12);
  const [markets, setMarkets] = useState(8);

  // Data for summary cards
  const summaryData = [
    { 
      id: 1, 
      title: 'Inventory', 
      value: `${totalBags}`, 
      unit: 'Bags',
      icon: <MaterialCommunityIcons name="rice" size={28} color="#fff" />,
      color: '#3498db',
      onPress: () => navigation.navigate('Inventory')
    },
    { 
      id: 2, 
      title: 'Weekly Orders', 
      value: `${weeklyOrders}`, 
      unit: 'Orders',
      icon: <FontAwesome5 name="clipboard-list" size={24} color="#fff" />,
      color: '#e74c3c',
      onPress: () => navigation.navigate('MarketOrders')
    },
    { 
      id: 3, 
      title: 'Field Team', 
      value: `${fieldTeam}`, 
      unit: 'Members',
      icon: <FontAwesome name="users" size={24} color="#fff" />,
      color: '#2ecc71',
      onPress: () => navigation.navigate('MarketVisits')
    },
    { 
      id: 4, 
      title: 'Markets', 
      value: `${markets}`, 
      unit: 'Active',
      icon: <FontAwesome5 name="store" size={24} color="#fff" />,
      color: '#f39c12',
      onPress: () => navigation.navigate('MarketVisits')
    },
  ];

  // Data for recent activities
  const recentActivities = [
    { id: 1, text: 'Team A delivered 45 bags to Central Market', time: '2h ago' },
    { id: 2, text: 'New order from Eastern Market: 30 bags', time: '4h ago' },
    { id: 3, text: 'Inventory updated at Main Warehouse', time: '6h ago' },
    { id: 4, text: 'Sarah visited Northern Market', time: '1d ago' },
  ];

  return (
    <ScrollView style={styles.container}>
      {/* Header with greeting */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Rice Sales Dashboard</Text>
        <Text style={styles.headerSubtitle}>Good morning, Manager</Text>
      </View>
      
      {/* Summary cards */}
      <View style={styles.cardContainer}>
        {summaryData.map(item => (
          <TouchableOpacity 
            key={item.id} 
            style={[styles.card, { backgroundColor: item.color }]}
            onPress={item.onPress}
          >
            <View style={styles.cardIconContainer}>
              {item.icon}
            </View>
            <Text style={styles.cardTitle}>{item.title}</Text>
            <View style={styles.valueContainer}>
              <Text style={styles.cardValue}>{item.value}</Text>
              <Text style={styles.cardUnit}>{item.unit}</Text>
            </View>
          </TouchableOpacity>
        ))}
      </View>

      {/* Quick actions */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.quickActions}>
          <TouchableOpacity 
            style={styles.actionButton} 
            onPress={() => navigation.navigate('RecordInventory')}
          >
            <View style={[styles.actionIcon, { backgroundColor: '#3498db' }]}>
              <FontAwesome5 name="truck-loading" size={20} color="#fff" />
            </View>
            <Text style={styles.actionText}>Record Outgoing</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.actionButton} 
            onPress={() => navigation.navigate('CreateOrder')}
          >
            <View style={[styles.actionIcon, { backgroundColor: '#e74c3c' }]}>
              <FontAwesome5 name="clipboard-check" size={20} color="#fff" />
            </View>
            <Text style={styles.actionText}>Add Order</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.actionButton} 
            onPress={() => navigation.navigate('ScheduleVisit')}
          >
            <View style={[styles.actionIcon, { backgroundColor: '#2ecc71' }]}>
              <Ionicons name="location" size={20} color="#fff" />
            </View>
            <Text style={styles.actionText}>Record Visit</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Recent Activity */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Recent Activity</Text>
        <View style={styles.activityContainer}>
          {recentActivities.map(activity => (
            <View key={activity.id} style={styles.activityItem}>
              <View style={styles.activityDot} />
              <View style={styles.activityContent}>
                <Text style={styles.activityText}>{activity.text}</Text>
                <Text style={styles.activityTime}>{activity.time}</Text>
              </View>
            </View>
          ))}
        </View>
      </View>

      {/* Market Performance */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Market Performance</Text>
        <View style={styles.marketPerformanceContainer}>
          <View style={styles.marketItem}>
            <Text style={styles.marketName}>Central Market</Text>
            <View style={styles.progressContainer}>
              <View style={[styles.progressBar, { width: '80%', backgroundColor: '#3498db' }]} />
            </View>
            <Text style={styles.marketValue}>80%</Text>
          </View>
          <View style={styles.marketItem}>
            <Text style={styles.marketName}>Eastern Market</Text>
            <View style={styles.progressContainer}>
              <View style={[styles.progressBar, { width: '65%', backgroundColor: '#3498db' }]} />
            </View>
            <Text style={styles.marketValue}>65%</Text>
          </View>
          <View style={styles.marketItem}>
            <Text style={styles.marketName}>Western Market</Text>
            <View style={styles.progressContainer}>
              <View style={[styles.progressBar, { width: '45%', backgroundColor: '#3498db' }]} />
            </View>
            <Text style={styles.marketValue}>45%</Text>
          </View>
          <View style={styles.marketItem}>
            <Text style={styles.marketName}>Northern Market</Text>
            <View style={styles.progressContainer}>
              <View style={[styles.progressBar, { width: '90%', backgroundColor: '#3498db' }]} />
            </View>
            <Text style={styles.marketValue}>90%</Text>
          </View>
        </View>
      </View>

      <View style={styles.bottomPadding} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#2A6B57',
    padding: 20,
    paddingTop: 40,
    borderBottomLeftRadius: 25,
    borderBottomRightRadius: 25,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#E0E0E0',
    marginTop: 5,
  },
  cardContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    padding: 15,
    marginTop: -30,
  },
  card: {
    width: '48%',
    padding: 15,
    borderRadius: 15,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardIconContainer: {
    marginBottom: 10,
  },
  cardTitle: {
    fontSize: 14,
    color: '#fff',
    opacity: 0.8,
  },
  valueContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginTop: 5,
  },
  cardValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  cardUnit: {
    fontSize: 14,
    marginLeft: 5,
    color: '#fff',
    opacity: 0.8,
  },
  section: {
    padding: 15,
    marginTop: 5,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#333',
  },
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  actionButton: {
    alignItems: 'center',
    width: '30%',
  },
  actionIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  actionText: {
    fontSize: 12,
    color: '#333',
    textAlign: 'center',
  },
  activityContainer: {
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 15,
  },
  activityDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#2A6B57',
    marginTop: 5,
    marginRight: 10,
  },
  activityContent: {
    flex: 1,
  },
  activityText: {
    fontSize: 14,
    color: '#333',
  },
  activityTime: {
    fontSize: 12,
    color: '#999',
    marginTop: 3,
  },
  marketPerformanceContainer: {
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  marketItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  marketName: {
    width: '25%',
    fontSize: 14,
    color: '#333',
  },
  progressContainer: {
    flex: 1,
    height: 8,
    backgroundColor: '#E0E0E0',
    borderRadius: 4,
    marginHorizontal: 10,
  },
  progressBar: {
    height: '100%',
    borderRadius: 4,
  },
  marketValue: {
    width: '10%',
    fontSize: 14,
    textAlign: 'right',
    color: '#333',
  },
  bottomPadding: {
    height: 20,
  },
});