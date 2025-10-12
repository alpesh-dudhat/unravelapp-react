import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";


// Async thunk to fetch data from local sample
export const fetchRooms = createAsyncThunk('rooms/fetchRooms', // action type
    async () => {
        const response = await fetch('/data/sample.json');
        if (!response.ok) throw new Error("Failed to load data")
        const data = await response.json();
        // console.log('From Slice data', data)
        return data;
    }
)

const initialState = {
    hotel: {}, // Hotel data
    rooms: [], // Room groups
    status: 'idle', // idle | loading | Succeeed | faild
    error: null // error null
}


// Room Slice to handle rooms state

const roomsSlice = createSlice({
    name: 'rooms',
    initialState,
    reducer: {}, // no sync reducer needed right now
    extraReducers: builder => {
        builder.addCase(fetchRooms.pending, state => {
            state.status = 'loading';
        }).addCase(fetchRooms.fulfilled, (state, action) => {
            state.status = 'succeeded';
            state.hotel = action.payload.hotel || action.payload.hotel_details || null;
            state.rooms = action.payload.rooms_by_serial_no?.flatMap((block) => block.rooms) || []; // Flatten nested array & store Data
        }).addCase(fetchRooms.rejected, (state, action) => {
            state.status = 'failed';
            state.error = action.error.message // store error
        })
    }
});

export default roomsSlice.reducer;



