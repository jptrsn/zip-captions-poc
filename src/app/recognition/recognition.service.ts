import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, Subject, distinctUntilChanged } from 'rxjs';
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
declare const webkitSpeechRecognition = SpeechRecognition || webkitSpeechRecognition;

@Injectable({
  providedIn: 'root'
})
export class RecognitionService {
  public recognizedText$: Subject<string> = new Subject<string>;
  public speaking$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  private liveOutput$: Subject<string> = new Subject<string>();
  private transcript?: string;
  private isStoppedSpeechRecog: boolean;
  private recognition: any;
  constructor() { 
    this.recognition = new webkitSpeechRecognition();
    this.isStoppedSpeechRecog = true;
  }

  init(): void {

    this.recognition.interimResults = true;
    this.recognition.lang = navigator.language;

    this.recognition.addEventListener('result', (e: any) => {
      this.transcript = Array.from(e.results)
      .map((result: any) => result[0])
      .map((result) => result.transcript)
      .join('');
      this.liveOutput$.next(this.transcript);
    });

    this.recognition.addEventListener('speechstart', () => {
      console.log('speech start')
      this.speaking$.next(true);
    })

    this.recognition.addEventListener('speechend', () => {
      console.log('speech end')
      this.speaking$.next(false);
    })

    this.recognition.addEventListener('end', () => {
      console.log('recognition end')
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
    this.recognition.abort();
  }
}
