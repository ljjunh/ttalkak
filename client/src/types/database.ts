export enum DatabaseType {
  MYSQL = "MYSQL",
  MARIADB = "MARIADB",
  MONGODB = "MONGODB",
  POSTGRESQL = "POSTGRESQL",
  REDIS = "REDIS",
}

export interface CreateDatabaseRequest {
  type: DatabaseType;
  name: string;
}

export interface GetDatabasesParams {
  page: number;
  size: number;
  sort: string;
  direction: string;
  searchKeyword?: string;
}

export interface GetDatabasesResponse {
  content: GetDatabaseResponse[];
  totalPages: number;
  totalElements: number;
}

export interface GetDatabaseResponse {
  id: number;
  name: string;
  type: DatabaseType;
  username: string;
  password: string;
  port: number;
}
