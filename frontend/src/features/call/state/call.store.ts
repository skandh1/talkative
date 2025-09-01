import { create } from 'zustand';

interface CallState {
  incomingCall: {
    callId: string;
    caller: {
      id: string;
      name: string;
      avatar?: string;
    };
  } | null;
  activeCall: {
    callId: string;
    peerId: string;
    peerName: string;
    startedAt: Date;
    isMuted: boolean;
  } | null;
  peerConnection: RTCPeerConnection | null;
  localStream: MediaStream | null;
  callStatus: 'idle' | 'calling' | 'ringing' | 'connected' | 'ended';
  
  // Actions
  setIncomingCall: (call: CallState['incomingCall']) => void;
  setActiveCall: (call: CallState['activeCall']) => void;
  setPeerConnection: (pc: RTCPeerConnection | null) => void;
  setLocalStream: (stream: MediaStream | null) => void;
  setCallStatus: (status: CallState['callStatus']) => void;
  toggleMute: () => void;
  clearCall: () => void;
}

export const useCallStore = create<CallState>((set, get) => ({
  incomingCall: null,
  activeCall: null,
  peerConnection: null,
  localStream: null,
  callStatus: 'idle',

  setIncomingCall: (call) => set({ incomingCall: call }),
  
  setActiveCall: (call) => set({ activeCall: call }),
  
  setPeerConnection: (pc) => set({ peerConnection: pc }),
  
  setLocalStream: (stream) => set({ localStream: stream }),
  
  setCallStatus: (status) => set({ callStatus: status }),
  
  toggleMute: () => set((state) => {
    const { localStream, activeCall } = state;
    if (localStream && activeCall) {
      const audioTrack = localStream.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        return {
          activeCall: {
            ...activeCall,
            isMuted: !audioTrack.enabled
          }
        };
      }
    }
    return state;
  }),

  clearCall: () => {
    const { peerConnection, localStream } = get();
    
    // Clean up WebRTC resources
    if (localStream) {
      localStream.getTracks().forEach(track => track.stop());
    }
    if (peerConnection) {
      peerConnection.close();
    }

    set({
      incomingCall: null,
      activeCall: null,
      peerConnection: null,
      localStream: null,
      callStatus: 'idle'
    });
  }
}));