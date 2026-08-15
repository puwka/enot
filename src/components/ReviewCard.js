/* src/components/ReviewCard.js */
import React from 'react';
import styles from '../ReviewsBlock/ReviewsBlock.module.css'; // Импортируем стили отсюда

function ReviewCard({ avatar, name, review }) {
  return (
    <div className={styles.reviewCard}>
      <img src={avatar} alt={name} className={styles.avatar} />
      <div>
        <h4 className={styles.name}>{name}</h4>
        <p className={styles.reviewText}>{review}</p>
      </div>
    </div>
  );
}

export default ReviewCard;