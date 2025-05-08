import {
    getPostsByParams,
    getPostById,
    createPost,
    updatePost,
    deletePost,
    addCommentToPost,
    addReplyToComment,
    getCommentsByPostId,
    getRepliesByCommentId,
    updateComment,
    deleteComment,
    sharePostById,
    reactToPostById,
} from '../../../services/api/post';

import * as types from '../types';

export const getPostsByParamsAction = (payload) => async (dispatch) => {
    try {
        const res = await getPostsByParams(payload);
        const { success, data } = res;

        if (success) {
            dispatch({
                type: types.POST_LIST_SUCCESS,
                payload: data,
            });
        } else {
            dispatch({
                type: types.POST_LIST_FAIL,
                payload: data.msg || "Failed to fetch posts",
            });
        }

        return res;
    } catch (err) {
        dispatch({
            type: types.POST_LIST_FAIL,
            payload: err.response?.data?.msg || "Failed to fetch posts",
        })
    }
};

export const getPostByIdAction = (payload) => async (dispatch) => {
    try {
        const res = await getPostById(payload);
        const { success, data } = res;

        if (success) {
            dispatch({
                type: types.POST_GET_SUCCESS,
                payload: data,
            });
        }

        return res;

    } catch (err) {
        dispatch({
            type: types.POST_GET_FAIL,
            payload: err.response?.data?.msg || "Failed to fetch post",
        })
    }
};

export const createPostAction = (payload) => async (dispatch) => {
    try {
        const res = await createPost(payload);
        const { success, data } = res;

        if (success) {
            dispatch({
                type: types.POST_CREATE_SUCCESS,
                payload: data,
            });
        } else {
            dispatch({
                type: types.POST_CREATE_FAIL,
                payload: data.msg || "Failed to create post",
            });
        }

        return res;
    } catch (err) {
        dispatch({
            type: types.POST_CREATE_FAIL,
            payload: err.response?.data?.msg || "Failed to create post",
        })
    }
};

export const updatePostAction = (payload) => async (dispatch) => {
    try {
        const res = await updatePost(payload);
        const { success, data } = res;

        if (success) {
            dispatch({
                type: types.POST_UPDATE_SUCCESS,
                payload: data,
            });
        } else {
            dispatch({
                type: types.POST_UPDATE_FAIL,
                payload: data.msg || "Failed to update post",
            });
        }

        return res;
    } catch (err) {
        dispatch({
            type: types.POST_UPDATE_FAIL,
            payload: err.response?.data?.msg || "Failed to update post",
        })
    }
};

export const deletePostAction = (payload) => async (dispatch) => {
    try {
        const res = await deletePost(payload);
        const { success, data } = res;

        if (success) {
            dispatch({
                type: types.POST_DELETE_SUCCESS,
                payload: data,
            });
        } else {
            dispatch({
                type: types.POST_DELETE_FAIL,
                payload: data.msg || "Failed to delete post",
            });
        }

        return res;
    } catch (err) {
        dispatch({
            type: types.POST_DELETE_FAIL,
            payload: err.response?.data?.msg || "Failed to delete post",
        })
    }
};

export const addCommentToPostAction = (payload) => async (dispatch) => {
    try {
        const res = await addCommentToPost(payload);
        const { success, data } = res;

        if (success) {
            dispatch({
                type: types.POST_ADD_COMMENT_SUCCESS,
                payload: data,
            });
        } else {
            dispatch({
                type: types.POST_ADD_COMMENT_FAIL,
                payload: data.msg || "Failed to create comment",
            });
        }

        return res;
    } catch (err) {
        dispatch({
            type: types.POST_ADD_COMMENT_FAIL,
            payload: err.response?.data?.msg || "Failed to create comment",
        })
    }
};

