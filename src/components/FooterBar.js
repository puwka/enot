import { Link } from 'react-router-dom';
import logoImage from '../images/logo.png';
import vkIcon from '../images/vkontakte.png';
import tgIcon from '../images/telega.png';
import maxIcon from '../images/max.png';
import './Footer.css';

const PRODUCT_LINKS = [
  { to: '/loans', label: 'Кредиты' },
  { to: '/cards', label: 'Дебетовые карты' },
  { to: '/auto-loans', label: 'Кредитные карты' },
];

const INFO_LINKS = [
  { to: '/Education', label: 'Статьи' },
  { to: '/obuchenie', label: 'Обучение' },
  { to: '/services', label: 'Сервисы' },
  { to: '/shops', label: 'Магазины' },
  { to: '/news', label: 'Новости' },
  { to: '/guide', label: 'Справочник' },
  { to: '/faq', label: 'Вопросы и ответы' },
];

const SOCIAL_LINKS = [
  { href: 'https://t.me/enot_mani', src: tgIcon, label: 'Telegram' },
  { href: 'https://vk.com/skupka_59_perm', src: vkIcon, label: 'ВКонтакте' },
  { href: 'https://max.ru/join/ABBu3RDHXvg7o3V7RB0i0JE1rxw2ZYTbkEzYAliHJo4', src: maxIcon, label: 'MAX' },
];

const FooterBar = () => {
  return (
    <footer className="site-footer">
      <div className="site-footer__main container">
        <div className="site-footer__brand">
          <Link to="/" className="site-footer__logo-link">
            <img src={logoImage} alt="ЕнотМани" className="site-footer__logo" />
            <span className="site-footer__brand-name">ЕнотМани</span>
          </Link>
          <p className="site-footer__desc">
            Сервис сравнения финансовых продуктов. Выбирайте лучшее и экономьте время и деньги.
          </p>
          <div className="site-footer__social">
            {SOCIAL_LINKS.map((item) => (
              <a
                key={item.href}
                href={item.href}
                target="_blank"
                rel="noopener noreferrer"
                className="site-footer__social-link"
                aria-label={item.label}
              >
                <img src={item.src} alt="" />
              </a>
            ))}
          </div>
        </div>

        <div className="site-footer__col">
          <h3 className="site-footer__title">Продукты</h3>
          <ul className="site-footer__list">
            {PRODUCT_LINKS.map((item) => (
              <li key={item.to}>
                <Link to={item.to}>{item.label}</Link>
              </li>
            ))}
          </ul>
        </div>

        <div className="site-footer__col">
          <h3 className="site-footer__title">Информация</h3>
          <ul className="site-footer__list">
            {INFO_LINKS.map((item) => (
              <li key={item.to}>
                <Link to={item.to}>{item.label}</Link>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="site-footer__bottom">
        <div className="site-footer__bottom-inner container">
          <div className="site-footer__meta">
            <p className="site-footer__copy">© ЕнотМани 2026</p>
            <div className="site-footer__meta-links">
              <Link to="/terms">Пользовательское соглашение</Link>
              <Link to="/privacy">Политика конфиденциальности</Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default FooterBar;
