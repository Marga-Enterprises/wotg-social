import * as types from '../types';
import axios from 'axios';

export const getAllBiblesAction = () => async (dispatch) => {
  try {
    const response = await axios.get('https://api.scripture.api.bible/v1/bibles', {
      headers: {
        'api-key': '3febb9df37ed813743d11611cdfa0786'
      }
    });

    dispatch({
      type: types.GET_BIBLES_SUCCESS,
      payload: response.data // The list of Bibles
    });

    return response;
  } catch (error) {
    dispatch({
      type: types.GET_BIBLES_FAIL,
      payload: error.response ? error.response.data : error.message
    });
  }
};
