import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http';

import { AppComponent } from './app.component';
import { CoreModule } from './core/core.module';
import { SharedModule } from './shared/shared.module';
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { TokenInterceptorService } from './services/token-interceptor.service';
import { Router } from '@angular/router';

@NgModule({
  declarations: [],
  imports: [
    BrowserModule,
    AppComponent,
    HttpClientModule,
    CoreModule,
    SharedModule,
  ],
  providers: [{ provide: HTTP_INTERCEPTORS, useClass: TokenInterceptorService, multi: true }]
})
export class AppModule {}
