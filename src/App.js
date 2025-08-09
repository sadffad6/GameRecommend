import './App.css';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Home from './pages/Home';
import Login from './pages/Login';
import Game from './pages/Game'
import TagChoose from './pages/TagChoose';
import GameRecommend from './pages/GameRecommend';


function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/game/:gameId" element={<Game />} />
        <Route path="/tagchoose" element={<TagChoose />} />
        <Route path="/gamerecommend" element={<GameRecommend />} />
      </Routes>
    </Router>
  );
}

export default App;
