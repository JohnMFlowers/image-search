import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Subject} from 'rxjs';

export interface SearchResult {
  title: string;
  description: string;
  images: {
    title: string;
    description: string;
    url: string;
    thumbnailUrl: string;
  }[];
}

export interface SearchError {
  message: string;
}

interface ImgurResult {
  data: {
    id: string;
    title: string;
    description: string;
    type?: string;
    link?: string;
    images?: {
      id: string;
      title: string;
      description: string;
      type: string;
      link: string;
    }[];
  }[];
  status: number;
  success: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class ImgurService {

  private clientId = '0d0f4697c0b4ec8';
  private apiUrl = 'https://api.imgur.com/3/gallery/';
  private thumbnailUrl = 'https://i.imgur.com/{0}_d.webp?shape=thumb';

  private headers = new HttpHeaders({
    'Authorization': 'Client-ID ' + this.clientId,
    'Accept': 'application/json',
  });

  public readonly searchResults = new Subject<SearchResult[]>();
  public readonly searchErrors = new Subject<SearchError>();

  public constructor(
    private httpClient: HttpClient,
  ) { }

  public async search(text: string) {
    const url = this.apiUrl + 'search';
    const options = {
      headers: this.headers,
      params: {
        q: text,
      },
    };
    try {
      const response = await this.httpClient.get<ImgurResult>(url, options).toPromise();
      console.log(response);
      if (response.success) {
        const results: SearchResult[] = [];
        response.data.forEach(item => {
          console.log(item);
          const result: SearchResult = {
            title: item.title,
            description: item.description,
            images: [],
          };
          if (item.images) {
            item.images.forEach(image => {
              if (image.type.startsWith('image')) {
                result.images.push({
                  title: image.title,
                  description: image.description,
                  url: image.link,
                  thumbnailUrl: this.thumbnailUrl.replace('{0}', image.id),
                });
              }
            });
          } else if (item.link && item.type?.startsWith('image')) {
            result.images.push({
              title: item.title,
              description: item.description,
              url: item.link,
              thumbnailUrl: this.thumbnailUrl.replace('{0}', item.id),
            });
          }
          if (result.images.length > 0) {
            results.push(result);
          }
        });
        console.log(results);
        this.searchResults.next(results);
      } else {
        this.searchErrors.next({message: `An error occurred while searching for '${text}'.`});
      }
    } catch (e: any) {
      this.searchErrors.next({message: `An error occurred while searching for '${text}'.`});
      console.log(e);
    }
    console.log('');
  }

}
