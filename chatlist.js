import React, { useState, useEffect } from 'react';
import { db } from './firebase'; // Firebase configuration
import { collection, query, where, getDocs, addDoc, doc, getDoc, updateDoc } from 'firebase/firestore'; // Ajoutez getDoc ici
import { getAuth } from 'firebase/auth';
import './chatlist.css';

const PrivateChat = () => {
  const auth = getAuth();
  const user = auth.currentUser; // Utilisateur actuel
  if (!user) {
    alert("Vous devez être connecté pour accéder aux messages privés."); }
  const [users, setUsers] = useState([]); // Liste des utilisateurs
  const [selectedUser, setSelectedUser] = useState(null); // Utilisateur sélectionné
  const [messages, setMessages] = useState([]); // Messages de la discussion
  const [newMessage, setNewMessage] = useState(''); // Nouveau message à envoyer
  const [chatId, setChatId] = useState(null); // ID de la discussion
  
  // Récupérer la liste des utilisateurs (sauf l'utilisateur actuel)
  useEffect(() => {
    const getUsers = async () => {
      const usersRef = collection(db, 'users');
      const usersSnapshot = await getDocs(usersRef);
      const usersList = usersSnapshot.docs
        .filter(doc => doc.id !== user.uid) // Exclure l'utilisateur actuel
        .map(doc => ({ id: doc.id, ...doc.data() }));
      setUsers(usersList);
    };

    getUsers();
  }, [user]);

  // Récupérer les messages d'une discussion privée
  useEffect(() => {
    if (chatId) {
      const getMessages = async () => {
        const chatRef = doc(db, 'privateChats', chatId);
        const chatSnapshot = await getDoc(chatRef); // Utilisation de getDoc ici
        if (chatSnapshot.exists()) {
          setMessages(chatSnapshot.data().messages);
        }
      };

      getMessages();
    }
  }, [chatId]);

  // Créer une nouvelle discussion privée ou obtenir l'existante
  const startChat = async (selectedUserId) => {
    const chatRef = collection(db, 'privateChats');
    const q = query(chatRef, where('members', 'array-contains', user.uid), where('members', 'array-contains', selectedUserId));
    const querySnapshot = await getDocs(q);
    let chatDoc = null;

    if (!querySnapshot.empty) {
      chatDoc = querySnapshot.docs[0];
      setChatId(chatDoc.id);
    } else {
      // Créer une nouvelle discussion privée si elle n'existe pas
      const newChat = await addDoc(chatRef, {
        members: [user.uid, selectedUserId],
        messages: [],
      });
      setChatId(newChat.id);
    }

    setSelectedUser(selectedUserId);
  };

  // Envoyer un message
  const sendMessage = async () => {
    if (newMessage.trim() === '') return;

    const message = {
      senderId: user.uid,
      text: newMessage,
      timestamp: new Date().toISOString(),
    };

    const chatRef = doc(db, 'privateChats', chatId);
    await updateDoc(chatRef, {
      messages: [...messages, message],
    });

    setNewMessage('');
    setMessages((prevMessages) => [...prevMessages, message]); // Ajouter localement le message
  };

  return (
    <div className="private-chat-container">
      <h2>Messages Privés</h2>

      {/* Liste des utilisateurs à qui envoyer des messages */}
      <div className="user-list">
        {users.map((user) => (
          <div key={user.id} className="user-item">
            <button onClick={() => startChat(user.id)}>{user.displayName}</button>
          </div>
        ))}
      </div>

      {/* Interface de discussion */}
      {selectedUser && chatId && (
        <div className="chat-interface">
          <div className="messages">
            {messages.map((msg, index) => (
              <div
                key={index}
                className={`message ${msg.senderId === user.uid ? 'sent' : 'received'}`}
              >
                <p>{msg.text}</p>
                <span>{new Date(msg.timestamp).toLocaleTimeString()}</span>
              </div>
            ))}
          </div>

          {/* Zone de saisie du message */}
          <div className="message-input">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Écrire un message..."
            />
            <button onClick={sendMessage}>Envoyer</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default PrivateChat;
