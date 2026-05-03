import { Injectable } from '@angular/core';
import { Apollo } from 'apollo-angular';
import { BehaviorSubject, Observable, map, tap } from 'rxjs';
import { TokenService } from './token.service';
import { User, UserRole } from '../models/user.model';
import { AuthResponse } from '../models/auth-response.model';
import { LOGIN_MUTATION, REGISTER_MUTATION } from '../graphql/auth.graphql';
import { Router } from '@angular/router';

const USER_KEY = 'schoolinc_user';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private currentUserSubject = new BehaviorSubject<User | null>(
    this.getCurrentUserFromStorage(),
  );
  currentUser$ = this.currentUserSubject.asObservable();

  constructor(
    private apollo: Apollo,
    private tokenService: TokenService,
    private router: Router,
  ) {}

  login(email: string, password: string): Observable<AuthResponse> {
    return this.apollo
      .mutate<{ login: AuthResponse }>({
        mutation: LOGIN_MUTATION,
        variables: { input: { email, password } },
      })
      .pipe(
        map((result) => result.data!.login),
        tap((response) => this.handleAuthResponse(response)),
      );
  }

  register(payload: {
    email: string;
    pseudo: string;
    password: string;
    role: UserRole;
  }): Observable<AuthResponse> {
    return this.apollo
      .mutate<{ register: AuthResponse }>({
        mutation: REGISTER_MUTATION,
        variables: { input: payload },
      })
      .pipe(
        map((result) => result.data!.register),
        tap((response) => this.handleAuthResponse(response)),
      );
  }

  logout(): void {
    this.tokenService.clearToken();
    localStorage.removeItem(USER_KEY);
    this.currentUserSubject.next(null);
    void this.apollo.client.clearStore();
    void this.router.navigate(['/login']);
  }

  isAuthenticated(): boolean {
    return !!this.tokenService.getToken();
  }

  getUserRole(): UserRole | null {
    const user = this.currentUserSubject.value;
    return user?.role ?? null;
  }

  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  getCurrentUserFromStorage(): User | null {
    const raw = localStorage.getItem(USER_KEY);
    if (!raw) return null;
    try {
      return JSON.parse(raw) as User;
    } catch {
      return null;
    }
  }

  private handleAuthResponse(response: AuthResponse): void {
    this.tokenService.setToken(response.accessToken);
    localStorage.setItem(USER_KEY, JSON.stringify(response.user));
    this.currentUserSubject.next(response.user);
  }
}
