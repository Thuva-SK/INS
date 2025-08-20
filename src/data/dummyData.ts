// Dummy data for the admin panel

export interface Student {
  id: string;
  name: string;
  email: string;
  studentId: string;
  course: string;
  class: string;
  status: 'active' | 'inactive' | 'graduated';
  enrolledDate: string;
  phone?: string;
  avatar?: string;
}

export interface Instructor {
  id: string;
  name: string;
  email: string;
  subject: string;
  assignedClasses: string[];
  phone?: string;
  avatar?: string;
  joinedDate: string;
}

export interface Course {
  id: string;
  title: string;
  code: string;
  instructor: string;
  duration: string;
  fee: number;
  description?: string;
  enrolledStudents: number;
  status: 'active' | 'inactive';
}

export interface Class {
  id: string;
  name: string;
  courseId: string;
  instructorId: string;
  schedule: string;
  enrolledStudents: string[];
  maxCapacity: number;
  room?: string;
}

export interface GalleryItem {
  id: string;
  title: string;
  type: 'image' | 'video';
  url: string;
  thumbnail?: string;
  uploadDate: string;
  description?: string;
}

export interface Announcement {
  id: string;
  title: string;
  message: string;
  date: string;
  priority: 'low' | 'medium' | 'high';
  author: string;
}

// Dummy Students Data
export const dummyStudents: Student[] = [
  {
    id: '1',
    name: 'John Smith',
    email: 'john.smith@email.com',
    studentId: 'INS001',
    course: 'Computer Science',
    class: 'CS-101',
    status: 'active',
    enrolledDate: '2024-01-15',
    phone: '+1234567890',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face'
  },
  {
    id: '2',
    name: 'Sarah Johnson',
    email: 'sarah.johnson@email.com',
    studentId: 'INS002',
    course: 'Business Administration',
    class: 'BA-201',
    status: 'active',
    enrolledDate: '2024-02-01',
    phone: '+1234567891',
    avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=100&h=100&fit=crop&crop=face'
  },
  {
    id: '3',
    name: 'Mike Davis',
    email: 'mike.davis@email.com',
    studentId: 'INS003',
    course: 'Digital Marketing',
    class: 'DM-101',
    status: 'active',
    enrolledDate: '2024-01-20',
    phone: '+1234567892',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face'
  }
];

// Dummy Instructors Data
export const dummyInstructors: Instructor[] = [
  {
    id: '1',
    name: 'Dr. Emily Chen',
    email: 'emily.chen@insonlinecollege.edu',
    subject: 'Computer Science',
    assignedClasses: ['CS-101', 'CS-201'],
    phone: '+1234567893',
    avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=100&h=100&fit=crop&crop=face',
    joinedDate: '2023-08-01'
  },
  {
    id: '2',
    name: 'Prof. Robert Williams',
    email: 'robert.williams@insonlinecollege.edu',
    subject: 'Business Administration',
    assignedClasses: ['BA-201', 'BA-301'],
    phone: '+1234567894',
    avatar: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=100&h=100&fit=crop&crop=face',
    joinedDate: '2023-09-15'
  }
];

// Dummy Courses Data
export const dummyCourses: Course[] = [
  {
    id: '1',
    title: 'Computer Science Fundamentals',
    code: 'CS-101',
    instructor: 'Dr. Emily Chen',
    duration: '16 weeks',
    fee: 2500,
    description: 'Introduction to programming and computer science concepts',
    enrolledStudents: 25,
    status: 'active'
  },
  {
    id: '2',
    title: 'Business Administration',
    code: 'BA-201',
    instructor: 'Prof. Robert Williams',
    duration: '12 weeks',
    fee: 2000,
    description: 'Core business principles and management strategies',
    enrolledStudents: 30,
    status: 'active'
  },
  {
    id: '3',
    title: 'Digital Marketing Strategy',
    code: 'DM-101',
    instructor: 'Ms. Sarah Cooper',
    duration: '8 weeks',
    fee: 1500,
    description: 'Modern digital marketing techniques and analytics',
    enrolledStudents: 20,
    status: 'active'
  }
];

// Dummy Classes Data
export const dummyClasses: Class[] = [
  {
    id: '1',
    name: 'CS-101',
    courseId: '1',
    instructorId: '1',
    schedule: 'Mon/Wed/Fri 10:00-11:30 AM',
    enrolledStudents: ['1', '3'],
    maxCapacity: 30,
    room: 'Virtual Room A'
  },
  {
    id: '2',
    name: 'BA-201',
    courseId: '2',
    instructorId: '2',
    schedule: 'Tue/Thu 2:00-3:30 PM',
    enrolledStudents: ['2'],
    maxCapacity: 35,
    room: 'Virtual Room B'
  }
];

// Dummy Gallery Data
export const dummyGallery: GalleryItem[] = [
  {
    id: '1',
    title: 'Campus Virtual Tour',
    type: 'video',
    url: 'https://player.vimeo.com/video/example',
    thumbnail: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=400&h=300&fit=crop',
    uploadDate: '2024-01-10',
    description: 'Virtual tour of our online learning platform'
  },
  {
    id: '2',
    title: 'Graduation Ceremony 2024',
    type: 'image',
    url: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=800&h=600&fit=crop',
    uploadDate: '2024-03-15',
    description: 'Annual graduation ceremony highlights'
  },
  {
    id: '3',
    title: 'Student Success Stories',
    type: 'image',
    url: 'https://images.unsplash.com/photo-1427504494785-3a9ca7044f45?w=800&h=600&fit=crop',
    uploadDate: '2024-02-20',
    description: 'Celebrating our students achievements'
  }
];

// Dummy Announcements Data
export const dummyAnnouncements: Announcement[] = [
  {
    id: '1',
    title: 'New Course Registration Open',
    message: 'Registration for Spring 2024 courses is now open. Visit the student portal to enroll.',
    date: '2024-03-01',
    priority: 'high',
    author: 'Admin'
  },
  {
    id: '2',
    title: 'System Maintenance Scheduled',
    message: 'The learning management system will be under maintenance on March 15th from 2-4 AM.',
    date: '2024-03-10',
    priority: 'medium',
    author: 'IT Department'
  },
  {
    id: '3',
    title: 'Career Fair Next Month',
    message: 'Join us for the virtual career fair on April 20th. Network with top employers.',
    date: '2024-03-12',
    priority: 'low',
    author: 'Career Services'
  }
];