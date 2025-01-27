import { saveSubscription, deleteSubscription } from '../../../services/api/subscription';

// Types
import * as types from '../types';

// Add Subscription
export const addSubscriptionAction = (payload) => async (dispatch) => {
  dispatch({ type: types.ADD_SUBSCRIPTION_REQUEST });

  return saveSubscription(payload).then((res) => {
    if (res.success) {
      dispatch({
        type: types.ADD_SUBSCRIPTION_SUCCESS,
        payload: res.data,
      });
    } else {
      dispatch({
        type: types.ADD_SUBSCRIPTION_FAIL,
        payload: res.msg,
      });
    }

    return res;
  });
};

// Delete Subscription
export const deleteSubscriptionAction = (subscriptionId) => async (dispatch) => {
  dispatch({ type: types.DELETE_SUBSCRIPTION_REQUEST });

  return deleteSubscription(subscriptionId).then((res) => {
    if (res.success) {
      dispatch({
        type: types.DELETE_SUBSCRIPTION_SUCCESS,
        payload: subscriptionId,
      });
    } else {
      dispatch({
        type: types.DELETE_SUBSCRIPTION_FAIL,
        payload: res.msg,
      });
    }

    return res;
  });
};
