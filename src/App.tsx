import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import PrivateRoute from './components/PrivateRoute';
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
          <Route path="moments" element={<MomentsPage />} />
          <Route path="profile" element={<ProfilePage />} />
          <Route path="badges" element={<BadgePage />} />
          <Route path="admin/gifts" element={<GiftAdminPage />} />
          <Route path="gift/shop" element={<GiftShopPage />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
