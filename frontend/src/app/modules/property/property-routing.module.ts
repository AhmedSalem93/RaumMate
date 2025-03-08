import { CreatePropertyComponent } from './create-property/create-property.component';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

const routes: Routes = [{ path: 'create', component: CreatePropertyComponent }];

@NgModule({
  imports: [RouterModule.forChild(routes), CreatePropertyComponent],
  exports: [RouterModule, CreatePropertyComponent],
})
export class PropertyRoutingModule {}
