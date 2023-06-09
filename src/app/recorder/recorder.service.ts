import { Injectable } from '@angular/core';
import { Observable, Subject, bufferWhen, from, map } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class RecorderService {
  public micLevel$: Subject<number> = new Subject<number>();
  private _context!: AudioContext;
  
  public init(): void {
    this._context = new window.AudioContext();
  }

  public getMediaRecorder(deviceId = 'default'): Observable<MediaRecorder> {
    return this._getMediaStream(deviceId).pipe(
      map((stream: MediaStream) => this._observeAudioStream(stream))
    )
  }

  private _observeAudioStream(stream: MediaStream): MediaRecorder {
    const recorder = new MediaRecorder(stream);
    const sourceNode: MediaStreamAudioSourceNode = this._context.createMediaStreamSource(stream);
    const analyserNode: AnalyserNode = this._context.createAnalyser();    
    sourceNode.connect(analyserNode);
    const pcmData = new Float32Array(analyserNode.fftSize);
    const onFrame = () => {
        analyserNode.getFloatTimeDomainData(pcmData);
        let sumSquares = 0.0;
        for (const amplitude of pcmData) { sumSquares += amplitude*amplitude; }
        const volLevel: number = Math.sqrt(sumSquares / pcmData.length);
        this.micLevel$.next(volLevel);
        window.requestAnimationFrame(onFrame);
    };
    window.requestAnimationFrame(onFrame);
    return recorder;
  }

  private _getMediaStream(deviceId: string): Observable<MediaStream> {
    return from(navigator.mediaDevices.getUserMedia({video: false, audio: {
      echoCancellation: true,
      noiseSuppression: true,
      channelCount: 1,
      sampleRate: 1600,
      deviceId
    } }))
  }

}
