import { useState, useEffect } from "react";
import { storage } from "../utils/storage";
import { getAllUsersApi } from "../services/api.service";

export const useCurrentUser = () => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCurrentUser = async () => {
      const userEmail = storage.get("userEmail");

      if (!userEmail) {
        setLoading(false);
        return;
      }

      try {
        const response = await getAllUsersApi();
        const users = response.data.data; // Access data array
        const user = users.find((u) => u.email === userEmail);

        setCurrentUser(user || null);
      } catch (error) {
        console.error("Failed to fetch current user:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCurrentUser();
  }, []);

  return { currentUser, loading };
};
