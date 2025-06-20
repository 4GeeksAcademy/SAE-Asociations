import React from "react";
import { EventForm } from "../components/EventForm";

export const EventCreation = () => {
    return (
        <div className="container mt-4">
            <h2>Crear nuevo evento</h2>
            <EventForm />
        </div>
    );
};