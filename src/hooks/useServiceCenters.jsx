import { useState, useEffect } from "react";
import { getServiceCentersApi } from "../services/api.service";

export const useServiceCenters = () => {
  const [serviceCenters, setServiceCenters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchServiceCenters = async () => {
      try {
        const response = await getServiceCentersApi();
        setServiceCenters(response.data.data || []);
      } catch (err) {
        setError(err.message);
        console.error("Failed to fetch service centers:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchServiceCenters();
  }, []);

  return { serviceCenters, loading, error };
};
