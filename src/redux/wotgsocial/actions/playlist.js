import {
    getPlaylistsByParams,
    getPlaylistById,
    createPlaylist,
    updatePlaylist,
    deletePlaylist,
    addMusicToPlaylist,
    removeMusicFromPlaylist,
} from '../../../services/api/playlist';

import * as types from '../types';

export const getPlaylistsByParamsAction = (payload) => async (dispatch) => {
    try {
        const res = await getPlaylistsByParams(payload);
        const { success, data } = res.data;
        
        if (success) {
            dispatch({
                type: types.PLAYLIST_LIST_SUCCESS,
                payload: data,
            });
        } else {
            dispatch({
                type: types.PLAYLIST_LIST_FAIL,
                payload: res.data.message,
            });
        }

        return res;
    } catch (error) {
        dispatch({
            type: types.PLAYLIST_LIST_FAIL,
            payload: error.message,
        });
    }
};

export const getPlaylistByIdAction = (payload) => async (dispatch) => {
    try {
        const res = await getPlaylistById(payload);
        const { success, data } = res.data;
        
        if (success) {
            dispatch({
                type: types.PLAYLIST_GET_SUCCESS,
                payload: data,
            });
        } else {
            dispatch({
                type: types.PLAYLIST_GET_FAIL,
                payload: res.data.message,
            });
        }

        return res;
    } catch (error) {
        dispatch({
            type: types.PLAYLIST_GET_FAIL,
            payload: error.message,
        });
    }
};

export const createPlaylistAction = (payload) => async (dispatch) => {
    try {
        const res = await createPlaylist(payload);
        const { success, data } = res.data;
        
        if (success) {
            dispatch({
                type: types.PLAYLIST_CREATE_SUCCESS,
                payload: data,
            });
        } else {
            dispatch({
                type: types.PLAYLIST_CREATE_FAIL,
                payload: res.data.message,
            });
        }

        return res;
    } catch (error) {
        dispatch({
            type: types.PLAYLIST_CREATE_FAIL,
            payload: error.message,
        });
    }
};

export const updatePlaylistAction = (payload) => async (dispatch) => {
    try {
        const res = await updatePlaylist(payload);
        const { success, data } = res.data;
        
        if (success) {
            dispatch({
                type: types.PLAYLIST_UPDATE_SUCCESS,
                payload: data,
            });
        } else {
            dispatch({
                type: types.PLAYLIST_UPDATE_FAIL,
                payload: res.data.message,
            });
        }

        return res;
    } catch (error) {
        dispatch({
            type: types.PLAYLIST_UPDATE_FAIL,
            payload: error.message,
        });
    }
};

export const deletePlaylistAction = (payload) => async (dispatch) => {
    try {
        const res = await deletePlaylist(payload);
        const { success, data } = res.data;
        
        if (success) {
            dispatch({
                type: types.PLAYLIST_DELETE_SUCCESS,
                payload: data,
            });
        } else {
            dispatch({
                type: types.PLAYLIST_DELETE_FAIL,
                payload: res.data.message,
            });
        }

        return res;
    } catch (error) {
        dispatch({
            type: types.PLAYLIST_DELETE_FAIL,
            payload: error.message,
        });
    }
};

export const addMusicToPlaylistAction = (payload) => async (dispatch) => {
    try {
        const res = await addMusicToPlaylist(payload);
        const { success, data } = res.data;
        
        if (success) {
            dispatch({
                type: types.PLAYLIST_UPDATE_SUCCESS,
                payload: data,
            });
        } else {
            dispatch({
                type: types.PLAYLIST_UPDATE_FAIL,
                payload: res.data.message,
            });
        }

        return res;
    } catch (error) {
        dispatch({
            type: types.PLAYLIST_UPDATE_FAIL,
            payload: error.message,
        });
    }
};

export const removeMusicFromPlaylistAction = (payload) => async (dispatch) => {
    try {
        const res = await removeMusicFromPlaylist(payload);
        const { success, data } = res.data;
        
        if (success) {
            dispatch({
                type: types.PLAYLIST_UPDATE_SUCCESS,
                payload: data,
            });
        } else {
            dispatch({
                type: types.PLAYLIST_UPDATE_FAIL,
                payload: res.data.message,
            });
        }

        return res;
    } catch (error) {
        dispatch({
            type: types.PLAYLIST_UPDATE_FAIL,
            payload: error.message,
        });
    }
};