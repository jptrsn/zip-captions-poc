import { trigger, state, style, transition, animate } from '@angular/animations';
import { Component, WritableSignal, signal } from '@angular/core';
import { RecorderService } from './recorder/recorder.service';
import { map } from 'rxjs';

@Component({
  selector: 'zip-captions-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  animations: [
    trigger('growShrinkVertical', [
      state('show', style({
        opacity: 1,
        transform: 'scaleY(1)',
        height: 'auto'
      })),
      state('hide', style({
        opacity: 0,
        transform: 'scaleY(0)',
        height: '0px'
      })),
      transition('show => hide', animate(`500ms ease-out`)),
      transition('hide => show', animate(`500ms ease-in`)),
    ])
  ]
})
export class AppComponent {
  title = 'zip-captions';
  public footerAnimate: WritableSignal<'show' | 'hide'> = signal('show');
  constructor(private recorderService: RecorderService) {
    this.recorderService.stream$.pipe(
      map((st) => st ? 'hide' : 'show')
    ).subscribe((value) => this.footerAnimate.set(value))
  }
}
