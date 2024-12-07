import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, sendPasswordResetEmail, signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { firebaseApp } from './firebase'; // Importer firebaseApp
import './Authpage.css';

const AuthPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false); 
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const auth = getAuth(firebaseApp);
  const provider = new GoogleAuthProvider();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSignUp) {
      try {
        await createUserWithEmailAndPassword(auth, email, password);
        navigate('/chat'); 
      } catch (error) {
        setError(error.message);
      }
    } else {
      try {
        await signInWithEmailAndPassword(auth, email, password);
        navigate('/chat'); 
      } catch (error) {
        setError(error.message);
      }
    }
  };

  const handleGoogleLogin = async () => {
    try {
      await signInWithPopup(auth, provider);
      navigate('/chat');
    } catch (error) {
      setError(error.message);
    }
  };

  const handleForgotPassword = async () => {
    try {
      await sendPasswordResetEmail(auth, email);
      alert("Un email de réinitialisation a été envoyé.");
    } catch (error) {
      setError(error.message);
    }
  };

  return (
    <div className="auth-container">
      <h2>{isSignUp ? 'Inscription' : 'Connexion'}</h2>
      <form onSubmit={handleSubmit}>
        <input 
          type="email" 
          value={email} 
          onChange={(e) => setEmail(e.target.value)} 
          placeholder="Email" 
          required 
        />
        <input 
          type="password" 
          value={password} 
          onChange={(e) => setPassword(e.target.value)} 
          placeholder="Mot de passe" 
          required 
        />
        <button type="submit">{isSignUp ? 'S inscrire' : 'Se connecter'}</button>
      </form>
      <div className="auth-footer">
        <button onClick={() => setIsSignUp(!isSignUp)}>
          {isSignUp ? 'Déjà un compte ? Connectez-vous' : 'Pas de compte ? Inscrivez-vous'}
        </button>
        <button onClick={handleForgotPassword}>Mot de passe oublié ?</button>
        <button onClick={handleGoogleLogin}>Se connecter avec Google</button>
        {error && <p className="error-message">{error}</p>}
      </div>
    </div>
  );
};

export default AuthPage;
