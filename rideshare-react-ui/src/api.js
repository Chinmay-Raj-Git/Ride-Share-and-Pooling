const BASE_URL = "http://localhost:8080";

export const apiRequest = async (endpoint, method = "GET", body = null) => {

    const token = localStorage.getItem("token");

    const options = {
        method,
        headers: {
            "Content-Type": "application/json",
            ...(token && { Authorization: `Bearer ${token}` })
        },
        ...(body && { body: JSON.stringify(body) })
    };
    console.log("API REQUEST FOR "+endpoint);
    console.log(options)

    const response = await fetch(`${BASE_URL}${endpoint}`, options);

    if (!response.ok) {
        throw new Error("Request failed");
    }

    return response;
};