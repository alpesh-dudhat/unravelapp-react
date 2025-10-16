import { configureStore } from "@reduxjs/toolkit";
import roomsReducer from '../features/roomSlice'

export const store = configureStore({
    reducer: {
        rooms: roomsReducer, // adding room slice under 'rooms'
    },
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({
            immutableCheck: false,
            serializableCheck: false,
        }),
})