import { createArtist, getArtistById } from "@/db-access/artist";
import { Artist, CreateArtist } from "@/types/artist";

export async function createArtistUseCase(data: CreateArtist) {
  return await createArtist(data);
}

export async function getArtistByIdUseCase(id: Artist["id"]) {
  return await getArtistById(id);
}
