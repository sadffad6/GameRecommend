import './App.css';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Home from './pages/Home';
import Login from './pages/Login';
import Game from './pages/Game'
import Register from './pages/Register';
import TagChoose from './pages/TagChoose';


function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/game/:gameId" element={<Game />} />
        <Route path="/register" element={<Register />} />
        <Route path="/tagchoose" element={<TagChoose />} />
      </Routes>
    </Router>
  );
}

export default App;
