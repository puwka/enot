import React, { useState } from 'react';

const PrivacyPolicyModal = ({ triggerLabel = 'Политика конфиденциальности и персональных данных' }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isChecked, setIsChecked] = useState(false);

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  const handleAccept = () => {
    if (isChecked) {
      closeModal();
    }
  };

  return (
    <div className="privacy-policy">
      <button type="button" onClick={openModal} className="privacy-policy__trigger">
        {triggerLabel}
      </button>

      {isModalOpen && (
        <div className="privacy-policy__overlay" onClick={closeModal} role="presentation">
          <div
            className="privacy-policy__dialog"
            role="dialog"
            aria-modal="true"
            aria-labelledby="privacy-policy-title"
            onClick={(event) => event.stopPropagation()}
          >
            <h2 id="privacy-policy-title" className="privacy-policy__title">
              Политика конфиденциальности и персональных данных
            </h2>
            <div className="privacy-policy__content">
              <h5>1. Общие положения</h5>
              <p>
                1.1. Настоящая Политика конфиденциальности (далее — Политика) разработана в соответствии с Федеральным законом № 152-ФЗ «О персональных данных»
              </p>
              <p>и определяет порядок обработки и защиты персональных данных пользователей сайта.</p>
              <p>
                1.2. Оператором персональных данных является [Наименование организации/ИП], ИНН: [ИНН], ОГРН: [ОГРН], адрес: [юридический адрес], e-mail: [контактный e-mail]
              </p>
              <h5>2. Какие данные собираются</h5>
              <p>2.1. При использовании сайта собираются следующие персональные данные:</p>
              <p>- фамилия, имя, отчество;</p>
              <p>- контактный телефон;</p>
              <p>- адрес электронной почты;</p>
              <p>- иные данные, которые пользователь предоставляет добровольно (например, резюме при отклике на вакансию).</p>
              <h5>3. Цели обработки данных</h5>
              <p>3.1. Персональные данные используются для:</p>
              <p>- предоставления информации о кредитных продуктах и микрозаймах;</p>
              <p>- обработки заявок на вакансии;</p>
              <p>- обратной связи с пользователями;</p>
              <p>- рассылки рекламных и информационных материалов (с согласия пользователя);</p>
              <p>- аналитики и улучшения работы сайта.</p>
            </div>
            <label className="privacy-policy__check">
              <input
                type="checkbox"
                checked={isChecked}
                onChange={(e) => setIsChecked(e.target.checked)}
              />
              <span>Я ознакомился(ась) с политикой конфиденциальности</span>
            </label>
            <button
              type="button"
              onClick={handleAccept}
              disabled={!isChecked}
              className="btn btn--primary"
            >
              Принять
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default PrivacyPolicyModal;
