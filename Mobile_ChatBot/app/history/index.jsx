import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useAuth } from "../../contexts/AuthContext";
import projectService from "../../services/projectService";


const History = () => {

    const router = useRouter();
    const { user, loading: authLoading } = useAuth();
    const [userHistory, setUserHistory] = useState([])

    useEffect(() => {
        if (!authLoading && !user) {
            router.replace('/auth');
        }
    }, [user, authLoading]);
    useEffect(() => {
        if (user) {
            fetchUserHistory()
        }
    }, [user])


    const fetchUserHistory = async () => {
        const response = await projectService.getUserHistorique(user.$id)
        if (response.error) {
            Alert.alert('Error fetching data', response.error);
        } else {
            setUserHistory(response)
        }
    }
    const onDelete = async (id) => {

        //setUserHistory(userHistory.filter((item) => item.$id !== id))
        Alert.alert('Delete Note', 'Are you sure you want to delete this note?', [
            {
                text: 'Cancel',
                style: 'cancel',
            },
            {
                text: 'Delete',
                style: 'destructive',
                onPress: async () => {
                    const response = await projectService.deleteUserHistorique(id)
                    if (response.error) {
                        Alert.alert("Error while getting id of the element to delete", response.error);
                    } else {
                        setUserHistory(userHistory.filter((item) => item.$id !== id))
                    }
                }
            },
        ]);

    }
    return (
        <ScrollView>
            <View>
                {userHistory.length === 0 ?
                    <Text style={styles.title}>No history found</Text>
                    : userHistory.map((item, index) => (
                        <View key={index} style={styles.noteItem} >
                            <TouchableOpacity style={{ position: 'absolute', top: 0, right: 0, fontSize: 30, width: 40, height: 50 }} onPress={() => onDelete(item.$id)}>
                                <Text style={{ position: 'absolute', justifyContent: 'center', alignItems: 'center', top: 2, right: 2, fontSize: 30 }}>❌</Text>
                            </TouchableOpacity>
                            <Text >
                                <Text style={styles.title}>Facture N°:</Text>
                                <Text style={styles.description}>{index + 1}</Text>
                            </Text>
                            <Text style={styles.lines}>
                                <Text style={styles.title}>Text From Facture: </Text>
                                <Text style={styles.description}>{item.OCR}</Text>
                            </Text>
                            <Text style={styles.lines}>
                                <Text style={styles.title}>Object Detetcted :</Text>
                                <Text style={styles.description}>{item.objectDetected}</Text>
                            </Text>
                            <Text style={styles.lines}>
                                <Text style={styles.title}>Similarity Score:</Text>
                                <Text style={styles.description}>{item.similarityScore}</Text>
                            </Text>
                            <Text style={styles.lines}>
                                <Text style={styles.title}>Time of Facture:</Text>
                                <Text style={styles.description}>{item.createdAt}</Text>
                            </Text>

                        </View>
                    ))}
            </View>
        </ScrollView>
    );

}
export default History;

const styles = StyleSheet.create({
    noteItem: {
        backgroundColor: '#f5f5f5',
        padding: 15,
        borderRadius: 5,
        marginVertical: 5,
    }, title: {
        fontSize: 18,
        fontWeight: 'bold',
    }, description: {
        fontSize: 18,
    }, lines: { padding: 10 }

});