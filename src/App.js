import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Loans from './pages/Loans';
import Cards from './pages/Cards';
import ConsumerLoans from './pages/ConsumerLoans';
import AutoLoans from './pages/AutoLoans';
import CollateralLoans from './pages/CollateralLoans';
import Job from './pages/Job';
import Education from './pages/Education';
import Obuchenie from './pages/Obuchenie';
import Services from './pages/Services';
import Shops from './pages/Shops';
import OfferDetail from './pages/OfferDetail';
import ArticleDetail from './pages/ArticleDetail';
import News from './pages/News';
import NewsDetail from './pages/NewsDetail';
import Faq from './pages/Faq';
import Guide from './pages/Guide';
import Favorites from './pages/Favorites';
import Privacy from './pages/Privacy';
import Terms from './pages/Terms';
import NotFound from './pages/NotFound';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import CabinetLayout from './pages/CabinetLayout';
import AccountOverview from './pages/AccountOverview';
import AccountLoans from './pages/AccountLoans';
import AccountFavorites from './pages/AccountFavorites';
import AccountBonuses from './pages/AccountBonuses';
import AccountHistory from './pages/AccountHistory';
import AccountReferrals from './pages/AccountReferrals';
import AccountSettings from './pages/AccountSettings';
import ProtectedRoute from './components/ProtectedRoute';
import FooterBar from './components/FooterBar';
import { AuthProvider } from './context/AuthContext';
import { AdminAuthProvider } from './admin/AdminAuthContext';
import AdminProtectedRoute from './admin/AdminProtectedRoute';
import AdminRoleRoute from './admin/AdminRoleRoute';
import AdminLayout from './admin/AdminLayout';
import AdminLogin from './admin/pages/AdminLogin';
import AdminDashboard from './admin/pages/AdminDashboard';
import AdminSection from './admin/pages/AdminSection';
import CmsPagesList from './admin/pages/CmsPagesList';
import CmsPageEdit from './admin/pages/CmsPageEdit';
import CmsContentList from './admin/pages/CmsContentList';
import CmsContentEdit from './admin/pages/CmsContentEdit';
import CmsFaqPage from './admin/pages/CmsFaqPage';
import CmsProductsList from './admin/pages/CmsProductsList';
import CmsProductEdit from './admin/pages/CmsProductEdit';
import CmsBanksList from './admin/pages/CmsBanksList';
import CmsCategoriesList from './admin/pages/CmsCategoriesList';
import CmsCalculatorSettings from './admin/pages/CmsCalculatorSettings';
import { MetrikaCounter } from 'react-metrika';
import './App.css';

const ScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
  }, [pathname]);

  return null;
};

const PublicShell = ({ children }) => {
  const location = useLocation();
  const isAdmin = location.pathname.startsWith('/admin');
  return (
    <>
      {!isAdmin ? <Navbar /> : null}
      {children}
      {!isAdmin ? <FooterBar /> : null}
    </>
  );
};

const adminPage = (permission, sectionKey) => (
  <AdminRoleRoute permission={permission}>
    <AdminSection sectionKey={sectionKey} />
  </AdminRoleRoute>
);

