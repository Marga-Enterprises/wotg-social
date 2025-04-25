import {
    getMusicByParams,
    getMusicById,
    createMusic,
    updateMusic,
    deleteMusic,
} from "../../../services/api/music";

import * as types from '../types';

export const getMusicByParamsAction = (payload) => async (dispatch) => {
    try {
        const res = await getMusicByParams(payload);
        const { success, data } = res;

        if (success) {
            dispatch({
                type: types.MUSIC_LIST_SUCCESS,
                payload: data,
            });
        } else {
            dispatch({
                type: types.MUSIC_LIST_FAIL,
                payload: data.msg || "Failed to fetch music",
            });
        }

        return res;
    } catch (err) {
        dispatch({
            type: types.MUSIC_LIST_FAIL,
            payload: err.response?.data?.msg || "Failed to fetch music",
        })
    }
};

export const getMusicByIdAction = (payload) => async (dispatch) => {
    try {
        const res = await getMusicById(payload);
        const { success, data } = res;

        if (success) {
            dispatch({
                type: types.MUSIC_LIST_SUCCESS,
                payload: data,
            })
        } else {
            dispatch({
                type: types.MUSIC_GET_FAIL,
                payload: data.msg || "Failed to fetch music",
            })
        }

        return res;
    } catch (err) {{
        dispatch({
            type: types.MUSIC_GET_FAIL,
            payload: err.response?.data?.msg || "Failed to fetch music",
        })
    }}
}

export const createMusicAction = (payload) => async (dispatch) => {
    try {
        const res = await createMusic(payload);
        const { success, data } = res;

        if (success) {
            dispatch({
                type: types.MUSIC_CREATE_SUCCESS,
                payload: data,
            });
        } else {
            dispatch({
                type: types.MUSIC_CREATE_FAIL,
                payload: data.msg || "Failed to create music",
            });
        }

        return res;
    } catch (err) {
        dispatch({
            type: types.MUSIC_CREATE_FAIL,
            payload: err.response?.data?.msg || "Failed to create music",
        });
    }
};

export const updateMusicAction = (payload) => async (dispatch) => {
    try {
        const res = await updateMusic(payload);
        const { success, data } = res;

        if (success) {
            dispatch({
                type: types.MUSIC_UPDATE_SUCCESS,
                payload: data,
            });
        } else {
            dispatch({
                type: types.MUSIC_UPDATE_FAIL,
                payload: data.msg || "Failed to update music",
            });
        }

        return res;
    } catch (err) {
        dispatch({
            type: types.MUSIC_UPDATE_FAIL,
            payload: err.response?.data?.msg || "Failed to update music",
        });
    }
};

export const deleteMusicAction = (payload) => async (dispatch) => {
    try {
        const res = await deleteMusic(payload);
        const { success, data } = res;

        if (success) {
            dispatch({
                type: types.MUSIC_DELETE_SUCCESS,
                payload: data,
            });
        } else {
            dispatch({
                type: types.MUSIC_DELETE_FAIL,
                payload: data.msg || "Failed to delete music",
            });
        }

        return res;
    } catch (err) {
        dispatch({
            type: types.MUSIC_DELETE_FAIL,
            payload: err.response?.data?.msg || "Failed to delete music",
        });
    }
};
