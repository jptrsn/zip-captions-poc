export interface InputDevice {
  id: string;
}

export interface RecorderState {
  inputDevice?: InputDevice;
  hasStream?: boolean;
  hasRecorder?: boolean;
}