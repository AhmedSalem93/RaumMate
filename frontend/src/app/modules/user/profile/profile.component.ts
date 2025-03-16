import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UserService } from '../../../core/services/user.service';
import { Router, RouterLink } from '@angular/router';
import { ReviewService } from '../../../services/review.service';
import { SlidebarComponent } from '../../../shared/components/slidebar/slidebar.component';

@Component({
  selector: 'app-profile',
  imports: [CommonModule, SlidebarComponent],
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss']
})
export class ProfileComponent implements OnInit {
   user: any = null;
   reviews: any[] = [];
   defaultProfilePicture: string = 'https://avatars.githubusercontent.com/u/47269252?v=1';

  constructor(private userService: UserService, private router: Router, private reviewService: ReviewService) { }

  ngOnInit(): void {
    if (!localStorage.getItem('token')) {
      this.router.navigate(['/auth/login']);
    }
    this.userService.getProfile().subscribe(user => {
      if (!user.profileCompleted) {
        this.router.navigate(['user/complete-profile']);
      }
    });
    this.userService.getProfile().subscribe(user => this.user = user);
    this.reviewService.getUserReviews(this.user.userId).subscribe(reviews => { this.reviews = reviews;});
  }

  getPreferencesKeys(): (keyof typeof this.user.preferences)[] {
    if (this.user && this.user.preferences) {
      return Object.keys(this.user.preferences) as (keyof typeof this.user.preferences)[];
    }
    return [];
  }

  getInterestsKeys(): (keyof typeof this.user.interests)[] {
    if (this.user && this.user.interests) {
      return Object.keys(this.user.interests) as (keyof typeof this.user.interests)[];
    }
    return [];
  }

  formatKey(key: string): string {
    return key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
  }
}