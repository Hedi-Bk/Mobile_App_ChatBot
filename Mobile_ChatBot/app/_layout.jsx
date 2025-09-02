import { Stack, useRouter } from "expo-router";
import { StyleSheet, Text, TouchableOpacity } from "react-native";
import { AuthProvider, useAuth } from "../contexts/AuthContext";


const HeaderLogout = () => {
  const router = useRouter(); // ✅ pour rediriger

  const handleLogout = async () => {
    await logout();        // Déconnexion
    router.replace("/");      // Redirection vers la page principale
  };
  const { logout, user } = useAuth();
  return user ? (
    <TouchableOpacity onPress={handleLogout} style={styles.logout}>
      <Text style={styles.logoutText}>Logout</Text>
    </TouchableOpacity>
  ) : null
}

const History = () => {
  const { logout, user } = useAuth();
  const router = useRouter();
  return user ? (
    <TouchableOpacity style={styles.logout} onPress={() => { router.push("/history") }}>
      <Text style={styles.logoutText}>Historique</Text>
    </TouchableOpacity>
  ) : null
}
export default function Layout() {

  return (
    <>
      <AuthProvider>
        <Stack
          screenOptions={{
            headerBackVisible: true,
            headerStyle: { backgroundColor: "#FAEDCD" },
            headerTintColor: "black",
            headerTintStyle: { fontWeight: "bold", fontsize: 20 },
            contentStyle: { paddingVertical: 10, paddingHorizontal: 20, backgroundColor: "#D4A373", marginBottom: 30 },

          }}
        >
          <Stack.Screen name="index" options={{ title: "Home" }} />
          <Stack.Screen name="auth" options={{ headerTitle: "Auth" }} />
          <Stack.Screen name="test" options={{
            headerTitle: "Testing", headerRight: () =>
              <>
                <HeaderLogout />
                <History />
              </>
          }} />
          <Stack.Screen name="history/index" options={{ headerTitle: "History" }} />
          <Stack.Screen name="chat" options={{
            headerTitle: "Chat", headerRight: () =>
              <>
                <HeaderLogout />
              </>
          }} />

        </Stack>
      </AuthProvider >
    </>
  );
}


const styles = StyleSheet.create({
  logout: {
    backgroundColor: "#CCD5AE",
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 22,
    marginVertical: 10, marginRight: 10
  },
  logoutText: { fontWeight: "bold", fontSize: 12 },
});