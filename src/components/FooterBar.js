import { Link } from 'react-router-dom';
import logoImage from '../images/logo.png';
import vkIcon from '../images/vkontakte.png';
import tgIcon from '../images/telega.png';
import maxIcon from '../images/max.png';
import { useSiteSettings } from '../context/SiteSettingsContext';
import './Footer.css';

const PRODUCT_LINKS = [
  { to: '/loans', label: 'Микрозаймы' },
  { to: '/consumer-loans', label: 'Потреб. кредиты' },
  { to: '/collateral-loans', label: 'Под залог' },
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

const FooterBar = () => {
  const { settings } = useSiteSettings();
  const brand = settings?.brand || {};
  const logo = brand.logo_url || logoImage;
  const name = brand.name || 'ЕнотМани';
  const desc =
    brand.footer_text ||
    'Сервис сравнения финансовых продуктов. Выбирайте лучшее и экономьте время и деньги.';

  const socials = [
    { href: brand.telegram_url, src: tgIcon, label: 'Telegram' },
    { href: brand.vk_url, src: vkIcon, label: 'ВКонтакте' },
    { href: brand.max_url, src: maxIcon, label: 'MAX' },
  ].filter((item) => item.href);

  return (
    <footer className="site-footer">
      <div className="site-footer__main container">
        <div className="site-footer__brand">
          <Link to="/" className="site-footer__logo-link">
            <img src={logo} alt={name} className="site-footer__logo" />
            <span className="site-footer__brand-name">{name}</span>
          </Link>
          <p className="site-footer__desc">{desc}</p>
          {socials.length ? (
            <div className="site-footer__social">
              {socials.map((item) => (
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
          ) : null}
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
    </footer>
  );
};

export default FooterBar;
