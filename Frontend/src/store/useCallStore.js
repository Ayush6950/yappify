import { create } from "zustand";
import { useAuthStore } from "./useAuthStore";

const ICE_SERVERS = {
  iceServers: [
    {
      urls: [
        "stun:stun.l.google.com:19302",
        "stun:stun1.l.google.com:19302",
      ],
    },
  ],
};

export const useCallStore = create((set, get) => ({
  // ==========================
  // Call Information
  // ==========================

  incomingCall: null,
  activeCall: null,

  // ==========================
  // Media Streams
  // ==========================

  localStream: null,
  remoteStream: null,

  // ==========================
  // WebRTC
  // ==========================

  peerConnection: null,
  iceCandidatesQueue: [],

  // ==========================
  // Call State
  // ==========================
  isConnecting: false,
  isCalling: false,
  callAccepted: false,
  callEnded: false,

  // "voice" | "video"
  callType: null,
  caller: null,

  // ==========================
  // Media Controls
  // ==========================

  isMuted: false,
  isVideoEnabled: true,
  isScreenSharing: false,

  // ==========================
  // WebRTC Initialization
  // ==========================

  initializePeerConnection: () => {
    try {
      const peer = new RTCPeerConnection(ICE_SERVERS);

      // Listen for ICE candidates
      peer.onicecandidate = (event) => {
        if (event.candidate) {
          const { socket } = useAuthStore.getState();
          const { activeCall, incomingCall } = get();
          const targetId = activeCall?._id || activeCall?.id || incomingCall?.from?.id;

          if (socket && targetId) {
            socket.emit("ice-candidate", {
              to: targetId,
              candidate: event.candidate,
            });
          }
        }
      };

      // Receive remote stream
      peer.ontrack = (event) => {
        console.log("Remote track received:", event.track.kind);
        set({
          remoteStream: event.streams[0],
        });
      };

      // Handle connection state changes
      peer.onconnectionstatechange = () => {
        console.log("Connection state:", peer.connectionState);
      };

      set({
        peerConnection: peer,
      });

      return peer;
    } catch (error) {
      console.error("Error initializing peer connection:", error);
      throw error;
    }
  },

  // ==========================
  // Get Local Stream
  // ==========================

  getLocalStream: async (callType) => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: callType === "video",
      });

      set({
        localStream: stream,
      });

      return stream;
    } catch (error) {
      console.error("Error getting local stream:", error);
      throw error;
    }
  },

  // ==========================
  // Incoming Call
  // ==========================

  setIncomingCall: (call) =>
    set({
      incomingCall: call,
      callEnded: false,
      caller: call.from,
      callType: call.callType,
    }),

  clearIncomingCall: () =>
    set({
      incomingCall: null,
      caller: null,
    }),

  // ==========================
  // Outgoing Call
  // ==========================

  startCall: async ({ user, callType }) => {
    const { socket } = useAuthStore.getState();
    const targetId = user._id || user.id;

    try {
      set({
        isConnecting: true,
        activeCall: user,
        isCalling: true,
        callAccepted: false,
        callEnded: false,
        callType,
      });

      // Step 0: Notify receiver of incoming call
      if (socket) {
        socket.emit("call-user", {
          to: targetId,
          callType,
        });
      }

      // Step 1: Create Peer Connection
      const peer = get().initializePeerConnection();

      // Step 2: Get Camera/Mic
      const stream = await get().getLocalStream(callType);

      // Step 3: Add Tracks
      stream.getTracks().forEach((track) => {
        peer.addTrack(track, stream);
      });

      // Step 4: Create Offer
      const offer = await peer.createOffer();

      // Step 5: Set Local Description
      await peer.setLocalDescription(offer);

      // Step 6: Emit Offer
      if (socket) {
        socket.emit("webrtc-offer", {
          to: targetId,
          offer: offer,
          callType,
        });
      }

      set({
        isConnecting: false,
      });
    } catch (error) {
      console.error("Error starting call:", error);
      set({
        isConnecting: false,
        isCalling: false,
        activeCall: null,
      });
      throw error;
    }
  },

  // ==========================
  // Accept Call
  // ==========================

  acceptCall: async () => {
    const { socket } = useAuthStore.getState();
    const { incomingCall, callType } = get();

    if (!incomingCall) return;

    try {
      set({
        isConnecting: true,
      });

      // Step 1: Get Camera/Mic
      const stream = await get().getLocalStream(callType || incomingCall.callType || "video");

      // Step 2: Create Peer
      const peer = get().initializePeerConnection();

      // Step 3: Add Tracks
      stream.getTracks().forEach((track) => {
        peer.addTrack(track, stream);
      });

      // Step 3.5: Set Remote Description (from stored offer)
      if (incomingCall.offer) {
        await peer.setRemoteDescription(
          new RTCSessionDescription(incomingCall.offer)
        );
        // Process any queued ICE candidates
        await get().processIceCandidatesQueue();
      }

      // Step 4: Create Answer
      const answer = await peer.createAnswer();

      // Step 5: Set Local Description
      await peer.setLocalDescription(answer);

      // Step 6: Emit Answer via accept-call
      socket.emit("accept-call", {
        to: incomingCall.from.id,
        answer: answer,
      });

      set({
        activeCall: incomingCall.from, // Set to standard user object for consistency
        incomingCall: null,
        callAccepted: true,
        isCalling: false,
        callEnded: false,
        isConnecting: false,
        callType: callType || incomingCall.callType || "video",
      });
    } catch (error) {
      console.error("Error accepting call:", error);
      set({
        isConnecting: false,
      });
      throw error;
    }
  },

  // ==========================
  // Reject Call
  // ==========================

  rejectCall: () => {
    const { socket } = useAuthStore.getState();
    const { incomingCall } = get();

    if (socket && incomingCall) {
      socket.emit("reject-call", {
        to: incomingCall.from.id,
      });
    }

    set({
      incomingCall: null,
      caller: null,
      isCalling: false,
    });
  },

  // ==========================
  // End Call
  // ==========================

  endCall: () => {
    const { socket } = useAuthStore.getState();
    const { localStream, remoteStream, peerConnection, activeCall, incomingCall } = get();

    // Stop all tracks
    localStream?.getTracks().forEach((track) => track.stop());
    remoteStream?.getTracks().forEach((track) => track.stop());

    // Close peer connection
    peerConnection?.close();

    // Emit end-call event
    if (socket) {
      const targetId = activeCall?._id || activeCall?.id || incomingCall?.from?.id;
      if (targetId) {
        socket.emit("end-call", { to: targetId });
      }
    }

    set({
      incomingCall: null,
      activeCall: null,

      localStream: null,
      remoteStream: null,

      peerConnection: null,
      iceCandidatesQueue: [],

      isCalling: false,
      callAccepted: false,
      callEnded: true,

      callType: null,

      isConnecting: false,
      isMuted: false,
      isVideoEnabled: true,
      isScreenSharing: false,
      caller: null,
    });
  },

  // ==========================
  // Streams
  // ==========================

  setLocalStream: (stream) =>
    set({
      localStream: stream,
    }),

  setRemoteStream: (stream) =>
    set({
      remoteStream: stream,
    }),

  clearStreams: () =>
    set({
      localStream: null,
      remoteStream: null,
    }),

  // ==========================
  // Peer Connection
  // ==========================

  setPeerConnection: (peerConnection) =>
    set({
      peerConnection,
    }),

  clearPeerConnection: () =>
    set({
      peerConnection: null,
    }),

  // ==========================
  // Handle WebRTC Signals
  // ==========================

  handleOffer: async (offerData) => {
    set((state) => ({
      incomingCall: state.incomingCall
        ? { ...state.incomingCall, offer: offerData.offer }
        : { from: offerData.from, callType: offerData.callType, offer: offerData.offer },
      callType: offerData.callType,
      caller: offerData.from,
    }));

    const { peerConnection } = get();
    try {
      if (peerConnection && !peerConnection.remoteDescription) {
        await peerConnection.setRemoteDescription(
          new RTCSessionDescription(offerData.offer)
        );
        await get().processIceCandidatesQueue();
      }
    } catch (error) {
      console.error("Error setting remote description in handleOffer:", error);
    }
  },

  handleAnswer: async (answer) => {
    const { peerConnection } = get();

    try {
      if (
        peerConnection &&
        peerConnection.signalingState === "have-local-offer"
      ) {
        await peerConnection.setRemoteDescription(
          new RTCSessionDescription(answer)
        );
        await get().processIceCandidatesQueue();

        set({
          callAccepted: true,
          isCalling: false,
          isConnecting: false,
        });
      }
    } catch (error) {
      console.error("Error handling answer:", error);
    }
  },

  handleCallAccepted: async (data) => {
    await get().handleAnswer(data.answer);
  },

  handleCallRejected: () => {
    get().endCall();
  },

  handleIceCandidate: async (candidate) => {
    const { peerConnection } = get();

    try {
      if (peerConnection && peerConnection.remoteDescription && peerConnection.remoteDescription.type) {
        await peerConnection.addIceCandidate(
          new RTCIceCandidate(candidate)
        );
      } else {
        set((state) => ({
          iceCandidatesQueue: [...state.iceCandidatesQueue, candidate],
        }));
      }
    } catch (error) {
      console.error("Error adding ICE candidate:", error);
    }
  },

  processIceCandidatesQueue: async () => {
    const { peerConnection, iceCandidatesQueue } = get();
    if (!peerConnection || !peerConnection.remoteDescription) return;

    for (const candidate of iceCandidatesQueue) {
      try {
        await peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
      } catch (error) {
        console.error("Error applying queued ICE candidate:", error);
      }
    }

    set({ iceCandidatesQueue: [] });
  },

  // ==========================
  // Media Controls
  // ==========================

  toggleMute: () => {
    const { localStream, isMuted } = get();

    if (localStream) {
      localStream.getAudioTracks().forEach((track) => {
        track.enabled = isMuted; // If muted, enable; if not muted, disable
      });
    }

    set({
      isMuted: !isMuted,
    });
  },

  toggleVideo: () => {
    const { localStream, isVideoEnabled } = get();

    if (localStream) {
      localStream.getVideoTracks().forEach((track) => {
        track.enabled = !isVideoEnabled;
      });
    }

    set({
      isVideoEnabled: !isVideoEnabled,
    });
  },

  setScreenSharing: (value) =>
    set({
      isScreenSharing: value,
    }),

  // ==========================
  // Screen Share
  // ==========================

  startScreenShare: async () => {
    const { peerConnection, localStream } = get();

    try {
      const displayStream = await navigator.mediaDevices.getDisplayMedia({
        video: true,
        audio: false,
      });

      const screenTrack = displayStream.getVideoTracks()[0];

      // Replace video track with screen track
      const videoTrack = localStream?.getVideoTracks()[0];
      if (videoTrack && peerConnection) {
        const sender = peerConnection
          .getSenders()
          .find((s) => s.track?.kind === "video");

        if (sender) {
          await sender.replaceTrack(screenTrack);
        }
      }

      set({
        isScreenSharing: true,
      });

      // Handle when user stops sharing screen
      screenTrack.onended = () => {
        get().stopScreenShare();
      };

      return displayStream;
    } catch (error) {
      console.error("Error starting screen share:", error);
      throw error;
    }
  },

  stopScreenShare: async () => {
    const { peerConnection, localStream } = get();

    try {
      const videoTrack = localStream?.getVideoTracks()[0];
      if (videoTrack && peerConnection) {
        const sender = peerConnection
          .getSenders()
          .find((s) => s.track?.kind === "video");

        if (sender) {
          await sender.replaceTrack(videoTrack);
        }
      }

      set({
        isScreenSharing: false,
      });
    } catch (error) {
      console.error("Error stopping screen share:", error);
    }
  },

  // ==========================
  // Reset Everything
  // ==========================

  resetCall: () =>
    set({
      incomingCall: null,
      activeCall: null,

      localStream: null,
      remoteStream: null,

      peerConnection: null,

      isCalling: false,
      callAccepted: false,
      callEnded: false,

      callType: null,

      isConnecting: false,
      isMuted: false,
      isVideoEnabled: true,
      isScreenSharing: false,
      caller: null,
    }),
}));