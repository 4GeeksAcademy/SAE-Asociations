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
      const response = await fetch(
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
        localStorage.removeItem("refresh_token"); // Limpiar token anterior si existe
        localStorage.setItem("refresh_token", data.refresh_token);
        localStorage.setItem("user", JSON.stringify(data.user));
      }

      return data;
    } catch (error) {
      // Si es un error de red, lanzar mensaje específico
      if (error.name === "TypeError" && error.message.includes("fetch")) {
        throw new Error(
          "No se pudo conectar con el servidor. Verifica tu conexión a internet."
        );
      }

      throw error;
    }
  },

  clearAuth() {
    localStorage.removeItem("token");
    localStorage.removeItem("refresh_token");
    localStorage.removeItem("user");
    // Limpiar cualquier otro dato de autenticación que pueda haber
    localStorage.removeItem("lastAuthCheck");

    // Disparar un evento para notificar a otros componentes
    window.dispatchEvent(new Event("auth-cleared"));

    // Forzar actualización del store global
    window.dispatchEvent(
      new CustomEvent("auth-state-changed", {
        detail: { isAuthenticated: false },
      })
    );
  },

  logout() {
    this.clearAuth();
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

  // Validar si el token es válido haciendo una petición al servidor
  async validateToken() {
    const token = this.getToken();
    if (!token) return false;

    try {
      const API_BASE_URL =
        import.meta.env.VITE_BACKEND_URL || window.location.origin;
      const response = await fetch(`${API_BASE_URL}/api/auth/validate`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        // Token inválido, limpiar localStorage
        this.logout();
        return false;
      }

      return true;
    } catch (error) {
      console.error("Error validating token:", error);
      // En caso de error de red, mantener el token pero devolver false
      return false;
    }
  },

  // Método para verificar si el token está expirado (alternativa más rápida)
  isTokenExpired() {
    const token = this.getToken();
    if (!token) return true;

    try {
      const payload = JSON.parse(atob(token.split(".")[1]));
      const expirationTime = payload.exp * 1000; // Convertir a milisegundos
      const currentTime = Date.now();

      if (currentTime >= expirationTime) {
        this.clearAuth(); // Usar el nuevo método
        return true;
      }

      return false;
    } catch (error) {
      console.error("Error checking token expiration:", error);
      this.clearAuth(); // Limpiar en caso de error
      return true;
    }
  },

  async updateProfile(profileData) {
    const token = this.getToken();
    const response = await fetch(`${API_BASE_URL}/api/user/profile`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(profileData),
    });
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.msg || "Error al actualizar perfil");
    }
    // Actualiza el objeto user en localStorage
    this.updateUser({ ...this.getCurrentUser(), ...profileData });
    return data;
  },

  async changePassword(passwordData) {
    const token = this.getToken();
    const response = await fetch(`${API_BASE_URL}/api/user/password`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(passwordData),
    });
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error || "Error al cambiar contraseña");
    }
    return data;
  },

  // Asegúrate de que estos dos métodos existen:
  getCurrentUser() {
    try {
      const userStr = localStorage.getItem("user");
      return userStr ? JSON.parse(userStr) : null;
    } catch {
      return null;
    }
  },

  getToken() {
    return localStorage.getItem("token");
  },

  updateUser(user) {
    localStorage.setItem("user", JSON.stringify(user));
  },
};

export default authService;
