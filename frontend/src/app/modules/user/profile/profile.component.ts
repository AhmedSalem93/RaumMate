import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-profile',
  imports: [CommonModule],
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss']
})
export class ProfileComponent {
  user = {
    firstName: "Hunain",
    lastName: "Murtaza",
    email: "hunain@example.com",
    role: "verified",
    isVerified: true,
    profilePicture: "https://avatars.githubusercontent.com/u/47269252?v=1",
    phone: "+49 1573 9358892",
    location: "Hildesheim, Germany",
    bio: "Software Engineer & Tech Enthusiast. Passionate about AI, Web Development, and Open Source.",
    createdAt: "January 5, 2024",
    preferences: {
      Smoking: "No",
      Pets: "Yes",
      Budget: "€500-€700",
      RoommateGender: "Male",
      Cleanliness: "High",
      NoiseTolerance: "Low",
      WorkFromHome: "Yes",
      Interests: ["Gaming", "Reading", "Programming", "Gym"]
    }
  };

  getPreferencesKeys(): (keyof typeof this.user.preferences)[] {
    return Object.keys(this.user.preferences) as (keyof typeof this.user.preferences)[];
  }

  formatKey(key: string): string {
    return key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
  }
}