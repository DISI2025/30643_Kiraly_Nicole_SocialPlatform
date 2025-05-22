import SockJS from "sockjs-client";
import Stomp from "stompjs";


const HOST = {
    backend_chat_api: "http://localhost:8080"
};

const endpoint = {
    sendMessage: "/app/send-message",
    sendBroadcast: "/app/send-broadcast",
    markSeen: "/app/mark-seen",
    receiveMessages: "/topic/messages",
    receiveSeen: "/topic/seen"
};

let stompClient = null;
let stompClientBroadcast = null;

function connectToChatWebSocket(user, currentChatUser, onMessageCallback, onSeenCallback, onTypingCallback, onStopTypingCallback, onConnected) {
    disconnectFromChatWebSocket();

    const socketUrl = `${HOST.backend_chat_api.replace(/^http(s)?:\/\//, "http://")}/chat`;
    const sockJS = new SockJS(socketUrl);
    stompClient = Stomp.over(sockJS);

    stompClient.connect({}, () => {
        console.log("WebSocket connected for chat.");
        const usernameLogged = sessionStorage.getItem("userNameLogged");

        if (onConnected) onConnected();

        stompClient.subscribe(`/user/${usernameLogged}/queue/messages`, (message) => {
            if (message.body) {
                try {
                    const parsedMessage = JSON.parse(message.body);
                    if (
                        (parsedMessage.sender === user && parsedMessage.receiver === currentChatUser) ||
                        (parsedMessage.sender === currentChatUser && parsedMessage.receiver === user)
                    ) {
                        if (onMessageCallback) onMessageCallback(parsedMessage);
                    }
                } catch (error) {
                    console.error("Error parsing WebSocket message:", error);
                }
            }
        });

        stompClient.subscribe(`/user/${usernameLogged}/queue/seen`, (message) => {
            if (message.body && onSeenCallback) {
                onSeenCallback(message.body);
            }
        });

        stompClient.subscribe(`/user/${usernameLogged}/queue/typing`, (message) => {
            if (message.body === currentChatUser && onTypingCallback) {
                onTypingCallback(message.body);
            }
        });

        stompClient.subscribe(`/user/${usernameLogged}/queue/stopTyping`, (message) => {
            if (message.body === currentChatUser && onStopTypingCallback) {
                onStopTypingCallback(message.body);
            }
        });

    }, (error) => {
        console.error("WebSocket connection error:", error);
    });

    return stompClient;
}

function sendMessage(sender, receiver, content) {
    if (!stompClient || !stompClient.connected) {
        console.error("WebSocket is not connected.");
        return;
    }

    const messageDTO = {
        id: null,
        content,
        sender,
        receiver,
        timestamp: new Date().toISOString(),
        seen: false
    };

    stompClient.send(endpoint.sendMessage, {}, JSON.stringify(messageDTO));
}

function markMessageAsSeen(messageId) {
    if (!stompClient || !stompClient.connected) {
        console.error("WebSocket is not connected.");
        return;
    }

    stompClient.send(endpoint.markSeen, {}, JSON.stringify({ messageId }));
}

function sendSeenNotification(messageId, userName) {
    if (!stompClient || !stompClient.connected) {
        console.error("WebSocket is not connected.");
        return;
    }

    stompClient.send("/app/mark-seen", {}, JSON.stringify({
        seenMessageId: messageId,
        receiver: userName
    }));
}

function sendTypingNotification(typingPerson, receiver, isTyping) {
    if (!stompClient || !stompClient.connected) {
        console.error("WebSocket is not connected.");
        return;
    }

    stompClient.send("/app/send-typing", {}, JSON.stringify({
        typingPerson,
        receiver,
        isTyping
    }));
}

function getMessages(senderName, receiverName, onSuccess, onError) {
    const apiUrl = `${HOST.backend_chat_api}/chat/messages/${senderName}/${receiverName}`;

    fetch(apiUrl)
        .then(response => {
            if (!response.ok) throw new Error("Failed to fetch messages");
            return response.json();
        })
        .then(data => onSuccess(data))
        .catch(error => {
            console.error("Error fetching previous messages:", error);
            onError(error);
        });
}

function connectToBroadcastWebSocket(onTopicMessageCallback) {
    disconnectFromBroadcastWebSocket();

    const socketUrl = `${HOST.backend_chat_api.replace(/^http(s)?:\/\//, "http://")}/chat`;
    const sockJS = new SockJS(socketUrl);
    stompClientBroadcast = Stomp.over(sockJS);

    stompClientBroadcast.connect({}, () => {
        console.log("Broadcast WebSocket connected.");
        stompClientBroadcast.subscribe("/topic/messages", (message) => {
            if (message.body) {
                const parsedMessage = JSON.parse(message.body);
                onTopicMessageCallback(parsedMessage);
            }
        });
    }, (error) => {
        console.error("Broadcast WebSocket connection error:", error);
    });

    return stompClientBroadcast;
}

function sendBroadcastMessage(users, sender, content) {
    if (!stompClientBroadcast || !stompClientBroadcast.connected) {
        console.error("WebSocket is not connected.");
        return;
    }

    const messageDTO = {
        id: null,
        content,
        sender,
        receiver: "all",
        timestamp: new Date().toISOString(),
        seen: false
    };

    const payload = {
        users,
        messageDTO
    };

    stompClientBroadcast.send('/app/send-broadcast', {}, JSON.stringify(messageDTO));
    console.log("Broadcast message sent:", payload);
}

function getChatRoomMessages(onSuccess, onError) {
    const apiUrl = `${HOST.backend_chat_api}/chat/messages/chatroom`;

    fetch(apiUrl)
        .then(response => {
            if (!response.ok) throw new Error("Failed to fetch messages");
            return response.json();
        })
        .then(data => onSuccess(data))
        .catch(error => {
            console.error("Error fetching chatroom messages:", error);
            onError(error);
        });
}

function disconnectFromChatWebSocket() {
    if (stompClient && stompClient.connected) {
        stompClient.disconnect(() => {
            console.log("WebSocket for one-to-one disconnected.");
        });
    }
}

function disconnectFromBroadcastWebSocket() {
    if (stompClientBroadcast && stompClientBroadcast.connected) {
        stompClientBroadcast.disconnect(() => {
            console.log("WebSocket for broadcast disconnected.");
        });
    }
}

export {
    connectToChatWebSocket,
    sendMessage,
    markMessageAsSeen,
    getMessages,
    connectToBroadcastWebSocket,
    sendBroadcastMessage,
    getChatRoomMessages,
    sendTypingNotification,
    sendSeenNotification
};
