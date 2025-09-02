import PostImage from "@/assets/images/HomePageLogo.png";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "expo-router";
import { ActivityIndicator, Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
export default function Index() {

  const { user, loading } = useAuth();


  const ADMIN_EMAIL = process.env.EXPO_PUBLIC_ADMIN_EMAIL;

  const router = useRouter();
  const handlePress = () => {
    if (!user) {
      // Si aucun utilisateur connecté
      router.push('/auth');
    } else if (user.email == ADMIN_EMAIL) {
      // Si c'est l'admin
      router.replace('/chat');
    } else {
      // Si c'est un utilisateur normal
      router.replace('/test');
    }
  };


  if (loading) {
    return (
      <View style={styles.CenteredContainer}>
        <Text>Loading...</Text>
        <ActivityIndicator size={"large"} color="blue" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Image source={PostImage} style={styles.image}></Image>

      <Text style={styles.title}>
        Welcom to The Obejct Detetction App
      </Text>
      <Text style={styles.subtitle}>
        Here u detect your object by taking a photo of them , plus you can
        convert image to text
      </Text>


      <TouchableOpacity style={styles.button} onPress={handlePress}>
        <Text style={styles.buttonText}>Scan your product !</Text>
      </TouchableOpacity>


    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#D4A373",
    padding: 20,
  },
  image: { width: 100, height: 100, marginBottom: 20, borderRadius: 10 },
  title: { fontSize: 20, fontWeight: "bold", color: "#333", marginBottom: 10 },
  subtitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#666",
    marginBottom: 20,
  },
  button: {
    backgroundColor: "#CCD5AE",
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 25, marginBottom: 10
  },
  buttonText: { fontWeight: "bold", fontSize: 18 },
  CenteredContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    textAlign: "center"
  }
});
