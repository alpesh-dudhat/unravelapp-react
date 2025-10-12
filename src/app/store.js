import { configureStore } from "@reduxjs/toolkit";
import roomsReducer from '../features/roomSlice'

export const store = configureStore({
    reducer: {
        rooms: roomsReducer, // adding room slice under 'rooms'
    },
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({
            serializableCheck: {
                ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE'],
                ignoredPaths: ['rooms.rooms', 'rooms.hotel'], // adjust based on your state structure
            },
        }),
})