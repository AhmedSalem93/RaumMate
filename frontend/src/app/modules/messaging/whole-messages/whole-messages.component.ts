import { Component, OnInit } from '@angular/core';
import { MessageService } from '../../../core/services/message.service';
import { UserService } from '../../../core/services/user.service';
import { CommonModule } from '@angular/common';
import { SlidebarComponent } from '../../../shared/components/slidebar/slidebar.component';
import { ReviewService } from '../../../services/review.service';

@Component({
  selector: 'app-whole-messages',
  imports: [CommonModule, SlidebarComponent],
  templateUrl: './whole-messages.component.html',
  styleUrl: './whole-messages.component.scss'
})
export class WholeMessagesComponent implements OnInit{
  userId: any | null = null;
  chatHistory: any[] = [];
  user: any = null;
  reviews: any[] = [];

  constructor(
    private messageService: MessageService,
    private userService: UserService,
    private reviewService: ReviewService
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
    this.userService.getProfile().subscribe(user => this.user = user);
    this.reviewService.getUserReviews(this.user.userId).subscribe(reviews => { this.reviews = reviews;});
  }
}
