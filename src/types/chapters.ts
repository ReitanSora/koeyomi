export interface Chapters {
  id: string;
  manga_id: string;
  type: string;
  attributes: {
    publishAt: string;
    translatedLanguage: string;
    chapter: string;
    title: string;
    pages: number;
  };
  relationships: Array<{
    id: string;
    type: string;
    attributes: {
      name: string;
      
    };
  }>;
  download_status: string;
  file_path: string;
  last_page_read: string;
}

export interface ChapterImages {
  result: string;
  baseUrl: string;
  chapter: {
    hash: string;
    data: string[];
    dataSaver: string[];
  };
}

export interface ChapterAPIResponse {
  result: string;
  response: string;
  data: Chapters[];
  limit: number;
  offset: number;
  total: number;
  fetchStatus: string;
}
