import db from "@/db";
import { Artist, CreateArtist } from "@/types/artist";

export async function createArtist(data: CreateArtist): Promise<Artist> {
  return db.artist.create({
    data,
  });
}

export async function getArtistById(id: Artist["id"]): Promise<Artist | null> {
  return db.artist.findUnique({
    where: { id },
  });
}
