import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { MessagesComponent } from './messages/messages.component';
import { WholeMessagesComponent } from './whole-messages/whole-messages.component';

const routes: Routes = [
  { path: 'messages/:receiverId/:senderId', component: MessagesComponent },
  { path: 'chat', component: WholeMessagesComponent },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class MessagingRoutingModule {}
