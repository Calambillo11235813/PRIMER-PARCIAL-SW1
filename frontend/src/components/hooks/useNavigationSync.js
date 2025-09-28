// hooks/useNavigationSync.js
import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

export const useNavigationSync = () => {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const handlePopState = () => {
      // Pequeño delay para asegurar que React Router haya procesado el cambio
      setTimeout(() => {
        if (window.location.pathname !== location.pathname) {
          console.log('Sincronizando navegación manualmente');
          navigate(window.location.pathname, { 
            replace: true,
            state: location.state 
          });
        }
      }, 10);
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [location, navigate]);
};