export const addReplyToCommentAction = (payload) => async (dispatch) => {
    try {
        const res = await addReplyToComment(payload);
        const { success, data } = res;

        if (success) {
            dispatch({
                type: types.COMMENT_ADD_REPLY_REQUEST,
                payload: data,
            });
        } else {
            dispatch({
                type: types.COMMENT_ADD_REPLY_FAIL,
                payload: data.msg || "Failed to create reply",
            });
        }

        return res;
    } catch (err) {
        dispatch({
            type: types.COMMENT_ADD_REPLY_FAIL,
            payload: err.response?.data?.msg || "Failed to create reply",
        })
    }
};

export const getCommentsByPostIdAction = (payload) => async (dispatch) => {
    try {
        const res = await getCommentsByPostId(payload);
        const { success, data } = res;

        if (success) {
            dispatch({
                type: types.POST_COMMENTS_LIST_REQUEST,
                payload: data,
            });
        } else {
            dispatch({
                type: types.POST_COMMENTS_LIST_FAIL,
                payload: data.msg || "Failed to fetch comments",
            });
        }

        return res;
    } catch (err) {
        dispatch({
            type: types.POST_COMMENTS_LIST_FAIL,
            payload: err.response?.data?.msg || "Failed to fetch comments",
        })
    }
};

export const getRepliesByCommentIdAction = (payload) => async (dispatch) => {
    try {
        const res = await getRepliesByCommentId(payload);
        const { success, data } = res;

        if (success) {
            dispatch({
                type: types.COMMENT_REPLIES_LIST_REQUEST,
                payload: data,
            });
        } else {
            dispatch({
                type: types.COMMENT_REPLIES_LIST_FAIL,
                payload: data.msg || "Failed to fetch replies",
            });
        }

        return res;
    } catch (err) {
        dispatch({
            type: types.COMMENT_REPLIES_LIST_FAIL,
            payload: err.response?.data?.msg || "Failed to fetch replies",
        })
    }
};

export const updateCommentAction = (payload) => async (dispatch) => {
    try {
        const res = await updateComment(payload);
        const { success, data } = res;

        if (success) {
            dispatch({
                type: types.EDIT_COMMENT_SUCCESS,
                payload: data,
            });
        } else {
            dispatch({
                type: types.EDIT_COMMENT_FAIL,
                payload: data.msg || "Failed to update comment",
            });
        }

        return res;
    } catch (err) {
        dispatch({
            type: types.EDIT_COMMENT_FAIL,
            payload: err.response?.data?.msg || "Failed to update comment",
        })
    }
};

export const deleteCommentAction = (payload) => async (dispatch) => {
    try {
        const res = await deleteComment(payload);
        const { success, data } = res;

        if (success) {
            dispatch({
                type: types.DELETE_COMMENT_SUCCESS,
                payload: data,
            });
        } else {
            dispatch({
                type: types.DELETE_COMMENT_FAIL,
                payload: data.msg || "Failed to delete comment",
            });
        }

        return res;
    } catch (err) {
        dispatch({
            type: types.DELETE_COMMENT_FAIL,
            payload: err.response?.data?.msg || "Failed to delete comment",
        })
    }
};

export const sharePostByIdAction = (payload) => async (dispatch) => {
    try {
        const res = await sharePostById(payload);
        const { success, data } = res;

        if (success) {
            dispatch({
                type: types.SHARE_POST_SUCCESS,
                payload: data,
            });
        } else {
            dispatch({
                type: types.SHARE_POST_FAIL,
                payload: data.msg || "Failed to share post",
            });
        }

        return res;
    } catch (err) {
        dispatch({
            type: types.SHARE_POST_FAIL,
            payload: err.response?.data?.msg || "Failed to share post",
        })
    }
};

export const reactToPostByIdAction = (payload) => async (dispatch) => {
    try {
        const res = await reactToPostById(payload);
        const { success, data } = res;

        if (success) {
            dispatch({
                type: types.POST_REACT_SUCCESS,
                payload: data,
            });
        } else {
            dispatch({
                type: types.POST_REACT_FAIL,
                payload: data.msg || "Failed to react to post",
            });
        }

        return res;
    } catch (err) {
        dispatch({
            type: types.POST_REACT_FAIL,
            payload: err.response?.data?.msg || "Failed to react to post",
        })
    }
};

