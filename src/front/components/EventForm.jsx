import React, { useState } from "react";

export const EventForm = () => {
    const [formData, setFormData] = useState({
        title: "",
        description: "",
        image_url: null,
        date: "",
    });

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const response = await fetch(`${API_BASE_URL}/api/events`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(formData),
            });

            if (!response.ok) throw new Error("Error al crear evento");

            const result = await response.json();
            alert("Evento creado con éxito");
            console.log(result);
        } catch (error) {
            console.error("Error:", error);
            alert("Hubo un error al crear el evento");
        }
    };

    return (
        <form className="row g-3" onSubmit={handleSubmit}>
            <div className="col-12">
                <label htmlFor="title" className="form-label">Título del evento</label>
                <input
                    type="text"
                    className="form-control"
                    id="title"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    required
                />
            </div>

            <div className="col-12">
                <label htmlFor="description" className="form-label">Descripción</label>
                <textarea
                    className="form-control"
                    id="description"
                    name="description"
                    rows="3"
                    value={formData.description}
                    onChange={handleChange}
                    required
                />
            </div>

            <div className="col-12">
                <label htmlFor="image_url" className="form-label">URL de la imagen</label>
                <input
                    type="url"
                    className="form-control"
                    id="image_url"
                    name="image_url"
                    value={formData.image_url}
                    onChange={handleChange}
                />
            </div>

            <div className="col-md-6">
                <label htmlFor="date" className="form-label">Fecha</label>
                <input
                    type="datetime-local"
                    className="form-control"
                    id="date"
                    name="date"
                    value={formData.date}
                    onChange={handleChange}
                    required
                />
            </div>

            <div className="col-12">
                <button type="submit" className="btn btn-primary">Crear evento</button>
            </div>
        </form>
    );
};
