import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { WhisperResponse } from './whisper.model';
@Injectable({
  providedIn: 'root'
})
export class WhisperService {

  // private readonly apiUrl = 'https://api.educoder.dev';
  private readonly apiUrl = 'http://localhost:8081';
  private allResponses: string[] = [];
  private response$: Subject<string[]> = new Subject<string[]>();
  constructor(private http: HttpClient) { }

  public watchRecorder(recorder: MediaRecorder): void {
    recorder.addEventListener('dataavailable', (ev: BlobEvent) => {
      this._recognize(ev.data);
    })
  }

  

  public getParsedOutput(): Observable<string[]> {
    return this.response$.asObservable();
  }

  private _recognize(data: Blob): Observable<string[]> {
    console.log('recognize', data);
    const headers: HttpHeaders = new  HttpHeaders();
    headers.set('Content-Type', 'multipart/form-data');
    const formData: FormData = new FormData();
    formData.append('audio_file', data);
    this.http.post(
      `${this.apiUrl}/asr?output=json`, 
      formData, 
      { headers }
    ).subscribe((response) => this._parseResponse(response as WhisperResponse));
    return this.getParsedOutput();
  }

  private _parseResponse(response: WhisperResponse): void {
    // TODO: Better segment parsing
    // console.log(response);
    // const result: string[] = [];
    // let start = 0;
    // let text = '';
    // response.segments.forEach((seg) => {
    //   if (seg.text.length) {
    //     if (seg.start <= start) {
    //       text += seg.text;
    //       start = seg.end;
    //     } else {
    //       result.push(text);
    //       text = '';
    //     }
    //   }
    // })
    // result.push(text);
    // this.allResponses.push(...result);
    
    this.allResponses.push(response.text);
    this.response$.next(this.allResponses);
  }

}
