import React from 'react';
import { Link, useNavigate } from 'react-router-dom'; // useNavigate est utilisé ici
import { getAuth, signOut } from 'firebase/auth';
import './navbar.css';

const Navbar = () => {
  const auth = getAuth();
  const user = auth.currentUser; // Utilisateur connecté
  const navigate = useNavigate(); // Hook de navigation

  // Fonction pour se déconnecter
  const handleSignOut = () => {
    signOut(auth)
      .then(() => {
        console.log("Déconnecté avec succès !");
        navigate("/auth"); // Rediriger vers la page de connexion après déconnexion
      })
      .catch((error) => {
        console.error("Erreur lors de la déconnexion : ", error);
      });
  };

  return (
    <nav>
      <ul>
        <li><Link to="/chat">Chat Public</Link></li>
        <li><Link to="/private-chat">Messages Privés</Link></li>
        <li><Link to="/groupes">Groupes</Link></li> {/* Nouvel onglet Groupes */}
        {user ? (
          <>
            <li><button onClick={handleSignOut}>Se déconnecter</button></li>
            <li>Bienvenue {user.displayName}</li>
          </>
        ) : (
          <li><Link to="/auth">Se connecter</Link></li>
        )}
      </ul>
    </nav>
  );
};

export default Navbar;
