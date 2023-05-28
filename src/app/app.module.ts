import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouterModule } from '@angular/router';
import { AppComponent } from './app.component';
import { appRoutes } from './app.routes';
import { RecognitionComponent } from './recognition/recognition.component';
import { HttpClientModule } from '@angular/common/http';
import { HeaderComponent } from './header/header.component';
import { NgIconsModule } from '@ng-icons/core';
import { heroBars3 } from '@ng-icons/heroicons/outline'

@NgModule({
  declarations: [AppComponent, RecognitionComponent, HeaderComponent],
  imports: [
    HttpClientModule,
    BrowserModule,
    RouterModule.forRoot(appRoutes, { initialNavigation: 'enabledBlocking' }),
    NgIconsModule.withIcons({
      heroBars3
    }),
  ],
  providers: [HttpClientModule],
  bootstrap: [AppComponent],
})
export class AppModule {}
