import React, { useState } from "react";
import { getAuth, createUserWithEmailAndPassword, signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import { useNavigate } from "react-router-dom"; // Pour rediriger après une connexion réussie

const Signup = () => {
  const [email, setEmail] = useState(""); // État pour l'email
  const [password, setPassword] = useState(""); // État pour le mot de passe
  const [error, setError] = useState(""); // État pour afficher les erreurs
  const [success, setSuccess] = useState(false); // État pour afficher un message de succès
  const navigate = useNavigate(); // Hook pour la redirection

  const handleSignup = async (e) => {
    e.preventDefault();
    const auth = getAuth();

    try {
      await createUserWithEmailAndPassword(auth, email, password);
      setSuccess(true);
      setError("");
      setEmail("");
      setPassword("");
    } catch (error) {
      setSuccess(false);
      setError(error.message);
    }
  };

  // Fonction pour gérer la connexion avec Google
  const handleGoogleSignup = async () => {
    const auth = getAuth();
    const provider = new GoogleAuthProvider();

    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      console.log("Utilisateur connecté via Google : ", user);
      navigate("/chat"); // Rediriger vers la page de chat après une connexion réussie
    } catch (error) {
      setError(error.message);
    }
  };

  return (
    <div>
      <h2>Créer un compte</h2>
      {success && <p style={{ color: "green" }}>Compte créé avec succès !</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}
      
      <form onSubmit={handleSignup}>
        <div>
          <label>Email :</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Votre email"
            required
          />
        </div>
        <div>
          <label>Mot de passe :</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Votre mot de passe"
            required
          />
        </div>
        <button type="submit">S'inscrire</button>
      </form>

      <p>
        <a href="/auth">Se connecter</a>
      </p>

      <hr />
      
      <h3>Ou inscrivez-vous avec Google</h3>
      <button onClick={handleGoogleSignup}>S'inscrire avec Google</button>
    </div>
  );
};

export default Signup;
