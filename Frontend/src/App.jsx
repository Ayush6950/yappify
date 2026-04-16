import { Navigate, Route, Routes } from "react-router";
import ChatPage from "../pages/ChatPage";
import LoginPage from "../pages/LoginPage";
import SignUpPage from "../pages/SignUpPage";
import { useAuthStore } from "../store/useauthstore";
import { useEffect } from "react";
import PageLoader from "../components/PageLoader";

import { Toaster } from "react-hot-toast";

function App() {
  const { checkAuth, isCheckingAuth, authUser } = useAuthStore();

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  if (isCheckingAuth) return <PageLoader />;

  return (

 <div className="min-h-screen bg-slate-950 relative flex items-center justify-center p-4 overflow-hidden">
    <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_50%,#ffffff05_0%,transparent_50%)]" />
    <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_80%,#ffffff08_0%,transparent_50%)]" />
    <div className="absolute -top-32 left-1/4 size-96 bg-violet-600 opacity-20 blur-[120px]" />
    <div className="absolute -bottom-40 right-1/4 size-96 bg-blue-600 opacity-20 blur-[130px]" />
    <div className="absolute top-1/3 -right-32 size-80 bg-indigo-500 opacity-15 blur-[100px]" />
    <div className="absolute bottom-1/3 -left-32 size-80 bg-cyan-500 opacity-15 blur-[110px]" />



        <Routes>
       <Route path = "/" element = {  authUser ? <ChatPage /> :<Navigate to={"/login"} />} />
       <Route path = "/login" element = {!authUser ? <LoginPage /> : <Navigate to = {"/"}/>}/>
         <Route path = "/signup" element = {!authUser ? <SignUpPage /> : <Navigate to = {"/"}/>}/>
      </Routes>
    </div>


  );
}
export default App; 