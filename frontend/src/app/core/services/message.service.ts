import { Injectable } from '@angular/core';
import { io, Socket } from 'socket.io-client';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class MessageService {
  private socket: Socket;

  constructor() {
    this.socket = io('http://localhost:3000'); // Connect to your Node.js server
  }

  // Join the chat
  joinChat(userId: string) {
    this.socket.emit('join', userId);
  }

  // Send a message
  sendMessage(senderId: string, receiverId: string, message: string) {
    this.socket.emit('sendMessage', { senderId, receiverId, message });
  }

  // Listen for incoming messages
  onReceiveMessage(): Observable<{
    senderId: string;
    message: string;
    _id: string;
  }> {
    return new Observable((observer) => {
      this.socket.on('receiveMessage', (data) => {
        observer.next(data);
      });
    });
  }

  // Mark a message as read
  markAsRead(messageId: string) {
    this.socket.emit('markAsRead', messageId);
  }

  // Listen for message read events
  onMessageRead(): Observable<string> {
    return new Observable((observer) => {
      this.socket.on('messageRead', (messageId) => {
        observer.next(messageId);
      });
    });
  }
}
