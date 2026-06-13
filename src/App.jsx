import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './components/AuthContext';
import { HotelProvider } from './context/HotelContext';
import AppRoutes from './routes/AppRoutes';
import HotelSwitchOverlay from './components/HotelSwitchOverlay';

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <HotelProvider>
          <HotelSwitchOverlay />
          <AppRoutes />
        </HotelProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
