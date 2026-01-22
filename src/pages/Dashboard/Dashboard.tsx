import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Home, User, BookOpen, Trophy, Briefcase, Lightbulb, LogOut, Bell, Settings, Calendar, ClipboardCheck, Compass, TrendingUp, Target, Map, Search, ChevronDown } from 'lucide-react';

// Default student info
const defaultStudentInfo = {
  name: 'Nischal Basavaraju',
  year: '2nd Year, BTech',
  department: 'CSE',
  email: 'nischal.b@example.edu',
  rollNo: 'CS21B1234',
  phone: '+91 98765 43210',
  dob: '15th March, 2003',
  degree: 'B.Tech',
  branch: 'Computer Science and Engineering',
  semester: '3',
  location: 'National Institute of Technology, Manipal',
  role: 'Student',
  resume: 'resume2.docx',
  aboutMe: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Etiam eu turpis molestie, dictum est a, mattis tellus. Sed dignissim, metus nec fringilla accumsan, risus sem sollicitudin lacus...',
  credits: 40,
  cgpa: 8.3,
  attendance: 90.5
};

// Load student info from localStorage
const loadStudentInfo = () => {
  const saved = localStorage.getItem('studentInfo');
  if (saved) {
    try {
      return { ...defaultStudentInfo, ...JSON.parse(saved) };
    } catch (e) {
      return defaultStudentInfo;
    }
  }
  return defaultStudentInfo;
};

