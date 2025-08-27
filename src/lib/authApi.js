import axios from "axios";

const authClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  timeout: 15000,
});

export const AuthAPI = {
  login: async ({
    username,
    password,
    client_id = "string",
    client_secret = "",
  }) => {
    const body = new URLSearchParams({
      grant_type: "password",
      username,
      password,
      scope: "",
      client_id,
      client_secret,
    });
    const r = await authClient.post("/token", body, {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        accept: "application/json",
      },
    });
    return r.data; // { access_token, token_type }
  },
};
