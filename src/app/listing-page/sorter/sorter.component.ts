import {Component, Input, OnInit} from '@angular/core';

@Component({
  selector: 'app-sorter',
  templateUrl: './sorter.component.html',
  styleUrls: ['./sorter.component.scss']
})
export class SorterComponent implements OnInit {
  @Input() state: string;

  constructor() { }

  ngOnInit(): void {
  }
}
