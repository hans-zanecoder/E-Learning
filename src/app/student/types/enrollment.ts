export interface Enrollment {
  _id: string;
  courseId: string;
  studentId: string;
  enrollmentDate: Date;
  status: 'active' | 'completed' | 'dropped';
  completedLessons: string[];
  redline?: {
    status: 'on-track' | 'behind' | 'at-risk';
    lastUpdated: Date;
    completedLessons: number;
    totalLessons: number;
    progressPercentage: number;
  };
}
