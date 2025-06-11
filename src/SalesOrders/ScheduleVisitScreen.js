import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, FlatList, Image } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useState } from 'react';
import { FontAwesome5, Ionicons, MaterialIcons } from '@expo/vector-icons';
import { Picker } from '@react-native-picker/picker';

export default function ScheduleVisitScreen() {
  const navigation = useNavigation();
  const [market, setMarket] = useState('');
  const [visitDate, setVisitDate] = useState('');
  const [visitTime, setVisitTime] = useState('');
  const [purpose, setPurpose] = useState('');
  const [notes, setNotes] = useState('');
  const [selectedTeamMembers, setSelectedTeamMembers] = useState([]);
  
  // Sample data
  const markets = [
    'Central Market',
    'Eastern Market',
    'Western Market',
    'Northern Market',
    'Southern Market',
  ];
  
  const purposes = [
    'Product Introduction',
    'Market Survey',
    'Order Follow-up',
    'Relationship Building',
    'Price Negotiation',
    'Product Promotion'
  ];
  
  const teamMembers = [
    { 
      id: '1', 
      name: 'Sarah Johnson', 
      role: 'Team Lead',
      avatar: 'https://api.a0.dev/assets/image?text=SJ&aspect=1:1',
      isSelected: false
    },
    { 
      id: '2', 
      name: 'Michael Chen', 
      role: 'Sales Rep',
      avatar: 'https://api.a0.dev/assets/image?text=MC&aspect=1:1',
      isSelected: false
    },
    { 
      id: '3', 
      name: 'Aisha Patel', 
      role: 'Sales Rep',
      avatar: 'https://api.a0.dev/assets/image?text=AP&aspect=1:1',
      isSelected: false
    },
    { 
      id: '4', 
      name: 'David Kim', 
      role: 'Sales Rep',
      avatar: 'https://api.a0.dev/assets/image?text=DK&aspect=1:1',
      isSelected: false
    },
  ];

  const toggleTeamMember = (id) => {
    if (selectedTeamMembers.includes(id)) {
      setSelectedTeamMembers(selectedTeamMembers.filter(memberId => memberId !== id));
    } else {
      setSelectedTeamMembers([...selectedTeamMembers, id]);
    }
  };

  const getSelectedTeamNames = () => {
    return teamMembers
      .filter(member => selectedTeamMembers.includes(member.id))
      .map(member => member.name)
      .join(', ');
  };

  const renderTeamMember = ({ item }) => {
    const isSelected = selectedTeamMembers.includes(item.id);
    
    return (
      <TouchableOpacity 
        style={[styles.teamCard, isSelected && styles.selectedTeamCard]}
        onPress={() => toggleTeamMember(item.id)}
      >
        <Image source={{ uri: item.avatar }} style={styles.avatar} />
        <View style={styles.teamInfo}>
          <Text style={styles.teamName}>{item.name}</Text>
          <Text style={styles.teamRole}>{item.role}</Text>
        </View>
        <View style={[styles.checkCircle, isSelected && styles.checkedCircle]}>
          {isSelected && <Ionicons name="checkmark" size={16} color="#fff" />}
        </View>
      </TouchableOpacity>
    );
  };

  const handleSubmit = () => {
    // Here we would save the visit data
    // Then navigate back to visits screen
    navigation.goBack();
  };

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Schedule New Visit</Text>
        <Text style={styles.headerSubtitle}>Plan your market visits</Text>
      </View>

      <View style={styles.formContainer}>
        {/* Market Selection */}
        <View style={styles.formSection}>
          <Text style={styles.sectionTitle}>Market</Text>
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={market}
              onValueChange={setMarket}
              style={styles.picker}
            >
              <Picker.Item label="Select a market" value="" />
              {markets.map((item, index) => (
                <Picker.Item key={index} label={item} value={item} />
              ))}
            </Picker>
          </View>
        </View>

        {/* Visit Date */}
        <View style={styles.formSection}>
          <Text style={styles.sectionTitle}>Visit Date</Text>
          <TouchableOpacity style={styles.inputContainer}>
            <View style={styles.datePickerField}>
              <TextInput
                style={styles.input}
                placeholder="Select visit date"
                value={visitDate}
                onChangeText={setVisitDate}
              />
              <FontAwesome5 name="calendar-alt" size={20} color="#777" />
            </View>
          </TouchableOpacity>
        </View>

        {/* Visit Time */}
        <View style={styles.formSection}>
          <Text style={styles.sectionTitle}>Visit Time</Text>
          <TouchableOpacity style={styles.inputContainer}>
            <View style={styles.datePickerField}>
              <TextInput
                style={styles.input}
                placeholder="Select visit time"
                value={visitTime}
                onChangeText={setVisitTime}
              />
              <Ionicons name="time-outline" size={20} color="#777" />
            </View>
          </TouchableOpacity>
        </View>

        {/* Visit Purpose */}
        <View style={styles.formSection}>
          <Text style={styles.sectionTitle}>Purpose of Visit</Text>
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={purpose}
              onValueChange={setPurpose}
              style={styles.picker}
            >
              <Picker.Item label="Select purpose" value="" />
              {purposes.map((item, index) => (
                <Picker.Item key={index} label={item} value={item} />
              ))}
            </Picker>
          </View>
        </View>

        {/* Team Members */}
        <View style={styles.formSection}>
          <Text style={styles.sectionTitle}>Team Members</Text>
          <Text style={styles.selectionHint}>Select team members for this visit</Text>
          
          {selectedTeamMembers.length > 0 ? (
            <View style={styles.selectedTeamContainer}>
              <Text style={styles.selectedTeamLabel}>Selected: </Text>
              <Text style={styles.selectedTeamNames}>{getSelectedTeamNames()}</Text>
            </View>
          ) : null}
          
          <View style={styles.teamMembersContainer}>
            <FlatList
              data={teamMembers}
              renderItem={renderTeamMember}
              keyExtractor={item => item.id}
              horizontal={false}
              scrollEnabled={false}
            />
          </View>
        </View>

        {/* Notes Field */}
        <View style={styles.formSection}>
          <Text style={styles.sectionTitle}>Visit Agenda & Notes</Text>
          <View style={styles.inputContainer}>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Add agenda items or other notes for the visit"
              value={notes}
              onChangeText={setNotes}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity 
            style={styles.cancelButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.submitButton}
            onPress={handleSubmit}
          >
            <Text style={styles.submitButtonText}>Schedule Visit</Text>
          </TouchableOpacity>
        </View>
      </View>
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
    paddingBottom: 25,
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
  formContainer: {
    padding: 15,
  },
  formSection: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  selectionHint: {
    fontSize: 14,
    color: '#777',
    marginBottom: 12,
  },
  pickerContainer: {
    backgroundColor: '#fff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    overflow: 'hidden',
  },
  picker: {
    height: 50,
  },
  inputContainer: {
    backgroundColor: '#fff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  datePickerField: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
  },
  input: {
    fontSize: 16,
    padding: 12,
    flex: 1,
  },
  textArea: {
    height: 100,
  },
  selectedTeamContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  selectedTeamLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
  },
  selectedTeamNames: {
    fontSize: 14,
    color: '#2A6B57',
    flex: 1,
  },
  teamMembersContainer: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 10,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  teamCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  selectedTeamCard: {
    backgroundColor: 'rgba(42, 107, 87, 0.05)',
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  teamInfo: {
    flex: 1,
    marginLeft: 15,
  },
  teamName: {
    fontSize: 15,
    fontWeight: '500',
    color: '#333',
  },
  teamRole: {
    fontSize: 13,
    color: '#777',
    marginTop: 2,
  },
  checkCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#ddd',
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkedCircle: {
    backgroundColor: '#2A6B57',
    borderColor: '#2A6B57',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
    marginBottom: 30,
  },
  cancelButton: {
    flex: 1,
    padding: 15,
    borderRadius: 8,
    backgroundColor: '#f5f5f5',
    alignItems: 'center',
    marginRight: 10,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  cancelButtonText: {
    fontSize: 16,
    color: '#555',
    fontWeight: '500',
  },
  submitButton: {
    flex: 2,
    padding: 15,
    borderRadius: 8,
    backgroundColor: '#2A6B57',
    alignItems: 'center',
  },
  submitButtonText: {
    fontSize: 16,
    color: '#fff',
    fontWeight: '500',
  },
});