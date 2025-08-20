import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { BookOpen, Calendar, Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/lib/supabaseClient';
import logo from '@/assets/log.png';

interface DashboardStats {
  totalStudents: number;
  activeStudents: number;
  totalInstructors: number;
  totalCourses: number;
  activeCourses: number;
  totalClasses: number;
  galleryItems: number;
  totalEnrollments: number;
  totalFunctions: number;
  totalParticipants: number;
}

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState<DashboardStats>({
    totalStudents: 0,
    activeStudents: 0,
    totalInstructors: 0,
    totalCourses: 0,
    activeCourses: 0,
    totalClasses: 0,
    galleryItems: 0,
    totalEnrollments: 0,
    totalFunctions: 0,
    totalParticipants: 0
  });
  const [loading, setLoading] = useState(true);

  // Fetch all stats from Supabase
  const fetchStats = async () => {
    setLoading(true);
    
    try {
      // Fetch students
      const { data: students, error: studentsError } = await supabase
        .from('students')
        .select('*');
      
      // Fetch instructors
      const { data: instructors, error: instructorsError } = await supabase
        .from('instructors')
        .select('*');
      
      // Fetch courses
      const { data: courses, error: coursesError } = await supabase
        .from('courses')
        .select('*');
      
      // Fetch classes
      const { data: classes, error: classesError } = await supabase
        .from('classes')
        .select('*');
      
      // Fetch gallery items
      const { data: gallery, error: galleryError } = await supabase
        .from('gallery')
        .select('*');
      
      // Fetch functions
      const { data: functions, error: functionsError } = await supabase
        .from('functions')
        .select('*');
      
      // Fetch participants
      const { data: participants, error: participantsError } = await supabase
        .from('participants')
        .select('*');

      if (!studentsError && !instructorsError && !coursesError && !classesError && !galleryError && !functionsError && !participantsError) {
        const newStats: DashboardStats = {
          totalStudents: students?.length || 0,
          activeStudents: students?.filter(s => s.status === 'active').length || 0,
          totalInstructors: instructors?.length || 0,
          totalCourses: courses?.length || 0,
          activeCourses: courses?.filter(c => c.status === 'active').length || 0,
          totalClasses: classes?.length || 0,
          galleryItems: gallery?.length || 0,
          totalEnrollments: courses?.reduce((sum, course) => sum + (course.enrolledStudents || 0), 0) || 0,
          totalFunctions: functions?.length || 0,
          totalParticipants: participants?.length || 0
        };
        setStats(newStats);
      }
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
    }
    
    setLoading(false);
  };

  useEffect(() => {
    fetchStats();

    // Real-time subscriptions for all tables
    const studentsChannel = supabase.channel('dashboard-students')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'students' }, fetchStats)
      .subscribe();

    const instructorsChannel = supabase.channel('dashboard-instructors')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'instructors' }, fetchStats)
      .subscribe();

    const coursesChannel = supabase.channel('dashboard-courses')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'courses' }, fetchStats)
      .subscribe();

    const classesChannel = supabase.channel('dashboard-classes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'classes' }, fetchStats)
      .subscribe();

    const galleryChannel = supabase.channel('dashboard-gallery')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'gallery' }, fetchStats)
      .subscribe();

    const functionsChannel = supabase.channel('dashboard-functions')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'functions' }, fetchStats)
      .subscribe();

    const participantsChannel = supabase.channel('dashboard-participants')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'participants' }, fetchStats)
      .subscribe();

    return () => {
      studentsChannel.unsubscribe();
      instructorsChannel.unsubscribe();
      coursesChannel.unsubscribe();
      classesChannel.unsubscribe();
      galleryChannel.unsubscribe();
      functionsChannel.unsubscribe();
      participantsChannel.unsubscribe();
    };
  }, []);

  const statCards = [
    {
      title: 'Total Students',
      value: stats.totalStudents,
      description: `${stats.activeStudents} active`,
      icon: 'Users', // This will be replaced by lucide-react icon
      color: 'text-blue-600',
      bgColor: 'bg-blue-50 dark:bg-blue-950/20'
    },
    {
      title: 'Instructors',
      value: stats.totalInstructors,
      description: 'Teaching staff',
      icon: 'UserCheck', // This will be replaced by lucide-react icon
      color: 'text-green-600',
      bgColor: 'bg-green-50 dark:bg-green-950/20'
    },
    {
      title: 'Active Courses',
      value: stats.activeCourses,
      description: `${stats.totalCourses} total courses`,
      icon: BookOpen,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50 dark:bg-purple-950/20'
    },
    {
      title: 'Classes',
      value: stats.totalClasses,
      description: 'Ongoing classes',
      icon: Calendar,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50 dark:bg-orange-950/20'
    },
    {
      title: 'Gallery Items',
      value: stats.galleryItems,
      description: 'Photos & videos',
      icon: 'Images', // This will be replaced by lucide-react icon
      color: 'text-pink-600',
      bgColor: 'bg-pink-50 dark:bg-pink-950/20'
    },
    {
      title: 'Total Enrollments',
      value: stats.totalEnrollments,
      description: 'Across all courses',
      icon: 'TrendingUp', // This will be replaced by lucide-react icon
      color: 'text-cyan-600',
      bgColor: 'bg-cyan-50 dark:bg-cyan-950/20'
    },
    {
      title: 'Functions',
      value: stats.totalFunctions,
      description: `${stats.totalParticipants} participants`,
      icon: Calendar,
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-50 dark:bg-indigo-950/20'
    }
  ];

  return (
    <div className="space-y-8 p-6 pt-16">
      {/* Welcome Banner */}
      <div className="flex flex-col md:flex-row items-center gap-6 md:gap-10 bg-gradient-to-r from-blue-100/80 via-blue-50/80 to-white dark:from-blue-900 dark:via-blue-800 dark:to-blue-900 rounded-2xl p-4 md:p-10 shadow-xl border border-blue-200 dark:border-blue-800 mb-10">
        <span className="w-24 h-24 md:w-28 md:h-28 flex items-center justify-center shadow-lg">
          <img src={logo} alt="INS Online College Logo" className="w-full h-auto object-contain" />
        </span>
        <div className="text-center md:text-left">
          <h1 className="text-2xl sm:text-3xl md:text-5xl font-extrabold text-gray-900 dark:text-gray-100 mb-3 drop-shadow-sm">Welcome to INS Online College</h1>
          <p className="text-gray-700 dark:text-gray-200 text-base sm:text-lg md:text-2xl font-medium drop-shadow-sm">Empowering education with technology and care.</p>
        </div>
      </div>

      {/* Key Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Active Courses */}
        <Card className="border-0 shadow-lg bg-white dark:bg-gray-800 hover:shadow-xl transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
              Active Courses
            </CardTitle>
            <div className="p-2 rounded-lg bg-purple-50 dark:bg-purple-950/20">
              <BookOpen className="w-5 h-5 text-purple-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-1">
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : stats.activeCourses}
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400">Currently running</p>
          </CardContent>
        </Card>
        {/* Active Classes */}
        <Card className="border-0 shadow-lg bg-white dark:bg-gray-800 hover:shadow-xl transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
              Active Classes
              </CardTitle>
            <div className="p-2 rounded-lg bg-orange-50 dark:bg-orange-950/20">
              <Calendar className="w-5 h-5 text-orange-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-1">
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : stats.totalClasses}
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400">Ongoing classes</p>
          </CardContent>
        </Card>
        {/* Functions */}
        <Card className="border-0 shadow-lg bg-white dark:bg-gray-800 hover:shadow-xl transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
              Functions
            </CardTitle>
            <div className="p-2 rounded-lg bg-indigo-50 dark:bg-indigo-950/20">
              <Calendar className="w-5 h-5 text-indigo-600" />
                  </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-1">
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : stats.totalFunctions}
              </div>
            <p className="text-xs text-gray-500 dark:text-gray-400">Upcoming/Recent</p>
            </CardContent>
          </Card>
      </div>
      {/* Functions Details Section */}
      <div className="flex justify-center items-center min-h-[30vh]">
        <Card className="border-0 shadow-2xl bg-gradient-to-br from-blue-100/80 via-white to-blue-50 dark:from-blue-900 dark:via-gray-900 dark:to-blue-900 rounded-2xl w-full max-w-7xl p-10">
          <CardHeader className="mb-6">
            <CardTitle className="text-2xl md:text-3xl font-extrabold text-gray-900 dark:text-gray-100 mb-2">Functions Details</CardTitle>
            <p className="text-lg text-gray-700 dark:text-gray-300 font-medium">Manage functions and track participant attendance</p>
          </CardHeader>
          <CardContent className="flex justify-center">
            <button 
              className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-bold text-lg px-10 py-3 rounded-xl shadow-lg transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-blue-300 dark:focus:ring-blue-800"
              onClick={() => navigate('/admin/functions-management')}
            >
              Function Details
            </button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;