import './../App.css'; // Импорт стилей из корня

const CardJob = ({ nameis, image, spec, link }) => {
  return (
    <div className="card">
      {/* Блок для изображения */}
      <div className="card-image">
        <img src={image} alt={nameis} />
      </div>
      
      <div className="card-content">
        <h3>{nameis}</h3>
       
        <p class="card-content-job"><strong>Напрапвление:</strong> {spec}</p>
        
        <a href={link} target="_blank" rel="noopener noreferrer" className="btn-apply">ОСТАВИТЬ ЗАЯВКУ</a>
      </div>
    </div>
  );
};

export default CardJob;