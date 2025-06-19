import React from "react"

export const EventCard = ({ event }) => {
    return (
        <div className="card">
            <img src="{event.image_url" className="card-img-top" alt={event.title} />
            <div className="card-body">
                <h5 className="card-title">{event.title}</h5>
                <p className="card-text">{event.description}</p>
                <Link to={`/event/${event.id}`} className="btn btn-primary">Ver detalle</Link>
            </div>
        </div>
    );
}