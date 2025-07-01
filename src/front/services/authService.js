const API_BASE_URL = import.meta.env.VITE_BACKEND_URL || window.location.origin;

const authService = {
  async registerUser(userData) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/register/user`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(userData),
      });

      const data = await response.json();

      if (!response.ok) {
        // Manejar errores específicos según el status code
        if (response.status === 409) {
          throw new Error(data.message || "Este email ya está registrado");
        } else if (response.status === 400) {
          if (data.error && data.details) {
            // Error de validación con detalles
            const errorDetails = Object.values(data.details).join(", ");
            throw new Error(`${data.error} ${errorDetails}`);
          } else {
            throw new Error(
              data.message ||
                "Datos inválidos. Por favor, revisa la información introducida."
            );
          }
        } else if (response.status >= 500) {
          throw new Error(
            "Error del servidor. Por favor, inténtalo de nuevo más tarde."
          );
        } else {
          throw new Error(data.message || "Error en el registro");
        }
      }

      return data;
    } catch (error) {
      console.error("Error en registerUser:", error);

      // Si es un error de red, lanzar mensaje específico
      if (error.name === "TypeError" && error.message.includes("fetch")) {
        throw new Error(
          "No se pudo conectar con el servidor. Verifica tu conexión a internet."
        );
      }

      throw error;
    }
  },

  async registerAssociation(associationData) {
    try {
      const response = await fetch (
        `${API_BASE_URL}/api/auth/register/association`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(associationData),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        // Manejar errores específicos según el status code
        if (response.status === 409) {
          throw new Error(data.message || "Email o CIF ya registrados");
        } else if (response.status === 400) {
          if (data.error && data.details) {
            // Error de validación con detalles
            const errorDetails = Object.values(data.details).join(", ");
            throw new Error(`${data.error} ${errorDetails}`);
          } else {
            throw new Error(
              data.message ||
                "Datos inválidos. Por favor, revisa la información introducida."
            );
          }
        } else if (response.status >= 500) {
          throw new Error(
            "Error del servidor. Por favor, inténtalo de nuevo más tarde."
          );
        } else {
          throw new Error(data.message || "Error en el registro");
        }
      }

      return data;
    } catch (error) {
      console.error("Error en registerAssociation:", error);

      // Si es un error de red, lanzar mensaje específico
      if (error.name === "TypeError" && error.message.includes("fetch")) {
        throw new Error(
          "No se pudo conectar con el servidor. Verifica tu conexión a internet."
        );
      }

      throw error;
    }
  },

  async login(credentials) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(credentials),
      });

      const data = await response.json();

      if (!response.ok) {
        // Manejar errores específicos según el status code
        if (response.status === 401) {
          throw new Error(data.message || "Email o contraseña incorrectos");
        } else if (response.status === 400) {
          if (data.error && data.details) {
            // Error de validación con detalles
            const errorDetails = Object.values(data.details).join(", ");
            throw new Error(`${data.error} ${errorDetails}`);
          } else {
            throw new Error(
              data.message ||
                "Datos inválidos. Por favor, revisa la información introducida."
            );
          }
        } else if (response.status >= 500) {
          throw new Error(
            "Error del servidor. Por favor, inténtalo de nuevo más tarde."
          );
        } else {
          throw new Error(data.message || "Error al iniciar sesión");
        }
      }

      // Guardar datos en localStorage
      if (data.access_token) {
        localStorage.setItem("token", data.access_token);
        localStorage.setItem("refresh_token", data.refresh_token);
        localStorage.setItem("user", JSON.stringify(data.user));
      }

      return data;
    } catch (error) {
      console.error("Error en login:", error);

      // Si es un error de red, lanzar mensaje específico
      if (error.name === "TypeError" && error.message.includes("fetch")) {
        throw new Error(
          "No se pudo conectar con el servidor. Verifica tu conexión a internet."
        );
      }

      throw error;
    }
  },

  logout() {
    localStorage.removeItem("token");
    localStorage.removeItem("refresh_token");
    localStorage.removeItem("user");
    // Retornar datos para el dispatch si se necesita
    return {
      message: { text: "Sesión cerrada", type: "info" },
    };
  },

  updateUser(user) {
    localStorage.setItem("user", JSON.stringify(user));
  },

  getCurrentUser() {
    try {
      const userStr = localStorage.getItem("user");
      return userStr ? JSON.parse(userStr) : null;
    } catch (error) {
      console.error("Error al obtener usuario:", error);
      return null;
    }
  },

  getToken() {
    return localStorage.getItem("token");
  },

  isAuthenticated() {
    return !!this.getToken();
  },
};

export default authService;
