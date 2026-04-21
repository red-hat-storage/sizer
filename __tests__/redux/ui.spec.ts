import {
  uiReducer,
  openModalAction,
  closeModal,
  setTab,
  setTourActive,
} from "../../src/redux/reducers/ui";

const defaultState = {
  openModal: "",
  activeTab: 0,
  isTourActive: true,
};

describe("UI Reducer", () => {
  it("should return the default state", () => {
    const state = uiReducer(undefined, { type: "INIT" });
    expect(state).toEqual(defaultState);
  });

  it("should handle openModalAction", () => {
    const state = uiReducer(defaultState, openModalAction("addWorkload"));
    expect(state.openModal).toBe("addWorkload");
  });

  it("should handle closeModal", () => {
    const openState = { ...defaultState, openModal: "addWorkload" };
    const state = uiReducer(openState, closeModal());
    expect(state.openModal).toBe("");
  });

  it("should handle setTab", () => {
    const state = uiReducer(defaultState, setTab(2));
    expect(state.activeTab).toBe(2);
  });

  it("should handle setTourActive to false", () => {
    const state = uiReducer(defaultState, setTourActive(false));
    expect(state.isTourActive).toBe(false);
  });

  it("should handle setTourActive to true", () => {
    const inactiveState = { ...defaultState, isTourActive: false };
    const state = uiReducer(inactiveState, setTourActive(true));
    expect(state.isTourActive).toBe(true);
  });

  it("should not modify other fields when opening a modal", () => {
    const state = uiReducer(defaultState, openModalAction("settings"));
    expect(state.activeTab).toBe(defaultState.activeTab);
    expect(state.isTourActive).toBe(defaultState.isTourActive);
  });
});
