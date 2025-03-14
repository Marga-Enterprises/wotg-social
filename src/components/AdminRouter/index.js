import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Cookies from 'js-cookie';

const AdminRouter = ({ children }) => {
  const navigate = useNavigate();
  const token = Cookies.get('token');

  const account = Cookies.get('account') ? JSON.parse(Cookies.get('account')) : null;

  useEffect(() => {
    if (!token) {
      navigate('/login'); // Redirect to login if no token
    } else if (account?.user_role === 'member') {
      navigate('/'); // Redirect regular users to home
    }
  }, [navigate, token, account]);

  return <>{children}</>;
};

export default AdminRouter;
