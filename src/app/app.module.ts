import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouterModule } from '@angular/router';
import { AppComponent } from './app.component';
import { appRoutes } from './app.routes';
import { RecognitionComponent } from './recognition/recognition.component';
import { HttpClientModule } from '@angular/common/http';
import { HeaderComponent } from './header/header.component';
import { NgIconsModule } from '@ng-icons/core';
import { heroBars3, heroMicrophone } from '@ng-icons/heroicons/outline';
import { ProperPipe } from './pipes/proper.pipe';
import { FooterComponent } from './footer/footer.component';

@NgModule({
  declarations: [
    AppComponent,
    RecognitionComponent,
    HeaderComponent,
    ProperPipe,
    FooterComponent,
  ],
  imports: [
    HttpClientModule,
    BrowserModule,
    RouterModule.forRoot(appRoutes, { initialNavigation: 'enabledBlocking' }),
    NgIconsModule.withIcons({
      heroBars3,
      heroMicrophone,
    }),
  ],
  providers: [HttpClientModule],
  bootstrap: [AppComponent],
})
export class AppModule {}
