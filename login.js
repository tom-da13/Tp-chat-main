import React, { useState } from "react";
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword } from "firebase/auth";
import { useNavigate } from "react-router-dom"; // Pour la redirection
import "./login.css"; // Ajoutez votre propre style CSS

const Login = () => {
  const [email, setEmail] = useState("");  // Email de l'utilisateur
  const [password, setPassword] = useState("");  // Mot de passe de l'utilisateur
  const [error, setError] = useState("");  // Message d'erreur
  const navigate = useNavigate();  // Utilisé pour rediriger l'utilisateur après la connexion

  // Fonction pour gérer la connexion de l'utilisateur
  const handleLogin = async () => {
    const auth = getAuth();
    
    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigate("/chat"); // Redirige vers la page de chat une fois connecté
    } catch (error) {
      setError("Identifiants incorrects ou utilisateur non trouvé.");
    }
  };

  // Fonction pour gérer l'inscription de l'utilisateur (si vous le souhaitez)
  const handleSignup = async () => {
    const auth = getAuth();

    try {
      await createUserWithEmailAndPassword(auth, email, password);
      navigate("/chat"); // Redirige vers la page de chat après l'inscription
    } catch (error) {
      setError("Erreur lors de l'inscription.");
    }
  };

  return (
    <div className="login-container">
      <h2>Connexion</h2>

      {error && <p className="error">{error}</p>}

      <div className="login-form">
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          type="password"
          placeholder="Mot de passe"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button onClick={handleLogin}>Se connecter</button>
        <button onClick={handleSignup}>S'inscrire</button>
      </div>
    </div>
  );
};

export default Login;
