//api
import { loginFunc,
registerFunc   } from '../../../services/api/user';
import Cookies from 'js-cookie';
import axios from 'axios';

//jwtDecode
import { jwtDecode } from 'jwt-decode';

//types
import * as types from '../types';

export const setAuthorizationHeader = (token) => {
    const bearerToken = `Bearer ${token}`;
    Cookies.set('token', token);
    axios.defaults.headers.common.Authorization = bearerToken;
};

export const setUserDetails = (userDetails) => {
    const { user } = userDetails;
    Cookies.set('account', JSON.stringify(user));
    Cookies.set('authenticated', true);
    Cookies.set('role', user.role);
    // Cookies.set('category', user.category);

    return {
        type: types.SET_USER_DETAILS,
        payload: user,
    };
};


export const loginFunction = (payload) => async (dispatch) => {
    try {
        const res = await loginFunc(payload);
        const { success, data, msg } = res;

        console.log('RESPONSEEEE', res);

        if (success) {
            console.log('RESPONSEEEE', res);
            const { token } = data;
            const account = jwtDecode(token);

            setAuthorizationHeader(token);
            dispatch(setUserDetails(account));
        }

        return res; // Return the response object in both success and error cases

    } catch (err) {
        console.log('ERRORRRRRR', err);
        return dispatch({
        type: types.LOGIN_FAIL,
        payload: err.response.data.msg,
        });
    }
};

export const addUser = (payload) => async (dispatch) => {
    try {
        const res = await registerFunc(payload);
        const { success, data, msg } = res;

        console.log('RESPONSEEEE SA REDUX', res);

        if (success) {
        dispatch({
            type: types.USER_ADD_SUCCESS,
            payload: res.data.docs,
        });
        }

        return res; // Return the response object in both success and error cases

    } catch (err) {
        return dispatch({
        type: types.USER_ADD_FAIL,
        payload: err.response.data.msg,
        });
    }
};





export const userLogout = () => {
    Cookies.remove('token');
    Cookies.remove('account');
    Cookies.remove('role');
    Cookies.remove('authenticated');
    Cookies.remove('category');
    window.location.replace('/login');

    // Router.push('/logout');
};
