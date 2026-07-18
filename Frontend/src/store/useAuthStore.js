import { create } from "zustand";
import { axiosInstance } from "../lib/axios";
import toast from "react-hot-toast";
import { io } from "socket.io-client";
import { useCallStore } from "./useCallStore";

const BASE_URL =
  import.meta.env.MODE === "development"
    ? "http://localhost:5000"
    : "/";

export const useAuthStore = create((set, get) => ({
  // =========================
  // State
  // =========================
  authUser: null,
  socket: null,
  onlineUsers: [],

  isCheckingAuth: true,
  isSigningUp: false,
  isLoggingIn: false,
  isUpdatingProfile: false,

  // =========================
  // Check Authentication
  // =========================
  checkAuth: async () => {
    try {
      const res = await axiosInstance.get("/auth/check");

      set({
        authUser: res.data,
      });

      get().connectSocket();
    } catch (error) {
      console.log("Auth Check Error:", error);

      set({
        authUser: null,
      });
    } finally {
      set({
        isCheckingAuth: false,
      });
    }
  },

  // =========================
  // Signup
  // =========================
  signup: async (data) => {
    set({
      isSigningUp: true,
    });

    try {
      const res = await axiosInstance.post("/auth/signup", data);

      set({
        authUser: res.data,
      });

      toast.success("Account created successfully");

      get().connectSocket();
    } catch (error) {
      toast.error(
        error?.response?.data?.message || "Signup failed"
      );
    } finally {
      set({
        isSigningUp: false,
      });
    }
  },

  // =========================
  // Login
  // =========================
  login: async (data) => {
    set({
      isLoggingIn: true,
    });

    try {
      const res = await axiosInstance.post("/auth/login", data);

      set({
        authUser: res.data,
      });

      toast.success("Logged in successfully");

      get().connectSocket();
    } catch (error) {
      toast.error(
        error?.response?.data?.message || "Login failed"
      );
    } finally {
      set({
        isLoggingIn: false,
      });
    }
  },

  // =========================
  // Logout
  // =========================
  logout: async () => {
    try {
      await axiosInstance.post("/auth/logout");

      get().disconnectSocket();

      set({
        authUser: null,
      });

      toast.success("Logged out successfully");
    } catch (error) {
      console.log(error);

      toast.error(
        error?.response?.data?.message || "Logout failed"
      );
    }
  },

  // =========================
  // Update Profile
  // =========================
  updateProfile: async (data) => {
    set({
      isUpdatingProfile: true,
    });

    try {
      const res = await axiosInstance.put(
        "/auth/update-profile",
        data
      );

      set({
        authUser: res.data,
      });

      toast.success("Profile updated successfully");
    } catch (error) {
      console.log(error);

      toast.error(
        error?.response?.data?.message ||
          "Failed to update profile"
      );
    } finally {
      set({
        isUpdatingProfile: false,
      });
    }
  },

  // =========================
  // Socket Connection
  // =========================
  connectSocket: () => {
    const { authUser, socket } = get();

    if (!authUser) return;

    if (socket?.connected) return;

    const newSocket = io(BASE_URL, {
      withCredentials: true,
      autoConnect: false,
    });

    newSocket.connect();

    set({
      socket: newSocket,
    });

    // =========================
    // Connection Events
    // =========================

    newSocket.on("connect", () => {
      console.log("✅ Socket Connected:", newSocket.id);
    });

    newSocket.on("disconnect", (reason) => {
      console.log("❌ Socket Disconnected:", reason);
    });

    newSocket.on("connect_error", (err) => {
      console.log("Socket Error:", err.message);
    });

    // =========================
    // Online Users
    // =========================

    newSocket.on("getOnlineUsers", (users) => {
      set({
        onlineUsers: users,
      });
    });

    // =========================
    // Incoming Call
    // =========================

    newSocket.on("incoming-call", (callData) => {
      console.log("Incoming Call");

      useCallStore.getState().setIncomingCall(callData);
    });

    // =========================
    // Call Accepted
    // =========================

    newSocket.on("call-accepted", (data) => {
      console.log("Call Accepted");

      if (useCallStore.getState().handleCallAccepted) {
        useCallStore.getState().handleCallAccepted(data);
      }
    });

    // =========================
    // Call Rejected
    // =========================

    newSocket.on("call-rejected", () => {
      console.log("Call Rejected");

      if (useCallStore.getState().handleCallRejected) {
        useCallStore.getState().handleCallRejected();
      }
    });

    // =========================
    // Call Ended
    // =========================

    newSocket.on("call-ended", () => {
      console.log("Call Ended");

      if (useCallStore.getState().endCall) {
        useCallStore.getState().endCall();
      }
    });

    // =========================
    // WebRTC Offer
    // =========================

    newSocket.on("webrtc-offer", (data) => {
      console.log("Received Offer");

      if (useCallStore.getState().handleOffer) {
        useCallStore.getState().handleOffer(data);
      }
    });

    // =========================
    // WebRTC Answer
    // =========================

    newSocket.on("webrtc-answer", (answer) => {
      console.log("Received Answer");

      if (useCallStore.getState().handleAnswer) {
        useCallStore.getState().handleAnswer(answer);
      }
    });

    // =========================
    // ICE Candidate
    // =========================

    newSocket.on("ice-candidate", (candidate) => {
      console.log("Received ICE Candidate");

      if (useCallStore.getState().handleIceCandidate) {
        useCallStore.getState().handleIceCandidate(candidate);
      }
    });
  },

  // =========================
  // Disconnect Socket
  // =========================

  disconnectSocket: () => {
    const socket = get().socket;

    if (!socket) return;

    socket.removeAllListeners();

    socket.disconnect();

    set({
      socket: null,
      onlineUsers: [],
    });
  },
}));