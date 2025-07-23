import React, { useState } from "react";

export const ForgotPassword = () => {
    const [email, setEmail] = useState("");
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");
    const API_BASE_URL = import.meta.env.VITE_BACKEND_URL;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage(""); // Limpia mensajes anteriores
        setError("");   // Limpia errores anteriores

        try {
            const response = await fetch(`${API_BASE_URL}/api/forgot-password`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ email }),
            });

            const data = await response.json();

            if (response.ok) {
                setMessage(data.message || "Si tu email está registrado, recibirás un enlace de recuperación en tu bandeja de entrada.");
                setEmail(""); // Limpiar el campo de email
            } else {
                setError(data.error || "Hubo un problema al procesar tu solicitud. Intenta de nuevo.");
            }
        } catch (error) {
            console.error("Error al solicitar restablecimiento:", error);
            setError("No se pudo conectar con el servidor. Intenta de nuevo más tarde.");
        }
    };

    return (
        <div className="container mt-5">
            <div className="row justify-content-center">
                <div className="col-md-6">
                    <div className="card">
                        <div className="card-header">
                            <h3 className="card-title text-center">¿Olvidaste tu contraseña?</h3>
                        </div>
                        <div className="card-body">
                            <p className="text-center">Introduce tu dirección de correo electrónico y te enviaremos un enlace para restablecer tu contraseña.</p>
                            {message && <div className="alert alert-info text-center">{message}</div>}
                            {error && <div className="alert alert-danger text-center">{error}</div>}
                            <form onSubmit={handleSubmit}>
                                <div className="mb-3">
                                    <label htmlFor="emailInput" className="form-label">Dirección de Correo Electrónico</label>
                                    <input
                                        type="email"
                                        className="form-control"
                                        id="emailInput"
                                        placeholder="tu.email@ejemplo.com"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        required
                                    />
                                </div>
                                <div className="d-grid gap-2">
                                    <button type="submit" className="btn btn-primary">Enviar Enlace</button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};