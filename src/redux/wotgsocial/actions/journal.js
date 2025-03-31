import {
    getJournals,
    getJournalById,
    createJournal,
    updateJournal,
    deleteJournal
  } from "../../../services/api/journal";
  
  import * as types from "../types";
  
  // 📘 Get all journals (paginated)
  export const getAllJournalsAction = (payload) => async (dispatch) => {
    try {
      const res = await getJournals(payload);
      const { success, data } = res;
  
      if (success) {
        dispatch({
          type: types.GET_JOURNALS_SUCCESS,
          payload: data.journals,
        });
      }
  
      return res;
    } catch (err) {
      return dispatch({
        type: types.GET_JOURNALS_FAIL,
        payload: err.response?.data?.msg || "Failed to fetch journals",
      });
    }
  };
  
  // 📘 Get a single journal by ID
  export const getJournalByIdAction = (id) => async (dispatch) => {
    try {
      const res = await getJournalById({ id });
      const { success, data } = res;
  
      if (success) {
        dispatch({
          type: types.GET_JOURNAL_BY_ID_SUCCESS,
          payload: data,
        });
      }
  
      return res;
    } catch (err) {
      return dispatch({
        type: types.GET_JOURNAL_BY_ID_FAIL,
        payload: err.response?.data?.msg || "Failed to fetch journal",
      });
    }
  };
  
  // 📝 Create journal
  export const createJournalAction = (payload) => async (dispatch) => {
    try {
      const res = await createJournal(payload);
      const { success, data } = res;
  
      if (success) {
        dispatch({
          type: types.CREATE_JOURNAL_SUCCESS,
          payload: data,
        });
      }
  
      return res;
    } catch (err) {
      return dispatch({
        type: types.CREATE_JOURNAL_FAIL,
        payload: err.response?.data?.msg || "Failed to create journal",
      });
    }
  };
  
  // 🔁 Update journal
  export const updateJournalAction = (payload) => async (dispatch) => {
    try {
      const res = await updateJournal(payload);
      const { success, data } = res;
  
      if (success) {
        dispatch({
          type: types.UPDATE_JOURNAL_SUCCESS,
          payload: data,
        });
      }
  
      return res;
    } catch (err) {
      return dispatch({
        type: types.UPDATE_JOURNAL_FAIL,
        payload: err.response?.data?.msg || "Failed to update journal",
      });
    }
  };
  
  // ❌ Delete journal
  export const deleteJournalAction = (payload) => async (dispatch) => {
    try {
      const res = await deleteJournal(payload);
      const { success, data } = res;
  
      if (success) {
        dispatch({
          type: types.DELETE_JOURNAL_SUCCESS,
          payload: data.id,
        });
      }
  
      return res;
    } catch (err) {
      return dispatch({
        type: types.DELETE_JOURNAL_FAIL,
        payload: err.response?.data?.msg || "Failed to delete journal",
      });
    }
  };
  