import { Chapters } from "./chapters";
import { Manga } from "./mangas";

export interface Records{
    id: string;
    formated_timestamp: Date
    manga_attributes: Manga['attributes'];
    chapter_attributes: Chapters['attributes'];
    coverImageUrl: string;
    timestamp: string;
}