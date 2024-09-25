export interface DeploymentLogParams {
  from: string;
  to: string;
  method: string[];
  status: string[];
  deploymentId: number;
  sort: string;
  page: number;
}

export interface Log {
  timestamp: string;
  deploymentId: string;
  ip: string;
  domain: string;
  path: string;
  method: string;
  status: string;
  duration: number;
}

export interface MethodCnt {
  DELETE: number;
  POST: number;
  GET: number;
  PATCH: number;
  PUT: number;
}

export interface StatusCnt {
  "2xx": number;
  "3xx": number;
  "4xx": number;
  "5xx": number;
}

export interface DeploymentLog {
  content: Log[];
  methodCounts: MethodCnt;
  statusCounts: StatusCnt;
}
