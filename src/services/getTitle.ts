import { Manga } from '@/types/mangas';

export const getTitle = (item: Manga['attributes']) => {
    const t = item.title;
    return t.ja || t['ja-ro'] || t.en || t['zh-ro'] || 'Unknown Title';
};
