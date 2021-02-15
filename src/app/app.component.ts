import { Component, AfterViewInit} from '@angular/core';
import { FormControl, } from '@angular/forms';

import { ImgurService, SearchResult } from './imgur.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {

  searchInput = new FormControl('cat');
  searchResults: SearchResult[] = [];
  searchError?: string;

  constructor(private imgurService: ImgurService,
  ) {
    this.imgurService.searchResults.subscribe(
      result => {
        this.searchResults.push(...result);
      },
      error => {
        this.searchError = error;
      }
    );
    this.search();
  }

  afterViewInit() {
    console.log('sdlfksdf')
    this.search();
  }

  search() {
    this.searchResults = [];
    this.searchError = undefined;
    const value = this.searchInput.value.trim();
    this.imgurService.search(value);
  }

}
