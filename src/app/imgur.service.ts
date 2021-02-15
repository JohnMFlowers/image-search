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

export interface SearchResults {
  imageCount: number;
  results: SearchResult[];
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
  private text = '';
  private page = 1;

  private headers = new HttpHeaders({
    'Authorization': 'Client-ID ' + this.clientId,
    'Accept': 'application/json',
  });

  public readonly searchResults = new Subject<SearchResults>();
  public readonly searchErrors = new Subject<SearchError>();

  public constructor(
    private httpClient: HttpClient,
  ) { }

  private postError() {
    const url = window.document.URL.toLowerCase();
    if (url.includes('localhost') || url.includes('127.0.0.0')) {
      this.searchErrors.next({message:
        'The Imgur APIs do not work properly when you access the dev server using the localhost url. ' +
        'Try using your client\'s IP address instead.'
      });
    } else {
      this.searchErrors.next({message: 'An error occurred while searching.'});
    }
  }

  public searchMore() {
    this.page += 1;
    this.doSearch();
  }

  public search(text: string) {
    this.text = text;
    this.page = 1;
    this.doSearch();
  }

  private async doSearch() {
    const url = this.apiUrl + 'search/' + this.page;
    const options = {
      headers: this.headers,
      params: {
        q: this.text,
      },
    };
    try {
      const response = await this.httpClient.get<ImgurResult>(url, options).toPromise();
      if (response.success) {
        const searchResults: SearchResults = {
          imageCount: 0,
          results: [],
        };
        response.data.forEach(item => {
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
            searchResults.results.push(result);
            searchResults.imageCount += result.images.length;
          }
        });
        this.searchResults.next(searchResults);
      } else {
        console.log(response);
        this.postError();
      }
    } catch (e: any) {
      console.log(e);
      this.postError();
    }
  }

}
