import './../App.css'; // Импорт стилей из корня

const CardLoan = ({ bank, image, rate, term, sum, link }) => {
  return (
    <div className="card">
      {/* Блок для изображения */}
      <div className="card-image">
        <img src={image} alt={bank} />
      </div>

      <div className="card-content">
        <div class="cart-content-sum">
          <p class="cart-content-sump"><strong>Сумма:</strong></p>
          <p class="cart-content-sum-p"><strong>{sum}</strong></p>
          </div>
        <div class="card-content-p">
          <div>
            {/* <h3>{bank}</h3> */}
            
            <p><strong>Срок:</strong></p>
            <p><strong>Ставка:</strong></p>
          </div>
          <div>
            {/* <h3>{bank}</h3> */}
            <p>{rate}</p>
            <p>{term}</p>
          </div>
        </div>

        <a href={link} target="_blank" rel="noopener noreferrer" className="btn-apply">ПОЛУЧИТЬ ДЕНЬГИ</a>
      </div>
    </div>
  );
};

export default CardLoan;