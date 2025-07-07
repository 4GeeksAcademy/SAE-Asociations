// Estado inicial de la aplicación
export const initialStore = () => {
  return {
    // Estados de autenticación
    user: JSON.parse(localStorage.getItem("user")) || null,
    token: localStorage.getItem("token") || null,
    isAuthenticated: !!localStorage.getItem("token"),

    // Estados globales de UI
    isLoading: false,
    message: null,
  };
};

// Reducer principal de la aplicación
export default function storeReducer(store, action = {}) {
  switch (action.type) {
    // === ACCIONES DE AUTENTICACIÓN ===
    case "LOGIN_SUCCESS":
      const { user, token } = action.payload;
      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));
      return {
        ...store,
        user: user,
        token: token,
        isAuthenticated: true,
        message: { text: "Login exitoso", type: "success" },
      };

    case "LOGOUT":
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      return {
        ...store,
        user: null,
        token: null,
        isAuthenticated: false,
        message: { text: "Sesión cerrada", type: "info" },
      };

    case "UPDATE_USER":
      return {
        ...store,
        user: action.payload,
      };

    // === ACCIONES DE LOADING ===
    case "SET_LOADING":
      return {
        ...store,
        isLoading: action.payload,
      };

    // === ACCIONES DE MENSAJES ===
    case "SET_MESSAGE":
      return {
        ...store,
        message: action.payload,
      };

    case "CLEAR_MESSAGE":
      return {
        ...store,
        message: null,
      };

    // === ACCIONES FUTURAS PARA ASOCIACIONES ===
    case "SET_ASSOCIATIONS":
      return {
        ...store,
        associations: action.payload,
      };

    case "ADD_ASSOCIATION":
      return {
        ...store,
        associations: [...store.associations, action.payload],
      };

    // === ACCIONES FUTURAS PARA EVENTOS ===
    case "SET_EVENTS":
      return {
        ...store,
        events: action.payload,
      };

    case "ADD_EVENT":
      return {
        ...store,
        events: [...store.events, action.payload],
      };

    // === DEFAULT ===
    default:
      return store;
  }
}
