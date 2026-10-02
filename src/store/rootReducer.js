import { combineReducers } from "@reduxjs/toolkit";
import authReducer from "./slices/authSlice";
import subscriptionReducer from "./slices/subscriptionSlice";

const rootReducer = combineReducers({
  auth: authReducer,
  subscription: subscriptionReducer,
});

export default rootReducer;