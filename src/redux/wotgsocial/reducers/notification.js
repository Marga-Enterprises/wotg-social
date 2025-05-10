import * as types from '../types';

const initialState = {
    notifications: null,
    loading: false,
    error: null,
    success: false,
};

// TYPES ARE
// NOTIFICATION_LIST_REQUEST: 'NOTIFICATION_LIST_REQUEST',
// NOTIFICATION_LIST_SUCCESS: 'NOTIFICATION_LIST_SUCCESS',
// NOTIFICATION_LIST_FAIL: 'NOTIFICATION_LIST_FAIL',


const notificationReducer = (state = initialState, action) => {
    switch (action.type) {
        case types.NOTIFICATION_LIST_REQUEST:
            return {
                ...state,
                loading: true,
                notifications: null,
                error: null,
            };
        case types.NOTIFICATION_LIST_SUCCESS:
            return {
                ...state,
                loading: false,
                notifications: action.payload,
                success: true,
            };
        case types.NOTIFICATION_LIST_FAIL:
            return {
                ...state,
                loading: false,
                error: action.payload,
            };
        default:
            return state;
    }
};

export default notificationReducer;