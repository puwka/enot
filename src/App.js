import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Loans from './pages/Loans';
import Cards from './pages/Cards';
import ConsumerLoans from './pages/ConsumerLoans';
import AutoLoans from './pages/AutoLoans';
import CollateralLoans from './pages/CollateralLoans';
import Job from './pages/Job';
import Education from './pages/Education';
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
import { MetrikaCounter } from 'react-metrika';
import './App.css';

function App() {
  return (
    <>
      <MetrikaCounter id={108751085} />
      <BrowserRouter>
        <AuthProvider>
          <Navbar />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/loans" element={<Loans />} />
            <Route path="/cards" element={<Cards />} />
            <Route path="/consumer-loans" element={<ConsumerLoans />} />
            <Route path="/auto-loans" element={<AutoLoans />} />
            <Route path="/collateral-loans" element={<CollateralLoans />} />
            <Route path="/Job" element={<Job />} />
            <Route path="/Education" element={<Education />} />
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
            <Route path="*" element={<NotFound />} />
          </Routes>
          <FooterBar />
        </AuthProvider>
      </BrowserRouter>
    </>
  );
}

export default App;
