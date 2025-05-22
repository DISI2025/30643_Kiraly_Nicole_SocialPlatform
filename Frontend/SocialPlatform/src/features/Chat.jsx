import React from 'react';
import { Button } from 'reactstrap';
import * as API_CHAT from '../assets/api-chat';
import { getUserData } from "../assets/api-profile.jsx";
import '../styles/Chat.css';
import Navbar from "./NavBar.jsx";

class Chat extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            tableData: [],
            isLoaded: false,
            errorStatus: 0,
            error: null,
            selectedPerson: null,
            message: '',
            messages: [],
            isChatVisible: false,
            isTyping: false,
            lastMessageSeen: false,
            lastSentMessageSeen: false, // Nou state pentru seen status
        };
    }

    componentDidMount() {
        this.fetchPersons();
        const userString = localStorage.getItem("user");
        if (userString) {
            try {
                const user = JSON.parse(userString);
                const userNameLogged = `${user.firstName} ${user.lastName}`;
                sessionStorage.setItem("userNameLogged", userNameLogged);
                console.log("User Name Logged: ", userNameLogged);
            } catch (error) {
                console.error("Error parsing user from localStorage:", error);
            }
        } else {
            console.warn("No user found in localStorage");
        }
    }

    async fetchPersons() {
        try {
            const token = localStorage.getItem('token');
            const users = await getUserData(token);
            console.log("All users from API:", users);

            // Get logged user info to filter them out
            const userString = localStorage.getItem("user");
            let loggedUserId = null;
            if (userString) {
                try {
                    const user = JSON.parse(userString);
                    loggedUserId = user.id;
                } catch (error) {
                    console.error("Error parsing user from localStorage:", error);
                }
            }

            // Filter out the logged user from the list
            const filteredUsers = users.filter(user => user.id !== loggedUserId);
            console.log("Filtered users (without logged user):", filteredUsers);

            this.setState({ tableData: filteredUsers, isLoaded: true });
        } catch (error) {
            console.error('Failed to fetch users:', error.message);
            this.setState({ errorStatus: error.status || 500, error: error.message });
        }
    }

    handleUserClick(person) {
        const fullName = `${person.firstName ?? ''} ${person.lastName ?? ''}`.trim();
        this.setState({
            selectedPerson: { ...person, name: fullName },
            isChatVisible: true,
            messages: [],
            isTyping: false,
            lastMessageSeen: false,
            lastSentMessageSeen: false, // Reset la schimbarea conversației
        });

        const userNameLogged = sessionStorage.getItem("userNameLogged");
        this.fetchPreviousMessages(userNameLogged, fullName);

        API_CHAT.connectToChatWebSocket(
            userNameLogged,
            fullName,
            (message) => {
                this.setState(prevState => ({
                    messages: [...prevState.messages, {
                        id: message.id,
                        sender: message.sender,
                        content: message.content,
                        receiver: message.receiver,
                        seen: message.seen,
                        timestamp: message.timestamp ? this.formatTimestamp(message.timestamp) : new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                    }]
                }));
                this.setState({ lastMessageSeen: false });
                this.sendSeenForLastMessage(fullName);
                this.scrollToBottom();
            },
            (seenMessageId) => {
                // Actualizăm seen status pentru mesajul specific
                this.setState(prevState => ({
                    messages: prevState.messages.map(msg =>
                        String(msg.id) === String(seenMessageId)
                            ? { ...msg, seen: true }
                            : msg
                    )
                }));

                // Verificăm dacă ultimul mesaj trimis de user a fost văzut
                if (this.state.messages.length > 0) {
                    const lastMessage = this.state.messages[this.state.messages.length - 1];
                    const userNameLogged = sessionStorage.getItem("userNameLogged");
                    if (lastMessage.sender === userNameLogged && String(lastMessage.id) === String(seenMessageId)) {
                        this.setState({ lastSentMessageSeen: true });
                    }
                }
            },
            (typingPerson) => {
                if (typingPerson === fullName) this.setState({ isTyping: true });
            },
            (stopTypingPerson) => {
                if (stopTypingPerson === fullName) this.setState({ isTyping: false });
            },
            () => {
                this.sendSeenForLastMessage(fullName);
                this.checkLastMessageStatus(fullName);
            }
        );
    }

    fetchPreviousMessages(senderName, receiverName) {
        API_CHAT.getMessages(senderName, receiverName, (messages) => {
            const messagesWithTimestamp = messages.map(msg => ({
                ...msg,
                timestamp: msg.timestamp ? this.formatTimestamp(msg.timestamp) : new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            }));
            this.setState(prevState => ({
                messages: [...messagesWithTimestamp, ...prevState.messages]
            }));

            // Verificăm statusul seen pentru ultimul mesaj trimis de user
            this.checkLastSentMessageSeenStatus(messagesWithTimestamp);
            this.scrollToBottom();
        }, (error) => {
            console.error("Error fetching previous messages:", error);
        });
    }

    // Funcție pentru verificarea seen status la ultimul mesaj trimis
    checkLastSentMessageSeenStatus(messages) {
        const userNameLogged = sessionStorage.getItem("userNameLogged");

        // Verificăm DOAR ultimul mesaj în ordine cronologică (nu ultimul trimis de user)
        if (messages.length > 0) {
            const lastMessage = messages[messages.length - 1];
            if (lastMessage.sender === userNameLogged) {
                this.setState({ lastSentMessageSeen: lastMessage.seen === true });
            }
        }
    }

    sendSeenForLastMessage(personName) {
        const lastMessage = this.state.messages[this.state.messages.length - 1];
        if (lastMessage && lastMessage.sender === personName) {
            API_CHAT.sendSeenNotification(lastMessage.id, personName);
        }
    }

    checkLastMessageStatus(personName) {
        const lastMessage = this.state.messages[this.state.messages.length - 1];
        if (lastMessage && lastMessage.sender === personName && lastMessage.seen === true) {
            this.setState({ lastMessageSeen: true });
        }
    }

    handleMessageChange(event) {
        const { selectedPerson, isTyping } = this.state;
        const userNameLogged = sessionStorage.getItem("userNameLogged");
        this.setState({ message: event.target.value });

        if (event.target.value.trim() && !isTyping) {
            API_CHAT.sendTypingNotification(userNameLogged, selectedPerson.name, true);
        }

        clearTimeout(this.typingTimeout);
        this.typingTimeout = setTimeout(() => {
            API_CHAT.sendTypingNotification(userNameLogged, selectedPerson.name, false);
        }, 2000);
    }

    handleSendMessage() {
        const { message, selectedPerson } = this.state;
        const userNameLogged = sessionStorage.getItem("userNameLogged");
        if (!message.trim()) return;

        API_CHAT.sendMessage(userNameLogged, selectedPerson.name, message);
        this.setState({
            message: '',
            lastSentMessageSeen: false // Reset seen status pentru noul mesaj
        });
    }

    handleKeyPress(event) {
        if (event.key === 'Enter' && !event.shiftKey) {
            event.preventDefault();
            this.handleSendMessage();
        }
    }

    scrollToBottom() {
        setTimeout(() => {
            const messagesContainer = document.querySelector('.messages-container');
            if (messagesContainer) {
                messagesContainer.scrollTop = messagesContainer.scrollHeight;
            }
        }, 100);
    }

    getInitials(name) {
        return name.split(' ').map(n => n[0]).join('').toUpperCase();
    }

    getAvatarUrl(person) {
        // Assuming the person object has an 'image' or 'avatar' property
        // If not available, return null to show initials
        return person.image || person.avatar || null;
    }

    getFriendshipStatus(person) {
        const userString = localStorage.getItem("user");
        if (!userString) return "Not A Friend";

        try {
            const loggedUser = JSON.parse(userString);
            const loggedUserId = loggedUser.id;

            // Check if the person has a friends array and if the logged user's ID is in it
            if (person.friends && Array.isArray(person.friends)) {
                const isFriend = person.friends.some(friend => friend.id === loggedUserId);
                return isFriend ? "Friend" : "Not A Friend";
            }

            return "Not A Friend";
        } catch (error) {
            console.error("Error parsing user from localStorage:", error);
            return "Not A Friend";
        }
    }

    formatTimestamp(timestamp) {
        try {
            const date = new Date(timestamp);
            return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        } catch (error) {
            console.error("Error formatting timestamp:", error);
            return new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        }
    }

    componentDidUpdate(prevProps, prevState) {
        if (prevState.messages.length !== this.state.messages.length) {
            this.scrollToBottom();
        }
    }

    // Funcție pentru determinarea seen status-ului DOAR pentru ultimul mesaj afișat
    getMessageSeenStatus(msg, index) {
        const userNameLogged = sessionStorage.getItem("userNameLogged");
        const { messages } = this.state;

        // Verificăm DOAR pentru ultimul mesaj în ordine cronologică (ultimul afișat)
        const isLastMessage = index === messages.length - 1;

        // Afișăm seen status DOAR dacă este ultimul mesaj ȘI este trimis de user
        if (isLastMessage && msg.sender === userNameLogged) {
            return msg.seen ? 'seen' : 'not-seen';
        }

        // Pentru toate celelalte mesaje nu afișăm nimic
        return null;
    }

    render() {
        const {
            tableData, selectedPerson, messages,
            isChatVisible, message, isTyping, lastMessageSeen
        } = this.state;

        const userNameLogged = sessionStorage.getItem("userNameLogged");
        const user = JSON.parse(localStorage.getItem('user'));
        return (
            <>
                {/* Container cu fundal alb pentru tot ecranul */}
                <div className="chat-full-background"></div>

                {user && <Navbar/>}
                <div className="chat-background">
                    {/* Sidebar */}
                    <div className="chat-sidebar">
                        {tableData.map(person => {
                            const fullName = `${person.firstName ?? ''} ${person.lastName ?? ''}`.trim();
                            const avatarUrl = this.getAvatarUrl(person);
                            const isActive = selectedPerson && selectedPerson.id === person.id;

                            return (
                                <button
                                    key={person.id}
                                    className={`chat-button ${isActive ? 'active' : ''}`}
                                    onClick={() => this.handleUserClick(person)}
                                >
                                    <div className="user-avatar">
                                        {avatarUrl ? (
                                            <img src={avatarUrl} alt={fullName} />
                                        ) : (
                                            this.getInitials(fullName)
                                        )}
                                    </div>
                                    <div className="user-info">
                                        <div className="user-name">{fullName}</div>
                                        <div className="user-status">{this.getFriendshipStatus(person)}</div>
                                    </div>
                                </button>
                            );
                        })}
                    </div>

                    {/* Chat container */}
                    <div className="chat-container">
                        {isChatVisible && selectedPerson ? (
                            <>
                                {/* Chat Header */}
                                <div className="chat-header">
                                    <div className="chat-header-avatar">
                                        {this.getAvatarUrl(selectedPerson) ? (
                                            <img src={this.getAvatarUrl(selectedPerson)} alt={selectedPerson.name} />
                                        ) : (
                                            this.getInitials(selectedPerson.name)
                                        )}
                                    </div>
                                    <div className="chat-header-info">
                                        <h3>{selectedPerson.name}</h3>
                                        <p>{isTyping ? 'Typing...' : 'Ready to chat'}</p>
                                    </div>
                                </div>

                                {/* Messages */}
                                <div className="messages-container">
                                    {messages.map((msg, index) => {
                                        const seenStatus = this.getMessageSeenStatus(msg, index);

                                        return (
                                            <div
                                                key={index}
                                                className={`message-bubble ${
                                                    msg.sender === userNameLogged ? 'message-sent' : 'message-received'
                                                }`}
                                            >
                                                {msg.sender !== userNameLogged && (
                                                    <div className="message-sender">{msg.sender}</div>
                                                )}
                                                <div className="message-content">{msg.content}</div>
                                                <div className="message-time">
                                                    {msg.timestamp}
                                                    {seenStatus && (
                                                        <span className={`message-status ${seenStatus}`}>
                                                            {seenStatus === 'seen' ? '✓✓' : '✓'}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })}
                                    {isTyping && (
                                        <div className="typing-indicator">
                                            {selectedPerson.name} is typing...
                                        </div>
                                    )}
                                </div>

                                {/* Message Input */}
                                <div className="message-area">
                                    <textarea
                                        className="message-input"
                                        rows="1"
                                        value={message}
                                        onChange={this.handleMessageChange.bind(this)}
                                        onKeyPress={this.handleKeyPress.bind(this)}
                                        placeholder="Write a message..."
                                    />
                                    <button
                                        className="send-button"
                                        onClick={this.handleSendMessage.bind(this)}
                                        disabled={!message.trim()}
                                        aria-label="Trimite mesaj"
                                    >
                                        &#9658;
                                    </button>
                                </div>
                            </>
                        ) : (
                            <div className="no-chat-selected">
                                <div className="icon">💬</div>
                                <h3>Selectează o conversație</h3>
                                <p>Alege un utilizator din lista din stânga pentru a începe să comunici</p>
                            </div>
                        )}
                    </div>
                </div>
            </>
        );
    }
}

export default Chat;