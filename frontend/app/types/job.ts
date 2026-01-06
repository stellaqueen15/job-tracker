export interface Job {
  id: number;
  company: string;
  position: string;
  status: string;
  appliedDate: string;
  notes?: string;
  hasFollowedUp?: number;
  canFollowUp?: number;
  followUpDate?: string | null;
  isInteresting?: number;
  jobLink?: string | null;
  updatedAt?: string;
}
