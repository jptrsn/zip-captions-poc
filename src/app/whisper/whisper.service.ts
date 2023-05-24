import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable, from, switchMap } from 'rxjs';
@Injectable({
  providedIn: 'root'
})
export class WhisperService {

  // private readonly apiUrl = 'https://api.educoder.dev';
  private readonly apiUrl = 'http://localhost:8081'
  constructor(private http: HttpClient) { }

  recognize(data: Blob): Observable<any> {
    const headers: HttpHeaders = new  HttpHeaders();
    headers.set('Content-Type', 'multipart/form-data');
    const formData: FormData = new FormData();
    formData.append('audio_file', data);
    return this.http.post(`${this.apiUrl}/asr?output=json`, formData, { headers })
  }

}
