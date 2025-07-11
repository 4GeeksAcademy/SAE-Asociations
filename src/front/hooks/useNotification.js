import { useState } from "react";

const useNotification = () => {
  const [notification, setNotification] = useState({
    show: false,
    type: "info",
    title: "",
    message: "",
    confirmText: "Aceptar",
    cancelText: "Cancelar",
    onConfirm: null,
    showCancel: false,
  });

  const showNotification = (config) => {
    setNotification({
      show: true,
      type: config.type || "info",
      title: config.title || "",
      message: config.message || "",
      confirmText: config.confirmText || "Aceptar",
      cancelText: config.cancelText || "Cancelar",
      onConfirm: config.onConfirm || null,
      showCancel: config.showCancel || false,
    });
  };

  const hideNotification = () => {
    setNotification((prev) => ({ ...prev, show: false }));
  };

  // Métodos de conveniencia
  const showSuccess = (title, message) => {
    showNotification({
      type: "success",
      title,
      message,
    });
  };

  const showError = (title, message) => {
    showNotification({
      type: "error",
      title,
      message,
    });
  };

  const showWarning = (title, message) => {
    showNotification({
      type: "warning",
      title,
      message,
    });
  };

  const showConfirm = (title, message, onConfirm) => {
    showNotification({
      type: "confirm",
      title,
      message,
      onConfirm,
      showCancel: true,
      confirmText: "Sí",
      cancelText: "No",
    });
  };

  const showInfo = (title, message) => {
    showNotification({
      type: "info",
      title,
      message,
    });
  };

  return {
    notification,
    showNotification,
    hideNotification,
    showSuccess,
    showError,
    showWarning,
    showConfirm,
    showInfo,
  };
};

export default useNotification;
