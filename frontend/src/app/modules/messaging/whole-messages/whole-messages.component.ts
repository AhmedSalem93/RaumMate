import { Component, OnInit } from '@angular/core';
import { MessageService } from '../../../core/services/message.service';
import { UserService } from '../../../core/services/user.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-whole-messages',
  imports: [CommonModule],
  templateUrl: './whole-messages.component.html',
  styleUrl: './whole-messages.component.scss'
})
export class WholeMessagesComponent implements OnInit{
  userId: any | null = null;
  chatHistory: any[] = [];

  constructor(
    private messageService: MessageService,
    private userService: UserService
  ) {}

  ngOnInit(): void {
    // Get the current user's ID
    this.userId = this.userService.user|| null;

    if (this.userId) {
      // Fetch chat history for the current user
      this.messageService.getChatHistory(this.userId).subscribe({
        next: (data) => {
          this.chatHistory = data;
        },
        error: (err) => {
          console.error('Error fetching chat history:', err);
        },
      });
    }
  }
}
