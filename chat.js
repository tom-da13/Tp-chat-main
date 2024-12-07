import React, { useState, useEffect } from 'react';
import { db } from './firebase'; // Assurez-vous que votre configuration Firebase est correcte
import { collection, addDoc, getDocs, deleteDoc, doc, updateDoc, query, orderBy, getDoc } from 'firebase/firestore'; // Import des méthodes Firestore nécessaires
import { getAuth } from 'firebase/auth'; // Pour récupérer l'utilisateur connecté

const Chat = () => {
  const auth = getAuth();
  const user = auth.currentUser; // Utilisateur actuel

  // On ne rend rien si l'utilisateur n'est pas connecté
  if (!user) {
    alert("Vous devez être connecté pour accéder aux messages.");
    return null; // Renvoyer null si l'utilisateur n'est pas connecté
  }

  // Déclaration de tous les hooks en haut
  const [chats, setChats] = useState([]); // Liste des discussions
  const [newChatName, setNewChatName] = useState(''); // Nom de la nouvelle discussion
  const [newMessage, setNewMessage] = useState(''); // Nouveau message à envoyer
  const [selectedChatId, setSelectedChatId] = useState(null); // ID de la discussion sélectionnée
  const [messages, setMessages] = useState([]); // Messages de la discussion sélectionnée

  // Récupérer toutes les discussions publiques
  useEffect(() => {
    const fetchChats = async () => {
      const chatsRef = collection(db, 'publicChats');
      const q = query(chatsRef, orderBy('createdAt', 'desc')); // Trier par date de création
      const chatSnapshot = await getDocs(q);
      const chatList = chatSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data()
      }));
      setChats(chatList);
    };

    fetchChats();
  }, []); // La liste des discussions se recharge au premier rendu

  // Créer une nouvelle discussion publique
  const createChat = async () => {
    if (newChatName.trim() === '') return; // Si le nom de la discussion est vide, on ne crée rien

    const newChat = {
      name: newChatName,
      createdAt: new Date(),
      creatorId: user.uid,
      messages: [] // Initialisation d'une discussion vide
    };

    const chatsRef = collection(db, 'publicChats');
    await addDoc(chatsRef, newChat); // Ajouter la discussion à Firestore
    setNewChatName(''); // Réinitialiser l'état du nom de la discussion
  };

  // Supprimer une discussion publique
  const deleteChat = async (chatId) => {
    const chatRef = doc(db, 'publicChats', chatId);
    await deleteDoc(chatRef); // Supprimer la discussion de Firestore
  };

  // Récupérer les messages d'une discussion publique
  useEffect(() => {
    if (selectedChatId) {
      const fetchMessages = async () => {
        const chatRef = doc(db, 'publicChats', selectedChatId);
        const chatSnapshot = await getDoc(chatRef); // Assurez-vous de récupérer le document
        if (chatSnapshot.exists()) {
          setMessages(chatSnapshot.data().messages);
        }
      };
      fetchMessages();
    }
  }, [selectedChatId]); // Récupère les messages lorsque la discussion sélectionnée change

  // Envoyer un message dans la discussion
  const sendMessage = async () => {
    if (newMessage.trim() === '') return; // Ne pas envoyer de message vide

    const message = {
      senderId: user.uid,
      text: newMessage,
      timestamp: new Date().toISOString(),
    };

    const chatRef = doc(db, 'publicChats', selectedChatId);
    await updateDoc(chatRef, {
      messages: [...messages, message], // Ajouter le message à la discussion existante
    });

    setNewMessage(''); // Réinitialiser le champ de texte du message
    setMessages((prevMessages) => [...prevMessages, message]); // Ajouter le message localement
  };

  return (
    <div className="chat-container">
      <h2>Chat Public</h2>

      {/* Section pour créer une nouvelle discussion */}
      <div className="create-chat">
        <input
          type="text"
          value={newChatName}
          onChange={(e) => setNewChatName(e.target.value)}
          placeholder="Nom de la nouvelle discussion"
        />
        <button onClick={createChat}>Créer une discussion</button>
      </div>

      {/* Liste des discussions */}
      <div className="chat-list">
        {chats.map((chat) => (
          <div key={chat.id} className="chat-item">
            <button onClick={() => setSelectedChatId(chat.id)}>{chat.name}</button>
            {chat.creatorId === user.uid && (
              <button onClick={() => deleteChat(chat.id)}>Supprimer</button>
            )}
          </div>
        ))}
      </div>

      {/* Interface de discussion si une discussion est sélectionnée */}
      {selectedChatId && (
        <div className="chat-interface">
          <h3>Messages de la discussion</h3>
          <div className="messages">
            {messages.map((msg, index) => (
              <div key={index} className={`message ${msg.senderId === user.uid ? 'sent' : 'received'}`}>
                <p>{msg.text}</p>
                <span>{new Date(msg.timestamp).toLocaleTimeString()}</span>
              </div>
            ))}
          </div>

          {/* Zone de saisie de message */}
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

export default Chat;
