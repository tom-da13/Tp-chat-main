import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import ChatList from "./chatlist";
import Chat from "./chat";
import Authpage from "./Authpage";
import Navbar from "./navbar"; // Importation de Navbar
import PrivateChat from "./PrivateChat";
import Groupes from './Groupes';

const App = () => {
  return (
    <Router> {/* Enveloppe l'ensemble de l'application dans le Router */}
      <div className="app-container">
        <Navbar /> {/* Navbar est maintenant dans le Router */}
        
        <Routes>
          <Route path="/" element={<h1>Accueil</h1>} />
          <Route path="/auth" element={<Authpage />} />
          <Route path="/chat" element={<Chat />} />
          <Route path="/chatlist" element={<ChatList/>} />
          <Route path="/private-chat" element={<PrivateChat />} />
          <Route path="/groupes" element={<Groupes />} /> 
        </Routes>
      </div>
    </Router>
  );
};

export default App;