function App() {
  return (
    <>
      <MetrikaCounter id={108751085} />
      <BrowserRouter>
        <ScrollToTop />
        <AuthProvider>
          <AdminAuthProvider>
            <PublicShell>
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/loans" element={<Loans />} />
                <Route path="/cards" element={<Cards />} />
                <Route path="/consumer-loans" element={<ConsumerLoans />} />
                <Route path="/auto-loans" element={<AutoLoans />} />
                <Route path="/collateral-loans" element={<CollateralLoans />} />
                <Route path="/Job" element={<Job />} />
                <Route path="/Education" element={<Education />} />
                <Route path="/obuchenie" element={<Obuchenie />} />
                <Route path="/services" element={<Services />} />
                <Route path="/shops" element={<Shops />} />
                <Route path="/article/:slug" element={<ArticleDetail />} />
                <Route path="/news" element={<News />} />
                <Route path="/news/:slug" element={<NewsDetail />} />
                <Route path="/offer/:slug" element={<OfferDetail />} />
                <Route path="/faq" element={<Faq />} />
                <Route path="/guide" element={<Guide />} />
                <Route path="/favorites" element={<Favorites />} />
                <Route path="/privacy" element={<Privacy />} />
                <Route path="/terms" element={<Terms />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route
                  path="/account"
                  element={
                    <ProtectedRoute>
                      <CabinetLayout />
                    </ProtectedRoute>
                  }
                >
                  <Route index element={<AccountOverview />} />
                  <Route path="loans" element={<AccountLoans />} />
                  <Route path="favorites" element={<AccountFavorites />} />
                  <Route path="bonuses" element={<AccountBonuses />} />
                  <Route path="history" element={<AccountHistory />} />
                  <Route path="referrals" element={<AccountReferrals />} />
                  <Route path="settings" element={<AccountSettings />} />
                </Route>
                <Route path="/admin/login" element={<AdminLogin />} />
                <Route
                  path="/admin"
                  element={
                    <AdminProtectedRoute>
                      <AdminLayout />
                    </AdminProtectedRoute>
                  }
                >
                  <Route index element={<AdminDashboard />} />
                  <Route
                    path="pages"
                    element={
                      <AdminRoleRoute permission="content">
                        <CmsPagesList />
                      </AdminRoleRoute>
                    }
                  />
                  <Route
                    path="pages/site/:slug"
                    element={
                      <AdminRoleRoute permission="content">
                        <CmsPageEdit />
                      </AdminRoleRoute>
                    }
                  />
                  <Route
                    path="pages/:id"
                    element={
                      <AdminRoleRoute permission="content">
                        <CmsPageEdit />
                      </AdminRoleRoute>
                    }
                  />
                  <Route
                    path="news"
                    element={
                      <AdminRoleRoute permission="news">
                        <CmsContentList entity="news" title="Новости" createPath="/admin/news/new" editPath="/admin/news" />
                      </AdminRoleRoute>
                    }
                  />
                  <Route
                    path="news/site/:slug"
                    element={
                      <AdminRoleRoute permission="news">
                        <CmsContentEdit entity="news" listPath="/admin/news" titleLabel="новость" />
                      </AdminRoleRoute>
                    }
                  />
                  <Route
                    path="news/:id"
                    element={
                      <AdminRoleRoute permission="news">
                        <CmsContentEdit entity="news" listPath="/admin/news" titleLabel="новость" />
                      </AdminRoleRoute>
                    }
                  />
                  <Route
                    path="articles"
                    element={
                      <AdminRoleRoute permission="articles">
                        <CmsContentList
                          entity="articles"
                          title="Статьи"
                          createPath="/admin/articles/new"
                          editPath="/admin/articles"
                        />
                      </AdminRoleRoute>
                    }
                  />
                  <Route
                    path="articles/site/:slug"
                    element={
                      <AdminRoleRoute permission="articles">
                        <CmsContentEdit entity="articles" listPath="/admin/articles" titleLabel="статья" />
                      </AdminRoleRoute>
                    }
                  />
                  <Route
                    path="articles/:id"
                    element={
                      <AdminRoleRoute permission="articles">
                        <CmsContentEdit entity="articles" listPath="/admin/articles" titleLabel="статья" />
                      </AdminRoleRoute>
                    }
                  />
                  <Route
                    path="categories"
                    element={
                      <AdminRoleRoute permission="categories">
                        <CmsCategoriesList />
                      </AdminRoleRoute>
                    }
                  />
                  <Route
                    path="faq"
                    element={
                      <AdminRoleRoute permission="faq">
                        <CmsFaqPage />
                      </AdminRoleRoute>
                    }
                  />
                  <Route
                    path="products/loans"
                    element={
                      <AdminRoleRoute permission="products">
                        <CmsProductsList sectionKey="loans" />
                      </AdminRoleRoute>
                    }
                  />
                  <Route
                    path="products/loans/:id"
                    element={
                      <AdminRoleRoute permission="products">
                        <CmsProductEdit sectionKey="loans" />
                      </AdminRoleRoute>
                    }
                  />
                  <Route
                    path="products/debit-cards"
                    element={
                      <AdminRoleRoute permission="products">
                        <CmsProductsList sectionKey="debit-cards" />
                      </AdminRoleRoute>
                    }
                  />
                  <Route
                    path="products/debit-cards/:id"
                    element={
                      <AdminRoleRoute permission="products">
                        <CmsProductEdit sectionKey="debit-cards" />
                      </AdminRoleRoute>
                    }
                  />
                  <Route
                    path="products/credit-cards"
                    element={
                      <AdminRoleRoute permission="products">
                        <CmsProductsList sectionKey="credit-cards" />
                      </AdminRoleRoute>
                    }
                  />
                  <Route
                    path="products/credit-cards/:id"
                    element={
                      <AdminRoleRoute permission="products">
                        <CmsProductEdit sectionKey="credit-cards" />
                      </AdminRoleRoute>
                    }
                  />
                  <Route
                    path="products/calculators"
                    element={
                      <AdminRoleRoute permission="products">
                        <CmsCalculatorSettings />
                      </AdminRoleRoute>
                    }
                  />
                  <Route
                    path="products/banks"
                    element={
                      <AdminRoleRoute permission="products">
                        <CmsBanksList />
                      </AdminRoleRoute>
                    }
                  />
                  <Route path="users" element={adminPage('users', 'users')} />
                  <Route path="applications" element={adminPage('users', 'applications')} />
                  <Route path="bonuses" element={adminPage('bonuses', 'bonuses')} />
                  <Route path="referrals" element={adminPage('users', 'referrals')} />
                  <Route path="media" element={adminPage('media', 'media')} />
                  <Route path="settings/site" element={adminPage('settings', 'settings-site')} />
                  <Route path="settings/header" element={adminPage('settings', 'settings-header')} />
                  <Route path="settings/footer" element={adminPage('settings', 'settings-footer')} />
                  <Route path="settings/menu" element={adminPage('settings', 'settings-menu')} />
                  <Route path="settings/seo" element={adminPage('settings', 'settings-seo')} />
                  <Route path="system/audit" element={adminPage('system', 'audit')} />
                </Route>
                <Route path="*" element={<NotFound />} />
              </Routes>
            </PublicShell>
          </AdminAuthProvider>
        </AuthProvider>
      </BrowserRouter>
    </>
  );
}

export default App;
