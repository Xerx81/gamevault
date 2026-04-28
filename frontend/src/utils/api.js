// src/utils/api.js - All API calls to Flask backend

const BASE = "https://gameshelf.pythonanywhere.com/api";

function getToken() {
    return localStorage.getItem("gv_token");
}

function authHeaders() {
    return {
        "Content-Type": "application/json",
        Authorization: `Bearer ${getToken()}`,
    };
}

async function handleResponse(res) {
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Request failed");
    return data;
}

export const api = {
    signup: (username, email, password) =>
        fetch(`${BASE}/auth/signup`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username, email, password }),
        }).then(handleResponse),

    login: (email, password) =>
        fetch(`${BASE}/auth/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password }),
        }).then(handleResponse),

    me: () =>
        fetch(`${BASE}/auth/me`, { headers: authHeaders() }).then(handleResponse),

    getGames: () =>
        fetch(`${BASE}/games`, { headers: authHeaders() }).then(handleResponse),

    addGame: (game) =>
        fetch(`${BASE}/games`, {
            method: "POST",
            headers: authHeaders(),
            body: JSON.stringify(game),
        }).then(handleResponse),

    updateGame: (id, game) =>
        fetch(`${BASE}/games/${id}`, {
            method: "PUT",
            headers: authHeaders(),
            body: JSON.stringify(game),
        }).then(handleResponse),

    deleteGame: (id) =>
        fetch(`${BASE}/games/${id}`, {
            method: "DELETE",
            headers: authHeaders(),
        }).then(handleResponse),

    searchIGDB: (query) =>
        fetch(`${BASE}/games/search?q=${encodeURIComponent(query)}`, {
            headers: authHeaders() 
        }).then(handleResponse),
};
