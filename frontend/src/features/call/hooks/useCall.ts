import { useEffect, useRef } from 'react';
import { useMutation } from '@tanstack/react-query';
import { useCallStore } from '../state/call.store.js';
import { callAPI } from '../api/call';
import { wsClient } from '../../../lib/ws';
import { type CallRingEvent, type CallStateEvent, type SDPEvent, type ICEEvent } from '../../../types/realtime';

const ICE_SERVERS = [
  { urls: 'stun:stun.l.google.com:19302' },
  { urls: 'stun:stun1.l.google.com:19302' }
];

export const useCall = () => {
  const {
    incomingCall,
    activeCall,
    peerConnection,
    localStream,
    callStatus,
    setIncomingCall,
    setActiveCall,
    setPeerConnection,
    setLocalStream,
    setCallStatus,
    toggleMute,
    clearCall
  } = useCallStore();

  const callTimerRef = useRef<NodeJS.Timeout>();

  // Subscribe to WebSocket events
  useEffect(() => {
    const unsubscribeRing = wsClient.subscribe('call.ring', (event: CallRingEvent) => {
      setIncomingCall(event);
      setCallStatus('ringing');
    });

    const unsubscribeState = wsClient.subscribe('call.state', (event: CallStateEvent) => {
      if (event.status === 'accepted') {
        setCallStatus('connected');
      } else if (['declined', 'canceled', 'ended'].includes(event.status)) {
        clearCall();
      }
    });

    const unsubscribeSDP = wsClient.subscribe('call.webrtc.sdp', async (event: SDPEvent) => {
      const pc = peerConnection;
      if (!pc) return;

      if (event.type === 'offer') {
        await pc.setRemoteDescription({ type: 'offer', sdp: event.sdp });
        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);
        
        wsClient.send('call.webrtc.sdp', {
          callId: event.callId,
          sdp: answer.sdp,
          type: 'answer'
        });
      } else if (event.type === 'answer') {
        await pc.setRemoteDescription({ type: 'answer', sdp: event.sdp });
      }
    });

    const unsubscribeICE = wsClient.subscribe('call.webrtc.ice', async (event: ICEEvent) => {
      const pc = peerConnection;
      if (pc && event.candidate) {
        await pc.addIceCandidate(new RTCIceCandidate(event.candidate));
      }
    });

    return () => {
      unsubscribeRing();
      unsubscribeState();
      unsubscribeSDP();
      unsubscribeICE();
    };
  }, [peerConnection, setIncomingCall, setCallStatus, clearCall]);

  // Mutations
  const startCallMutation = useMutation({
    mutationFn: callAPI.startCall,
    onSuccess: () => {
      setCallStatus('calling');
    }
  });

  const acceptCallMutation = useMutation({
    mutationFn: callAPI.acceptCall,
    onSuccess: async (result) => {
      if (incomingCall) {
        await setupWebRTC(result.call._id, false);
        setActiveCall({
          callId: result.call._id,
          peerId: incomingCall.caller.id,
          peerName: incomingCall.caller.name,
          startedAt: new Date(),
          isMuted: false
        });
        setIncomingCall(null);
        setCallStatus('connected');
      }
    }
  });

  const declineCallMutation = useMutation({
    mutationFn: callAPI.declineCall,
    onSuccess: () => {
      clearCall();
    }
  });

  const cancelCallMutation = useMutation({
    mutationFn: callAPI.cancelCall,
    onSuccess: () => {
      clearCall();
    }
  });

  const endCallMutation = useMutation({
    mutationFn: ({ callId, reason }: { callId: string; reason?: 'hangup' | 'failed' }) => 
      callAPI.endCall(callId, reason),
    onSuccess: () => {
      clearCall();
    }
  });

  const setupWebRTC = async (callId: string, isInitiator: boolean): Promise<RTCPeerConnection> => {
    try {
      // Get user media
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
      setLocalStream(stream);

      // Create peer connection
      const pc = new RTCPeerConnection({ iceServers: ICE_SERVERS });
      setPeerConnection(pc);

      // Add local stream
      stream.getTracks().forEach(track => {
        pc.addTrack(track, stream);
      });

      // Handle remote stream
      pc.ontrack = (event) => {
        const remoteAudio = new Audio();
        remoteAudio.srcObject = event.streams[0];
        remoteAudio.play();
      };

      // Handle ICE candidates
      pc.onicecandidate = (event) => {
        if (event.candidate) {
          wsClient.send('call.webrtc.ice', {
            callId,
            candidate: event.candidate.toJSON()
          });
        }
      };

      // If initiator, create offer
      if (isInitiator) {
        const offer = await pc.createOffer();
        await pc.setLocalDescription(offer);
        
        wsClient.send('call.webrtc.sdp', {
          callId,
          sdp: offer.sdp,
          type: 'offer'
        });
      }

      return pc;
    } catch (error) {
      console.error('Error setting up WebRTC:', error);
      throw error;
    }
  };

  const startCall = async (calleeId: string, calleeName: string) => {
    try {
      const call = await startCallMutation.mutateAsync(calleeId);
      await setupWebRTC(call._id, true);
      
      setActiveCall({
        callId: call._id,
        peerId: calleeId,
        peerName: calleeName,
        startedAt: new Date(),
        isMuted: false
      });
    } catch (error) {
      console.error('Failed to start call:', error);
      clearCall();
    }
  };

  const acceptCall = () => {
    if (incomingCall) {
      acceptCallMutation.mutate(incomingCall.callId);
    }
  };

  const declineCall = () => {
    if (incomingCall) {
      declineCallMutation.mutate(incomingCall.callId);
    }
  };

  const cancelCall = () => {
    if (activeCall && callStatus === 'calling') {
      cancelCallMutation.mutate(activeCall.callId);
    }
  };

  const endCall = () => {
    if (activeCall) {
      endCallMutation.mutate({ callId: activeCall.callId, reason: 'hangup' });
    }
  };

  return {
    incomingCall,
    activeCall,
    callStatus,
    startCall,
    acceptCall,
    declineCall,
    cancelCall,
    endCall,
    toggleMute,
    isInCall: !!activeCall,
    isReceivingCall: !!incomingCall
  };
};