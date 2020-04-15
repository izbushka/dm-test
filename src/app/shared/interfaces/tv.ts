export interface TvShow {
  name: string;
  genre_ids: number[];
  popularity: number;
  origin_country: string[];
  vote_count: number;
  vote_average: number;
  overview: string;
  poster_path: string;
  first_air_date: string;
}
export interface TvGenre {
  id: number;
  name: string;
}
