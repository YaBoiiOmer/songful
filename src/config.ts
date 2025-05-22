import axios from "axios";
import { unstable_cache } from "next/cache";
import { SpotifyApi } from "@spotify/web-api-ts-sdk";

export const APP_CONFIG = {
  outputDir: "./songs",
  songDuration: 30,
};

const getBearerToken = unstable_cache(
  async () => {
    const client_id = process.env.SPOTIFY_CLIENT_ID;
    const client_secret = process.env.SPOTIFY_CLIENT_SECRET;

    const response = await axios
      .post(
        "https://accounts.spotify.com/api/token",
        new URLSearchParams({
          grant_type: "client_credentials",
        }),
        {
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
            Authorization: "Basic " + Buffer.from(client_id + ":" + client_secret).toString("base64"),
          },
        }
      )
      .catch((error) => {
        if (error.response) {
          console.error(error.response.data);
        }
      });

    if (!response?.data?.access_token) {
      throw new Error("Failed to get access token");
    }

    return response.data.access_token;
  },
  ["spotify-bearer-token"],
  { revalidate: 3600 }
);

export const spotify = SpotifyApi.withClientCredentials(
  process.env.SPOTIFY_CLIENT_ID!,
  process.env.SPOTIFY_CLIENT_SECRET!
);
