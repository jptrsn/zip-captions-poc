import { trigger, state, style, transition, animate } from '@angular/animations';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { RecorderService } from '../recorder/recorder.service';
import { Observable, Subject, map, startWith, takeUntil } from 'rxjs';

@Component({
  selector: 'zip-captions-footer',
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.scss'],
  animations: [
    trigger('growShrinkVertical', [
      state('show', style({
        opacity: 1,
        transform: 'scaleY(1)',
        height: 'auto',
      })),
      state('hide', style({
        opacity: 0,
        transform: 'scaleY(0)',
        height: '0px',
      })),
      transition('show => hide', animate(`500ms ease-out`)),
      transition('hide => show', animate(`500ms ease-in`)),
    ])
  ]
})
export class FooterComponent implements OnInit, OnDestroy {
  public growShrink$!: Observable<'show' | 'hide'>;
  private onDestroy$: Subject<void> = new Subject<void>();
  constructor(private recorderService: RecorderService) {}

  ngOnInit(): void {
    this.growShrink$ = this.recorderService.stream$.pipe(
      takeUntil(this.onDestroy$),
      map((stream) => stream ? 'hide' : 'show'),
      startWith('show' as 'show' | 'hide')
    );
  }

  ngOnDestroy(): void {
    this.onDestroy$.next();
  }
}
