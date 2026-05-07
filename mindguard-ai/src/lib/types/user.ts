export interface UserProfile {
  name?: string;
  email?: string;
  fieldOfStudy: string;
  semester: string;
  workload: string;
  studyStyle: string;
  baselineStress: number;
  baselineSleep: number;
  updatedAt?: unknown;
}
