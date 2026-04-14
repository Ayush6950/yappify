import { create } from "zustand";

export const UseAuthStore = create((set) => ({
  authUser: { name: "Ayush", _id: 123, age: 20 },
  isLoggedIn: false,
  isloading:false,

  login: () => {
    console.log("we just logged in");
    set({ isLoggedIn: true  , isloading:true});
  },
}));