export interface ComputerStatus {
  id: number;
  name: string;
  hostname: string | null;
  ip: string;
  queueId: string | null;
  queueName: string | null;
  maxLimit: string;
  preset: string;   // '10mb' | '50mb' | '100mb' | 'custom' | 'unknown'
  online: boolean;
}

export interface ISPStatusResponse {
  activeId: number | null;
  activeComment: string | null;
  isps: { id: number; name: string }[];
  error?: string;
}
