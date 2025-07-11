import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

export const ResetPassword = () => {
    const { token } = useParams(); // Obtiene el token de la URL 
    const navigate = useNavigate(); // Redirigir al login
    const [newPassword, setNewPassword] = useState("");
    const [confirmNewPassword, setConfirmNewPassword] = useState("");
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");
    const API_BASE_URL = import.meta.env.VITE_BACKEND_URL; 

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage("");
        setError("");

        if (newPassword !== confirmNewPassword) {
            setError("Las contraseñas no coinciden.");
            return;
        }

        // Validación contraseña
        if (newPassword.length < 8) {
            setError("La contraseña debe tener al menos 8 caracteres.");
            return;
        }

        try {
            const response = await fetch(`${API_BASE_URL}/api/reset-password/${token}`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ 
                    new_password: newPassword, 
                    confirm_new_password: confirmNewPassword 
                }),
            });

            const data = await response.json();

            if (response.ok) {
                setMessage(data.message || "Contraseña restablecida con éxito. Redirigiendo a la página de inicio de sesión...");
                setNewPassword("");
                setConfirmNewPassword("");
                // Redirigir al login después de un breve retraso
                setTimeout(() => {
                    navigate('/login');
                }, 3000); // Redirige después de 3 segundos
            } else {
                setError(data.error || "Hubo un problema al restablecer tu contraseña. El enlace puede ser inválido o haber expirado.");
            }
        } catch (error) {
            console.error("Error al restablecer contraseña:", error);
            setError("No se pudo conectar con el servidor. Intenta de nuevo más tarde.");
        }
    };

    return (
        <div className="container mt-5">
            <div className="row justify-content-center">
                <div className="col-md-6">
                    <div className="card">
                        <div className="card-header">
                            <h3 className="card-title text-center">Restablecer Contraseña</h3>
                        </div>
                        <div className="card-body">
                            {message && <div className="alert alert-success text-center">{message}</div>}
                            {error && <div className="alert alert-danger text-center">{error}</div>}
                            <form onSubmit={handleSubmit}>
                                <div className="mb-3">
                                    <label htmlFor="newPasswordInput" className="form-label">Nueva Contraseña</label>
                                    <input
                                        type="password"
                                        className="form-control"
                                        id="newPasswordInput"
                                        value={newPassword}
                                        onChange={(e) => setNewPassword(e.target.value)}
                                        required
                                    />
                                </div>
                                <div className="mb-3">
                                    <label htmlFor="confirmNewPasswordInput" className="form-label">Confirmar Nueva Contraseña</label>
                                    <input
                                        type="password"
                                        className="form-control"
                                        id="confirmNewPasswordInput"
                                        value={confirmNewPassword}
                                        onChange={(e) => setConfirmNewPassword(e.target.value)}
                                        required
                                    />
                                </div>
                                <div className="d-grid gap-2">
                                    <button type="submit" className="btn btn-primary">Restablecer Contraseña</button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};