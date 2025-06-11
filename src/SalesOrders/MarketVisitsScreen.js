import { View, Text, StyleSheet, ScrollView, TouchableOpacity, FlatList, TextInput, Image } from 'react-native';
import { useState } from 'react';
import { FontAwesome5, MaterialIcons, Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

export default function MarketVisitsScreen() {
  const navigation = useNavigation();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTab, setSelectedTab] = useState('Upcoming');
  
  // Tabs data
  const tabs = ['Upcoming', 'Completed', 'All'];
  
  // Sample sales team data
  const teamMembers = [
    { 
      id: '1', 
      name: 'Sarah Johnson', 
      role: 'Team Lead',
      avatar: 'https://api.a0.dev/assets/image?text=SJ&aspect=1:1',
      activeMarkets: ['Central Market', 'Eastern Market'],
      lastVisit: '2h ago'
    },
    { 
      id: '2', 
      name: 'Michael Chen', 
      role: 'Sales Rep',
      avatar: 'https://api.a0.dev/assets/image?text=MC&aspect=1:1',
      activeMarkets: ['Western Market'],
      lastVisit: '1d ago'
    },
    { 
      id: '3', 
      name: 'Aisha Patel', 
      role: 'Sales Rep',
      avatar: 'https://api.a0.dev/assets/image?text=AP&aspect=1:1',
      activeMarkets: ['Northern Market', 'Southern Market'],
      lastVisit: '4h ago'
    },
    { 
      id: '4', 
      name: 'David Kim', 
      role: 'Sales Rep',
      avatar: 'https://api.a0.dev/assets/image?text=DK&aspect=1:1',
      activeMarkets: ['Central Market'],
      lastVisit: '2d ago'
    },
  ];
  
  // Sample visit schedule data
  const visitSchedule = [
    { 
      id: '1', 
      market: 'Central Market', 
      date: '09 Jun 2025', 
      time: '9:00 AM',
      status: 'Upcoming',
      team: ['Sarah Johnson', 'David Kim'],
      notes: 'Follow up on last week\'s premium rice orders'
    },
    { 
      id: '2', 
      market: 'Eastern Market', 
      date: '08 Jun 2025', 
      time: '11:30 AM',
      status: 'Completed',
      team: ['Sarah Johnson'],
      notes: 'Introduced new jasmine rice variety'
    },
    { 
      id: '3', 
      market: 'Western Market', 
      date: '10 Jun 2025', 
      time: '10:00 AM',
      status: 'Upcoming',
      team: ['Michael Chen'],
      notes: 'Promotion for premium basmati rice'
    },
    { 
      id: '4', 
      market: 'Northern Market', 
      date: '07 Jun 2025', 
      time: '2:00 PM',
      status: 'Completed',
      team: ['Aisha Patel'],
      notes: 'Market survey for organic rice demand'
    },
    { 
      id: '5', 
      market: 'Southern Market', 
      date: '11 Jun 2025', 
      time: '1:30 PM',
      status: 'Upcoming',
      team: ['Aisha Patel'],
      notes: 'New product introduction'
    },
  ];
  
  // Filter visits based on search and selected tab
  const filteredVisits = visitSchedule.filter(item => {
    const matchesSearch = item.market.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         item.team.some(member => member.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesTab = selectedTab === 'All' || item.status === selectedTab;
    return matchesSearch && matchesTab;
  });
  
  // Market stats data
  const marketStats = [
    { id: '1', name: 'Central Market', visits: 22, orders: 18, revenue: '$5,400' },
    { id: '2', name: 'Eastern Market', visits: 18, orders: 15, revenue: '$4,200' },
    { id: '3', name: 'Western Market', visits: 14, orders: 11, revenue: '$3,100' },
    { id: '4', name: 'Northern Market', visits: 16, orders: 13, revenue: '$3,600' },
    { id: '5', name: 'Southern Market', visits: 12, orders: 9, revenue: '$2,800' },
  ];

  const renderTeamMember = ({ item }) => (
    <TouchableOpacity style={styles.teamCard}>
      <Image source={{ uri: item.avatar }} style={styles.avatar} />
      <View style={styles.teamInfo}>
        <Text style={styles.teamName}>{item.name}</Text>
        <Text style={styles.teamRole}>{item.role}</Text>
      </View>
      <View style={styles.marketBadge}>
        <Text style={styles.marketCount}>{item.activeMarkets.length}</Text>
        <Text style={styles.marketLabel}>Markets</Text>
      </View>
    </TouchableOpacity>
  );

  const renderVisitItem = ({ item }) => (
    <TouchableOpacity style={[
      styles.visitItem,
      item.status === 'Completed' ? styles.completedVisit : styles.upcomingVisit
    ]}>
      <View style={styles.visitHeader}>
        <Text style={styles.visitMarket}>{item.market}</Text>
        <View style={[
          styles.statusBadge,
          item.status === 'Completed' ? styles.completedBadge : styles.upcomingBadge
        ]}>
          <Text style={[
            styles.statusText,
            item.status === 'Completed' ? styles.completedText : styles.upcomingText
          ]}>{item.status}</Text>
        </View>
      </View>
      
      <View style={styles.visitDetails}>
        <View style={styles.visitRow}>
          <View style={styles.visitIconContainer}>
            <Ionicons name="calendar-outline" size={16} color="#777" />
          </View>
          <Text style={styles.visitDetailText}>{item.date} • {item.time}</Text>
        </View>
        
        <View style={styles.visitRow}>
          <View style={styles.visitIconContainer}>
            <Ionicons name="people-outline" size={16} color="#777" />
          </View>
          <Text style={styles.visitDetailText}>{item.team.join(', ')}</Text>
        </View>
        
        {item.notes && (
          <View style={styles.visitRow}>
            <View style={styles.visitIconContainer}>
              <MaterialIcons name="notes" size={16} color="#777" />
            </View>
            <Text style={styles.visitDetailText}>{item.notes}</Text>
          </View>
        )}
      </View>
      
      <View style={styles.visitActions}>
        {item.status === 'Upcoming' ? (
          <>
            <TouchableOpacity style={styles.visitButton}>
              <Text style={styles.visitButtonText}>Reschedule</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.visitButton, styles.primaryButton]}>
              <Text style={styles.primaryButtonText}>Start Visit</Text>
            </TouchableOpacity>
          </>
        ) : (
          <>
            <TouchableOpacity style={styles.visitButton}>
              <Text style={styles.visitButtonText}>View Report</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.visitButton, styles.primaryButton]}>
              <Text style={styles.primaryButtonText}>Follow Up</Text>
            </TouchableOpacity>
          </>
        )}
      </View>
    </TouchableOpacity>
  );

  const renderMarketItem = ({ item }) => (
    <View style={styles.marketRow}>
      <Text style={styles.marketName}>{item.name}</Text>
      <View style={styles.marketStats}>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{item.visits}</Text>
          <Text style={styles.statLabel}>Visits</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{item.orders}</Text>
          <Text style={styles.statLabel}>Orders</Text>
        </View>
        <Text style={styles.revenueText}>{item.revenue}</Text>
      </View>
    </View>
  );

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.headerContainer}>
        <View style={styles.headerTextContainer}>
          <Text style={styles.headerTitle}>Market Visits</Text>
          <Text style={styles.headerSubtitle}>Team activity tracker</Text>
        </View>
        <TouchableOpacity 
          style={styles.addButton}
          onPress={() => navigation.navigate('ScheduleVisit')}
        >
          <FontAwesome5 name="plus" size={16} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* Search bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchInputContainer}>
          <FontAwesome5 name="search" size={16} color="#999" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search markets or team members..."
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </View>

      {/* Team section */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Sales Team</Text>
          <TouchableOpacity>
            <Text style={styles.seeAllText}>See All</Text>
          </TouchableOpacity>
        </View>
        
        <FlatList
          data={teamMembers}
          renderItem={renderTeamMember}
          keyExtractor={item => item.id}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.teamList}
        />
      </View>

      {/* Tabs */}
      <View style={styles.tabsContainer}>
        {tabs.map(tab => (
          <TouchableOpacity
            key={tab}
            style={[styles.tab, selectedTab === tab && styles.activeTab]}
            onPress={() => setSelectedTab(tab)}
          >
            <Text style={[styles.tabText, selectedTab === tab && styles.activeTabText]}>{tab}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Visit schedule */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Visit Schedule</Text>
        
        <FlatList
          data={filteredVisits}
          renderItem={renderVisitItem}
          keyExtractor={item => item.id}
          scrollEnabled={false}
          style={styles.visitsList}
        />
      </View>

      {/* Markets section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Market Performance</Text>
        
        <View style={styles.marketContainer}>
          <FlatList
            data={marketStats}
            renderItem={renderMarketItem}
            keyExtractor={item => item.id}
            scrollEnabled={false}
            style={styles.marketList}
          />
        </View>
      </View>

      {/* Schedule Visit Button */}
      <TouchableOpacity 
        style={styles.scheduleButton}
        onPress={() => navigation.navigate('ScheduleVisit')}
      >
        <FontAwesome5 name="calendar-plus" size={16} color="#fff" style={styles.scheduleIcon} />
        <Text style={styles.scheduleButtonText}>Schedule New Visit</Text>
      </TouchableOpacity>

      <View style={styles.bottomPadding} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  headerContainer: {
    backgroundColor: '#2A6B57',
    padding: 20,
    paddingBottom: 25,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTextContainer: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#fff',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#E0E0E0',
    marginTop: 5,
  },
  addButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchContainer: {
    paddingHorizontal: 15,
    paddingVertical: 15,
  },
  searchInputContainer: {
    backgroundColor: '#fff',
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    height: 45,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
  },
  section: {
    padding: 15,
    paddingTop: 5,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#333',
  },
  seeAllText: {
    color: '#2A6B57',
    fontSize: 14,
    fontWeight: '500',
  },
  teamList: {
    paddingRight: 15,
  },
  teamCard: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    marginRight: 12,
    width: 150,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginBottom: 10,
  },
  teamInfo: {
    alignItems: 'center',
  },
  teamName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    textAlign: 'center',
  },
  teamRole: {
    fontSize: 12,
    color: '#777',
    marginTop: 3,
    textAlign: 'center',
  },
  marketBadge: {
    backgroundColor: 'rgba(42, 107, 87, 0.1)',
    borderRadius: 15,
    paddingHorizontal: 12,
    paddingVertical: 5,
    marginTop: 10,
    alignItems: 'center',
  },
  marketCount: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#2A6B57',
  },
  marketLabel: {
    fontSize: 10,
    color: '#2A6B57',
  },
  tabsContainer: {
    flexDirection: 'row',
    marginHorizontal: 15,
    marginVertical: 10,
    backgroundColor: '#E0E0E0',
    borderRadius: 8,
    padding: 4,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 6,
  },
  activeTab: {
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  tabText: {
    fontSize: 14,
    color: '#555',
  },
  activeTabText: {
    fontWeight: '500',
    color: '#2A6B57',
  },
  visitsList: {
    backgroundColor: 'transparent',
  },
  visitItem: {
    borderRadius: 10,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  upcomingVisit: {
    backgroundColor: '#fff',
    borderLeftWidth: 4,
    borderLeftColor: '#3498db',
  },
  completedVisit: {
    backgroundColor: '#fff',
    borderLeftWidth: 4,
    borderLeftColor: '#2ecc71',
  },
  visitHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  visitMarket: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 15,
  },
  upcomingBadge: {
    backgroundColor: 'rgba(52, 152, 219, 0.15)',
  },
  completedBadge: {
    backgroundColor: 'rgba(46, 204, 113, 0.15)',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '500',
  },
  upcomingText: {
    color: '#3498db',
  },
  completedText: {
    color: '#2ecc71',
  },
  visitDetails: {
    padding: 15,
  },
  visitRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  visitIconContainer: {
    width: 24,
    marginRight: 8,
    alignItems: 'center',
  },
  visitDetailText: {
    fontSize: 14,
    color: '#555',
    flex: 1,
  },
  visitActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    padding: 15,
    paddingTop: 5,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  visitButton: {
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 6,
    marginLeft: 8,
  },
  visitButtonText: {
    fontSize: 14,
    color: '#555',
  },
  primaryButton: {
    backgroundColor: '#2A6B57',
  },
  primaryButtonText: {
    color: '#fff',
    fontWeight: '500',
  },
  marketContainer: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  marketList: {
    backgroundColor: 'transparent',
  },
  marketRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  marketName: {
    fontSize: 15,
    fontWeight: '500',
    color: '#333',
    width: '35%',
  },
  marketStats: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  statItem: {
    alignItems: 'center',
    width: '25%',
  },
  statValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  statLabel: {
    fontSize: 11,
    color: '#777',
  },
  revenueText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2A6B57',
    width: '25%',
    textAlign: 'right',
  },
  scheduleButton: {
    backgroundColor: '#2A6B57',
    borderRadius: 25,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
    alignSelf: 'center',
    marginVertical: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  scheduleIcon: {
    marginRight: 8,
  },
  scheduleButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
  },
  bottomPadding: {
    height: 20,
  },
});