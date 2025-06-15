const API_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:8000";

export const authService = {
  async registerUser(data) {
    try {
      const response = await fetch(`${API_URL}/api/auth/register/user`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        throw result;
      }

      if (result.token) {
        localStorage.setItem("user", JSON.stringify(result));
      }
      return result;
    } catch (error) {
      console.error("Register error:", error);

      // Mejorar manejo de errores para el usuario
      let userFriendlyMessage;

      if (
        error.name === "TypeError" &&
        error.message.includes("Failed to fetch")
      ) {
        userFriendlyMessage =
          "No se puede conectar al servidor. Verifica que el backend esté funcionando.";
      } else if (typeof error === "string") {
        userFriendlyMessage = error;
      } else if (error.message) {
        userFriendlyMessage = error.message;
      } else if (error.details) {
        userFriendlyMessage = error.details;
      } else {
        userFriendlyMessage = "Error en el registro. Inténtalo de nuevo.";
      }

      throw userFriendlyMessage;
    }
  },

  async registerAssociation(data) {
    try {
      const response = await fetch(`${API_URL}/api/auth/register/association`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        throw result;
      }

      if (result.token) {
        localStorage.setItem("user", JSON.stringify(result));
      }
      return result;
    } catch (error) {
      // Mejorar manejo de errores para el usuario
      let userFriendlyMessage;

      if (
        error.name === "TypeError" &&
        error.message.includes("Failed to fetch")
      ) {
        userFriendlyMessage =
          "No se puede conectar al servidor. Verifica que el backend esté funcionando.";
      } else if (typeof error === "string") {
        userFriendlyMessage = error;
      } else if (error.message) {
        userFriendlyMessage = error.message;
      } else if (error.details) {
        userFriendlyMessage = error.details;
      } else {
        userFriendlyMessage = "Error en el registro. Inténtalo de nuevo.";
      }

      throw userFriendlyMessage;
    }
  },

  async login(data) {
    try {
      const response = await fetch(`${API_URL}/api/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        throw result;
      }

      if (result.token) {
        localStorage.setItem("user", JSON.stringify(result));
      }
      return result;
    } catch (error) {
      console.error("Login error:", error);

      // Mejorar manejo de errores para el usuario
      let userFriendlyMessage;

      if (
        error.name === "TypeError" &&
        error.message.includes("Failed to fetch")
      ) {
        userFriendlyMessage =
          "No se puede conectar al servidor. Verifica que el backend esté funcionando.";
      } else if (typeof error === "string") {
        userFriendlyMessage = error;
      } else if (error.message) {
        userFriendlyMessage = error.message;
      } else if (error.details) {
        userFriendlyMessage = error.details;
      } else {
        userFriendlyMessage = "Error en el login. Inténtalo de nuevo.";
      }

      throw userFriendlyMessage;
    }
  },

  logout() {
    localStorage.removeItem("user");
  },

  getCurrentUser() {
    return JSON.parse(localStorage.getItem("user"));
  },
};
