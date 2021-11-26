import { createAction, createReducer } from "@reduxjs/toolkit";
import { Service } from "../../models";

let SERVICE_COUNTER = 0;

export const generateServiceID = (): number => SERVICE_COUNTER++;

const defaultState = {
  services: [] as Service[],
};

const addService = createAction<Service>("ADD_SERVICE");
const addServices = createAction<Service[]>("ADD_SERVICES");

const updateService = createAction<Service>("UPDATE_SERVICE");
const removeServices = createAction<Service[]>("REMOVE_SERVICE");

const serviceReducer = createReducer(defaultState, (builder) => {
  builder
    .addCase(addService, (state, { payload }) => {
      state.services.push(payload);
    })
    .addCase(addServices, (state, { payload }) => {
      payload.forEach((item) => state.services.push(item));
    })
    .addCase(updateService, (state, { payload }) => {
      state.services.map((service) =>
        service.id === payload.id ? payload : service
      );
    })
    .addCase(removeServices, (state, { payload }) => {
      const removeIds = payload.map((service) => service.id);
      state.services = state.services.filter(
        (service) => !removeIds.includes(service.id)
      );
    });
});

export { addService, addServices, removeServices, serviceReducer };