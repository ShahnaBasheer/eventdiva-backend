

export interface IVideoCallRepository {
    initializeConnection(): void;
    createOffer(): Promise<RTCSessionDescriptionInit>;
    createAnswer(): Promise<RTCSessionDescriptionInit>;
    setRemoteDescription(description: RTCSessionDescriptionInit): Promise<void>;
    addIceCandidate(candidate: RTCIceCandidateInit): Promise<void>;
    onIceCandidate(callback: (candidate: RTCIceCandidate) => void): void;
    onTrack(callback: (event: RTCTrackEvent) => void): void;
}
  