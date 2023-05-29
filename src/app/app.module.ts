import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouterModule } from '@angular/router';
import { AppComponent } from './app.component';
import { appRoutes } from './app.routes';
import { RecognitionComponent } from './recognition/recognition.component';
import { HttpClientModule } from '@angular/common/http';
import { HeaderComponent } from './header/header.component';
import { NgIconsModule } from '@ng-icons/core';
import {
  heroBars3,
  heroMicrophone,
  heroPlayCircle,
  heroStopCircle,
} from '@ng-icons/heroicons/outline';
import { ProperPipe } from './pipes/proper.pipe';
import { FooterComponent } from './footer/footer.component';
import { AboutComponent } from './about/about.component';
import { AudioInputSelectComponent } from './audio-input-select/audio-input-select.component';
import { heroMicrophoneSlash } from './vectors/vectors';
import { BackgroundMagnitudeDirective } from './directives/background-magnitude.directive';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations'

@NgModule({
  declarations: [
    AppComponent,
    RecognitionComponent,
    HeaderComponent,
    ProperPipe,
    FooterComponent,
    AboutComponent,
    AudioInputSelectComponent,
    BackgroundMagnitudeDirective,
  ],
  imports: [
    HttpClientModule,
    BrowserModule,
    BrowserAnimationsModule,
    RouterModule.forRoot(appRoutes, { initialNavigation: 'enabledBlocking' }),
    NgIconsModule.withIcons({
      heroBars3,
      heroMicrophone,
      heroPlayCircle,
      heroStopCircle,
      heroMicrophoneSlash,
    }),
  ],
  providers: [HttpClientModule],
  bootstrap: [AppComponent],
})
export class AppModule {}
