// src/components/ReviewsBlock.js
import React from 'react';
import avatar1 from '../images/avatar1.webp'; // Путь к картинкам
import avatar2 from '../images/avatar2.webp';
import avatar3 from '../images/avatar3.webp';
import avatar4 from '../images/avatar4.webp';
import styles from './ReviewsBlock.module.css'; // Импортируем стили

// Данные для отзывов
const reviewsData = [
  {
    avatar: avatar1,
    name: 'Иван Кужич',
    review:
      'Очень быстро оформили займ, всё прозрачно и без скрытых комиссий. Рекомендую!, главное все внимательно читайте при оформлении займа или кредита.',
  },
  {
    avatar: avatar2,
    name: 'Мария Смирнова',
    review:
      'Пользуюсь сервисом уже полгода, всегда одобряют заявки. Отличная поддержка! А еще в данном сервисе бывают вакансии что не мало важно для тех кто в поиске работы.',
  },
  {
    avatar: avatar3,
    name: 'Андрей Филимонов',
    review:
      'Таких сервисов в интернете очень много, но почему то доверился Енот-мани, лчино мне он нравится, работает как часы, все просто и понятно, да и выбора  кредитов много.',
  },
  {
    avatar: avatar4,
    name: 'София Мансурова',
    review:
      'Огромное спасибо за прекрасный сервис, енот-мани Вы лучшие, и расешите, и займ можно оформит, сегла слежу за Вашими новостями в ленте и в историях!',
  },
];

// Компонент теперь содержит в себе и карточку
function ReviewsBlock() {
  return (
    <section className={styles.reviewsSection}>
      <h2 className={styles.title}>Отзывы наших клиентов</h2>
      <div className={styles.reviewsContainer}>
        {reviewsData.map((review, index) => (
          <div key={index} className={styles.reviewCard}>
            <img src={review.avatar} alt={review.name} className={styles.avatar} />
            <div>
              <h4 className={styles.name}>{review.name}</h4>
              <p className={styles.reviewText}>{review.review}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

export default ReviewsBlock;