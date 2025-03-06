// API
import { loginFunc, registerFunc, getAllUsers, updateUser, getUser, refreshTokenFunc, logoutUser } from '../../../services/api/user';
import Cookies from 'js-cookie';
import axios from 'axios';

// JWT Decode
import { jwtDecode } from 'jwt-decode';

// Types
import * as types from '../types';

export const getAllUsersAction = (payload) => async (dispatch) => {
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
    
    // ✅ Store access token in cookies with 1-year expiration
    Cookies.set("token", token, { expires: 365, secure: true, sameSite: "Strict" });

    axios.defaults.headers.common.Authorization = bearerToken;
};

export const setUserDetails = (userDetails) => {
    const { user } = userDetails;

    // ✅ Store user details persistently (1-year expiration)
    Cookies.set("account", JSON.stringify(user), { expires: 365, secure: true, sameSite: "Strict" });
    Cookies.set("authenticated", true, { expires: 365, secure: true, sameSite: "Strict" });
    Cookies.set("role", user.user_role, { expires: 365, secure: true, sameSite: "Strict" });

    return {
        type: types.SET_USER_DETAILS,
        payload: user,
    };
};


// 🔹 UPDATED LOGIN FUNCTION
export const loginFunction = (payload) => async (dispatch) => {
    try {
        const res = await loginFunc(payload);
        const { success, data } = res;

        if (success) {
            const { accessToken, refreshToken } = data;
            const account = jwtDecode(accessToken);

            setAuthorizationHeader(accessToken);

            // ✅ Store refresh token persistently (1 year)
            Cookies.set("refreshToken", refreshToken, { expires: 365, secure: true, sameSite: "Strict", httpOnly: false });

            dispatch(setUserDetails(account));

            // ✅ Send login details to Flutter
            if (window.flutter_inappwebview) {
                window.flutter_inappwebview.callHandler("onLoginSuccess", {
                    userId: account.user.id,   // Extracted from JWT
                    email: account.user.email, // Extracted from JWT
                    token: accessToken    // Send access token
                });
            }
        }

        return res;

    } catch (err) {
        return dispatch({
            type: types.LOGIN_FAIL,
            payload: err.response?.data?.msg || "Login failed.",
        });
    }
};

export const addUser = (payload) => async (dispatch) => {
    try {
        const res = await registerFunc(payload);
        const { success, data } = res;

        if (success) {
            const { accessToken, refreshToken } = data;
            const account = jwtDecode(accessToken);

            setAuthorizationHeader(accessToken);

            // ✅ Store refresh token persistently (1 year)
            Cookies.set("refreshToken", refreshToken, { expires: 365, secure: true, sameSite: "Strict", httpOnly: false });

            dispatch(setUserDetails(account));
            dispatch({
                type: types.USER_ADD_SUCCESS,
                payload: data,
            });
        }

        return res;

    } catch (err) {
        return dispatch({
            type: types.USER_ADD_FAIL,
            payload: err.response?.data?.msg || "Registration failed.",
        });
    }
};



// 🔹 REFRESH TOKEN ACTION (Auto-renew Access Token)
export const refreshTokenAction = () => async (dispatch) => {
    try {
        const refreshToken = Cookies.get("refreshToken"); // ✅ Fetch refresh token from cookies

        if (!refreshToken) {
            dispatch(userLogout());
            return { success: false, message: "No refresh token found, please log in again." };
        }

        const res = await refreshTokenFunc({ refreshToken }); // ✅ Send refreshToken in request body
        const { success, data } = res;

        if (success) {
            const { accessToken } = data;
            setAuthorizationHeader(accessToken);
            return { success: true, accessToken };
        } else {
            dispatch(userLogout());
            return { success: false, message: "Refresh failed." };
        }

    } catch (err) {
        dispatch(userLogout());
        return { success: false, message: "Session expired, please log in again." };
    }
};

export const restoreSessionAction = () => async (dispatch) => {
    try {
        const refreshToken = Cookies.get("refreshToken");

        if (!refreshToken) {
            return; // ✅ Prevent calling `userLogout()` if already logged out
        }

        const res = await refreshTokenFunc({ refreshToken });
        const { success, data } = res;

        if (success) {
            const { accessToken } = data;
            setAuthorizationHeader(accessToken);

            const account = jwtDecode(accessToken);
            dispatch(setUserDetails(account));
        } else {
            dispatch(userLogout()); // ✅ Only call logout if refresh explicitly fails
        }
    } catch (err) {
        console.error("Session restore failed:", err);
    }
};



// 🔹 LOGOUT ACTION
export const userLogout = () => async (dispatch) => {
    try {
        const refreshToken = Cookies.get("refreshToken"); // ✅ Fetch refresh token from cookies

        if (refreshToken) {
            await logoutUser({ refreshToken }); // ✅ Send refreshToken in request body
        }

        // ✅ Remove cookies
        Cookies.remove("token");
        Cookies.remove("refreshToken"); 
        Cookies.remove("account");
        Cookies.remove("role");
        Cookies.remove("authenticated");

        window.location.replace("/login");

        return dispatch({
            type: "USER_LOGOUT",
        });
    } catch (err) {
        console.error("Logout failed:", err);
    }
};

