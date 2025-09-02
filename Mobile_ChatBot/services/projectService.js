import { ID, Query } from "react-native-appwrite";
import databaseService from "./databaseServices";

// Appwrite database and collection id
const dbId = process.env.EXPO_PUBLIC_APPWRITE_DB_ID;
const colId = process.env.EXPO_PUBLIC_APPWRITE_COL_USEHISTORIQUE_ID;

const noteService = {
  // Get Notes
  async getUserHistorique(userId) {
    if (!userId) {
      console.error("Error: Missing userId in getNotes()");
      return {
        data: [],
        error: "User ID is missing",
      };
    }

    try {
      const response = await databaseService.listDocuments(dbId, colId, [
        Query.equal("user_id", userId),
      ]);
      return response.data;
    } catch (error) {
      console.log("Error fetching notes:", error.message);
      return { data: [], error: error.message };
    }
  },
  // Add New Note
  async addUserHistorique(user_id, similarityScore, objectDetected, OCR) {
    if (!similarityScore || !OCR || !objectDetected) {
      return {
        error: "OCR or similarityScore or objectDetected cannot be empty",
      };
    }

    const data = {
      createdAt: new Date().toISOString(),
      similarityScore: similarityScore,
      objectDetected: objectDetected,
      OCR: OCR,
      user_id: user_id,
    };

    const response = await databaseService.createDocument(
      dbId,
      colId,
      data,
      ID.unique()
    );

    if (response?.error) {
      return { error: response.error };
    }
    alert("Historique ajouté avec succès🟢");
    return { data: response };
  },
  // Delete Note
  async deleteUserHistorique(id) {
    const response = await databaseService.deleteDocument(dbId, colId, id);
    if (response?.error) {
      return { error: response.error };
    }

    return { success: true };
  },
};

export default noteService;
