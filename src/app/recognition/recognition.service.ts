import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, Subject, debounceTime, distinctUntilChanged } from 'rxjs';
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
declare const webkitSpeechRecognition = SpeechRecognition || webkitSpeechRecognition;

@Injectable({
  providedIn: 'root'
})
export class RecognitionService {
  public recognizedText$: Subject<string> = new Subject<string>;
  public speaking$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  public error$: Subject<{message: string}> = new Subject<{message: string}>();
  
  private liveOutput$: Subject<string> = new Subject<string>();
  private transcript?: string;
  private recognizedOutputChunk$: Subject<string> = new Subject<string>();
  private isStoppedSpeechRecog: boolean;
  private recognition: any;
  constructor() { 
    this.recognition = new webkitSpeechRecognition();
    this.isStoppedSpeechRecog = true;
  }

  init(): void {

    this.recognition.interimResults = true;
    this.recognition.continuous = true;
    this.recognition.lang = navigator.language;

    this.recognition.addEventListener('result', (e: any) => {
      // console.log(e)
      if (e.results.length === 1 && e.results[0].isFinal) {
        // console.log('final transcript', e.results[0][0].transcript)
        this.recognizedOutputChunk$.next(e.results[0][0].transcript);
      } else {
        this.transcript = Array.from(e.results)
        .map((result: any) => result[0])
        .map((result) => result.transcript)
        .join('');
        this.liveOutput$.next(this.transcript);
      }
    });

    this.recognizedOutputChunk$.pipe(
      debounceTime(750)
    ).subscribe(() => {
      this.recognition.stop();
    })

    const listener = (e: any) => {
      console.log('recognition', e.type);
    }

    // this.recognition.addEventListener('audiostart', listener);
    // this.recognition.addEventListener('audioend', listener);
    // this.recognition.addEventListener('end', listener);
    // this.recognition.addEventListener('error', listener);
    // this.recognition.addEventListener('nomatch', listener);
    // this.recognition.addEventListener('result', listener);
    // this.recognition.addEventListener('soundend', listener);
    // this.recognition.addEventListener('soundstart', listener);
    // this.recognition.addEventListener('speechend', listener);
    // this.recognition.addEventListener('speechstart', listener);
    // this.recognition.addEventListener('start', listener);

    this.recognition.addEventListener('speechstart', () => {
      this.speaking$.next(true);
    });

    this.recognition.addEventListener('speechend', () => {
      this.speaking$.next(false);
    });

    this.recognition.addEventListener('error', (err: ErrorEvent) => {
      if (err.error === 'network') {
        this.error$.next({message: 'The service encountered a network error, recognition has stopped.'});
      } else if (err.error === 'no-speech') {
        console.log('stopping on no speech')
      } else {
        this.error$.next({message: `The service has encountered a ${err.error} error, recogntion has stopped.`})
      }
      this.isStoppedSpeechRecog = true;
      this.recognition.stop();
    });

    this.recognition.addEventListener('end', () => {
      if (this.transcript) {
        this.recognizedText$.next(this.transcript as string);
        delete this.transcript;
        this.liveOutput$.next('');
      }
      if (this.isStoppedSpeechRecog) {
        this.recognition.stop();
      } else {
        this.recognition.start();
      }
    });
  }

  start(): Observable<string> {
    this.isStoppedSpeechRecog = false;
    this.recognition.start();
    return this.liveOutput$.pipe(
      distinctUntilChanged()
    );
  }

  stop(): void {
    this.isStoppedSpeechRecog = true;
    this.recognition.stop();
  }
}
