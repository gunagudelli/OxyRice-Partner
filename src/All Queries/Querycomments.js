import { Dimensions, StyleSheet, Text, View ,FlatList,Linking,Alert,TouchableOpacity} from 'react-native'
import React,{useEffect, useState} from 'react'
const {height,width}=Dimensions.get('window')
const Querycomments = ({route,navigation}) => {
    const [details, setDetails] = useState([])
    
    useEffect(() => {
            setDetails(route.params.details.userPendingQueries);
    },[])
    console.log(route.params.details.userPendingQueries[0]);
    
    function handleOpenPath(url) {
      console.log("open path");
      console.log({ url });
      const fileExtension = url;
      const filePath = `${url}`; // Update the base URL to your file storage
        
        if (fileExtension === 'jpg' || fileExtension === 'png' || fileExtension === 'jpeg' || fileExtension === 'svg') {
            Linking.openURL(filePath);
        }
        else if
        (fileExtension === 'pdf') {
            Linking.openURL(filePath);
        }
        else {
            Alert.alert('Unsupported file format');
        }
    }

    const renderItem = ({item}) => {
        return (
          <View style={styles.card}>
            <Text style={styles.header}>{item.resolvedBy}</Text>
            <View style={styles.row}>
              <Text style={styles.left}>Ticket Id</Text>
              <Text style={styles.right}>
                {item.randomId}
              </Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.left}>Query</Text>
              <Text style={styles.right}>{item.pendingComments}</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.left}>Responded On</Text>
              <Text style={styles.right}>
                {item.resolvedOn?.substring(0, 10)}
              </Text>
            </View>
            {item.resolvedBy == "admin" ? (
              <View style={styles.row}>
                <Text style={styles.left}>File</Text>
                <TouchableOpacity
                  onPress={() => handleOpenPath(item.adminFilePath)}
                >
                  <Text style={styles.rightFilePath}>{item.adminFileName}</Text>
                </TouchableOpacity>
              </View>
            ) : null}
          </View>
        );
}



  return (
    <View style={styles.container}>
          <Text style={{
              alignSelf: "center",
              fontSize: 20,
              marginVertical: 10,
              fontWeight:"bold"
      }}>View User and Admin replies</Text>

          { details.length>0  ?
              <FlatList
                  data={details}
                  keyExtractor={(item) => item.id}
                  renderItem={renderItem}
                  contentContainerStyle={styles.container}
              />
              :
              <Text style={styles.empty}>No Data Found</Text>
              }
  
    </View>
  );
}

export default Querycomments

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#c0c0c0",
    flex: 1,
    padding: 5,
  },
  card: {
    backgroundColor: "white",
    width: width * 0.9,
    alignSelf: "center",
    padding: 5,
    marginBottom: 10,
    borderRadius: 5,
    elevation: 5,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 15,
  },
  left: {
    width: width * 0.3,
    fontWeight: "bold",
    fontSize: 15,
  },
  right: {
    width: width * 0.55,
  },
  rightFilePath: {
    width: width * 0.55,
    color: "green",
  },
  header: {
    fontSize: 18,
    fontWeight: "bold",
    textTransform: "uppercase",
    marginVertical: 5,
    color: "orange",
    paddingLeft: 3,
  },
    empty:{
        justifyContent: "center",
        alignSelf: "center",
        fontSize: 18,
        marginTop: height * 0.1
  }
});