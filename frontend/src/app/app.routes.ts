import { Routes } from '@angular/router';
import { LandingComponent } from './pages/landing/landing.component';
import { MessagesComponent } from './modules/messaging/messages/messages.component';
import { WholeMessagesComponent } from './modules/messaging/whole-messages/whole-messages.component';

export const routes: Routes = [
  { path: '', component: LandingComponent, pathMatch: 'full' },
  {
    path: 'auth',
    loadChildren: () =>
      import('./modules/auth/auth.module').then((m) => m.AuthModule),
  },
  {
    path: 'property',
    loadChildren: () =>
      import('./modules/property/property.module').then(
        (m) => m.PropertyModule
      ),
  },
  {
    path: 'user',
    loadChildren: () =>
      import('./modules/user/user.module').then((m) => m.UserModule),
  },
  {
    path: 'admin',
    loadChildren: () =>
      import('./modules/admin/admin.module').then((m) => m.AdminModule),
  },
  {
    path: 'messaging',
    loadChildren: () =>
      import('./modules/messaging/messaging.module').then(
        (m) => m.MessagingModule
      ),
  },
  {
    path: 'messages',
    component: MessagesComponent,
  },
  {
    path: 'whole-messages',
    component: WholeMessagesComponent, // For all previous chats
  },
  { path: '**', redirectTo: '' },
];
