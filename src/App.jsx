import RoomList from "./components/RoomList"
import bg from './assets/4.png';
function App() {

  return (
    <main>
      <img
        src={bg} className="bgImg"
        alt="shape"
      />
      <div className="header">
        <div className="sub">Rooms</div>
        <h2>Our best rooms</h2>
      </div>
      <RoomList />
    </main>
  )
}

export default App
