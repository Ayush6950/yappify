import{ Routes, Route} from "react-router-dom";
import ChatPage from "../pages/ChatPage";
import LoginPage from"../pages/LoginPage";
import "./index.css";
import SignUpPage from "../pages/SignUpPage";
import {UseAuthStore} from "../store/UseAuthStore";
function App() {
 
const authUser = UseAuthStore((state) => state.authUser);
const isLoggedIn = UseAuthStore((state) => state.isLoggedIn);
const login = UseAuthStore((state) => state.login);
  return (

 <div className="min-h-screen bg-slate-950 relative flex items-center justify-center p-4 overflow-hidden">
    <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_50%,#ffffff05_0%,transparent_50%)]" />
    <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_80%,#ffffff08_0%,transparent_50%)]" />
    <div className="absolute -top-32 left-1/4 size-96 bg-violet-600 opacity-20 blur-[120px]" />
    <div className="absolute -bottom-40 right-1/4 size-96 bg-blue-600 opacity-20 blur-[130px]" />
    <div className="absolute top-1/3 -right-32 size-80 bg-indigo-500 opacity-15 blur-[100px]" />
    <div className="absolute bottom-1/3 -left-32 size-80 bg-cyan-500 opacity-15 blur-[110px]" />

    <button onClick={login}  className = "z-10"> Login</button>

         <Routes>
       <Route path = "/" element = {<ChatPage/>} />
       <Route path = "/login" element = {<LoginPage />}/>
       <Route path = "/signup" element = {<SignUpPage />}/>
      </Routes>
    </div>
  );
}
export default App; 