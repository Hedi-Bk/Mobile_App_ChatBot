import axios from "axios";
import { useEffect, useState } from "react";
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import Markdown from "react-native-markdown-display";


export default function App() {

    // Assurez-vous que cette variable d'environnement est définie

    const myApiKey = process.env.EXPO_PUBLIC_OPENAI_API_KEY;


    // URL de base du backend exposé via Ngrok.
    // ⚠️ Attention : cette URL est temporaire et change à chaque nouvelle session Ngrok. 
    // Pour un usage en production, il vaut mieux utiliser un domaine fixe (ex: ton propre serveur ou un reverse proxy).

    const BASE_URL = "https://4a9cf9ee1b47.ngrok-free.app";

    const [apiKey, setApiKey] = useState(myApiKey);
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [messages, setMessages] = useState([]);
    const [userMessage, setUserMessage] = useState("");
    const [isLoading, setIsLoading] = useState(false);


    useEffect(() => {
        console.log("Messages", messages);
    }, [messages]);

    const handleSubmitApiKey = () => {
        if (!apiKey) {
            alert("Please enter your API Key");
            return;
        }
        setIsSubmitted(true);
        setMessages((prev) => [
            ...prev,
            { role: "system", content: "✅ Welcome! Your API key is saved." },
        ]);
    };

    const sendMessage = async () => {
        if (!userMessage.trim()) return;

        // Affiche le message de l'utilisateur
        setMessages((prev) => [...prev, { role: "user", content: userMessage }]);
        const messageToSend = userMessage;
        setUserMessage("");

        setIsLoading(true);
        try {
            const response = await axios.post(
                `${BASE_URL}/rag_chat`, // ton backend Flask
                { question: messageToSend },              // ici le message devient la question
                { headers: { "Content-Type": "application/json" } }
            );

            const reply = response.data.response;

            setMessages((prev) => [...prev, { role: "assistant", content: reply }]);
        } catch (error) {
            console.log(error);
            alert("Error: " + error.message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <View style={styles.container}>
            {!isSubmitted ? (
                <>
                    <Text style={styles.title}>Enter your OpenRouter API Key</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="Paste your API Key here"
                        value={apiKey}
                        onChangeText={setApiKey}
                    />
                    <TouchableOpacity onPress={handleSubmitApiKey} style={styles.button}>
                        <Text style={styles.buttonText}>Submit API Key</Text>
                    </TouchableOpacity>
                </>
            ) : (
                <KeyboardAwareScrollView
                    // style={{ flex: 1, backgroundColor: "#fff" }}
                    contentContainerStyle={{ flexGrow: 1, justifyContent: "flex-end" }}
                    enableOnAndroid={true}
                    extraScrollHeight={200} // ajuste la distance au clavier
                >
                    <View style={styles.chatBox}>
                        <>
                            {messages.map((msg, idx) => (
                                <Text
                                    key={idx}
                                    style={msg.role === "assistant"
                                        ? styles.assistant
                                        : msg.role === "user"
                                            ? styles.user
                                            : styles.system
                                    }
                                >
                                    <Markdown>
                                        {`**${msg.role.toUpperCase()}**` + " : \n" + msg.content.trim()}
                                    </Markdown>
                                </Text>
                            ))}
                        </>
                        {isLoading && (
                            <Text style={{ fontStyle: "italic", marginBottom: 5 }}>
                                Assistant is typing...
                            </Text>
                        )}
                    </View>
                    <TextInput
                        style={styles.input}
                        placeholder="Type your message..."
                        value={userMessage}
                        onChangeText={setUserMessage}
                        multiline={true}        // permet d'écrire plusieurs lignes
                        numberOfLines={3}
                        textAlignVertical="top"    // important pour Android, aligne le texte en haut
                        scrollEnabled={true}       // permet de scroller si le texte dépasse
                    />
                    <TouchableOpacity onPress={sendMessage} style={styles.button}>
                        <Text style={styles.buttonText}>Send Message</Text>
                    </TouchableOpacity>
                </KeyboardAwareScrollView>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        backgroundColor: "#D4A373",
        justifyContent: "center",
        alignItems: "center",

    },
    title: {
        fontSize: 20,
        marginBottom: 15,
        textAlign: "center",
    },
    input: {
        borderWidth: 1,
        borderColor: "#ccc",
        padding: 10,
        marginBottom: 15,
        borderRadius: 8,
        maxWidth: "99%",      // limite la hauteur du TextInput
        width: "99%",


    },
    chatBox: {
        flex: 1,
        marginBottom: 10,
    },
    assistant: {
        backgroundColor: "#e0ffe0",
        padding: 10,
        borderRadius: 6,
        marginBottom: 8,
    },
    user: {
        backgroundColor: "#e0e0ff",
        padding: 10,
        borderRadius: 6,
        marginBottom: 8,
    },
    system: {
        backgroundColor: "#FAEDCD",
        padding: 10,
        borderRadius: 6,
        marginBottom: 8,
    },
    button: {
        backgroundColor: "#CCD5AE",
        padding: 10,
        borderRadius: 8,
    }, buttonText: {
        color: "#333",
        fontWeight: "bold",
        textAlign: "center",
    },
});
