//api
import { loginFunc,
registerFunc, getAllUsers, updateUser, getUser } from '../../../services/api/user';
import Cookies from 'js-cookie';
import axios from 'axios';

//jwtDecode
import { jwtDecode } from 'jwt-decode';

//types
import * as types from '../types';

export const getAllUsersAction = (payload) => async (dispatch) => {
    console.log('PAYLOAD USER ACTION', payload);
    return getAllUsers(payload).then((res) => {
        if (res.success) {
            dispatch({
            type: types.USER_LIST_SUCCESS,
            payload: res.data, 
            });
        } else {
            dispatch({
            type: types.USER_LIST_FAIL,
            payload: res.msg,
            });
        }

        return res; 
    });
};

export const updateUserAction = (payload) => async (dispatch) => {
    console.log('[[[[[[[[[[[[PAYLOAD USER ACTION]]]]]]]]]]]]', payload);
    return updateUser(payload).then((res) => {
        if (res.success) {
            dispatch({
            type: types.USER_UPDATE_SUCCESS,
            payload: res.data,
            });
        } else {
            dispatch({
            type: types.USER_UPDATE_FAIL,
            payload: res.msg,
            });
        }

        return res; 
    });
};

export const getUserAction = (payload) => async (dispatch) => {
    return getUser(payload).then((res) => {
        if (res.success) {
            dispatch({
            type: types.USER_GET_SUCCESS,
            payload: res.data,
            });
        } else {
            dispatch({
            type: types.USER_GET_FAIL,
            payload: res.msg,
            });
        }

        return res; 
    });
};

export const setAuthorizationHeader = (token) => {
    const bearerToken = `Bearer ${token}`;
    Cookies.set('token', token); // Set cookie properly
    axios.defaults.headers.common.Authorization = bearerToken;
    console.log('Token Set in Axios Header:', bearerToken); // Verify header set
};


export const setUserDetails = (userDetails) => {
    const { user } = userDetails;
    Cookies.set('account', JSON.stringify(user));
    Cookies.set('authenticated', true);
    Cookies.set('role', user.user_role);

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

            console.log('ACCOUNT', account);

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
    window.location.replace('/login');

    return {
        type: 'USER_LOGOUT',
    };
};
