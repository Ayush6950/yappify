import { useAuthStore } from "../store/useAuthStore";
import { useCallStore } from "../store/useCallStore";

import {
  startLocalStream,
  createPeerConnection,
  createOffer,
  createAnswer,
  endCall as endWebRTCCall,
} from "./webrtc";

/**
 * Start Voice / Video Call
 */
export const startCall = async (user, callType = "video") => {
  try {
    const socket = useAuthStore.getState().socket;

    if (!socket) {
      throw new Error("Socket not connected");
    }

    // Start local media
    await startLocalStream(callType === "video");

    // Create Peer Connection
    createPeerConnection(socket, user._id);

    // Create Offer
    const offer = await createOffer();

    // Update Store
    useCallStore.getState().startCall({
      user,
      callType,
    });

    // Notify Receiver
    socket.emit("call-user", {
      to: user._id,
      offer,
      callType,
    });

  } catch (err) {
    console.error("Start Call Error:", err);
  }
};

/**
 * Accept Incoming Call
 */
export const acceptCall = async () => {
  try {
    const socket = useAuthStore.getState().socket;

    const incomingCall = useCallStore.getState().incomingCall;

    if (!incomingCall) return;

    // Start Camera/Mic
    await startLocalStream(
      incomingCall.callType === "video"
    );

    // Create Peer Connection
    createPeerConnection(
      socket,
      incomingCall.from._id
    );

    // Create WebRTC Answer
    const answer = await createAnswer(
      incomingCall.offer
    );

    // Send Answer
    socket.emit("accept-call", {
      to: incomingCall.from._id,
      answer,
    });

    useCallStore.getState().acceptCall();

  } catch (err) {
    console.error(err);
  }
};

/**
 * Reject Incoming Call
 */
export const rejectCall = () => {
  const socket = useAuthStore.getState().socket;

  const incomingCall =
    useCallStore.getState().incomingCall;

  if (!incomingCall) return;

  socket.emit("reject-call", {
    to: incomingCall.from._id,
  });

  useCallStore.getState().rejectCall();
};

/**
 * End Current Call
 */
export const endCurrentCall = () => {
  const socket = useAuthStore.getState().socket;

  const activeCall =
    useCallStore.getState().activeCall;

  if (activeCall) {
    socket.emit("end-call", {
      to: activeCall._id,
    });
  }

  endWebRTCCall();
};