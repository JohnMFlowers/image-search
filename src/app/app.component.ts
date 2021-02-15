import { Component } from '@angular/core';
import { FormControl } from '@angular/forms';

import { ImgurService, SearchResult, SearchError, SearchResults } from './imgur.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {

  searchInput = new FormControl('cat');
  searchResults?: SearchResults;
  searchError?: string;
  searching = false;
  allowMore = true;

  constructor(private imgurService: ImgurService,
  ) {
    this.imgurService.searchResults.subscribe(results => {
      this.searching = false;
      this.allowMore = results.imageCount > 0;
      if (this.searchResults) {
        this.searchResults.imageCount += results.imageCount;
        this.searchResults.results.push(...results.results);
      } else {
        this.searchResults = results;
      }
    });
    this.imgurService.searchErrors.subscribe(error => {
      this.allowMore = false;
      this.searching = false;
      this.searchError = error.message;
    });
    this.search();
  }

  search() {
    this.searching = true;
    this.searchResults = undefined;
    this.searchError = undefined;
    const value = this.searchInput.value.trim();
    this.imgurService.search(value);
  }

  searchMore() {
    this.searching = true;
    this.searchError = undefined;
    this.imgurService.searchMore();
  }

}
