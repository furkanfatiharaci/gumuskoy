import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from '@/contexts/AuthContext';
import { CartProvider } from '@/contexts/CartContext';
import { FavoritesProvider } from '@/contexts/FavoritesContext';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import HomePage from '@/pages/HomePage';
import ProductsPage from '@/pages/ProductsPage';
import ProductDetailPage from '@/pages/ProductDetailPage';
import CartPage from '@/pages/CartPage';
import LoginPage from '@/pages/LoginPage';
import SignUpPage from '@/pages/SignUpPage';
import ForgotPasswordPage from '@/pages/ForgotPasswordPage';
import AccountPage from '@/pages/AccountPage';
import CheckoutPage from '@/pages/CheckoutPage';
import SearchPage from '@/pages/SearchPage';
import AboutPage from '@/pages/AboutPage';
import ContactPage from '@/pages/ContactPage';
import AdminPage from '@/pages/AdminPage';
import NotFoundPage from '@/pages/NotFoundPage';

function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <FavoritesProvider>
          <BrowserRouter>
            <div className="flex min-h-screen flex-col">
              <Header />
              <main className="flex-1">
                <Routes>
                  <Route path="/" element={<HomePage />} />
                  <Route path="/urunler" element={<ProductsPage />} />
                  <Route path="/urun/:slug" element={<ProductDetailPage />} />
                  <Route path="/kategori/:slug" element={<ProductsPage />} />
                  <Route path="/sepet" element={<CartPage />} />
                  <Route path="/giris" element={<LoginPage />} />
                  <Route path="/kayit-ol" element={<SignUpPage />} />
                  <Route path="/sifremi-unuttum" element={<ForgotPasswordPage />} />
                  <Route path="/hesabim" element={<AccountPage />} />
                  <Route path="/hesabim/:tab" element={<AccountPage />} />
                  <Route path="/odeme" element={<CheckoutPage />} />
                  <Route path="/ara" element={<SearchPage />} />
                  <Route path="/hakkimizda" element={<AboutPage />} />
                  <Route path="/iletisim" element={<ContactPage />} />
                  <Route path="/admin" element={<AdminPage />} />
                  <Route path="*" element={<NotFoundPage />} />
                </Routes>
              </main>
              <Footer />
            </div>
          </BrowserRouter>
        </FavoritesProvider>
      </CartProvider>
    </AuthProvider>
  );
}

export default App;
