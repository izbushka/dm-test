import {Component, Input, OnDestroy, OnInit} from '@angular/core';
import {MovieService} from '../../shared/services/movie.service';
import {takeWhile} from 'rxjs/operators';

@Component({
  selector: 'app-sorter',
  templateUrl: './sorter.component.html',
  styleUrls: ['./sorter.component.scss']
})
export class SorterComponent implements OnInit, OnDestroy {
  isAlive = true;
  @Input() name: string;
  method = '';

  constructor(private movieService: MovieService) { }

  ngOnInit(): void {
    this.movieService.getFilters().pipe(
      takeWhile(() => this.isAlive)
    ).subscribe(
      data => {
        if (data.sort.field === this.name) {
          this.method = data.sort.method;
        } else {
          this.method = '';
        }
      }
    );
  }

  ngOnDestroy(): void {
    this.isAlive = false;
  }

}
