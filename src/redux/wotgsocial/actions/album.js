import { 
    getAlbumsByParams,
    getAlbumById,
    createAlbum,
    updateAlbum,
    deleteAlbum
} from '../../../services/api/album';

import * as types from '../types';

export const getAlbumsByParamsAction = (payload) => async (dispatch) => {
    try {
        const res = await getAlbumsByParams(payload);
        const { success, data } = res;

        if (success) {
            dispatch({
                type: types.ALBUM_LIST_SUCCESS,
                payload: data.albums,
            })
        } else {
            dispatch({
                type: types.ALBUM_LIST_FAIL,
                payload: data.msg || "Failed to fetch albums",
            });
        }

        return res;
    } catch (err) {
        return dispatch({
            type: types.ALBUM_LIST_FAIL,
            payload: err.response?.data?.msg || "Failed to fetch albums",
        });
    }

};

export const getAlbumByIdAction = (payload) => async (dispatch) => {
    try {
        const res = await getAlbumById(payload);

        const { success, data } = res;

        if (success) {
            dispatch({
                type: types.ALBUM_GET_SUCCESS,
                payload: data,
            });
        } else {
            dispatch({
                type: types.ALBUM_GET_FAIL,
                payload: data.msg || "Failed to fetch album",
            });
        }

        return res;
    } catch (err) {
        return dispatch({
            type: types.ALBUM_GET_FAIL,
            payload: err.response?.data?.msg || "Failed to fetch album",
        });
    }
};

export const createAlbumAction = (payload) => async (dispatch) => {
    try {
        const res = await createAlbum(payload);
        const { success, data } = res;

        if (success) {
            dispatch({
                type: types.ALBUM_CREATE_SUCCESS,
                payload: data,
            });
        } else {
            dispatch({
                type: types.ALBUM_CREATE_FAIL,
                payload: data.msg || "Failed to create album",
            });
        }

        return res;
    } catch (err) {
        return dispatch({
            type: types.ALBUM_CREATE_FAIL,
            payload: err.response?.data?.msg || "Failed to create album",
        });
    }
};

export const updateAlbumAction = (payload) => async (dispatch) => {
    try {
        const res = await updateAlbum(payload);
        const { success, data } = res;

        if (success) {
            dispatch({
                type: types.ALBUM_UPDATE_SUCCESS,
                payload: data,
            });
        } else {
            dispatch({
                type: types.ALBUM_UPDATE_FAIL,
                payload: data.msg || "Failed to update album",
            });
        }

        return res;
    } catch (err) {
        return dispatch({
            type: types.ALBUM_UPDATE_FAIL,
            payload: err.response?.data?.msg || "Failed to update album",
        });
    }
};

export const deleteAlbumAction = (payload) => async (dispatch) => {
    try {
        const res = await deleteAlbum(payload);
        const { success, data } = res;

        if (success) {
            dispatch({
                type: types.ALBUM_DELETE_SUCCESS,
                payload: data,
            });
        } else {
            dispatch({
                type: types.ALBUM_DELETE_FAIL,
                payload: data.msg || "Failed to delete album",
            });
        }

        return res;
    } catch (err) {
        return dispatch({
            type: types.ALBUM_DELETE_FAIL,
            payload: err.response?.data?.msg || "Failed to delete album",
        });
    }
};