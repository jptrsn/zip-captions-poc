import { Component, OnDestroy, OnInit, WritableSignal, signal } from '@angular/core';
import { WhisperService } from '../whisper/whisper.service';
import { RecognitionService } from './recognition.service';
import { Observable, Subject, forkJoin, take, takeUntil } from 'rxjs';
import { RecorderService } from '../recorder/recorder.service';

@Component({
  selector: 'zip-captions-recognition',
  templateUrl: './recognition.component.html',
  styleUrls: ['./recognition.component.scss'],
})
export class RecognitionComponent implements OnInit, OnDestroy {
  
  public loaded: WritableSignal<boolean> = signal<boolean>(false);
  public errorMessage: WritableSignal<string> = signal<string>('');
  public isListening: WritableSignal<boolean> = signal<boolean>(false);
  public partialText: WritableSignal<string> = signal<string>('');
  public renderedText: WritableSignal<string[]> = signal<string[]>([]);
  public whisperCapturedText: WritableSignal<string[]> = signal<string[]>([]);
  public vol$!: Observable<number>;
  public shouldRecord: WritableSignal<boolean> = signal(false);
  
  private recognizedText: Map<number, string> = new Map();
  private recorder?: MediaRecorder;
  private stop$: Subject<void> = new Subject<void>();
  private disconnect$: Subject<void> = new Subject<void>();
  private onDestroy$: Subject<void> = new Subject<void>();
  constructor(private recognition: RecognitionService,
              private recorderService: RecorderService,
              private whisper: WhisperService) {}

  ngOnInit(): void {
    this.vol$ = this.recorderService.micLevel$.pipe(takeUntil(this.onDestroy$))
    this._initRecognition();
  }

  ngOnDestroy(): void {
    this.onDestroy$.next();
  }

  enable(): void {
    this.recorderService.init();
    this.recorderService.getMediaRecorder('default').pipe(take(1)).subscribe((recorder) => {
      if (this.shouldRecord()) {
        this._initRecorder(recorder);
      }
      this._startListening();
      this.loaded.set(true);
    });
    this.whisper.getParsedOutput().pipe(
      takeUntil(forkJoin([this.onDestroy$,this.disconnect$]))
    ).subscribe((response: string[]) => {
      this.whisperCapturedText.set(response)
    });
  }

  disable(): void {
    this.disconnect$.next();
    this.recorderService.stopAudioStream();
    this.loaded.set(false);
  }
  
  start(): void {
    this._startRecognition();
    if (this.shouldRecord()) {
      this._startRecording();
    }
  }

  stop(): void {
    this.stop$.next();
  }

  private _initRecorder(recorder: MediaRecorder): void {
    this.recorder = recorder;
    this.whisper.watchRecorder(recorder);
  }

  private _startListening(): void {
    this.recognition.recognizedText$.pipe(
      takeUntil(forkJoin([this.onDestroy$, this.disconnect$]))
    ).subscribe((text) => {
      if (text.length) {
        console.log(text);
        this.recorder?.stop();
        this.recorder?.start();
        const ts: number = Date.now();
        this.recognizedText.set(ts, text);
        this._updateRenderedText();
      }
    });
  }

  private _initRecognition(): void {
    this.recognition.init();
    this.recognition.error$.pipe(
      takeUntil(this.onDestroy$)
    ).subscribe((error: {message: string}) => {
      this.disable();
      this.errorMessage.set(error.message);
    });
  }

  private _startRecording(): void {
    this.recorder?.start();
    this.recognition.speaking$.pipe(
      takeUntil(this.stop$)
    ).subscribe((isSpeaking: boolean) => {
      console.log('isSpeaking', isSpeaking);
      if (isSpeaking && this.recorder?.state === 'paused') {
        this.recorder.resume()
      } else if (!isSpeaking && this.recorder?.state === 'recording') {
        this.recorder.pause();
      }
    })
    this.stop$.pipe(
      take(1)
    ).subscribe(() => {
      this.recorder?.stop();
    })
  }

  private _startRecognition(): void {
    this.isListening.set(true);
    this.recognition.start().pipe(
      takeUntil(this.stop$)
    ).subscribe((partialText) => {
      this.partialText.set(partialText);
    });
    this.stop$.pipe(
      take(1)
    ).subscribe(() => {
      this.recognition.stop();
      this.isListening.set(false);
      this.partialText.set('')
    });
  }

  private _updateRenderedText(): void {
    this.renderedText.set(Array.from(this.recognizedText.values()))
  }
}
