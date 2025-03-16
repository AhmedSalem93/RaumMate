import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MessageService } from '../../../core/services/message.service';
import { ActivatedRoute } from '@angular/router';
import { BrowserModule } from '@angular/platform-browser';

@Component({
  selector: 'app-messages',
  imports: [BrowserModule, FormsModule],
  templateUrl: './messages.component.html',
  styleUrl: './messages.component.scss',
})
export class MessagesComponent implements OnInit {
  receiverId = '';
  senderId = '';
  messages: {
    senderId: string;
    message: string;
    _id?: string;
    delivered?: boolean;
    read?: boolean;
  }[] = [];
  newMessage = '';

  constructor(
    private messageService: MessageService,
    private route: ActivatedRoute
  ) {}

  ngOnInit() {
    this.route.queryParams.subscribe((params) => {
      this.receiverId = params['sellerId'];
      this.senderId = params['buyerId'];
    });

    // Join the chat as the buyer
    this.messageService.joinChat(this.senderId);

    // Listen for incoming messages
    this.messageService.onReceiveMessage().subscribe((data) => {
      this.messages.push({ ...data, delivered: true, read: false });
    });

    // Listen for message read events
    this.messageService.onMessageRead().subscribe((messageId) => {
      const message = this.messages.find((msg) => msg._id === messageId);
      if (message) {
        message.read = true;
      }
    });
  }

  sendMessage() {
    if (this.newMessage.trim()) {
      this.messageService.sendMessage(
        this.senderId,
        this.receiverId,
        this.newMessage
      );
      this.messages.push({
        senderId: this.senderId,
        message: this.newMessage,
        delivered: false,
        read: false,
      });
      this.newMessage = '';
    }
  }

  markAsRead(messageId: string) {
    this.messageService.markAsRead(messageId);
  }
}
