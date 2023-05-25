import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable, Subject, from, switchMap, tap } from 'rxjs';
@Injectable({
  providedIn: 'root'
})
export class WhisperService {

  // private readonly apiUrl = 'https://api.educoder.dev';
  private readonly apiUrl = 'http://localhost:8081';
  private response$: Subject<any> = new Subject<any>();
  private data: Blob[] = [];
  constructor(private http: HttpClient) { }

  public watchRecorder(recorder: MediaRecorder): void {
    recorder.addEventListener('dataavailable', (ev: BlobEvent) => {
      this.recognize(ev.data);
    })
  }

  public recognize(data: Blob): Observable<any> {
    const headers: HttpHeaders = new  HttpHeaders();
    headers.set('Content-Type', 'multipart/form-data');
    const formData: FormData = new FormData();
    formData.append('audio_file', data);
    this.http.post(
      `${this.apiUrl}/asr?output=json`, 
      formData, 
      { headers }
    ).subscribe((response) => this.response$.next(response));
    return this.getResponse();
  }

  public getResponse(): Observable<any> {
    return this.response$.asObservable();
  }

}
