import './../App.css'; // Импорт стилей из корня

const Education = ({ bank, naprav, image, link }) => {
  return (
    <div className="card">
      {/* Блок для изображения */}
      <div className="card-image">
        <img src={image} alt={bank} />
      </div>
      
      <div className="card-content">
        <div class="cart-content-napr">
          <p class="cart-content-naprav"><strong>Направление</strong></p>
          <p class="cart-content-naprav-p"><strong>{naprav}</strong></p>
          </div>

        <a href={link} target="_blank" rel="noopener noreferrer" className="btn-apply">ПОДРОБНЕЕ</a>
      </div>

      
    </div>
  );
};

export default Education;