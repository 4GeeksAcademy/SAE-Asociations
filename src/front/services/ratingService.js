const backendUrl = import.meta.env.VITE_BACKEND_URL;

export const ratingService = {
  // Verificar si el usuario puede valorar una asociación
  async canUserRate(associationId) {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `${backendUrl}/api/ratings/can-rate/${associationId}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error("Error al verificar permisos");
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Error checking rating permissions:", error);
      throw error;
    }
  },

  // Obtener valoraciones de una asociación
  async getRatings(associationId) {
    try {
      const response = await fetch(
        `${backendUrl}/api/ratings/association/${associationId}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error("Error al obtener valoraciones");
      }

      return await response.json();
    } catch (error) {
      console.error("Error fetching ratings:", error);
      throw error;
    }
  },

  // Crear nueva valoración
  async createRating(ratingData) {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${backendUrl}/api/ratings/`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(ratingData),
      });

      const data = await response.json();

      if (!response.ok) {
        // Si hay un mensaje específico del backend, usarlo
        throw new Error(data.message || "Error al crear valoración");
      }

      return data;
    } catch (error) {
      console.error("Error creating rating:", error);
      throw error;
    }
  },

  // Actualizar valoración existente
  async updateRating(ratingId, ratingData) {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${backendUrl}/api/ratings/${ratingId}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(ratingData),
      });

      const data = await response.json();

      if (!response.ok) {
        // Si hay un mensaje específico del backend, usarlo
        throw new Error(data.message || "Error al actualizar valoración");
      }

      return data;
    } catch (error) {
      console.error("Error updating rating:", error);
      throw error;
    }
  },
};
