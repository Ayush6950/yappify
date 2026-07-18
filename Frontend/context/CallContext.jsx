import { createContext, useContext, useState } from "react";

const CallContext = createContext();

export const CallProvider = ({ children }) => {
  const [incomingCall, setIncomingCall] = useState(null);
  const [callAccepted, setCallAccepted] = useState(false);
  const [callEnded, setCallEnded] = useState(false);
  const [localStream, setLocalStream] = useState(null);
  const [remoteStream, setRemoteStream] = useState(null);

  return (
    <CallContext.Provider
      value={{
        incomingCall,
        setIncomingCall,

        callAccepted,
        setCallAccepted,

        callEnded,
        setCallEnded,

        localStream,
        setLocalStream,

        remoteStream,
        setRemoteStream,
      }}
    >
      {children}
    </CallContext.Provider>
  );
};

export const useCall = () => useContext(CallContext);