export interface Manga {
  id: string;
  type: string;
  attributes: {
    description: {
      en: string;
      ja: string;
      "es-la": string;
    };
    title: {
      "ja-ro"?: string;
      ja?: string;
      en: string;
      "zh-ro"?: string;
    };
    availableTranslatedLanguages: string[];
    tags: Array<{
      id: string;
      type: string;
      attributes: {
        name: {
          en: string;
        };
        description: object;
        group: string;
        version: number;
      };
      relationships: any[];
    }>;
    status: string;
    links: {
      mal: string;
      raw: string;
    };
    publicationDemographic: string;
    year: string;
  };
  relationships: Array<{
    id: string;
    type: string;
    attributes: {
      name?: string;
    };
  }>;
  coverImageUrl: string;
  empty?: boolean;
}

export interface MangaAPIResponse {
  result: string;
  response: string;
  data: Manga;
}
