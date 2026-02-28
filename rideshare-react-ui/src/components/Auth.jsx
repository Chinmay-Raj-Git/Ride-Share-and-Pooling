import { useState } from "react";
import { apiRequest } from "../api";

export default function Auth({ setIsLoggedIn }) {

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const login = async () => {
        try {
            const token = await apiRequest(
                "/api/auth/login",
                "POST",
                { email, password }
            ).then(res => res.text());
            console.log("Received token:", token);

            localStorage.setItem("token", token);
            getProfile();
        } catch (err) {
            alert(err);
        }
    };

    const register = async () => {
        try {
            await apiRequest(
                "/api/auth/register",
                "POST",
                { email, password }
            );

            alert("Registered. Now login.");
        } catch (err) {
            alert("Register failed");
        }
    };

    const [user, setUser] = useState(null);
    const getProfile = async () => {
        try{
            await apiRequest("/api/profile").then(res => res.json()).then(json => {
                console.log("Profile data:", json);
                setUser(json);
            });
        } catch (err) {
            alert("Failed to get profile");
        }
    }

    return (
        <div className="">
            <h2>Auth</h2>
            <input placeholder="Email" onChange={e => setEmail(e.target.value)} />
            <input placeholder="Password" type="password"
                   onChange={e => setPassword(e.target.value)} />
            <button onClick={login}>Login</button>
            <button onClick={register}>Register</button>

            <div className="flex flex-col gap-2">
                <span>Current User: {localStorage.getItem("token") ? "Logged In" : "Not Logged In"}</span>
                <span>User Email: {user ? user.email : "N/A"}</span>
                <span>User Name: {user ? user.name : "N/A"}</span>
                <span>User Contact: {user ? user.contact : "N/A"}</span>
            </div>
        </div>
    );
}