export interface ChapterInfo {
  id: string;
  type: string;
  attributes: {
    publishAt: string;
    translatedLanguage: string;
    chapter: string;
    title: string;
  };
  relationships: [];
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
