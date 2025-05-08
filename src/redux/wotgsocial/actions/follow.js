import {
    getFollowersByParams,
    getFollowingByParams,
    followUserById,
    unfollowUserById,
} from "../../../services/api/follow";

import * as types from '../types';

export const getFollowersByParamsAction = (payload) => async (dispatch) => {
    try {
        const res = await getFollowersByParams(payload);
        const { success, data } = res;

        if (success) {
            dispatch({
                type: types.FOLLOWERS_LIST_SUCCESS,
                payload: data,
            });
        } else {
            dispatch({
                type: types.FOLLOWERS_LIST_FAIL,
                payload: data.msg || "Failed to fetch followers",
            });
        }

        return res;
    } catch (err) {
        dispatch({
            type: types.FOLLOWERS_LIST_FAIL,
            payload: err.response?.data?.msg || "Failed to fetch followers",
        })
    }
};

export const getFollowingByParamsAction = (payload) => async (dispatch) => {
    try {
        const res = await getFollowingByParams(payload);
        const { success, data } = res;

        if (success) {
            dispatch({
                type: types.FOLLOWING_LIST_SUCCESS,
                payload: data,
            });
        } else {
            dispatch({
                type: types.FOLLOWING_LIST_FAIL,
                payload: data.msg || "Failed to fetch following",
            });
        }

        return res;
    } catch (err) {
        dispatch({
            type: types.FOLLOWING_LIST_FAIL,
            payload: err.response?.data?.msg || "Failed to fetch following",
        })
    }
};

export const followUserByIdAction = (payload) => async (dispatch) => {
    try {
        const res = await followUserById(payload);
        const { success, data } = res;

        if (success) {
            dispatch({
                type: types.FOLLOW_USER_SUCCESS,
                payload: data.followers,
            })
        } else {
            dispatch({
                type: types.FOLLOW_USER_FAIL,
                payload: data.msg || "Failed to follow user",
            })
        }

        return res;
    } catch (err) {
        dispatch({
            type: types.FOLLOW_USER_FAIL,
            payload: err.response?.data?.msg || "Failed to follow user",
        })
    }
};

export const unfollowUserByIdAction = (payload) => async (dispatch) => {
    try {
        const res = await unfollowUserById(payload);
        const { success, data } = res;

        if (success) {
            dispatch({
                type: types.UNFOLLOW_USER_SUCCESS,
                payload: data.followers,
            })
        } else {
            dispatch({
                type: types.UNFOLLOW_USER_FAIL,
                payload: data.msg || "Failed to unfollow user",
            })
        }

        return res;
    } catch (err) {
        dispatch({
            type: types.UNFOLLOW_USER_FAIL,
            payload: err.response?.data?.msg || "Failed to unfollow user",
        })
    }
};