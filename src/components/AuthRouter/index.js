import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Cookies from 'js-cookie';

const AuthRouter = ({ children }) => {
  const navigate = useNavigate();
  const token = Cookies.get('token');

  useEffect(() => {
    if (!token) {
      navigate('/login');
    }
  }, [navigate, token]);

  return <>{children}</>;
};

export default AuthRouter;