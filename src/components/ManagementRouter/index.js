import Cookie from 'js-cookie';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const ManagementRouter = ({children}) => {
    const token = Cookie.get('token');
    const account = Cookie.get('account') ? JSON.parse(Cookie.get('account')) : null;
    const navigate = useNavigate();
    
    useEffect(() => {
        if (!token) {
          navigate('/login') // Redirect to login if no token
        } else if (account?.user_role !== 'admin' && account?.user_role !== 'owner') {
            navigate('/')
        }
    }, [token, account]);
    
    return <>{children}</>;
}

export default ManagementRouter;