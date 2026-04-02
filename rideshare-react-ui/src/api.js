const BASE_URL = "http://localhost:8080";

export const apiRequest = async (endpoint, method = "GET", body = null) => {
    const token = localStorage.getItem("token");

    const options = {
        method,
        headers: {
            "Content-Type": "application/json",
            ...(token && { Authorization: `Bearer ${token}` }),
        },
        ...(body && { body: JSON.stringify(body) }),
    };

    // Return the raw response — callers must check res.ok themselves
    return fetch(`${BASE_URL}${endpoint}`, options);
};
