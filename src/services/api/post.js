import { GET, POST, POST_FORM_DATA, PUT_FORM_DATA, DELETE } from '../request.js';
import * as methods from '../../utils/methods.js';

// GET POST BY PARAMS
export async function getPostsByParams(payload) {
    const params = methods.convertQueryString(payload);
    return GET(`/posts?${params}`);
};

// GET POST BY ID
export async function getPostById(payload) {
    return GET(`/posts/${payload.id}`);
};

// CREATE A POST USING POST FORM DATA METHOD
export async function createPost(payload) {
    const formData = new FormData();

    for (const key in payload) {
        const value = payload[key];
        if (value !== null && value !== undefined) {
            // If it's an array (like files), append each one
            if (Array.isArray(value)) {
                value.forEach((item) => {
                    formData.append(`${key}`, item);
                });
            } else {
                formData.append(key, value);
            }
        }
    }

    return POST_FORM_DATA('/posts', { formData });
}

// UPDATE A POST USING PUT FORM DATA METHOD
export async function updatePost(payload) {
    const formData = new FormData();

    for (const key in payload) {
        const value = payload[key];
        if (value !== null && value !== undefined) {
            // If it's an array (like files), append each one
            if (Array.isArray(value)) {
                value.forEach((item) => {
                    formData.append(`${key}`, item);
                });
            } else {
                formData.append(key, value);
            }
        }
    }

    return PUT_FORM_DATA(`/posts/${payload.id}`, { formData });
}

// DELETE A POST BY ID
export async function deletePost(payload) {
    return DELETE(`/posts/${payload.id}`);
};

// ADD A COMMENT TO A POST
export async function addCommentToPost(payload) {
    const formData = new FormData();

    for (const key in payload) {
        if (payload[key] !== null && payload[key] !== undefined) {
            formData.append(key, payload[key]);
        }
    }

    return POST_FORM_DATA(`/posts/add-comment/${payload.postId}/comments`, { formData });
};

// ADD A REPLY TO A COMMENT
export async function addReplyToComment(payload) {
    const formData = new FormData();

    for (const key in payload) {
        if (payload[key] !== null && payload[key] !== undefined) {
            formData.append(key, payload[key]);
        }
    }

    return POST_FORM_DATA(`/posts/add-reply/${payload.postId}/${payload.commentId}`, { formData });
};

// GET COMMENTS BY POST ID
export async function getCommentsByPostId(payload) {
    const params = methods.convertQueryString(payload);
    return GET(`/posts/get-comments/${payload.postId}?${params}`);
};

// GET REPLIES BY COMMENT ID
export async function getRepliesByCommentId(payload) {
    const params = methods.convertQueryString(payload);
    return GET(`/posts/get-replies/${payload.commentId}?${params}`);
};

// UPDATE A COMMENT BY POST ID AND COMMENT ID
export async function updateComment(payload) {
    const formData = new FormData();

    for (const key in payload) {
        if (payload[key] !== null && payload[key] !== undefined) {
            formData.append(key, payload[key]);
        }
    }

    return PUT_FORM_DATA(`/posts/update-comment/${payload.postId}/${payload.commentId}`, { formData });
};

// DELETE A COMMENT BY COMMENT ID
export async function deleteComment(payload) {
    return DELETE(`/posts/delete-comment/${payload.commentId}`);
};

// SHARE A POST BY POST ID
export async function sharePostById(payload) {
    return POST(`/posts/share/${payload.postId}`, payload);
};

// REACT TO A POST BY POST ID
export async function reactToPostById(payload) {
    return POST(`/posts/react/${payload.postId}`, payload);
};