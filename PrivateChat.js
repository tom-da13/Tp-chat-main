import React, { useState, useEffect } from 'react';
import { db } from './firebase'; // Configuration Firebase
import { collection, doc, getDocs, query, where, addDoc, updateDoc, onSnapshot } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import './PrivateChat.css'; // Style CSS pour la page

const PrivateChat = () => {
  const auth = getAuth();
  const user = auth.currentUser;
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [chatId, setChatId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');

  // Charger les utilisateurs
  useEffect(() => {
    const fetchUsers = async () => {
      if (!user) return; // Ne rien faire si l'utilisateur n'est pas connecté
  
      try {
        const usersRef = collection(db, 'users');
        const usersSnapshot = await getDocs(usersRef);
  
        const filteredUsers = usersSnapshot.docs
          .filter(doc => doc.id !== user.uid) // Exclure l'utilisateur connecté
          .map(doc => ({
            id: doc.id, // ID unique du document
            displayName: doc.data().displayName || 'Utilisateur inconnu', // Nom de l'utilisateur ou défaut
            ...doc.data(), // Inclure toutes les données supplémentaires
          }));
  
        setUsers(filteredUsers);
      } catch (error) {
        console.error('Erreur lors du chargement des utilisateurs :', error);
      }
    };
  
    fetchUsers();
  }, [user]);
  
  // Charger les messages en temps réel
  useEffect(() => {
    if (!chatId) return;
    const chatRef = doc(db, 'privateChats', chatId);
    const unsubscribe = onSnapshot(chatRef, (snapshot) => {
      if (snapshot.exists()) {
        setMessages(snapshot.data().messages || []);
      }
    });
    return () => unsubscribe();
  }, [chatId]);

  // Ouvrir ou créer un chat
const startChat = async (userId) => {
  try {
    const chatsRef = collection(db, 'privateChats');
    const q = query(chatsRef, where('members', 'array-contains', user.uid));
    const querySnapshot = await getDocs(q);

    const existingChat = querySnapshot.docs.find(
      doc => doc.data().members.includes(userId)
    );

    if (existingChat) {
      setChatId(existingChat.id);
    } else {
      const newChat = await addDoc(chatsRef, {
        members: [user.uid, userId],
        messages: [],
      });
      setChatId(newChat.id);
    }

    setSelectedUser(userId);
  } catch (error) {
    console.error('Erreur lors de l’ouverture du chat :', error);
  }
};

  // Envoyer un message
  const sendMessage = async () => {
    if (!newMessage.trim()) return;
    const message = {
      senderId: user.uid,
      text: newMessage,
      timestamp: new Date().toISOString(),
    };
    try {
    const chatRef = doc(db, 'privateChats', chatId);
    await updateDoc(chatRef, {
      messages: [...messages, message],
    });
    setNewMessage(''); // Réinitialiser le champ de saisie
  } catch (error) {
    console.error('Erreur lors de l’envoi du message :', error);
  }
};

  return (
    <div className="chat-container">
      <div className="user-list">
        <h2>Utilisateurs</h2>
        {users.map(u => (
          <button key={u.id} onClick={() => startChat(u.id)}>
            {u.displayName || 'Utilisateur'}
          </button>
        ))}
      </div>

      <div className="chat-area">
        {selectedUser ? (
          <>
            <h3>Chat avec {users.find(u => u.id === selectedUser)?.displayName || ' Utilisateur'}
            </h3>
            <div className="messages">
              {messages.map((msg, idx) => (
                <div key={idx} className={`message ${msg.senderId === user.uid ? 'sent' : 'received'}`}>
                  <p>{msg.text}</p>
                  <span>{new Date(msg.timestamp).toLocaleTimeString()}</span>
                </div>
              ))}
            </div>
            <div className="message-input">
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Écrire un message..."
              />
              <button onClick={sendMessage}>Envoyer</button>
            </div>
          </>
        ) : (
          <p>Sélectionnez un utilisateur pour commencer à discuter.</p>
        )}
      </div>
    </div>
  );
}
export default PrivateChat;