import React, { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { fetchRooms } from '../features/roomSlice'
import RoomCard from './RoomCard';

const RoomList = () => {
    const dispatch = useDispatch();
    const { rooms, hotel, status, error } = useSelector((s) => s.rooms)
    //    console.log('rooms',rooms)
    // const data = useSelector((state) => state)
    // console.log('the whole state',data)



    useEffect(() => {
        if (status === 'idle') {
            dispatch(fetchRooms())
        }
    }, [status, dispatch])

    if (status === 'loading') return <p>Loading Rooms'</p>;
    if (status === 'failed') return <p>Error : {error}</p>;

    return (
        <div className="room-list">
            <h2>Room List</h2>
            {
                rooms.length === 0 ? (
                <p>No Room Found</p>       
                ) : (
                    rooms.map((room,i) => <RoomCard key={i} room={room}/>)
                )
            }
        </div>
    )
}

export default RoomList