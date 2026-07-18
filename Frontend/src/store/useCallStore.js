import { create } from "zustand";

export const useCallStore = create((set) => ({
  // Incoming call information
  incomingCall: null,

  // Current active call
  activeCall: null,

  // Local & remote media streams
  localStream: null,
  remoteStream: null,

  // Call states
  callAccepted: false,
  callEnded: false,
  isCalling: false,
  callType: null, // "voice" | "video"

  // -------------------------
  // Actions
  // -------------------------

  setIncomingCall: (call) =>
    set({
      incomingCall: call,
    }),

  clearIncomingCall: () =>
    set({
      incomingCall: null,
    }),

  startCall: ({ user, callType }) =>
    set({
      activeCall: user,
      isCalling: true,
      callAccepted: false,
      callEnded: false,
      callType,
    }),

  acceptCall: () =>
    set({
      callAccepted: true,
      isCalling: false,
      incomingCall: null,
    }),

  rejectCall: () =>
    set({
      incomingCall: null,
      isCalling: false,
    }),

  endCall: () =>
    set({
      activeCall: null,
      localStream: null,
      remoteStream: null,
      callAccepted: false,
      callEnded: true,
      isCalling: false,
      callType: null,
    }),

  setLocalStream: (stream) =>
    set({
      localStream: stream,
    }),

  setRemoteStream: (stream) =>
    set({
      remoteStream: stream,
    }),
}));