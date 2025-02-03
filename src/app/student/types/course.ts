import { Enrollment } from '@/app/student/types/enrollment';

interface Lesson {
  _id: string;
  title: string;
  content: string;
  dueDate: string;
  courseId: string;
  completed: boolean;
  studentProgress?: Array<{
    studentId: string;
    completed: boolean;
  }>;
}

export interface Course {
  _id: string;
  title: string;
  description: string;
  category: string;
  startDate: string;
  endDate: string;
  teachers: Array<{
    _id: string;
    fullName: string;
    email: string;
  }>;
  schedule: Array<{
    dayOfWeek: string;
    startTime: string;
    endTime: string;
  }>;
  enrolledStudents?: Array<{
    _id: string;
    username: string;
  }>;
  enrollment?: Enrollment;
  lessons: Lesson[];
  exams?: Array<{
    _id: string;
    title: string;
    date: string;
    status: 'upcoming' | 'completed' | 'missed';
  }>;
}
