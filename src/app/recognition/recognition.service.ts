import { Injectable } from '@angular/core';
import { Observable, Subject, distinctUntilChanged } from 'rxjs';
declare const webkitSpeechRecognition: any;

@Injectable({
  providedIn: 'root'
})
export class RecognitionService {
  public recognizedText$: Subject<string> = new Subject<string>;
  
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
    this.recognition.abort();
    this.liveOutput$.complete();
  }
}
