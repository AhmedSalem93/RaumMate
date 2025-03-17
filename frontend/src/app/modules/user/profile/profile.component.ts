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
  styleUrls: ['./profile.component.scss'],
})
export class ProfileComponent implements OnInit {
  user: any = null;
  reviews: any[] = [];
  defaultProfilePicture: string =
    'https://avatars.githubusercontent.com/u/47269252?v=1';

  constructor(
    private userService: UserService,
    private router: Router,
    private reviewService: ReviewService
  ) {}

  ngOnInit(): void {
    if (!localStorage.getItem('token')) {
      this.router.navigate(['/auth/login']);
    }

    this.userService.getProfile().subscribe((user) => {
      this.user = user;
      if (!user.profileCompleted) {
        this.router.navigate(['user/complete-profile']);
      }
      console.log('User ', this.user);
      this.reviewService.getUserReviews(this.user._id).subscribe((reviews) => {
        this.reviews = reviews;
      });
    });
  }

  // user = {
  //   firstName: "Hunain",
  //   lastName: "Murtaza",
  //   email: "hunain@example.com",
  //   role: "verified",
  //   isVerified: true,
  //   profilePicture: "https://avatars.githubusercontent.com/u/47269252?v=1",
  //   phone: "+49 1573 9358892",
  //   location: "Hildesheim, Germany",
  //   bio: "Software Engineer & Tech Enthusiast. Passionate about AI, Web Development, and Open Source.",
  //   createdAt: "January 5, 2024",
  //   preferences: {
  //     Smoking: "No",
  //     Pets: "Yes",
  //     Budget: "€500-€700",
  //     RoommateGender: "Male",
  //     Cleanliness: "High",
  //     NoiseTolerance: "Low",
  //     WorkFromHome: "Yes",
  //     Interests: ["Gaming", "Reading", "Programming", "Gym"]
  //   }
  // };

  getPreferencesKeys(): (keyof typeof this.user.preferences)[] {
    if (this.user && this.user.preferences) {
      return Object.keys(
        this.user.preferences
      ) as (keyof typeof this.user.preferences)[];
    }
    return [];
  }

  getInterestsKeys(): (keyof typeof this.user.interests)[] {
    if (this.user && this.user.interests) {
      return Object.keys(
        this.user.interests
      ) as (keyof typeof this.user.interests)[];
    }
    return [];
  }

  formatKey(key: string): string {
    return key
      .replace(/([A-Z])/g, ' $1')
      .replace(/^./, (str) => str.toUpperCase());
  }
}
