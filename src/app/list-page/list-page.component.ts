import {Component, OnDestroy, OnInit} from '@angular/core';
import {TvService} from '../shared/services/tv.service';
import {TvGenre, TvShow} from '../shared/interfaces/tv';
import {takeWhile} from 'rxjs/operators';

@Component({
  selector: 'app-list-page',
  templateUrl: './list-page.component.html',
  styleUrls: ['./list-page.component.scss']
})
export class ListPageComponent implements OnInit, OnDestroy {
  private isAlive = true;
  tvShows: TvShow[];
  genres: TvGenre[];

  constructor(private tvService: TvService) { }

  ngOnInit(): void {
    this.tvService.getTvSeries().pipe(
      takeWhile(() => this.isAlive)
    ).subscribe(data => {
      this.tvShows = data;
    });

    this.tvService.getGenres().pipe(
      takeWhile(() => this.isAlive)
    ).subscribe(
      data => this.genres = data
    );
  }

  getGenreById(id: number) {
    const genre = this.genres.find(item => item.id === id);
    return genre ? genre.name : 'unknown';
  }

  ngOnDestroy(): void {
    this.isAlive = false;
  }

  sortShows(field: string, direction: string) {
    this.tvService.setSort(field, direction);
  }
}
