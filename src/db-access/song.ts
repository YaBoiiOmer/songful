import { CreateSong, Song } from "@/types/song";
import { Artist } from "@/types/artist";
import db from "../db";

const includeArtists = { include: { artists: { include: { artist: true } } } };

const mapArtistToSong = (song: any | null) => {
  if (!song) return null;
  return {
    ...song,
    artists: song.artists.map((rel: any) => rel.artist),
  };
};

export async function createSong(song: CreateSong): Promise<Song> {
  const createdSong = await db.song.create({
    data: {
      ...song,
      addedAt: new Date(),
      artists: {
        create: song.artists.map((artist: Artist) => ({
          artist: {
            connectOrCreate: {
              where: { id: artist.id },
              create: {
                id: artist.id,
                name: artist.name,
              },
            },
          },
        })),
      },
    },
    ...includeArtists,
  });

  return mapArtistToSong(createdSong);
}

export async function getSongById(id: Song["id"]): Promise<Song | null> {
  const query = await db.song.findUnique({
    where: { id },
    ...includeArtists,
  });

  return mapArtistToSong(query);
}

export async function getAllSongs(): Promise<Song[]> {
  const query = await db.song.findMany({
    ...includeArtists,
  });

  return query.map(mapArtistToSong);
}
