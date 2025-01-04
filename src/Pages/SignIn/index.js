import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';

import { wotgsocial, common } from '../../redux/combineActions';
import { useNavigate } from 'react-router-dom';

import Cookies from 'js-cookie';


const Page = () => {
    const { error } = useSelector((state) => state.wotgsocial.user);
    const {
        ui: { loading },
    } = useSelector((state) => state.common);

    const dispatch = useDispatch();
    const navigate = useNavigate();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [errMsg, setErrMsg] = useState('');
    const [openErrorSnackbar, setOpenErrorSnackbar] = useState(false);

    const handleSubmitLogin = (event) => {
        event.preventDefault();

        const payload = {
            email,
            password,
        };

        dispatch(common.ui.setLoading());
        dispatch(wotgsocial.user.loginFunction(payload))
        .then((res) => {
            if (res.success) {
                window.location.replace('/');
                // navigate('/');
            } else {
                setOpenErrorSnackbar(true);
                setErrMsg(res.payload); // Set error message to display
            }
        })
        .catch((error) => {
            console.error('An error occurred during login:', error);
            setOpenErrorSnackbar(true);
            setErrMsg('An unexpected error occurred. Please try again.'); // Set a generic error message
        })
        .finally(() => {
            dispatch(common.ui.clearLoading());
        });
    };

    useEffect(() => {
        const token = Cookies.get('token'); // Check local storage for the token
    
        if (token) {
          // If there's no token, redirect to the login page or any other route
          navigate('/');
        }
      }, [navigate]);

    return (
        <div className="flex items-center justify-center mt-10">
            <div className="w-full max-w-md p-8 bg-white rounded-lg shadow-lg">
                <h1 className="text-2xl font-bold mb-6 text-center text-gray-800">Login</h1>
                <form className="space-y-4" onSubmit={handleSubmitLogin}>
                    <div>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                            Email address
                        </label>
                        <input
                            type="email"
                            id="email"
                            name="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-custom-slight-light-blue focus:border-custom-slight-light-blue sm:text-sm"
                            required
                        />
                    </div>
                    <div>
                        <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                            Password
                        </label>
                        <input
                            type="password"
                            id="password"
                            name="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-custom-slight-light-blue focus:border-custom-slight-light-blue sm:text-sm"
                            required
                        />
                    </div>
                    <div>
                        <button
                            type="submit"
                            className="w-full px-4 py-2 bg-custom-slight-light-blue text-white font-semibold rounded-md shadow-sm hover:bg-custom-blue focus:outline-none focus:ring-2 focus:ring-custom-slight-light-blue focus:ring-offset-2"
                            disabled={loading} // Disable button while loading
                        >
                            Sign In
                        </button>
                    </div>
                </form>
                {openErrorSnackbar && (
                    <div className="mt-4 text-red-600 text-center">{errMsg}</div>
                )}
                <p className="mt-4 text-center text-sm text-gray-600">
                    Don't have an account?{' '}
                    <a href="/register" className="font-medium text-custom-slight-light-blue hover:text-custom-slight-light-blue">
                        Sign Up
                    </a>
                </p>
            </div>
        </div>
    );
};

export default Page;
