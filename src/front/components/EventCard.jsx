export const EventCard = ({event}) => {
    return(
        <div className="card" style="width: 18rem;">
  <img src={event.image} className="card-img-top"/>
  <div className="card-body">
    <h5 className="card-title">{event.title} </h5>
    <p className="card-text">{event.description}</p>
    <a href="#" className="btn btn-primary">Ver más</a>
  </div>
</div>
    );
};