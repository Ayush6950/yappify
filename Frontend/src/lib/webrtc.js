import { useCallStore } from "../store/useCallStore";

const configuration = {
  iceServers: [
    {
      urls: "stun:stun.l.google.com:19302",
    },
  ],
};

let peerConnection = null;

export const createPeerConnection = (socket, remoteUserId) => {
  if (peerConnection) {
    peerConnection.close();
  }

  peerConnection = new RTCPeerConnection(configuration);

  useCallStore.getState().setPeerConnection(peerConnection);

  // Local Tracks
  const localStream = useCallStore.getState().localStream;

  if (localStream) {
    localStream.getTracks().forEach((track) => {
      peerConnection.addTrack(track, localStream);
    });
  }

  // Remote Stream
  const remoteStream = new MediaStream();

  useCallStore.getState().setRemoteStream(remoteStream);

  peerConnection.ontrack = (event) => {
    event.streams[0].getTracks().forEach((track) => {
      remoteStream.addTrack(track);
    });
  };

  // ICE Candidate
  peerConnection.onicecandidate = (event) => {
    if (event.candidate) {
      socket.emit("ice-candidate", {
        to: remoteUserId,
        candidate: event.candidate,
      });
    }
  };

  return peerConnection;
};

export const startLocalStream = async (video = true) => {
  const stream = await navigator.mediaDevices.getUserMedia({
    video,
    audio: true,
  });

  useCallStore.getState().setLocalStream(stream);

  return stream;
};

export const createOffer = async () => {
  const offer = await peerConnection.createOffer();

  await peerConnection.setLocalDescription(offer);

  return offer;
};

export const createAnswer = async (offer) => {
  await peerConnection.setRemoteDescription(
    new RTCSessionDescription(offer)
  );

  const answer = await peerConnection.createAnswer();

  await peerConnection.setLocalDescription(answer);

  return answer;
};

export const setRemoteAnswer = async (answer) => {
  await peerConnection.setRemoteDescription(
    new RTCSessionDescription(answer)
  );
};

export const addIceCandidate = async (candidate) => {
  if (!peerConnection) return;

  try {
    await peerConnection.addIceCandidate(
      new RTCIceCandidate(candidate)
    );
  } catch (err) {
    console.error(err);
  }
};

export const endCall = () => {
  const { localStream, peerConnection } = useCallStore.getState();

  if (localStream) {
    localStream.getTracks().forEach((track) => track.stop());
  }

  if (peerConnection) {
    peerConnection.close();
  }

  useCallStore.getState().endCall();
};