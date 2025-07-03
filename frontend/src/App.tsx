import React, { useState } from 'react';
import { AppProvider } from './context/AppContext';
import Header from './components/Layout/Header';
import Footer from './components/Layout/Footer';
import HomePage from './pages/HomePage';
import BrowsePage from './pages/BrowsePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ProfilePage from './pages/ProfilePage';
import MyBidsPage from './pages/MyBidsPage';
import MyListingsPage from './pages/MyListingsPage';
import CreateAuctionPage from './pages/CreateAuctionPage';
import AdminPage from './pages/AdminPage';
import AuctionDetailPage from './pages/AuctionDetailPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import EditAuctionPage from './pages/EditAuctionPage';
import NotificationsPage from './pages/NotificationsPage';

function AppContent() {
  const [currentPage, setCurrentPage] = useState('home');
  const [selectedAuctionId, setSelectedAuctionId] = useState<string | null>(null);

  const handlePageChange = (page: string, auctionId?: string) => {
    setCurrentPage(page);
    if (auctionId) {
      setSelectedAuctionId(auctionId);
    }
  };

  const renderPage = () => {
    switch (currentPage) {
      case 'home':
        return <HomePage onPageChange={handlePageChange} />;
      case 'browse':
        return <BrowsePage onPageChange={handlePageChange} />;
      case 'login':
        return <LoginPage onPageChange={handlePageChange} />;
      case 'register':
        return <RegisterPage onPageChange={handlePageChange} />;
      case 'profile':
        return <ProfilePage onPageChange={handlePageChange} />;
      case 'my-bids':
        return <MyBidsPage onPageChange={handlePageChange} />;
      case 'my-listings':
        return <MyListingsPage onPageChange={handlePageChange} />;
      case 'create-auction':
        return <CreateAuctionPage onPageChange={handlePageChange} />;
      case 'admin':
        return <AdminPage onPageChange={handlePageChange} />;
      case 'auction-detail':
        return <AuctionDetailPage auctionId={selectedAuctionId} onPageChange={handlePageChange} />;
      case 'forgot-password':
        return <ForgotPasswordPage onPageChange={handlePageChange} />;
      case 'reset-password':
        return <ResetPasswordPage />;
      case 'edit-auction':
          return <EditAuctionPage auctionId={selectedAuctionId} onPageChange={handlePageChange} />;
      case 'notifications':
        return <NotificationsPage onPageChange={handlePageChange} />;
      default:
        return <HomePage onPageChange={handlePageChange} />;
    }
  };

  // Don't show header/footer for auth pages
  const authPages = ['login', 'register', 'forgot-password', 'reset-password'];
  const isAuthPage = authPages.includes(currentPage);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {!isAuthPage && <Header currentPage={currentPage} onPageChange={handlePageChange} />}
      <main className={isAuthPage ? 'flex-1' : 'flex-1'}>
        {renderPage()}
      </main>
      {!isAuthPage && <Footer />}
    </div>
  );
}

function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}

export default App;