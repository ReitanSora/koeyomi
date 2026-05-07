import { Manga } from "./mangas";

export interface SearchAPIResponse {
  result: string;
  response: string;
  data: Array<Manga>;
  limit: number;
  offset: number;
  total: number;
}
