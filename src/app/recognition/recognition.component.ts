import { Component, OnDestroy, OnInit, WritableSignal, signal } from '@angular/core';
import { WhisperService } from '../whisper/whisper.service';
import { RecognitionService } from './recognition.service';
import { Observable, Subject, take, takeUntil } from 'rxjs';
import { RecorderService } from '../recorder/recorder.service';

@Component({
  selector: 'zip-captions-recognition',
  templateUrl: './recognition.component.html',
  styleUrls: ['./recognition.component.scss'],
})
export class RecognitionComponent implements OnInit, OnDestroy {
  public loaded: WritableSignal<boolean> = signal<boolean>(false);
  public partialText: WritableSignal<string> = signal<string>('');
  private recognizedText: Map<number, string> = new Map();
  public renderedText: WritableSignal<string[]> = signal<string[]>([]);
  public whisperCapturedText: WritableSignal<string[]> = signal<string[]>([]);
  public vol$!: Observable<number>;
  private recorder?: MediaRecorder;
  private stop$: Subject<void> = new Subject<void>();
  private onDestroy$: Subject<void> = new Subject<void>();
  constructor(private recognition: RecognitionService,
              private recorderService: RecorderService,
              private whisper: WhisperService) {}

  ngOnInit(): void {
    this.vol$ = this.recorderService.micLevel$.pipe(takeUntil(this.onDestroy$))
    this._initRecognition();
    this.recorderService.getMediaRecorder('default').pipe(take(1)).subscribe((recorder) => {
      this._initRecorder(recorder);
      this.loaded.set(true)
    });
    this.whisper.getResponse().pipe(
      takeUntil(this.onDestroy$)
    ).subscribe((response) => {
      console.log('whisper', response);
      this.whisperCapturedText.update((text) => {
        text.push(...response.segments.map((seg: any) => seg.text));
        console.log(text)
        return text;
      })
    })
  }

  ngOnDestroy(): void {
    this.onDestroy$.next();
  }
  
  setThreshold(): void {
    this.recorderService.setThreshold(5);
  }

  start(): void {
    this._startRecognition();
    this._startRecording();
  }

  stop(): void {
    this.stop$.next();
  }

  private _initRecorder(recorder: MediaRecorder): void {
    this.recorder = recorder;
    this.whisper.watchRecorder(recorder);
  }

  private _initRecognition(): void {
    this.recognition.init();
    this.recognition.recognizedText$.pipe(
      takeUntil(this.onDestroy$)
    ).subscribe((text) => {
      if (text.length) {
        console.log(text)
        const ts: number = Date.now();
        this.recognizedText.set(ts, text);
        this._updateRenderedText();
      }
    });
  }

  private _startRecording(): void {
    console.log('start', this.recorder?.state);
    this.recorder?.start();
    this.stop$.pipe(
      take(1)
    ).subscribe(() => {
      console.log('stopping');
      this.recorder?.stop();
    })
  }

  private _startRecognition(): void {
    this.recognition.start().pipe(
      takeUntil(this.stop$)
    ).subscribe((partialText) => {
      this.partialText.set(partialText);
    });
    this.stop$.pipe(
      take(1)
    ).subscribe(() => this.recognition.stop());
  }

  private _updateRenderedText(): void {
    this.renderedText.set(Array.from(this.recognizedText.values()))
  }
}
