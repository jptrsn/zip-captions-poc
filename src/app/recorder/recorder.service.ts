import { Injectable, WritableSignal, signal } from '@angular/core';
import { BehaviorSubject, Observable, ReplaySubject, Subject, filter, from, map, of, take } from 'rxjs';
import { RecorderState } from './recorder.model';

@Injectable({
  providedIn: 'root'
})
export class RecorderService {
  public micLevel$: Subject<number> = new Subject<number>();
  public stream$: BehaviorSubject<MediaStream | null> = new BehaviorSubject<MediaStream | null>(null);
  private _recorder$: ReplaySubject<MediaRecorder> = new ReplaySubject<MediaRecorder>(1);
  private _context?: AudioContext;
  
  public init(): void {
    if (!this._context) {
      this._context = new window.AudioContext();
    } else if (this._context.state === 'suspended') {
      this._context.resume();
    } else {
      console.log('duplicate init call!')
    }
  }

  public getMediaStream(deviceId = 'default'): Observable<MediaStream> {
    if (this.stream$.value) {
      this.stopAudioStream();
    }
    navigator.mediaDevices.getUserMedia({video: false, audio: {
      echoCancellation: true,
      noiseSuppression: true,
      autoGainControl: true,
      channelCount: 1,
      sampleRate: 1600,
      deviceId
    } }).then((stream: MediaStream) => {
      this._observeAudioStream(stream);
      this.stream$.next(stream);
    })
    return this.stream$.pipe(filter((v) => !!v)) as Observable<MediaStream>;
  }

  public getMediaRecorder(deviceId?: string): Observable<MediaRecorder> {
    if (!this.stream$.value) {
      this.getMediaStream(deviceId).pipe(
        take(1)
      ).subscribe((stream: MediaStream) => {
        this._recorder$.next(new MediaRecorder(stream));
      })
    } else {
      this._recorder$.next(new MediaRecorder(this.stream$.value))
    }
    return this._recorder$;
  }

  public stopAudioStream(): void {
    const st: MediaStream | null = this.stream$.value;
    if (st) {
      st.getTracks().forEach((track) => track.stop());
      st.dispatchEvent(new Event('stop_observation'))
      this.stream$.next(null);
    }
  }

  private _observeAudioStream(stream: MediaStream): void {
    const sourceNode: MediaStreamAudioSourceNode = this._context!.createMediaStreamSource(stream);
    const analyserNode: AnalyserNode = this._context!.createAnalyser();    
    stream.addEventListener('stop_observation', () => {
      sourceNode.disconnect();
      analyserNode.disconnect();
    })
    sourceNode.connect(analyserNode);
    const pcmData = new Float32Array(analyserNode.fftSize);
    const onFrame = () => {
        analyserNode.getFloatTimeDomainData(pcmData);
        let sumSquares = 0.0;
        for (const amplitude of pcmData) { sumSquares += amplitude*amplitude; }
        const volLevel: number = Math.round(Math.sqrt(sumSquares / pcmData.length) * 100);
        this.micLevel$.next(volLevel);
        if (stream.active) {
          window.requestAnimationFrame(onFrame);
        } else {
          this.micLevel$.next(0)
        }
    };
    window.requestAnimationFrame(onFrame);
  }

}
