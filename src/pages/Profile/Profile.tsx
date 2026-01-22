import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Home, User, BookOpen, Award, Trophy, Briefcase, Lightbulb, FileText, LogOut, Bell, Settings, Edit2, Plus, MapPin, Maximize2, Search, ChevronRight, ClipboardCheck, Compass, TrendingUp, Map, Save } from 'lucide-react';

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

// Save student info to localStorage
const saveStudentInfo = (info: typeof defaultStudentInfo) => {
  localStorage.setItem('studentInfo', JSON.stringify(info));
};

const Profile: React.FC = () => {
  const [activeMenu, setActiveMenu] = useState<string>('Personal Info');
  const [studentInfo, setStudentInfo] = useState(loadStudentInfo);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [saveMessage, setSaveMessage] = useState<string>('');
  
  // Load data on mount
  useEffect(() => {
    const loaded = loadStudentInfo();
    setStudentInfo(loaded);
  }, []);

  const [areasOfInterest, setAreasOfInterest] = useState<string[]>(['Badminton', 'Competitive Programming', 'Web development']);
  const [linkedLinks, setLinkedLinks] = useState<Array<{ name: string; value: string }>>([{ name: 'Leetcode', value: 'nischal2341' }]);

  const handleInputChange = (field: string, value: string) => {
    setStudentInfo(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSave = () => {
    setIsSaving(true);
    saveStudentInfo(studentInfo);
    
    // Dispatch custom event to notify Dashboard (same tab)
    window.dispatchEvent(new Event('studentInfoUpdated'));
    
    // Show success message
    setSaveMessage('Profile saved successfully!');
    setTimeout(() => {
      setSaveMessage('');
      setIsSaving(false);
    }, 2000);
  };

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


  const handleLogout = () => {
    // Handle logout - to be connected to auth later
    window.location.href = '/login';
  };

  const handleMenuClick = (label: string, route: string) => {
    setActiveMenu(label);
    // Navigation will be handled by Link components or router
  };

  return (
    <div className="flex h-screen bg-gray-100">
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
              onClick={() => handleMenuClick(item.label, item.route)}
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
      <main className="flex-1 ml-64 overflow-y-auto bg-gray-100 max-lg:ml-0">
        {/* Header */}
        <header className="bg-white border-b px-6 py-3 flex items-center justify-between sticky top-0 z-10 max-md:px-4">
          <div className="flex-1 max-w-sm">
            <div className="relative">
              <Search size={16} className="absolute left-3 top-2.5 text-gray-400" />
              <input 
                type="text" 
                placeholder="Search" 
                className="pl-9 pr-3 py-2 border rounded-lg w-full text-sm focus:ring-2 focus:ring-purple-500 focus:outline-none" 
              />
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 max-md:hidden">
              <div className="w-9 h-9 bg-gradient-to-br from-orange-400 to-orange-600 rounded-full flex items-center justify-center text-white font-semibold text-sm">NB</div>
              <div className="text-xs">
                <div className="font-semibold text-gray-900">{studentInfo.name}</div>
                <div className="text-gray-500">{studentInfo.year}, {studentInfo.department}</div>
              </div>
            </div>
            <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
              <Bell size={18} className="text-gray-600" />
            </button>
            <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
              <Settings size={18} className="text-gray-600" />
            </button>
          </div>
        </header>

        {/* Content Grid */}
        <div className="p-6 grid grid-cols-3 gap-4 max-lg:grid-cols-1 max-md:p-4">
          {/* Left Column */}
          <div className="col-span-2 space-y-4 max-lg:col-span-1">
            {/* Personal Info */}
            <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-5 text-white">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h2 className="font-bold text-lg mb-1">Personal Info</h2>
                  <p className="text-purple-100 text-xs">Edit your personal information here</p>
                </div>
                <div className="flex items-center gap-2">
                  {saveMessage && (
                    <span className="text-xs text-green-200 bg-green-500/20 px-2 py-1 rounded">
                      {saveMessage}
                    </span>
                  )}
                  <button 
                    onClick={handleSave}
                    disabled={isSaving}
                    className="px-4 py-2 bg-white text-purple-600 rounded-lg text-sm font-semibold hover:bg-purple-50 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Save size={16} />
                    {isSaving ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3 max-md:grid-cols-1">
                <div>
                  <label className="text-purple-100 text-xs block mb-1">Full name</label>
                  <input 
                    type="text"
                    value={studentInfo.name} 
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    className="w-full bg-white/20 border border-white/30 rounded-lg px-3 py-2 text-sm text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/50" 
                    placeholder="Enter your full name"
                  />
                </div>
                <div>
                  <label className="text-purple-100 text-xs block mb-1">Email</label>
                  <div className="relative">
                    <input 
                      type="email"
                      value={studentInfo.email} 
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      className="w-full bg-white/20 border border-white/30 rounded-lg px-3 py-2 text-sm text-white pr-8 placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/50" 
                      placeholder="Enter your email"
                    />
                    <Edit2 size={12} className="absolute right-2 top-3 text-purple-200" />
                  </div>
                </div>
                <div>
                  <label className="text-purple-100 text-xs block mb-1">Contact Number</label>
                  <div className="relative">
                    <input 
                      type="tel"
                      value={studentInfo.phone} 
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                      className="w-full bg-white/20 border border-white/30 rounded-lg px-3 py-2 text-sm text-white pr-8 placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/50" 
                      placeholder="Enter your phone number"
                    />
                    <Edit2 size={12} className="absolute right-2 top-3 text-purple-200" />
                  </div>
                </div>
                <div>
                  <label className="text-purple-100 text-xs block mb-1">DOB</label>
                  <div className="relative">
                    <input 
                      type="text"
                      value={studentInfo.dob} 
                      onChange={(e) => handleInputChange('dob', e.target.value)}
                      className="w-full bg-white/20 border border-white/30 rounded-lg px-3 py-2 text-sm text-white pr-8 placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/50" 
                      placeholder="Enter your date of birth"
                    />
                    <Edit2 size={12} className="absolute right-2 top-3 text-purple-200" />
                  </div>
                </div>
              </div>
            </div>

            {/* Professional Info & Additional Info */}
            <div className="grid grid-cols-2 gap-4 max-md:grid-cols-1">
              <div className="bg-white rounded-xl p-5 border border-gray-200">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-bold text-gray-900">Professional Info</h3>
                  <button className="p-1 hover:bg-gray-100 rounded transition-colors">
                    <Edit2 size={14} className="text-purple-600" />
                  </button>
                </div>
                <div className="space-y-3">
                  <div>
                    <label className="text-gray-600 text-xs block mb-1">Degree</label>
                    <input 
                      type="text"
                      value={studentInfo.degree} 
                      onChange={(e) => handleInputChange('degree', e.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                  <div>
                    <label className="text-gray-600 text-xs block mb-1">Branch</label>
                    <input 
                      type="text"
                      value={studentInfo.branch} 
                      onChange={(e) => handleInputChange('branch', e.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                  <div>
                    <label className="text-gray-600 text-xs block mb-1">Semester</label>
                    <input 
                      type="text"
                      value={studentInfo.semester} 
                      onChange={(e) => handleInputChange('semester', e.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                  <div>
                    <label className="text-gray-600 text-xs block mb-1">Roll number</label>
                    <input 
                      type="text"
                      value={studentInfo.rollNo} 
                      onChange={(e) => handleInputChange('rollNo', e.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-5 text-white">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-bold">Additional Info</h3>
                  <button className="p-1 hover:bg-purple-400 rounded transition-colors">
                    <Maximize2 size={14} className="cursor-pointer" />
                  </button>
                </div>
                <div className="space-y-3">
                  <div>
                    <label className="text-purple-100 text-xs block mb-1">Resume</label>
                    <input 
                      type="text"
                      value={studentInfo.resume} 
                      onChange={(e) => handleInputChange('resume', e.target.value)}
                      className="w-full bg-white/20 border border-white/30 rounded-lg px-3 py-1.5 text-sm text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/50" 
                      placeholder="Enter resume filename"
                    />
                  </div>
                  <div>
                    <label className="text-purple-100 text-xs block mb-1">Linked Links</label>
                    <div className="flex gap-2 flex-wrap">
                      {linkedLinks.map((link, i) => (
                        <span key={i} className="bg-white/20 px-2 py-1 rounded-full text-xs">{link.name}</span>
                      ))}
                      <button className="bg-white/20 px-2 py-1 rounded-full text-xs hover:bg-white/30 transition-colors">+2</button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Areas of Interest */}
            <div className="bg-white rounded-xl p-5 border border-gray-200">
              <div className="flex justify-between items-center mb-3">
                <h3 className="font-bold text-gray-900">Areas of Interest</h3>
                <div className="flex gap-2">
                  <button className="p-1 hover:bg-gray-100 rounded transition-colors">
                    <Plus size={16} className="text-purple-600" />
                  </button>
                  <button className="p-1 hover:bg-gray-100 rounded transition-colors">
                    <ChevronRight size={16} className="text-gray-600" />
                  </button>
                </div>
              </div>
              <ul className="space-y-2">
                {areasOfInterest.map((interest, i) => (
                  <li key={i} className="text-sm text-gray-700">• {interest}</li>
                ))}
              </ul>
            </div>

            {/* Projects & Internship */}
            <div className="grid grid-cols-2 gap-4 max-md:grid-cols-1">
              <div className="bg-white rounded-xl p-5 border border-gray-200">
                <div className="flex justify-between items-center mb-3">
                  <h3 className="font-bold text-gray-900">Projects</h3>
                  <div className="flex gap-2">
                    <button className="p-1 hover:bg-gray-100 rounded transition-colors">
                      <Plus size={16} className="text-purple-600" />
                    </button>
                    <button className="p-1 hover:bg-gray-100 rounded transition-colors">
                      <Maximize2 size={16} className="text-gray-600" />
                    </button>
                  </div>
                </div>
                <div className="text-sm text-purple-600 font-medium cursor-pointer hover:text-purple-700 transition-colors">Do your own project</div>
              </div>

              <div className="bg-white rounded-xl p-5 border border-gray-200">
                <div className="flex justify-between items-center mb-3">
                  <h3 className="font-bold text-gray-900">Internship</h3>
                  <div className="flex gap-2">
                    <button className="p-1 hover:bg-gray-100 rounded transition-colors">
                      <Plus size={16} className="text-purple-600" />
                    </button>
                    <button className="p-1 hover:bg-gray-100 rounded transition-colors">
                      <Maximize2 size={16} className="text-gray-600" />
                    </button>
                  </div>
                </div>
                <div className="text-sm text-gray-500">Nothing to show here right now</div>
              </div>
            </div>

            {/* Achievements */}
            <div className="bg-white rounded-xl p-5 border border-gray-200">
              <div className="flex justify-between items-center mb-3">
                <h3 className="font-bold text-gray-900">Achievements</h3>
                <div className="flex gap-2">
                  <button className="p-1 hover:bg-gray-100 rounded transition-colors">
                    <Plus size={16} className="text-purple-600" />
                  </button>
                  <button className="p-1 hover:bg-gray-100 rounded transition-colors">
                    <ChevronRight size={16} className="text-gray-600" />
                  </button>
                </div>
              </div>
              <div className="text-sm text-purple-600 font-medium cursor-pointer hover:text-purple-700 transition-colors">Upload certificate</div>
            </div>
          </div>

          {/* Right Column - Profile Card */}
          <div className="space-y-4">
            <div className="bg-white rounded-xl p-5 border border-gray-200 relative">
              <button className="absolute top-4 right-4 p-1 hover:bg-gray-100 rounded transition-colors">
                <Maximize2 size={14} />
              </button>
              <div className="flex flex-col items-center">
                <div className="w-32 h-32 bg-gray-100 rounded-full mb-4 flex items-center justify-center relative">
                  <div className="w-28 h-28 bg-gradient-to-br from-orange-100 to-orange-200 rounded-full flex items-center justify-center">
                    <span className="text-5xl">👤</span>
                  </div>
                  <button className="absolute bottom-0 right-0 w-8 h-8 bg-gray-900 rounded-full flex items-center justify-center text-white hover:bg-gray-800 transition-colors">
                    <Plus size={16} />
                  </button>
                </div>
                <h2 className="font-bold text-gray-900 text-lg mb-1">{studentInfo.name}</h2>
                <span className="text-sm text-gray-600 mb-4">{studentInfo.role}</span>
                
                <div className="w-full bg-gray-50 rounded-lg p-3 mb-4">
                  <div className="flex items-start gap-2">
                    <MapPin size={14} className="text-gray-500 mt-0.5 flex-shrink-0" />
                    <div className="flex-1">
                      <div className="font-semibold text-gray-900 text-sm mb-1">Location</div>
                      <input 
                        type="text"
                        value={studentInfo.location} 
                        onChange={(e) => handleInputChange('location', e.target.value)}
                        className="w-full text-xs text-gray-600 bg-transparent border-b border-gray-300 focus:outline-none focus:border-purple-500 pb-1"
                        placeholder="Enter your location"
                      />
                    </div>
                  </div>
                </div>

                <div className="w-full bg-gray-50 rounded-lg p-3">
                  <div className="flex items-start gap-2">
                    <FileText size={14} className="text-gray-500 mt-0.5 flex-shrink-0" />
                    <div className="flex-1">
                      <div className="flex justify-between items-center mb-1">
                        <div className="font-semibold text-gray-900 text-sm">About Me</div>
                        <button className="p-1 hover:bg-gray-200 rounded transition-colors">
                          <Edit2 size={12} className="text-gray-500 cursor-pointer" />
                        </button>
                      </div>
                      <textarea 
                        value={studentInfo.aboutMe} 
                        onChange={(e) => handleInputChange('aboutMe', e.target.value)}
                        className="w-full text-xs text-gray-600 leading-relaxed bg-transparent border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
                        rows={4}
                        placeholder="Tell us about yourself..."
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Profile;

