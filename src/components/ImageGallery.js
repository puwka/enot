import React from 'react';
import './ImageGallery.css'; // Подключаем стили

// 1. Импортируем все нужные картинки
import otp from '../images/otp_bank.png'; // Импортируем картинку
import akBars from '../images/akbars__bank.png'; // Импортируем картинку
import uralSib from '../images/uralsib__bank.png'; // Импортируем картинку
import alfaBank from '../images/alfaBank.png'; // Импортируем картинку
import tBank from '../images/t_Bank.png'; // Импортируем картинку
import renesans from '../images/renesans.png'; // Импортируем картинку






const ImageGallery = () => {
  // 2. Создаем массив, где хранятся ссылки на импортированные картинки
  const images = [otp, akBars, uralSib, alfaBank, tBank, renesans];

  return (
    <div className="gallery-container">
      {/* Первый ряд: первые 3 картинки */}
      <div className="gallery-row">
        {images.slice(0, 3).map((src, index) => (
          <div key={index} className="gallery-item">
            {/* Теперь src - это корректный путь к файлу */}
            <img src={src} alt={`Картинка ${index + 1}`} />
          </div>
        ))}
      </div>

      {/* Второй ряд: оставшиеся 3 картинки */}
      <div className="gallery-row">
        {images.slice(3, 6).map((src, index) => (
          // Индекс начинается с 0 снова, поэтому +4 даст правильные номера
          <div key={index + 3} className="gallery-item">
            <img src={src} alt={`Картинка ${index + 4}`} />
          </div>
        ))}
      </div>
    </div>
  );
};

export default ImageGallery;