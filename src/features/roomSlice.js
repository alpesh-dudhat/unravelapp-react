import { createSlice } from "@reduxjs/toolkit";
import sampleData from "../assets/sample.json";
import { normalizeRooms } from "../utils/roomsUtils";

const initialState = {
    hotel: {},
    rooms: [], // Currently displayed rooms
    allRooms: [], // All normalized rooms (for client-side pagination)
    status: 'idle',
    error: null,
    pagination: {
        currentPage: 0,
        pageSize: 10, // Rooms per page
        hasMore: true,
        isLoadingMore: false
    }
};

const roomsSlice = createSlice({
    name: 'rooms',
    initialState,
    reducers: {
        loadRooms: (state) => {
            try {
                const normalized = normalizeRooms(sampleData);
                state.allRooms = normalized; // Store all rooms
                
                // Load first page
                state.rooms = normalized.slice(0, state.pagination.pageSize);
                state.pagination.currentPage = 1;
                state.pagination.hasMore = normalized.length > state.pagination.pageSize;
                state.status = 'succeeded';
            } catch (error) {
                state.status = 'failed';
                state.error = error.message;
            }
        },
        loadMoreRooms: (state) => {
            if (!state.pagination.hasMore || state.pagination.isLoadingMore) return;
            
            state.pagination.isLoadingMore = true;
            
            const nextPage = state.pagination.currentPage + 1;
            const startIndex = state.pagination.currentPage * state.pagination.pageSize;
            const endIndex = startIndex + state.pagination.pageSize;
            
            if (startIndex < state.allRooms.length) {
                const nextRooms = state.allRooms.slice(startIndex, endIndex);
                state.rooms = [...state.rooms, ...nextRooms];
                state.pagination.currentPage = nextPage;
                state.pagination.hasMore = endIndex < state.allRooms.length;
            } else {
                state.pagination.hasMore = false;
            }
            
            state.pagination.isLoadingMore = false;
        },
        setRoomsPagination: (state, action) => {
            state.pagination = { ...state.pagination, ...action.payload };
        },
        resetRooms: (state) => {
            state.rooms = [];
            state.pagination.currentPage = 0;
            state.pagination.hasMore = true;
            state.pagination.isLoadingMore = false;
        }
    }
});

export const { loadRooms, loadMoreRooms, setRoomsPagination, resetRooms } = roomsSlice.actions;
export default roomsSlice.reducer;