const Dashboard: React.FC = () => {
  const [activeMenu, setActiveMenu] = useState<string>('Dashboard');
  const [showProfileDropdown, setShowProfileDropdown] = useState<boolean>(false);
  const [studentInfo, setStudentInfo] = useState(loadStudentInfo);
  
  // Load data on mount and listen for storage changes
  useEffect(() => {
    const loaded = loadStudentInfo();
    setStudentInfo(loaded);
    
    // Listen for storage changes (when Profile page saves in other tabs)
    const handleStorageChange = () => {
      const updated = loadStudentInfo();
      setStudentInfo(updated);
    };
    
    // Listen for custom event (when Profile page saves in same tab)
    const handleStudentInfoUpdate = () => {
      const updated = loadStudentInfo();
      setStudentInfo(updated);
    };
    
    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('studentInfoUpdated', handleStudentInfoUpdate);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('studentInfoUpdated', handleStudentInfoUpdate);
    };
  }, []);

  const menuItems = [
    { icon: Home, label: 'Dashboard', route: '/dashboard' },
    { icon: User, label: 'Personal Info', route: '/profile' },
    { icon: BookOpen, label: 'Academics', route: '/academics' },
    { icon: ClipboardCheck, label: 'Assessments', route: '/assessment/start' },
    { icon: Compass, label: 'Career Guidance', route: '/guidance' },
    { icon: Map, label: 'Learning Roadmaps', route: '/roadmaps' },
    { icon: TrendingUp, label: 'My Progress', route: '/progress' },
    { icon: Trophy, label: 'Achievements', route: '/achievements' },
    { icon: Briefcase, label: 'Projects', route: '/projects' },
    { icon: Lightbulb, label: 'Skills', route: '/skills' },
  ];

  const quickActions = [
    {
      id: 'assessment',
      icon: ClipboardCheck,
      title: 'Start Aptitude & Interest Test',
      description: 'Answer simple questions about your interests and thinking style. No technical knowledge needed—just be yourself!',
      ctaText: 'Start Test',
      route: '/assessment/start',
      gradient: 'from-purple-500 to-purple-600',
      iconColor: 'text-purple-600'
    },
    {
      id: 'guidance',
      icon: Compass,
      title: 'Get Career / Domain Guidance',
      description: 'Discover which CS domains match your interests and personality. Get clear, beginner-friendly explanations.',
      ctaText: 'Get Guidance',
      route: '/guidance',
      gradient: 'from-blue-500 to-blue-600',
      iconColor: 'text-blue-600'
    },
    {
      id: 'roadmaps',
      icon: Map,
      title: 'Explore Learning Roadmaps',
      description: 'See step-by-step learning paths for different CS domains. Start from year one and build your skills gradually.',
      ctaText: 'View Roadmaps',
      route: '/roadmaps',
      gradient: 'from-indigo-500 to-indigo-600',
      iconColor: 'text-indigo-600'
    }
  ];

  const enrolledCourses = [
    { name: 'Object Oriented Programming', progress: 75, icon: '💻', color: 'bg-purple-50', borderColor: 'border-purple-200' },
    { name: 'Database Systems', progress: 60, icon: '🗄️', color: 'bg-blue-50', borderColor: 'border-blue-200' },
    { name: 'Data Structures', progress: 85, icon: '🌳', color: 'bg-green-50', borderColor: 'border-green-200' },
    { name: 'Computer Networks', progress: 45, icon: '🌐', color: 'bg-orange-50', borderColor: 'border-orange-200' }
  ];

  const recentActivity = [
    { title: 'Completed Python Assessment', time: '2 hours ago', icon: '✅', color: 'text-green-600' },
    { title: 'Viewed AI/ML Roadmap', time: '1 day ago', icon: '🗺️', color: 'text-blue-600' },
    { title: 'Updated Profile Information', time: '3 days ago', icon: '👤', color: 'text-purple-600' }
  ];

  const handleLogout = () => {
    // Handle logout - to be connected to auth later
    window.location.href = '/login';
  };

  const handleMenuClick = (label: string) => {
    setActiveMenu(label);
    // Navigation will be handled by Link components or router
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="w-64 bg-gradient-to-b from-purple-600 to-purple-700 text-white flex flex-col fixed h-full overflow-y-auto shadow-xl z-20">
        {/* Logo */}
        <div className="p-6 flex flex-col items-center border-b border-purple-500">
          <div className="w-20 h-20 bg-white rounded-2xl flex items-center justify-center mb-3 shadow-lg">
            <span className="text-5xl">🎓</span>
          </div>
          <span className="font-bold text-lg">SkillMate</span>
          <span className="text-xs text-purple-200 mt-1">Career Guidance Platform</span>
        </div>

        {/* Menu Items */}
        <nav className="flex-1 overflow-y-auto py-4">
          {menuItems.map((item) => (
            <Link
              key={item.label}
              to={item.route}
              onClick={() => handleMenuClick(item.label)}
              className={`w-full px-6 py-3 flex items-center gap-3 text-left transition-all duration-200 ${
                activeMenu === item.label
                  ? 'bg-purple-800 border-l-4 border-white shadow-lg'
                  : 'hover:bg-purple-600 border-l-4 border-transparent'
              }`}
            >
              <item.icon size={18} />
              <span className="text-sm font-medium">{item.label}</span>
            </Link>
          ))}
        </nav>

        {/* Bottom Actions */}
        <div className="border-t border-purple-500">
          <button className="w-full px-6 py-3 flex items-center gap-3 hover:bg-purple-600 transition-colors">
            <Settings size={18} />
            <span className="text-sm font-medium">Settings</span>
          </button>
          <button 
            onClick={handleLogout}
            className="w-full px-6 py-4 flex items-center gap-3 hover:bg-purple-600 transition-colors text-purple-100"
          >
            <LogOut size={18} />
            <span className="text-sm font-medium">Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto ml-64 max-lg:ml-0">
        {/* Top Header */}
        <header className="bg-white border-b border-gray-200 px-8 py-4 flex items-center justify-between sticky top-0 z-10 shadow-sm max-md:px-4">
          <div className="flex items-center gap-4 flex-1">
            <div className="relative flex-1 max-w-md">
              <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search courses, roadmaps, guidance..."
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button className="p-2 hover:bg-gray-100 rounded-lg relative transition-colors">
              <Bell size={20} className="text-gray-600" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>
            
            <div className="h-8 w-px bg-gray-300 mx-2"></div>
            
            <div className="relative">
              <button 
                onClick={() => setShowProfileDropdown(!showProfileDropdown)}
                className="flex items-center gap-3 hover:bg-gray-100 rounded-lg p-2 transition-colors"
              >
                <div className="w-10 h-10 bg-gradient-to-br from-orange-400 to-orange-600 rounded-full flex items-center justify-center text-white font-semibold shadow-md">
                  NB
                </div>
                <div className="text-sm text-left max-md:hidden">
                  <div className="font-semibold text-gray-900">{studentInfo.name}</div>
                  <div className="text-gray-500 text-xs">{studentInfo.department}</div>
                </div>
                <ChevronDown size={16} className={`text-gray-400 transition-transform ${showProfileDropdown ? 'rotate-180' : ''}`} />
              </button>
              
              {/* Profile Dropdown */}
              {showProfileDropdown && (
                <div className="absolute right-0 mt-2 w-72 bg-white rounded-xl shadow-2xl border border-gray-200 py-2 animate-in z-50">
                  <div className="px-4 py-4 border-b border-gray-100">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-12 h-12 bg-gradient-to-br from-orange-400 to-orange-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                        NB
                      </div>
                      <div>
                        <div className="font-semibold text-gray-900">{studentInfo.name}</div>
                        <div className="text-sm text-gray-500">{studentInfo.year}</div>
                      </div>
                    </div>
                    <div className="text-xs text-gray-500 space-y-1">
                      <div>📧 {studentInfo.email}</div>
                      <div>🎓 Roll No: {studentInfo.rollNo}</div>
                    </div>
                  </div>
                  <Link to="/profile" className="w-full px-4 py-3 text-left text-sm hover:bg-gray-50 flex items-center gap-3 transition-colors">
                    <User size={16} className="text-gray-600" />
                    <span>View Profile</span>
                  </Link>
                  <button className="w-full px-4 py-3 text-left text-sm hover:bg-gray-50 flex items-center gap-3 transition-colors">
                    <Settings size={16} className="text-gray-600" />
                    <span>Account Settings</span>
                  </button>
                  <button className="w-full px-4 py-3 text-left text-sm hover:bg-gray-50 flex items-center gap-3 transition-colors">
                    <Bell size={16} className="text-gray-600" />
                    <span>Notifications</span>
                  </button>
                  <div className="border-t border-gray-100 mt-2 pt-2">
                    <button 
                      onClick={handleLogout}
                      className="w-full px-4 py-3 text-left text-sm hover:bg-red-50 flex items-center gap-3 text-red-600 transition-colors"
                    >
                      <LogOut size={16} />
                      <span className="font-medium">Logout</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="p-8 max-md:p-4">
          {/* Welcome Banner */}
          <div className="bg-gradient-to-r from-purple-500 via-purple-600 to-indigo-600 rounded-2xl p-8 text-white mb-8 relative overflow-hidden shadow-lg">
            <div className="flex items-center justify-between relative z-10">
              <div>
                <div className="flex items-center gap-2 text-purple-100 mb-2">
                  <Calendar size={16} />
                  <span className="text-sm">Thursday, January 22, 2026</span>
                </div>
                <h1 className="text-4xl font-bold mb-2 max-md:text-2xl">Welcome back, {studentInfo.name.split(' ')[0]}! 👋</h1>
                <p className="text-purple-100 text-lg max-md:text-base">Let's find the right direction for you today</p>
              </div>
              <div className="text-9xl opacity-10 max-md:hidden">🎯</div>
            </div>
            <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent"></div>
          </div>

          {/* Quick Actions Section */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-6 max-md:flex-col max-md:items-start max-md:gap-2">
              <h2 className="text-2xl font-bold text-gray-900">Get Started</h2>
              <span className="text-sm text-gray-500">Choose an action to begin your journey</span>
            </div>
            <div className="grid grid-cols-3 gap-6 max-lg:grid-cols-2 max-md:grid-cols-1">
              {quickActions.map((action) => {
                const IconComponent = action.icon;
                return (
                  <Link
                    key={action.id}
                    to={action.route}
                    className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 group cursor-pointer"
                  >
                    <div className={`w-14 h-14 bg-gradient-to-br ${action.gradient} rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-md`}>
                      <IconComponent size={28} className="text-white" />
                    </div>
                    <h3 className="font-bold text-gray-900 mb-2 text-lg">{action.title}</h3>
                    <p className="text-sm text-gray-600 mb-5 leading-relaxed min-h-[60px]">{action.description}</p>
                    <div className={`text-sm font-semibold bg-gradient-to-r ${action.gradient} text-white px-5 py-2.5 rounded-lg hover:shadow-lg transition-all w-full text-center`}>
                      {action.ctaText}
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-3 gap-6 mb-8 max-lg:grid-cols-2 max-md:grid-cols-1">
            {/* Academic Info Card */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                  <Target size={20} className="text-purple-600" />
                </div>
                <h3 className="font-semibold text-gray-900">Academic Info</h3>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between items-center p-3 bg-gradient-to-r from-purple-50 to-transparent rounded-lg border border-purple-100">
                  <span className="text-gray-600 text-sm font-medium">Credits</span>
                  <span className="font-bold text-gray-900 text-lg">{studentInfo.credits}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-gradient-to-r from-purple-50 to-transparent rounded-lg border border-purple-100">
                  <span className="text-gray-600 text-sm font-medium">CGPA</span>
                  <span className="font-bold text-gray-900 text-lg">{studentInfo.cgpa}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-gradient-to-r from-purple-50 to-transparent rounded-lg border border-purple-100">
                  <span className="text-gray-600 text-sm font-medium">Semester</span>
                  <span className="font-bold text-gray-900 text-lg">{studentInfo.semester}</span>
                </div>
              </div>
            </div>

            {/* Attendance Card */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <h3 className="font-semibold text-gray-900 mb-4">Attendance Overview</h3>
              <div className="flex items-center justify-center">
                <div className="relative w-36 h-36">
                  <svg className="transform -rotate-90 w-36 h-36">
                    <circle
                      cx="72"
                      cy="72"
                      r="60"
                      stroke="#e5e7eb"
                      strokeWidth="14"
                      fill="transparent"
                    />
                    <circle
                      cx="72"
                      cy="72"
                      r="60"
                      stroke="url(#gradient)"
                      strokeWidth="14"
                      fill="transparent"
                      strokeDasharray={`${2 * Math.PI * 60}`}
                      strokeDashoffset={`${2 * Math.PI * 60 * (1 - studentInfo.attendance / 100)}`}
                      strokeLinecap="round"
                    />
                    <defs>
                      <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#a855f7" />
                        <stop offset="100%" stopColor="#6366f1" />
                      </linearGradient>
                    </defs>
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-3xl font-bold text-gray-900">{studentInfo.attendance}%</span>
                    <span className="text-xs text-gray-500 font-medium">Present</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <h3 className="font-semibold text-gray-900 mb-4">Recent Activity</h3>
              <div className="space-y-3">
                {recentActivity.map((activity, idx) => (
                  <div key={idx} className="flex items-start gap-3 p-2.5 hover:bg-gray-50 rounded-lg transition-colors cursor-pointer">
                    <span className="text-2xl flex-shrink-0">{activity.icon}</span>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-gray-900 truncate">{activity.title}</div>
                      <div className="text-xs text-gray-500 mt-0.5">{activity.time}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Enrolled Courses */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-bold text-gray-900 text-xl">Enrolled Courses</h3>
              <button className="text-purple-600 text-sm font-semibold hover:underline">View All →</button>
            </div>
            <div className="grid grid-cols-2 gap-5 max-md:grid-cols-1">
              {enrolledCourses.map((course, idx) => (
                <div
                  key={idx}
                  className={`${course.color} rounded-xl p-5 border-2 ${course.borderColor} relative overflow-hidden group hover:shadow-lg transition-all cursor-pointer`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="text-3xl">{course.icon}</div>
                    <div className="bg-white px-3 py-1 rounded-full shadow-sm">
                      <span className="text-xs font-bold text-purple-700">{course.progress}%</span>
                    </div>
                  </div>
                  <h4 className="font-bold text-gray-900 mb-3 text-base">{course.name}</h4>
                  <div className="w-full bg-white rounded-full h-2.5 mb-4 shadow-inner">
                    <div
                      className="bg-gradient-to-r from-purple-600 to-indigo-600 h-2.5 rounded-full transition-all duration-300"
                      style={{ width: `${course.progress}%` }}
                    ></div>
                  </div>
                  <button className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-4 py-2.5 rounded-lg text-sm font-semibold hover:shadow-lg transition-all w-full">
                    Continue Learning →
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Helpful Message */}
          <div className="mt-8 bg-gradient-to-r from-purple-50 to-indigo-50 rounded-xl p-6 border-2 border-purple-200">
            <div className="flex items-start gap-4">
              <div className="text-3xl flex-shrink-0">💜</div>
              <div>
                <h4 className="font-semibold text-purple-900 mb-2">Remember</h4>
                <p className="text-gray-700 leading-relaxed">
                  There's no rush. Take your time exploring each option, and choose what feels right for you. This is your journey, and we're here to guide you every step of the way.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
