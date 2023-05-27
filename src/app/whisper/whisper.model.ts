export interface WhisperSegment {
  avg_logprob: number;
  compression_ratio: number;
  end: number;
  id: number;
  no_speech_prob: number;
  seek: number;
  start: number;
  temperature: number;
  text: string;
  tokens: number[];
}

export interface WhisperResponse {
  language: string;
  segments: WhisperSegment[];
  text: string;
}