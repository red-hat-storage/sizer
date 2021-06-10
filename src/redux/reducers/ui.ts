import { createAction, createReducer } from "@reduxjs/toolkit";

const defaultState = {
  openModal: "",
  activeTab: 0,
  isTourActive: true,
};

// Actions
const openModalAction = createAction<string>("OPEN_MODAL");
const closeModal = createAction("CLOSE_MODAL");
const setTab = createAction<number>("SET_TAB");
const setTourActive = createAction<boolean>("SET_TOUR_ACTIVE");

const uiReducer = createReducer(defaultState, (builder) => {
  builder
    .addCase(openModalAction, (state, action) => {
      state.openModal = action.payload;
    })
    .addCase(closeModal, (state) => {
      state.openModal = "";
    })
    .addCase(setTab, (state, action) => {
      state.activeTab = action.payload;
    })
    .addCase(setTourActive, (state, action) => {
      state.isTourActive = action.payload;
    });
});

export { openModalAction, closeModal, setTab, setTourActive, uiReducer };
