import axios from 'axios ';

export const axiosInstance = axios.create({
    baseURL:import.meta.env.MODE === "dvelopment" ? "http://localhost:5000" : "/api",
    withCredentials:true,
})