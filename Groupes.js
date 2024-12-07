import React, { useState, useEffect } from 'react';
import { db } from './firebase'; // Assurez-vous que votre fichier de configuration Firebase est importé
import {
  collection,
  addDoc,
  doc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  arrayUnion,
  Timestamp,
} from 'firebase/firestore';

const Groupes = () => {
  const [groupes, setGroupes] = useState([]); // Liste des groupes
  const [nomGroupe, setNomGroupe] = useState(''); // Nom du groupe à créer
  const [nouveauMessage, setNouveauMessage] = useState(''); // Nouveau message
  const [membres, setMembres] = useState(''); // Liste des membres (UIDs)
  const [messages, setMessages] = useState([]); // Messages pour un groupe sélectionné
  const [groupeActif, setGroupeActif] = useState(null); // Groupe actuellement sélectionné

  // Charger les groupes en temps réel
  useEffect(() => {
    const groupesRef = collection(db, 'groupChats');

    const unsubscribe = onSnapshot(groupesRef, (snapshot) => {
      const groupesData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setGroupes(groupesData);
    });

    return () => unsubscribe(); // Arrêter l'écoute en cas de déconnexion
  }, []);

  // Créer un groupe
  const creerGroupe = async () => {
    if (!nomGroupe) return alert('Veuillez entrer un nom pour le groupe.');

    const membresArray = membres.split(',').map((membre) => membre.trim()); // Convertir les UID en tableau

    try {
      const groupesRef = collection(db, 'groupChats');
      await addDoc(groupesRef, {
        name: nomGroupe,
        members: membresArray,
        messages: [],
        createdAt: Timestamp.now(),
      });

      setNomGroupe('');
      setMembres('');
      alert('Groupe créé avec succès !');
    } catch (error) {
      console.error('Erreur lors de la création du groupe :', error);
    }
  };

  // Envoyer un message
  const envoyerMessage = async () => {
    if (!groupeActif || !nouveauMessage) return;

    try {
      const groupeRef = doc(db, 'groupChats', groupeActif.id);

      const newMessage = {
        senderId: 'currentUserUID', // Remplacez par l’UID de l’utilisateur connecté
        text: nouveauMessage,
        timestamp: Timestamp.now(),
      };

      await updateDoc(groupeRef, {
        messages: arrayUnion(newMessage),
      });

      setNouveauMessage('');
    } catch (error) {
      console.error('Erreur lors de l’envoi du message :', error);
    }
  };

  // Supprimer un groupe
  const supprimerGroupe = async (id) => {
    try {
      const groupeRef = doc(db, 'groupChats', id);
      await deleteDoc(groupeRef);
      alert('Groupe supprimé avec succès !');
    } catch (error) {
      console.error('Erreur lors de la suppression du groupe :', error);
    }
  };

  // Charger les messages d’un groupe
  const afficherMessages = (groupe) => {
    setGroupeActif(groupe);
    setMessages(groupe.messages || []);
  };

  return (
    <div>
      <h1>Gestion des Groupes</h1>

      {/* Formulaire pour créer un groupe */}
      <div>
        <h2>Créer un Groupe</h2>
        <input
          type="text"
          placeholder="Nom du groupe"
          value={nomGroupe}
          onChange={(e) => setNomGroupe(e.target.value)}
        />
        <input
          type="text"
          placeholder="UIDs des membres (séparés par des virgules)"
          value={membres}
          onChange={(e) => setMembres(e.target.value)}
        />
        <button onClick={creerGroupe}>Créer</button>
      </div>

      {/* Liste des groupes */}
      <div>
        <h2>Liste des Groupes</h2>
        {groupes.map((groupe) => (
          <div key={groupe.id}>
            <h3>{groupe.name}</h3>
            <button onClick={() => afficherMessages(groupe)}>Afficher</button>
            <button onClick={() => supprimerGroupe(groupe.id)}>Supprimer</button>
          </div>
        ))}
      </div>

      {/* Messages d’un groupe */}
      {groupeActif && (
        <div>
          <h2>Messages - {groupeActif.name}</h2>
          <div>
            {messages.map((msg, index) => (
              <div key={index}>
                <strong>{msg.senderId}:</strong> {msg.text}
              </div>
            ))}
          </div>
          <input
            type="text"
            placeholder="Votre message"
            value={nouveauMessage}
            onChange={(e) => setNouveauMessage(e.target.value)}
          />
          <button onClick={envoyerMessage}>Envoyer</button>
        </div>
      )}
    </div>
  );
};

export default Groupes;
