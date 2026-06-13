import { Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from '../pages/LoginPage';
import DashboardPage from '../pages/DashboardPage';
import RevenueStatsPage from '../pages/stats/RevenueStatsPage';
import FoodStatsPage from '../pages/stats/FoodStatsPage';
import OrderStatsPage from '../pages/stats/OrderStatsPage';
import BillingHistoryPage from '../pages/BillingHistoryPage';
import GenerateBillPage from '../pages/GenerateBillPage';
import ProfilePage from '../pages/ProfilePage';
import MainLayout from '../layouts/MainLayout';
import { useAuth } from '../components/AuthContext';

// Kitchen
import KitchenDashboardPage from '../pages/kitchen/KitchenDashboardPage';
import KitchenOrdersPage from '../pages/kitchen/KitchenOrdersPage';
import OrderDetailPage from '../pages/kitchen/OrderDetailPage';
import PreparationWorkflowPage from '../pages/kitchen/PreparationWorkflowPage';

// QR Ordering
import OrderingLayout from '../layouts/OrderingLayout';
import QRLandingPage from '../pages/ordering/QRLandingPage';
import MenuPage from '../pages/ordering/MenuPage';
import ReviewOrderPage from '../pages/ordering/ReviewOrderPage';

// Super Admin
import SuperAdminDashboard from '../pages/superadmin/SuperAdminDashboard';
import HotelManagementPage from '../pages/superadmin/HotelManagementPage';
import GlobalAnalyticsPage from '../pages/superadmin/GlobalAnalyticsPage';
import UserManagementPage from '../pages/superadmin/UserManagementPage';

// ─── Multi-Hotel Pages ────────────────────────────────────────────────────────
import HotelAnalyticsPage from '../pages/hotel/HotelAnalyticsPage';

// ─── New Admin Features ───────────────────────────────────────────────────────
import FoodManagementPage from '../pages/FoodManagementPage';
import QRCreatorPage from '../pages/QRCreatorPage';
import TableManagementPage from '../pages/TableManagementPage';

function RoleIndexRedirect() {
  const { user } = useAuth();
  const home = user?.role === 'kitchen' ? '/kitchen/dashboard' : user?.role === 'super_admin' ? '/superadmin/dashboard' : '/dashboard';
  return <Navigate to={home} replace />;
}

function ProtectedRoute({ children }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  return children;
}

function RoleRoute({ children, allowedRoles }) {
  const { user } = useAuth();
  if (!allowedRoles.includes(user?.role)) {
    const home = user?.role === 'kitchen' ? '/kitchen/dashboard' : user?.role === 'super_admin' ? '/superadmin/dashboard' : '/dashboard';
    return <Navigate to={home} replace />;
  }
  return children;
}

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />

      {/* QR Ordering (public) */}
      <Route path="/order" element={<OrderingLayout />}>
        <Route index element={<QRLandingPage />} />
        <Route path="menu" element={<MenuPage />} />
        <Route path="review" element={<ReviewOrderPage />} />
      </Route>

      {/* Protected Dashboard */}
      <Route path="/" element={<ProtectedRoute><MainLayout /></ProtectedRoute>}>
        <Route index element={<RoleIndexRedirect />} />

        {/* Super Admin only */}
        <Route path="superadmin/dashboard" element={<RoleRoute allowedRoles={['super_admin']}><SuperAdminDashboard /></RoleRoute>} />
        <Route path="superadmin/hotels" element={<RoleRoute allowedRoles={['super_admin']}><HotelManagementPage /></RoleRoute>} />
        <Route path="superadmin/analytics" element={<RoleRoute allowedRoles={['super_admin']}><GlobalAnalyticsPage /></RoleRoute>} />
        <Route path="superadmin/users" element={<RoleRoute allowedRoles={['super_admin']}><UserManagementPage /></RoleRoute>} />

        {/* Admin / Super-Admin */}
        <Route path="dashboard" element={<RoleRoute allowedRoles={['admin', 'super_admin']}><DashboardPage /></RoleRoute>} />

        {/* ─── Multi-Hotel Routes ─────────────────────────────────────────── */}
        <Route path="hotel/analytics" element={<RoleRoute allowedRoles={['admin', 'super_admin']}><HotelAnalyticsPage /></RoleRoute>} />

        {/* Statistics */}
        <Route path="statistics" element={<Navigate to="/statistics/revenue" replace />} />
        <Route path="statistics/revenue" element={<RoleRoute allowedRoles={['admin', 'super_admin']}><RevenueStatsPage /></RoleRoute>} />
        <Route path="statistics/food" element={<RoleRoute allowedRoles={['admin', 'super_admin']}><FoodStatsPage /></RoleRoute>} />
        <Route path="statistics/orders" element={<RoleRoute allowedRoles={['admin', 'super_admin']}><OrderStatsPage /></RoleRoute>} />

        <Route path="admin/food" element={<RoleRoute allowedRoles={['admin', 'super_admin']}><FoodManagementPage /></RoleRoute>} />
        <Route path="admin/qr-creator" element={<RoleRoute allowedRoles={['admin', 'super_admin']}><QRCreatorPage /></RoleRoute>} />
        <Route path="admin/tables" element={<RoleRoute allowedRoles={['admin', 'super_admin']}><TableManagementPage /></RoleRoute>} />

        <Route path="history" element={<RoleRoute allowedRoles={['admin', 'super_admin']}><BillingHistoryPage /></RoleRoute>} />
        <Route path="billing/generate" element={<RoleRoute allowedRoles={['admin', 'super_admin']}><GenerateBillPage /></RoleRoute>} />

        {/* Shared */}
        <Route path="profile" element={<ProfilePage />} />

        {/* Kitchen */}
        <Route path="kitchen" element={<Navigate to="/kitchen/dashboard" replace />} />
        <Route path="kitchen/dashboard" element={<RoleRoute allowedRoles={['kitchen']}><KitchenDashboardPage /></RoleRoute>} />
        <Route path="kitchen/orders" element={<RoleRoute allowedRoles={['kitchen']}><KitchenOrdersPage /></RoleRoute>} />
        <Route path="kitchen/orders/:id" element={<RoleRoute allowedRoles={['kitchen']}><OrderDetailPage /></RoleRoute>} />
        <Route path="kitchen/orders/:id/workflow" element={<RoleRoute allowedRoles={['kitchen']}><PreparationWorkflowPage /></RoleRoute>} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}