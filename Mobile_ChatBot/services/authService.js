import { ID } from "react-native-appwrite";
import { account } from "./appwrite";

const authService = {
  // Rgister a User
  async register(email, password) {
    try {
      const response = await account.create(ID.unique(), email, password);
      return response;
    } catch (error) {
      return {
        error:
          error.message || "Registration failed from authservice Try again ❌",
      };
    }
  },
  // Login a User
  async login(email, password) {
    try {
      const response = await account.createEmailPasswordSession(
        email,
        password
      );
      return response;
    } catch (error) {
      return {
        error: error.message || "Login failed from authservice Try again ❌",
      };
    }
  },
  // get logged in User
  async getUser() {
    try {
      return await account.get();
    } catch (error) {
      return null;
    }
  },
  // Logout  User
  async logout() {
    try {
      await account.deleteSession("current");
    } catch (error) {
      return {
        error: error.message || "Logout failed from authservice Try again ❌",
      };
    }
  },
};

export default authService;
