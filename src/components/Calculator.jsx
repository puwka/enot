import React, { useEffect, useId, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { fetchCalculatorConfig } from '../data/productsRuntimeApi';
import './Calculator.css';

const PURPOSE_OPTIONS = [
  'Любая цель',
  'Потребительский кредит',
  'Рефинансирование',
  'Кредитная карта',
];

const Calculator = ({
  title = 'Калькулятор кредита',
  showPurpose = false,
  showRangeLabels = false,
  ctaTo = '/loans',
  ctaLabel = 'Показать предложения',
  footnote = 'Расчёт предварительный',
  configKey = 'loan',
}) => {
  const [config, setConfig] = useState({
    minAmount: 50000,
    maxAmount: 5000000,
    minTerm: 6,
    maxTerm: 84,
    rate: 0.008,
    purposes: PURPOSE_OPTIONS,
  });
  const [sum, setSum] = useState(500000);
  const [months, setMonths] = useState(36);
  const [purpose, setPurpose] = useState('Любая цель');
  const [purposeOpen, setPurposeOpen] = useState(false);
  const purposeRef = useRef(null);
  const purposeListId = useId();
  const rate = config.rate;
  const days = months * 30;

  const interest = sum * rate * days;
  const total = sum + interest;
  const monthly = total / Math.max(1, months);
  const sumProgress = ((sum - config.minAmount) / Math.max(1, config.maxAmount - config.minAmount)) * 100;
  const monthsProgress = ((months - config.minTerm) / Math.max(1, config.maxTerm - config.minTerm)) * 100;

  useEffect(() => {
    let cancelled = false;
    fetchCalculatorConfig(configKey)
      .then((data) => {
        if (!data || cancelled) return;
        const nextConfig = {
          minAmount: Number(data.min_amount ?? 50000),
          maxAmount: Number(data.max_amount ?? 5000000),
          minTerm: Number(data.min_term ?? 6),
          maxTerm: Number(data.max_term ?? 84),
          rate: Number(data.rate ?? 0.008),
          purposes: Array.isArray(data.purposes) && data.purposes.length ? data.purposes : PURPOSE_OPTIONS,
        };
        setConfig(nextConfig);
        setSum(Number(data.default_amount ?? nextConfig.minAmount));
        setMonths(Number(data.default_term ?? nextConfig.minTerm));
        setPurpose(data.default_purpose || nextConfig.purposes[0] || 'Любая цель');
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [configKey]);

  useEffect(() => {
    if (!purposeOpen) return undefined;

    const onPointerDown = (event) => {
      if (purposeRef.current && !purposeRef.current.contains(event.target)) {
        setPurposeOpen(false);
      }
    };

    const onKeyDown = (event) => {
      if (event.key === 'Escape') setPurposeOpen(false);
    };

    document.addEventListener('mousedown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('mousedown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [purposeOpen]);

  return (
    <div className="calc">
      {title ? <h3 className="calc__title">{title}</h3> : null}

      <div className="calc__field">
        <div className="calc__label-row">
          <span className="calc__label">Сумма кредита</span>
        </div>
        <div className="calc__amount">{sum.toLocaleString('ru-RU')} ₽</div>
        <input
          type="range"
          min={config.minAmount}
          max={config.maxAmount}
          step="10000"
          value={sum}
          onChange={(e) => setSum(Number(e.target.value))}
          className="calc__slider"
          style={{ '--progress': `${sumProgress}%` }}
          aria-label="Сумма кредита"
        />
        {showRangeLabels ? (
          <div className="calc__range">
            <span>{config.minAmount.toLocaleString('ru-RU')} ₽</span>
            <span>{config.maxAmount.toLocaleString('ru-RU')} ₽</span>
          </div>
        ) : null}
      </div>

      <div className="calc__field">
        <div className="calc__label-row">
          <span className="calc__label">Срок</span>
        </div>
        <div className="calc__amount">{months} месяцев</div>
        <input
          type="range"
          min={config.minTerm}
          max={config.maxTerm}
          step="1"
          value={months}
          onChange={(e) => setMonths(Number(e.target.value))}
          className="calc__slider"
          style={{ '--progress': `${monthsProgress}%` }}
          aria-label="Срок кредита"
        />
        {showRangeLabels ? (
          <div className="calc__range">
            <span>{config.minTerm} мес.</span>
            <span>{config.maxTerm} мес.</span>
          </div>
        ) : null}
      </div>

      {showPurpose ? (
        <div className="calc__field" ref={purposeRef}>
          <span className="calc__label" id={`${purposeListId}-label`}>
            Цель кредита
          </span>
          <div className={`calc__dropdown${purposeOpen ? ' is-open' : ''}`}>
            <button
              type="button"
              className="calc__dropdown-trigger"
              aria-haspopup="listbox"
              aria-expanded={purposeOpen}
              aria-controls={purposeListId}
              aria-labelledby={`${purposeListId}-label`}
              onClick={() => setPurposeOpen((open) => !open)}
            >
              <span>{purpose}</span>
              <svg className="calc__dropdown-chevron" viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
                <path d="M6 9l6 6 6-6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
            {purposeOpen ? (
              <ul
                className="calc__dropdown-menu"
                id={purposeListId}
                role="listbox"
                aria-labelledby={`${purposeListId}-label`}
              >
                {config.purposes.map((option) => {
                  const selected = option === purpose;
                  return (
                    <li key={option} role="option" aria-selected={selected}>
                      <button
                        type="button"
                        className={`calc__dropdown-option${selected ? ' is-selected' : ''}`}
                        onClick={() => {
                          setPurpose(option);
                          setPurposeOpen(false);
                        }}
                      >
                        {option}
                        {selected ? (
                          <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true">
                            <path d="M5 12l5 5L20 7" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        ) : null}
                      </button>
                    </li>
                  );
                })}
              </ul>
            ) : null}
          </div>
        </div>
      ) : null}

      <div className="calc__result">
        <div className="calc__result-row">
          <div className="calc__result-item">
            <span className="calc__result-label">Ежемесячный платёж от</span>
            <strong className="calc__result-value calc__result-value--accent">
              {monthly.toLocaleString('ru-RU', { maximumFractionDigits: 0 })} ₽
            </strong>
          </div>
          <div className="calc__result-item">
            <span className="calc__result-label">Ставка от</span>
            <strong className="calc__result-value">{(rate * 100).toLocaleString('ru-RU', { maximumFractionDigits: 2 })}%</strong>
          </div>
        </div>
      </div>

      {ctaTo ? (
        <Link to={ctaTo} className="calc__cta">
          {ctaLabel}
        </Link>
      ) : null}

      {footnote ? <p className="calc__foot">{footnote}</p> : null}
    </div>
  );
};

export default Calculator;
