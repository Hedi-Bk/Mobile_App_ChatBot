import { useRouter } from "expo-router";
import { useState } from "react";
import { Alert, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { useAuth } from "../../contexts/AuthContext";

export default function AuthPage() {

  const { login, register, user } = useAuth();
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setconfirmPassword] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);
  const [error, setError] = useState(true);



  const handleAuth = async () => {
    if (!email.trim() || !password.trim()) {
      setError('Email and password are required');
      return;
    }
    if (isRegistering && password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    let response;
    if (isRegistering) {
      response = await register(email, password);
    } else {
      response = await login(email, password);
    }
    if (response?.error) {
      Alert.alert("Error", response.error);
      return
    }
    const ADMIN_EMAIL = process.env.EXPO_PUBLIC_ADMIN_EMAIL;
    if (email.trim() === ADMIN_EMAIL.trim()) {
      router.replace("/chat");   // Admin → Chat
    } else {
      router.replace("/test");   // Autres → Test
    }

  }

  return (
    <View style={styles.container}>
      <Text style={styles.header}>{isRegistering ? "Sign Up" : "Login"}</Text>
      {error ? <Text style={{ color: "red" }}>{error}</Text> : null}
      <TextInput
        style={styles.input}
        placeholder="Email"
        value={email}
        onChangeText={(text) => setEmail(text)}
        autoCapitalize="none"
        placeholderTextColor="#000"
        keyboardType="email-address"
      />
      <TextInput
        style={styles.input}
        placeholder="Password"
        value={password}
        onChangeText={(text) => setPassword(text)}
        placeholderTextColor="#000"
        secureTextEntry
      />
      {isRegistering && (
        <TextInput
          style={styles.input}
          placeholder="Confirm Password"
          value={confirmPassword}
          onChangeText={(text) => setconfirmPassword(text)}
          placeholderTextColor="#000"
          secureTextEntry
        />
      )}
      <TouchableOpacity style={styles.button} onPress={handleAuth}>
        <Text style={styles.buttonText} >
          {isRegistering ? "Sign Up" : "Login"}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => setIsRegistering(!isRegistering)}>
        <Text style={styles.switchText}>
          {isRegistering ? "Already have an account? Login" : "Don't have an account? Sign Up"}
        </Text>
      </TouchableOpacity>


    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#D4A373",
    justifyContent: "center",
    alignItems: "center",
    padding: 20
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
  },
  header: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 20
  },
  input: {
    width: "100%",
    height: 40,
    borderColor: "#ccc",
    borderWidth: 1,
    marginBottom: 10,
    paddingHorizontal: 10,
  },
  button: {
    backgroundColor: "#E9EDC9",
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 25,
  },
  buttonText: {
    fontWeight: "bold",
    fontSize: 18,
    color: "#333",
  },
  switchText: {
    marginTop: 20,
    color: "#333",
    fontSize: 18,
  },
});
