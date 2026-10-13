import {
  RTCPeerConnection,
  RTCIceCandidate,
  RTCSessionDescription,
  MediaStream,
} from "react-native-webrtc";

export class ParentWebrtcManager {
  constructor({
    iceServers = [{ urls: "stun:stun.l.google.com:19302" }],
    onIceCandidate,
    onRemoteStream,
    receiveVideo = true,
  }) {
    this.receiveVideo = receiveVideo;
    this.iceServers = iceServers;
    this.onIceCandidate = onIceCandidate;
    this.onRemoteStream = onRemoteStream;
    this.peerConnection = null;
    this.addedCandidates = new Set();
  }

  ensurePeerConnection() {
    if (this.peerConnection) {
      return this.peerConnection;
    }

    const pc = new RTCPeerConnection({ iceServers: this.iceServers });
    pc.onicecandidate = (event) => {
      if (event?.candidate) {
        this.onIceCandidate?.(event.candidate);
      }
    };
    pc.ontrack = (event) => {
      console.log("[WebRTC] ontrack", event?.track?.kind, "streams:", event?.streams?.length ?? 0);
      let remoteStream = event?.streams?.[0];
      // Some senders add a track without attaching it to a stream; wrap it so it still plays.
      if (!remoteStream && event?.track) {
        if (!this.fallbackStream) this.fallbackStream = new MediaStream();
        this.fallbackStream.addTrack(event.track);
        remoteStream = this.fallbackStream;
      }
      if (remoteStream) {
        this.onRemoteStream?.(remoteStream);
      }
    };
    pc.oniceconnectionstatechange = () => {
      console.log("[WebRTC] iceConnectionState:", pc.iceConnectionState);
    };
    pc.onconnectionstatechange = () => {
      console.log("[WebRTC] connectionState:", pc.connectionState);
    };
    this.peerConnection = pc;
    return pc;
  }

  async createOffer() {
    const pc = this.ensurePeerConnection();
    const offer = await pc.createOffer({
      offerToReceiveAudio: true,
      offerToReceiveVideo: this.receiveVideo,
    });
    await pc.setLocalDescription(offer);
    return offer;
  }

  async applyAnswer(sdp) {
    const pc = this.ensurePeerConnection();
    const answer = new RTCSessionDescription({
      type: "answer",
      sdp,
    });
    await pc.setRemoteDescription(answer);
  }

  async addIceCandidate(candidate) {
    if (!candidate) return;
    const pc = this.ensurePeerConnection();

    const candidateKey = JSON.stringify({
      candidate: candidate.candidate,
      sdpMid: candidate.sdpMid,
      sdpMLineIndex: candidate.sdpMLineIndex,
    });
    if (this.addedCandidates.has(candidateKey)) {
      return;
    }

    this.addedCandidates.add(candidateKey);
    await pc.addIceCandidate(new RTCIceCandidate(candidate));
  }

  close() {
    if (this.peerConnection) {
      this.peerConnection.onicecandidate = null;
      this.peerConnection.ontrack = null;
      this.peerConnection.oniceconnectionstatechange = null;
      this.peerConnection.onconnectionstatechange = null;
      this.fallbackStream = null;
      this.peerConnection.close();
      this.peerConnection = null;
    }
    this.addedCandidates.clear();
  }
}
