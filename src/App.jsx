import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Storefront from './pages/Storefront';
import CategoryPage from './pages/CategoryPage';
import AdminLayout from './pages/admin/AdminLayout';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminSliders from './pages/admin/AdminSliders';
import AdminSliderUpload from './pages/admin/AdminSliderUpload';
import AdminFeatures from './pages/admin/AdminFeatures';
import AdminBanners from './pages/admin/AdminBanners';
import AdminProducts from './pages/admin/AdminProducts';
import AdminProductForm from './pages/admin/AdminProductForm';
import AdminCollections from './pages/admin/AdminCollections';
import AdminNewArrivals from './pages/admin/AdminNewArrivals';
import AdminOrders from './pages/admin/AdminOrders';
import AdminUsers from './pages/admin/AdminUsers';
import AdminNavigation from './pages/admin/AdminNavigation';
import AdminFooter from './pages/admin/AdminFooter';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Storefront Route */}
        <Route path="/" element={<Storefront />} />

        {/* Dedicated Dynamic Category / Route Collection Page */}
        <Route path="/category/:slug" element={<CategoryPage />} />
        <Route path="/collection/:slug" element={<CategoryPage />} />

        {/* Admin Control Panel Nested Routes */}
        <Route path="/admin" element={<AdminLayout />}>
          {/* Main Dashboard: Analytics, health, quick links, active slider preview */}
          <Route index element={<AdminDashboard />} />

          {/* Sliders Grid & Reorder Management */}
          <Route path="sliders" element={<AdminSliders />} />

          {/* Route dedicated to uploading new sliders */}
          <Route path="sliders/new" element={<AdminSliderUpload />} />

          {/* Route to edit an existing slider */}
          <Route path="sliders/edit/:id" element={<AdminSliderUpload />} />

          {/* Route to manage Feature Highlights (USP bar below slider) */}
          <Route path="features" element={<AdminFeatures />} />

          {/* Route to manage Section Editorial Banners (Unstitched, etc.) */}
          <Route path="banners" element={<AdminBanners />} />

          {/* Routes to manage Products Catalog */}
          <Route path="products" element={<AdminProducts />} />
          <Route path="products/new" element={<AdminProductForm />} />
          <Route path="products/edit/:id" element={<AdminProductForm />} />

          {/* Route to manage Curated Editions (Shop By Collection) */}
          <Route path="collections" element={<AdminCollections />} />

          {/* Route to manage New Arrivals */}
          <Route path="new-arrivals" element={<AdminNewArrivals />} />

          {/* Route to manage Customer Orders (localStorage + API) */}
          <Route path="orders" element={<AdminOrders />} />

          {/* Route to manage Registered Customer Profiles & LTV */}
          <Route path="users" element={<AdminUsers />} />

          {/* Route to manage Navigation Routes & Brand Logo / WhatsApp */}
          <Route path="navigation" element={<AdminNavigation />} />

          {/* Route to manage Footer Content & Newsletter Subscribers */}
          <Route path="footer" element={<AdminFooter />} />
        </Route>

        {/* Catch-all redirect */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
