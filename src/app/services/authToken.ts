/**
 * Токен хранится только в Redux; этот модуль держит актуальное значение
 * для API-запросов (обновляется компонентом AuthTokenSync).
 */
let currentToken: string | null = null;

export function setAuthToken(token: string | null): void {
  currentToken = token;
}

export function getAuthToken(): string | null {
  return currentToken;
}
