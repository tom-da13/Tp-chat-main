import React, { useState, useEffect } from 'react';
import { db } from './firebase';
import { collection, addDoc, onSnapshot, query, orderBy, Timestamp } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import './chatPublic.css';

const ChatPublic = () => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const auth = getAuth();
  const user = auth.currentUser;
  const createGroup = async (name, description, userIds) => {
    try {
      const groupChatsRef = collection(db, 'groupChats');
  
      await addDoc(groupChatsRef, {
        name,
        description,
        members: userIds, // Liste des UID des membres
        messages: [], // Initialement vide
        createdAt: Timestamp.now(),
      });
  
      console.log('Groupe créé avec succès !');
    } catch (error) {
      console.error('Erreur lors de la création du groupe :', error);
    }
  };

  useEffect(() => {
    const messagesRef = collection(db, 'publicChats');
    const q = query(messagesRef, orderBy('timestamp'));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const messagesData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setMessages(messagesData);
    });

    return () => unsubscribe();
  }, []);

  const handleSendMessage = async () => {
    if (newMessage.trim() === '') return;

    const message = {
      text: newMessage,
      sender: user.displayName,
      senderId: user.uid,
      timestamp: new Date(),
    };

    await addDoc(collection(db, 'publicChats'), message);
    setNewMessage('');
  };

  return (
    <div className="chat-container">
      <h2>Chat Public</h2>
      <div className="messages">
        {messages.map((message) => (
          <div key={message.id} className="message">
            <strong>{message.sender}:</strong> {message.text}
          </div>
        ))}
      </div>
      <div className="message-input">
        <input 
          type="text" 
          value={newMessage} 
          onChange={(e) => setNewMessage(e.target.value)} 
          placeholder="Votre message..." 
        />
        <button onClick={handleSendMessage}>Envoyer</button>
      </div>
    </div>
  );
};

export default ChatPublic;
