import { createAction, createReducer } from "@reduxjs/toolkit";
import { Service } from "../../types";

let SERVICE_COUNTER = 0;

export const generateServiceID = (): number => SERVICE_COUNTER++;

const defaultState = {
  services: [] as Service[],
};

const addService = createAction<Service>("ADD_SERVICE");
const addServices = createAction<Service[]>("ADD_SERVICES");

const editServices = createAction<Service[]>("UPDATE_SERVICE");
const removeServices = createAction<Service[]>("REMOVE_SERVICE");

const serviceReducer = createReducer(defaultState, (builder) => {
  builder
    .addCase(addService, (state, { payload }) => {
      state.services.push(payload);
    })
    .addCase(addServices, (state, { payload }) => {
      payload.forEach((item) => state.services.push(item));
    })
    .addCase(editServices, (state, { payload }) => {
      payload.forEach((item) =>
        state.services.map((service) =>
          service.id === item.id ? item : service
        )
      );
    })
    .addCase(removeServices, (state, { payload }) => {
      const removeIds = payload.map((service) => service.id);
      state.services = state.services.filter(
        (service) => !removeIds.includes(service.id)
      );
    });
});

export {
  addService,
  addServices,
  editServices,
  removeServices,
  serviceReducer,
};
