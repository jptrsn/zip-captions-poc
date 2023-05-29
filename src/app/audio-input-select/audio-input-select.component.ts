import { Component, OnDestroy, OnInit, WritableSignal, signal } from '@angular/core';
import { Subject } from 'rxjs/internal/Subject';
import { RecorderService } from '../recorder/recorder.service';
import { Observable, distinctUntilChanged, take, takeUntil } from 'rxjs';

@Component({
  selector: 'zip-captions-audio-input-select',
  templateUrl: './audio-input-select.component.html',
  styleUrls: ['./audio-input-select.component.scss'],
})
export class AudioInputSelectComponent implements OnInit, OnDestroy {

  public enabled: WritableSignal<boolean> = signal(false);
  public volume$!: Observable<number>;
  private onDestroy$: Subject<void> = new Subject<void>();
  constructor(private recorderService: RecorderService) {}

  ngOnInit(): void {
    this.volume$ = this.recorderService.micLevel$.pipe(
      takeUntil(this.onDestroy$),
      // distinctUntilChanged((a, b) => { return a === b;})
    );

    this.recorderService.init();
    
    this.recorderService.stream$.pipe(
      takeUntil(this.onDestroy$)
    ).subscribe((stream: MediaStream | null) => {
      this.enabled.set(!!stream);
    })
  }

  ngOnDestroy(): void {
    this.onDestroy$.next();
  }

  public toggle(): void {
    if (this.enabled()) {
      this._disable();
    } else {
      this._enable();
    }
  }

  private _enable(): void {
    this.recorderService.getMediaStream().pipe(
      take(1)
    ).subscribe((stream) => {
      console.log('stream', stream)
    })
  }

  private _disable(): void {
    this.recorderService.stopAudioStream();
    this.enabled.set(false);
  }
}
