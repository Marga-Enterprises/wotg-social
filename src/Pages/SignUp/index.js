import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { wotgsocial, common } from '../../redux/combineActions';
import { useNavigate } from 'react-router-dom';

import Cookies from 'js-cookie';

const Page = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();

    // Form state management
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [gender, setGender] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [errMsg, setErrMsg] = useState('');
    const [openErrorSnackbar, setOpenErrorSnackbar] = useState(false);

    const handleSubmitSignUp = (event) => {
        event.preventDefault();

        const payload = {
            user_fname: firstName,
            user_lname: lastName,
            user_gender: gender,
            email,
            password,
        };

        dispatch(common.ui.setLoading());
        dispatch(wotgsocial.user.addUser(payload))
            .then((res) => {
                if (res.success) {
                    // Optionally save user data in cookies or redirect
                    window.location.replace('/login');
                    // navigate('/login');
                } else {
                    setOpenErrorSnackbar(true);
                    setErrMsg(res.payload); // Set error message to display
                }
            })
            .catch((error) => {
                console.error('An error occurred during registration:', error);
                setOpenErrorSnackbar(true);
                setErrMsg('An unexpected error occurred. Please try again.'); // Set a generic error message
            })
            .finally(() => {
                dispatch(common.ui.clearLoading());
            });
    };

    return (
        <div className="flex items-center justify-center mt-10">
            <div className="w-full max-w-md p-12 bg-white rounded-lg shadow-2xl min-h-[600px] flex flex-col justify-center">
                <h1 className="text-2xl font-bold mb-6 text-center text-gray-800">Register</h1>
                <form className="space-y-6" onSubmit={handleSubmitSignUp}>
                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                        <div>
                            <label htmlFor="first-name" className="block text-sm font-medium text-gray-700">
                                First Name
                            </label>
                            <input
                                type="text"
                                id="first-name"
                                name="first-name"
                                value={firstName}
                                onChange={(e) => setFirstName(e.target.value)}
                                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-custom-blue sm:text-sm"
                                required
                            />
                        </div>
                        <div>
                            <label htmlFor="last-name" className="block text-sm font-medium text-gray-700">
                                Last Name
                            </label>
                            <input
                                type="text"
                                id="last-name"
                                name="last-name"
                                value={lastName}
                                onChange={(e) => setLastName(e.target.value)}
                                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-custom-blue sm:text-sm"
                                required
                            />
                        </div>
                    </div>

                    <div>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                            Email Address
                        </label>
                        <input
                            type="email"
                            id="email"
                            name="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-custom-blue sm:text-sm"
                            required
                        />
                    </div>

                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
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
                                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-custom-blue sm:text-sm"
                                required
                            />
                        </div>
                        <div>
                            <label htmlFor="gender" className="block text-sm font-medium text-gray-700">
                                Gender
                            </label>
                            <select
                                id="gender"
                                name="gender"
                                value={gender}
                                onChange={(e) => setGender(e.target.value)}
                                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-custom-blue sm:text-sm"
                                required
                            >
                                <option value="">Select Gender</option>
                                <option value="male">Male</option>
                                <option value="female">Female</option>
                            </select>
                        </div>
                    </div>

                    <div>
                        <button
                            type="submit"
                            className="w-full px-4 py-2 bg-custom-slight-light-blue text-white font-semibold rounded-md shadow-sm hover:bg-custom-blue focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                        >
                            Register
                        </button>
                    </div>
                </form>

                {openErrorSnackbar && (
                    <div className="mt-4 text-red-600 text-center">{errMsg}</div>
                )}

                <p className="mt-4 text-center text-sm text-gray-600">
                    Already have an account?{' '}
                    <a href="/login" className="font-medium text-custom-slight-light-blue hover:font-medium text-custom-blue">
                        Log In
                    </a>
                </p>
            </div>
        </div>
    );
};

export default Page;
