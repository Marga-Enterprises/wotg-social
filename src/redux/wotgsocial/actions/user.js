// API
import { loginFunc, registerFunc, getAllUsers, updateUser, getUser,
    forgotPasswordFunc, resetPasswordFunc, guestLoginFunc, updateUserThroughChat
} from '../../../services/api/user';
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

export const updateUserThroughChatAction = (payload) => async (dispatch) => {
    return updateUserThroughChat(payload).then((res) => {
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
    try {
        const res = await getUser(payload);

        const { success, data } = res;
        if (success) {
            dispatch({
                type: types.USER_GET_SUCCESS,
                payload: data,
            });
        } else {
            dispatch({
                type: types.USER_GET_FAIL,
                payload: res.msg || "Failed to fetch user profile.",
            });
        }

        return res;
    } catch (err) {
        return dispatch({
            type: types.USER_GET_FAIL,
            payload: err.response?.data?.msg || "Error in fetching user profile.",
        });
    }
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
    Cookies.set("autoLoginDisabled", false, { expires: 365, secure: true, sameSite: "Strict" });

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
            const { accessToken, chatroomLoginId } = data;
            const account = jwtDecode(accessToken);

            setAuthorizationHeader(accessToken);

            Cookies.set("chatroomLoginId", chatroomLoginId, { expires: 365, secure: true, sameSite: "Strict", httpOnly: false });

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


// guest login function
export const guestLoginFunction = (payload) => async (dispatch) => {
    try {
        const res = await guestLoginFunc(payload);
        const { success, data } = res;
        if (success) {
            const { accessToken, chatroomLoginId } = data;
            const account = jwtDecode(accessToken);
            setAuthorizationHeader(accessToken);

            Cookies.set("chatroomLoginId", chatroomLoginId, { expires: 365, secure: true, sameSite: "Strict", httpOnly: false });

            dispatch(setUserDetails(account));

            // ✅ Send guest login details to Flutter
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
            payload: err.response?.data?.msg || "Guest login failed.",
        });
    }
};


export const addUser = (payload) => async (dispatch) => {
    try {
        const res = await registerFunc(payload);
        const { success, data } = res;

        if (success) {
            const { accessToken, chatroomLoginId } = data;
            const account = jwtDecode(accessToken);

            setAuthorizationHeader(accessToken);

            Cookies.set("chatroomLoginId", chatroomLoginId, { expires: 365, secure: true, sameSite: "Strict", httpOnly: false });

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


export const forgotPasswordAction = (payload) => async (dispatch) => {
    try {
        const res = await forgotPasswordFunc(payload);

        if (res.success) {
        dispatch({
            type: types.REQUEST_NEW_PASSWORD_SUCCESS,
            payload: res.message, // Success message
        });
        } else {
        dispatch({
            type: types.REQUEST_NEW_PASSWORD_FAIL,
            payload: res.msg || "Failed to send password reset email.",
        });
        }

        return res;
    } catch (err) {
        return dispatch({
        type: types.REQUEST_NEW_PASSWORD_FAIL,
        payload: err.response?.data?.msg || "Error in requesting password reset.",
        });
    }
};


export const resetPasswordAction = (payload) => async (dispatch) => {
    try {
        const res = await resetPasswordFunc(payload);

        if (res.success) {
        dispatch({
            type: types.CHANGE_PASSWORD_SUCCESS,
            payload: res.message, // Success message
        });
        } else {
        dispatch({
            type: types.CHANGE_PASSWORD_FAIL,
            payload: res.msg || "Failed to reset password.",
        });
        }

        return res;
    } catch (err) {
        return dispatch({
        type: types.CHANGE_PASSWORD_FAIL,
        payload: err.response?.data?.msg || "Error in resetting password.",
        });
    }
};

export const reloginAction = (token) => async (dispatch) => {
    if (token) {
        try {
            const account = jwtDecode(token);
            setAuthorizationHeader(token);
            dispatch(setUserDetails(account));
            return { success: true, data: account };
        } catch (err) {
            console.error("Error in reloginAction:", err);
            return { success: false, msg: "Invalid token." };
        }
    } else {
        return { success: false, msg: "No token provided." };
    }
};

// 🔹 LOGOUT ACTION
export const userLogout = () => (dispatch) => {
    try {
        Cookies.remove("token");
        Cookies.remove("account");
        Cookies.remove("role");
        Cookies.remove("authenticated");
        Cookies.remove("chatroomLoginId");

        // set auto login to false
        Cookies.set("autoLoginDisabled", true, { expires: 365, secure: true, sameSite: "Strict" });

        return dispatch({
            type: "USER_LOGOUT",
        });
    } catch (err) {
        console.error("Logout failed:", err);
    }
};

