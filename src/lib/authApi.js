import axios from "axios";

const BASE =
  import.meta.env.VITE_API_BASE_URL ||
  import.meta.env.VITE_API_BASE ||
  "https://uzbekdoner.adminsite.uz";

const authClient = axios.create({
  baseURL: BASE,
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
