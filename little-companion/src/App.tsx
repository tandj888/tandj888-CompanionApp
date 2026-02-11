import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import PrivateRoute from './components/PrivateRoute';
import ReminderManager from './components/ReminderManager';
import LoginPage from './pages/LoginPage';
import HomePage from './pages/HomePage';
import GoalSelectPage from './pages/GoalSelectPage';
import GoalCustomPage from './pages/GoalCustomPage';
import MicroRecordAddPage from './pages/MicroRecordAddPage';
import GroupPage from './pages/GroupPage';
import GroupCreatePage from './pages/GroupCreatePage';
import MomentsPage from './pages/MomentsPage';
import ProfilePage from './pages/ProfilePage';
import BadgePage from './pages/BadgePage';
import GiftAdminPage from './pages/GiftAdminPage';
import GiftShopPage from './pages/GiftShopPage';
import RedemptionCenterPage from './pages/RedemptionCenterPage';
import NotificationCenterPage from './pages/NotificationCenterPage';
import CommunityPage from './pages/CommunityPage';
import ArticleEditorPage from './pages/ArticleEditorPage';
import ArticleDetailPage from './pages/ArticleDetailPage';
import UserCreativeCenterPage from './pages/UserCreativeCenterPage';
import MyFavoritesPage from './pages/MyFavoritesPage';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        
        <Route path="/" element={<PrivateRoute><Layout /></PrivateRoute>}>
          <Route index element={<HomePage />} />
          <Route path="goal/select" element={<GoalSelectPage />} />
          <Route path="goal/custom" element={<GoalCustomPage />} />
          <Route path="record/add" element={<MicroRecordAddPage />} />
          <Route path="group" element={<GroupPage />} />
          <Route path="group/create" element={<GroupCreatePage />} />
          <Route path="community" element={<CommunityPage />} />
          <Route path="community/editor" element={<ArticleEditorPage />} />
          <Route path="community/editor/:id" element={<ArticleEditorPage />} />
          <Route path="creative-center" element={<UserCreativeCenterPage />} />
          <Route path="favorites" element={<MyFavoritesPage />} />
          <Route path="moments" element={<MomentsPage />} />
          <Route path="profile" element={<ProfilePage />} />
          <Route path="notifications" element={<NotificationCenterPage />} />
          <Route path="badges" element={<BadgePage />} />
          <Route path="admin/gifts" element={<GiftAdminPage />} />
          <Route path="gift/shop" element={<GiftShopPage />} />
          <Route path="redemption-center" element={<RedemptionCenterPage />} />
        </Route>

        <Route path="community/article/:id" element={
          <PrivateRoute>
            <div className="max-w-md mx-auto shadow-xl min-h-screen bg-white relative">
              <ReminderManager />
              <ArticleDetailPage />
            </div>
          </PrivateRoute>
        } />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
