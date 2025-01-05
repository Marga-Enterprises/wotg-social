// Import necessary dependencies
import { useEffect, useState } from 'react';
import Cookies from 'js-cookie';
import styles from './index.module.css'; // Import styles if needed

const Page = () => {
    // State to store user details
    const [user, setUser] = useState(null);

    // UseEffect to get the authenticated user from cookies when the component mounts
    useEffect(() => {
        // Get the user data from the 'account' cookie
        const account = Cookies.get('account') ? JSON.parse(Cookies.get('account')) : null;

        // If the user is authenticated and we have the user data, set it to state
        if (account) {
            setUser(account);
        }
    }, []);

    return (
        <div className="flex flex-col items-center min-h-screen p-4">
            {user ? (
                <h1>Hello, {user.user_fname} {user.user_lname}!</h1> 
            ) : (
                <h1>Welcome, guest!</h1>  
            )}
        </div>
    );
};

export default Page;
