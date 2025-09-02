import { useAuth } from '@/contexts/AuthContext';
import axios from 'axios';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, Alert, Image, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

import projectService from '../../services/projectService';

const Test = () => {
    const router = useRouter();

    const { user, loading: authLoading } = useAuth();

    const BASE_URL = "https://4a9cf9ee1b47.ngrok-free.app";
    const [loading, setLoading] = useState(false);

    const [objectImage, setObjectImage] = useState("...");
    const [ocrImage, setOcrImage] = useState(null);
    const [objectResult, setObjectResult] = useState(null);
    const [ocrResult, setOcrResult] = useState(null);
    const [isEditing, setIsEditing] = useState(true); // par défaut modifiable

    const [similarityScore, setSimilarityScore] = useState(null);

    const [inputHeight, setInputHeight] = useState(100); // hauteur par défaut



    // 📷 Choisir une image depuis la caméra
    const pickImage = async (type) => {
        const permission = await ImagePicker.requestCameraPermissionsAsync();
        if (!permission.granted) {
            alert('Permission refusée pour accéder à la caméra');
            return;
        }

        const result = await ImagePicker.launchCameraAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: false,
            base64: false,
        });

        if (!result.cancelled) {
            if (type === 'object') setObjectImage(result.assets[0]);
            else if (type === 'ocr') setOcrImage(result.assets[0]);
        }
    };

    // 🚀 Envoyer les images à l’API
    const handleSubmit = async () => {
        try {
            // 📤 1. Détection d’objet
            if (objectImage) {
                try {
                    setLoading(true);
                    const formData1 = new FormData();
                    formData1.append('obj_image', {
                        uri: objectImage.uri,
                        name: 'object.jpg',
                        type: 'image/jpeg',
                    });

                    const res1 = await axios.post(`${BASE_URL}/detect_object`, formData1, {
                        headers: {
                            "ngrok-skip-browser-warning": "true",
                            'Content-Type': 'multipart/form-data'
                        },
                    });
                    setLoading(false);
                    if (res1?.data) {
                        setObjectResult(res1.data);
                    } else {
                        setObjectResult("Error");
                    }
                    // setObjectResult(res1?.data ? res1.data : "Error");
                    console.log("res1.data :", res1.data);
                } catch (error) {
                    console.error("Erreur detect_object:", error);
                    alert("Erreur lors de l'envoi de l'image objet");
                }

            }

            // 📤 2. OCR
            if (ocrImage) {
                try {
                    setLoading(true);
                    const formData2 = new FormData();
                    formData2.append('ocr_image', {
                        uri: ocrImage.uri,
                        name: 'ocr.jpg',
                        type: 'image/jpeg',
                    });

                    const res2 = await axios.post(`${BASE_URL}/upload_ocr_image`, formData2, {
                        headers: {
                            'Content-Type': 'multipart/form-data',
                        },
                    });
                    setLoading(false);
                    setOcrResult(res2?.data ? res2.data : "Error");
                } catch (error) {
                    console.error("Erreur lors de l'envoi de l'image OCR:", error);
                    alert("Erreur lors de l'envoi de l'image OCR");
                }

            }
        } catch (error) {
            console.error("Erreur lors de l’envoi:", error);
            alert("Erreur lors de l'envoi des images");
        }
    };

    const handleMatch = async () => {
        if (!ocrResult || !objectResult) return;

        try {
            setLoading(true);
            const res = await axios.post(`${BASE_URL}/match`, {
                ocr_text: ocrResult?.text,
                detected_obj: objectResult?.classes
            });

            setSimilarityScore(res.data.score);
            setLoading(false);
        } catch (error) {
            console.error("Erreur lors du match:", error);
            setLoading(false);
        }
    };

    const handleSave = async () => {
        try {
            const response = await projectService.addUserHistorique(user.$id, similarityScore, objectResult?.classes, ocrResult?.text);
            if (response.error) {
                Alert.alert('Error from server ', response.error);
            } else {
                alert("Historique ajouté avec succès🟢");
                setObjectImage(null);
                setOcrImage(null);
                setObjectResult(null);
                setOcrResult(null);
                setSimilarityScore(null);
            }
        } catch (error) {
            console.error("Erreur lors de l'ajout de l'historique:", error);
            alert("Erreur lors de l'ajout de l'historique a la BD");

        }
    }


    return (
        <ScrollView contentContainerStyle={styles.scrollContainer}>
            <View style={styles.container}>
                <Text style={styles.title}>Formulaire - Détection</Text>

                <TouchableOpacity style={styles.button} onPress={() => pickImage('object')} >
                    <Text style={styles.buttonText}>📸 Prendre photo pour détection objet</Text>
                </TouchableOpacity>
                {objectImage && <Image source={{ uri: objectImage.uri }} style={styles.image} />}

                <TouchableOpacity style={styles.button} onPress={() => pickImage('ocr')}>
                    <Text style={styles.buttonText}>📸 Prendre photo pour OCR</Text>
                </TouchableOpacity>
                {ocrImage && <Image source={{ uri: ocrImage.uri }} style={styles.image} />}

                {ocrImage && objectImage && (

                    <TouchableOpacity style={styles.button} onPress={handleSubmit}>
                        <Text style={styles.buttonText}>🚀 Envoyer les deux images</Text>
                    </TouchableOpacity>
                )}

                {/* 2 .API */}
                <Text style={styles.result}>
                    <Text >🎯 Résultat Objets: </Text>
                    <Text>{objectResult?.classes && objectResult.classes.length > 0 ? objectResult?.classes : objectResult}</Text>
                </Text>
                {loading && !ocrResult && <ActivityIndicator size="large" color="#fefae0" />}
                {ocrResult && (
                    isEditing ? (
                        <>
                            <Text style={styles.label}>📝 Résultat OCR modifiable :</Text>
                            <TextInput
                                style={styles.input}
                                multiline={true}
                                value={ocrResult.text}
                                onChangeText={(text) =>
                                    setOcrResult((prev) => ({ ...prev, text }))
                                }
                                onContentSizeChange={(e) =>
                                    setInputHeight(e.nativeEvent.contentSize.height)
                                }

                            />

                            <TouchableOpacity onPress={() => setIsEditing(false)} style={styles.buttonModify} >
                                <Text style={styles.buttonText}>✅ Valider</Text>
                            </TouchableOpacity>
                        </>
                    ) : (
                        <>
                            <Text style={styles.result}>
                                <Text >📝 Résultat OCR :</Text>
                                <Text>{ocrResult.text}</Text>
                            </Text>
                            <TouchableOpacity style={styles.buttonModify} onPress={() => setIsEditing(true)}>
                                <Text style={styles.buttonText}>✏️ Modifier</Text>
                            </TouchableOpacity>

                        </>
                    )
                )}


                {/* 3 .API */}
                {ocrResult && ocrResult && objectResult && (
                    // <Button style={styles.result} title="✅ Vérifier similarité" onPress={handleMatch} />
                    <TouchableOpacity style={styles.button} onPress={handleMatch}>
                        <Text style={styles.buttonText}>✅ Vérifier similarité</Text>
                    </TouchableOpacity>
                )}
                {loading && ocrResult && <ActivityIndicator size="large" color="#fefae0" />}

                {similarityScore !== null && (
                    <>
                        <Text style={styles.result}>
                            <Text style={styles.result}>🔁 Score de similarité :</Text>
                            <Text> {similarityScore}</Text>
                        </Text>
                        <TouchableOpacity style={styles.button} onPress={handleSave}>
                            <Text style={styles.buttonText}>💾 Enregistrer</Text>
                        </TouchableOpacity>
                    </>
                )}


            </View>
        </ScrollView >
    );
}



export default Test;
const styles = StyleSheet.create({
    container: { padding: 20, flex: 1, marginBottom: 30 },
    scrollContainer: {
        flexGrow: 1, paddingBottom: 250, backgroundColor: "#D4A373"
    },
    image: { width: 200, height: 200, marginVertical: 10 },
    title: { fontSize: 22, fontWeight: 'bold', marginBottom: 20, alignItems: "center" },
    result: { marginVertical: 20, fontWeight: "bold" },
    input: { height: 80, borderColor: 'gray', borderWidth: 1, marginBottom: 20, paddingHorizontal: 5 },
    label: { mmarginVertical: 10 },
    button: {
        backgroundColor: "#CCD5AE",
        borderRadius: 8,
        paddingVertical: 12,
        paddingHorizontal: 25,
        marginVertical: 10, alignItems: "stretch"
    },
    buttonText: { fontWeight: "bold", fontSize: 14 },
    buttonModify: {
        backgroundColor: "#fefae0",
        borderRadius: 8,
        paddingVertical: 12,
        width: 150,
        paddingHorizontal: 20,
        marginBottom: 50
    }

});
