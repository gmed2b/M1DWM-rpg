import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

export interface HeroStats {
  strength: number;
  magic: number;
  agility: number;
  speed: number;
  charisma: number;
  luck: number;
}

export interface Hero {
  id: number;
  name: string;
  race: string;
  classType: string;
  experience: number;
  level: number;
  stats: HeroStats;
  health: number;
  money: number;
  isActive: boolean;
  createdAt: string;
}

export interface CreateHeroDto {
  name: string;
  race: string;
  class_type: string;
  stats: HeroStats;
}

@Injectable({
  providedIn: 'root',
})
export class HeroService {
  private apiUrl = 'http://localhost:9000/api/heroes';

  constructor(private http: HttpClient) {}

  getAllHeroes(): Observable<Hero[]> {
    return this.http.get<Hero[]>(this.apiUrl);
  }

  getHeroById(id: number): Observable<Hero> {
    return this.http.get<Hero>(`${this.apiUrl}/${id}`);
  }

  createHero(hero: CreateHeroDto): Observable<{ message: string; hero: Hero }> {
    return this.http.post<{ message: string; hero: Hero }>(this.apiUrl, hero);
  }

  updateHero(
    id: number,
    hero: Partial<Hero>
  ): Observable<{ message: string; hero: Hero }> {
    return this.http.put<{ message: string; hero: Hero }>(
      `${this.apiUrl}/${id}`,
      hero
    );
  }

  deleteHero(id: number): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.apiUrl}/${id}`);
  }

  getHeroInventory(id: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/${id}/inventory`);
  }
}
