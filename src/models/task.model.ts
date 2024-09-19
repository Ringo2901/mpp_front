export interface Task {
  id?: number;
  title: string;
  status: 'pending' | 'complete';
  dueDate: string;
  file?: Uint8Array;
  fileName?: string;
}
