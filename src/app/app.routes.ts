import { Route } from '@angular/router';
import { RecognitionComponent } from './recognition/recognition.component';
import { AboutComponent } from './about/about.component';

export const appRoutes: Route[] = [
  { path: '', component: RecognitionComponent },
  { path: 'about', component: AboutComponent },
];
