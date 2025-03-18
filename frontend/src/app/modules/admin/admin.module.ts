import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';

import { AdminRoutingModule } from './admin-routing.module';
import { AdminService } from './admin.service';

@NgModule({
  declarations: [],
  imports: [CommonModule, AdminRoutingModule, HttpClientModule],
  providers: [AdminService],
})
export class AdminModule {}
