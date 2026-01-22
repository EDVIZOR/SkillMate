import React, { useState, useMemo } from 'react';
import { Card } from '../../components';
import './Roadmaps.css';

interface Roadmap {
  name: string;
  url: string;
  category: 'role-based' | 'skill-based' | 'project-ideas' | 'best-practices';
  isNew?: boolean;
}

const roadmaps: Roadmap[] = [
  // Role-based Roadmaps
  { name: 'Frontend', url: 'https://roadmap.sh/frontend', category: 'role-based' },
  { name: 'Backend', url: 'https://roadmap.sh/backend', category: 'role-based' },
  { name: 'Full Stack', url: 'https://roadmap.sh/full-stack', category: 'role-based' },
  { name: 'DevOps', url: 'https://roadmap.sh/devops', category: 'role-based' },
  { name: 'DevSecOps', url: 'https://roadmap.sh/devsecops', category: 'role-based', isNew: true },
  { name: 'Data Analyst', url: 'https://roadmap.sh/data-analyst', category: 'role-based' },
  { name: 'AI Engineer', url: 'https://roadmap.sh/ai-engineer', category: 'role-based' },
  { name: 'AI and Data Scientist', url: 'https://roadmap.sh/ai-and-data-scientist', category: 'role-based' },
  { name: 'Data Engineer', url: 'https://roadmap.sh/data-engineer', category: 'role-based' },
  { name: 'Android', url: 'https://roadmap.sh/android', category: 'role-based' },
  { name: 'Machine Learning', url: 'https://roadmap.sh/machine-learning', category: 'role-based' },
  { name: 'PostgreSQL', url: 'https://roadmap.sh/postgresql-dba', category: 'role-based' },
  { name: 'iOS', url: 'https://roadmap.sh/ios', category: 'role-based' },
  { name: 'Blockchain', url: 'https://roadmap.sh/blockchain', category: 'role-based' },
  { name: 'QA', url: 'https://roadmap.sh/qa', category: 'role-based' },
  { name: 'Software Architect', url: 'https://roadmap.sh/software-architect', category: 'role-based' },
  { name: 'Cyber Security', url: 'https://roadmap.sh/cyber-security', category: 'role-based' },
  { name: 'UX Design', url: 'https://roadmap.sh/ux-design', category: 'role-based' },
  { name: 'Technical Writer', url: 'https://roadmap.sh/technical-writer', category: 'role-based' },
  { name: 'Game Developer', url: 'https://roadmap.sh/game-developer', category: 'role-based' },
  { name: 'Server Side Game Developer', url: 'https://roadmap.sh/server-side-game-developer', category: 'role-based' },
  { name: 'MLOps', url: 'https://roadmap.sh/mlops', category: 'role-based' },
  { name: 'Product Manager', url: 'https://roadmap.sh/product-manager', category: 'role-based' },
  { name: 'Engineering Manager', url: 'https://roadmap.sh/engineering-manager', category: 'role-based' },
  { name: 'Developer Relations', url: 'https://roadmap.sh/developer-relations', category: 'role-based' },
  { name: 'BI Analyst', url: 'https://roadmap.sh/bi-analyst', category: 'role-based' },
  
  // Skill-based Roadmaps
  { name: 'SQL', url: 'https://roadmap.sh/sql', category: 'skill-based' },
  { name: 'Computer Science', url: 'https://roadmap.sh/computer-science', category: 'skill-based' },
  { name: 'React', url: 'https://roadmap.sh/react', category: 'skill-based' },
  { name: 'Vue', url: 'https://roadmap.sh/vue', category: 'skill-based' },
  { name: 'Angular', url: 'https://roadmap.sh/angular', category: 'skill-based' },
  { name: 'JavaScript', url: 'https://roadmap.sh/javascript', category: 'skill-based' },
  { name: 'TypeScript', url: 'https://roadmap.sh/typescript', category: 'skill-based' },
  { name: 'Node.js', url: 'https://roadmap.sh/nodejs', category: 'skill-based' },
  { name: 'Python', url: 'https://roadmap.sh/python', category: 'skill-based' },
  { name: 'System Design', url: 'https://roadmap.sh/system-design', category: 'skill-based' },
  { name: 'Java', url: 'https://roadmap.sh/java', category: 'skill-based' },
  { name: 'ASP.NET Core', url: 'https://roadmap.sh/aspnet-core', category: 'skill-based' },
  { name: 'API Design', url: 'https://roadmap.sh/api-design', category: 'skill-based' },
  { name: 'Spring Boot', url: 'https://roadmap.sh/spring-boot', category: 'skill-based' },
  { name: 'Flutter', url: 'https://roadmap.sh/flutter', category: 'skill-based' },
  { name: 'C++', url: 'https://roadmap.sh/cpp', category: 'skill-based' },
  { name: 'Rust', url: 'https://roadmap.sh/rust', category: 'skill-based' },
  { name: 'Go Roadmap', url: 'https://roadmap.sh/golang', category: 'skill-based' },
  { name: 'Design and Architecture', url: 'https://roadmap.sh/design-system', category: 'skill-based' },
  { name: 'GraphQL', url: 'https://roadmap.sh/graphql', category: 'skill-based' },
  { name: 'React Native', url: 'https://roadmap.sh/react-native', category: 'skill-based' },
  { name: 'Design System', url: 'https://roadmap.sh/design-system', category: 'skill-based' },
  { name: 'Prompt Engineering', url: 'https://roadmap.sh/prompt-engineering', category: 'skill-based' },
  { name: 'MongoDB', url: 'https://roadmap.sh/mongodb', category: 'skill-based' },
  { name: 'Linux', url: 'https://roadmap.sh/linux', category: 'skill-based' },
  { name: 'Kubernetes', url: 'https://roadmap.sh/kubernetes', category: 'skill-based' },
  { name: 'Docker', url: 'https://roadmap.sh/docker', category: 'skill-based' },
  { name: 'AWS', url: 'https://roadmap.sh/aws', category: 'skill-based' },
  { name: 'Terraform', url: 'https://roadmap.sh/terraform', category: 'skill-based' },
  { name: 'Data Structures & Algorithms', url: 'https://roadmap.sh/data-structures-and-algorithms', category: 'skill-based' },
  { name: 'Redis', url: 'https://roadmap.sh/redis', category: 'skill-based' },
  { name: 'Git and GitHub', url: 'https://roadmap.sh/git', category: 'skill-based' },
  { name: 'PHP', url: 'https://roadmap.sh/php', category: 'skill-based' },
  { name: 'Cloudflare', url: 'https://roadmap.sh/cloudflare', category: 'skill-based' },
  { name: 'AI Red Teaming', url: 'https://roadmap.sh/ai-red-teaming', category: 'skill-based' },
  { name: 'AI Agents', url: 'https://roadmap.sh/ai-agents', category: 'skill-based' },
  { name: 'Next.js', url: 'https://roadmap.sh/nextjs', category: 'skill-based' },
  { name: 'Code Review', url: 'https://roadmap.sh/code-review', category: 'skill-based' },
  { name: 'Kotlin', url: 'https://roadmap.sh/kotlin', category: 'skill-based' },
  { name: 'HTML', url: 'https://roadmap.sh/html', category: 'skill-based' },
  { name: 'CSS', url: 'https://roadmap.sh/css', category: 'skill-based' },
  { name: 'Swift & Swift UI', url: 'https://roadmap.sh/swift', category: 'skill-based' },
  { name: 'Shell / Bash', url: 'https://roadmap.sh/bash', category: 'skill-based' },
  { name: 'Laravel', url: 'https://roadmap.sh/laravel', category: 'skill-based' },
  { name: 'Elasticsearch', url: 'https://roadmap.sh/elasticsearch', category: 'skill-based' },
  { name: 'WordPress', url: 'https://roadmap.sh/wordpress', category: 'skill-based' },
  { name: 'Django', url: 'https://roadmap.sh/django', category: 'skill-based', isNew: true },
  { name: 'Ruby', url: 'https://roadmap.sh/ruby', category: 'skill-based', isNew: true },
  
  // Project Ideas
  { name: 'Frontend Projects', url: 'https://roadmap.sh/projects/frontend', category: 'project-ideas' },
  { name: 'Backend Projects', url: 'https://roadmap.sh/projects/backend', category: 'project-ideas' },
  { name: 'DevOps Projects', url: 'https://roadmap.sh/projects/devops', category: 'project-ideas' },
  
  // Best Practices
  { name: 'AWS Best Practices', url: 'https://roadmap.sh/best-practices/aws', category: 'best-practices' },
  { name: 'API Security', url: 'https://roadmap.sh/best-practices/api-security', category: 'best-practices' },
  { name: 'Backend Performance', url: 'https://roadmap.sh/best-practices/backend-performance', category: 'best-practices' },
  { name: 'Frontend Performance', url: 'https://roadmap.sh/best-practices/frontend-performance', category: 'best-practices' },
  { name: 'Code Review Best Practices', url: 'https://roadmap.sh/best-practices/code-review', category: 'best-practices' },
];

// Icon mapping for different roadmaps
const getRoadmapIcon = (name: string): string => {
  const iconMap: Record<string, string> = {
    'Frontend': '🎨', 'Backend': '⚙️', 'Full Stack': '🚀', 'DevOps': '🔧',
    'DevSecOps': '🔒', 'Data Analyst': '📊', 'AI Engineer': '🤖', 'AI and Data Scientist': '🧠',
    'Data Engineer': '💾', 'Android': '📱', 'Machine Learning': '🎓', 'PostgreSQL': '🐘',
    'iOS': '🍎', 'Blockchain': '⛓️', 'QA': '✅', 'Software Architect': '🏗️',
    'Cyber Security': '🛡️', 'UX Design': '🎯', 'Technical Writer': '✍️', 'Game Developer': '🎮',
    'Server Side Game Developer': '🎲', 'MLOps': '⚡', 'Product Manager': '📋', 'Engineering Manager': '👔',
    'Developer Relations': '🤝', 'BI Analyst': '📈',
    'React': '⚛️', 'Vue': '💚', 'Angular': '🅰️', 'JavaScript': '📜', 'TypeScript': '📘',
    'Node.js': '🟢', 'Python': '🐍', 'System Design': '🏛️', 'Java': '☕', 'C++': '⚡',
    'Rust': '🦀', 'Go Roadmap': '🐹', 'GraphQL': '🔷', 'React Native': '📲',
    'Docker': '🐳', 'Kubernetes': '☸️', 'AWS': '☁️', 'Linux': '🐧', 'MongoDB': '🍃',
    'Redis': '🔴', 'Git and GitHub': '📦', 'PHP': '🐘', 'HTML': '🌐', 'CSS': '🎨',
    'Swift & Swift UI': '🦉', 'Laravel': '🔴', 'Django': '🎸', 'Ruby': '💎',
    'SQL': '🗄️', 'Computer Science': '💻', 'Flutter': '📱', 'Terraform': '🏗️',
    'Elasticsearch': '🔍', 'WordPress': '📝', 'Next.js': '▲', 'Kotlin': '🟢',
    'Shell / Bash': '💻', 'Cloudflare': '☁️', 'Prompt Engineering': '✨', 'Design System': '🎨',
    'AI Red Teaming': '🔴', 'AI Agents': '🤖', 'Code Review': '👀', 'Design and Architecture': '🏛️',
    'Data Structures & Algorithms': '📚', 'API Design': '🔌', 'Spring Boot': '🌱', 'ASP.NET Core': '🔷',
  };
  
  return iconMap[name] || '📖';
};

const Roadmaps: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const roleBasedRoadmaps = roadmaps.filter(r => r.category === 'role-based');
  const skillBasedRoadmaps = roadmaps.filter(r => r.category === 'skill-based');
  const projectIdeas = roadmaps.filter(r => r.category === 'project-ideas');
  const bestPractices = roadmaps.filter(r => r.category === 'best-practices');

  // Filter roadmaps based on search and category
  const filteredRoadmaps = useMemo(() => {
    let filtered = roadmaps;
    
    if (selectedCategory) {
      filtered = filtered.filter(r => r.category === selectedCategory);
    }
    
    if (searchQuery) {
      filtered = filtered.filter(r => 
        r.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    return filtered;
  }, [searchQuery, selectedCategory]);

  const handleRoadmapClick = (url: string) => {
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const categories = [
    { id: 'role-based', name: 'Role-based', icon: '🎯', count: roleBasedRoadmaps.length },
    { id: 'skill-based', name: 'Skill-based', icon: '🛠️', count: skillBasedRoadmaps.length },
    { id: 'project-ideas', name: 'Project Ideas', icon: '💡', count: projectIdeas.length },
    { id: 'best-practices', name: 'Best Practices', icon: '⭐', count: bestPractices.length },
  ];

  return (
    <div className="roadmaps-page">
      {/* Header with Gradient */}
      <div className="roadmaps-header">
        <div className="header-background"></div>
        <div className="container">
          <div className="header-content">
            <h1 className="roadmaps-title">
              <span className="title-gradient">Developer Roadmaps</span>
            </h1>
            <p className="roadmaps-description">
              Community created roadmaps, guides and articles to help developers grow in their career.
              Explore comprehensive learning paths for various roles and skills.
            </p>
            <p className="roadmaps-source">
              Powered by <a href="https://roadmap.sh" target="_blank" rel="noopener noreferrer" className="roadmap-link">roadmap.sh</a>
            </p>
          </div>
        </div>
      </div>

      {/* Search and Filter Bar */}
      <div className="roadmaps-filters">
        <div className="container">
          <div className="filters-container">
            <div className="search-box">
              <span className="search-icon">🔍</span>
              <input
                type="text"
                placeholder="Search roadmaps..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="search-input"
              />
              {searchQuery && (
                <button 
                  onClick={() => setSearchQuery('')}
                  className="clear-search"
                  aria-label="Clear search"
                >
                  ✕
                </button>
              )}
            </div>
            <div className="category-filters">
              <button
                className={`category-filter ${selectedCategory === null ? 'active' : ''}`}
                onClick={() => setSelectedCategory(null)}
              >
                All ({roadmaps.length})
              </button>
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  className={`category-filter ${selectedCategory === cat.id ? 'active' : ''}`}
                  onClick={() => setSelectedCategory(cat.id as any)}
                >
                  {cat.icon} {cat.name} ({cat.count})
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* All Roadmaps Display */}
      {selectedCategory || searchQuery ? (
        <section className="roadmaps-section">
          <div className="container">
            <div className="results-header">
              <h2 className="section-title">
                {searchQuery ? `Search Results for "${searchQuery}"` : categories.find(c => c.id === selectedCategory)?.name + ' Roadmaps'}
                <span className="results-count">({filteredRoadmaps.length})</span>
              </h2>
            </div>
            {filteredRoadmaps.length > 0 ? (
              <div className="roadmaps-grid">
                {filteredRoadmaps.map((roadmap, index) => (
                  <Card
                    key={index}
                    variant="elevated"
                    padding="lg"
                    className="roadmap-card"
                    onClick={() => handleRoadmapClick(roadmap.url)}
                  >
                    <div className="roadmap-card-content">
                      <div className="roadmap-icon-wrapper">
                        <span className="roadmap-icon">{getRoadmapIcon(roadmap.name)}</span>
                      </div>
                      <div className="roadmap-card-header">
                        <h3 className="roadmap-name">{roadmap.name}</h3>
                        {roadmap.isNew && <span className="new-badge">New</span>}
                      </div>
                      <div className="roadmap-card-footer">
                        <span className="roadmap-link-text">Explore Roadmap →</span>
                      </div>
                    </div>
                    <div className="card-glow"></div>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="no-results">
                <div className="no-results-icon">🔍</div>
                <h3>No roadmaps found</h3>
                <p>Try adjusting your search or filter criteria</p>
              </div>
            )}
          </div>
        </section>
      ) : (
        <>
          {/* Role-based Roadmaps Section */}
          <section className="roadmaps-section">
            <div className="container">
              <div className="section-header">
                <h2 className="section-title">
                  <span className="section-icon">🎯</span>
                  Role-based Roadmaps
                </h2>
                <p className="section-description">
                  Choose a career path and follow a structured roadmap to become an expert in that role.
                </p>
              </div>
              <div className="roadmaps-grid">
                {roleBasedRoadmaps.map((roadmap, index) => (
                  <Card
                    key={index}
                    variant="elevated"
                    padding="lg"
                    className="roadmap-card"
                    onClick={() => handleRoadmapClick(roadmap.url)}
                  >
                    <div className="roadmap-card-content">
                      <div className="roadmap-icon-wrapper">
                        <span className="roadmap-icon">{getRoadmapIcon(roadmap.name)}</span>
                      </div>
                      <div className="roadmap-card-header">
                        <h3 className="roadmap-name">{roadmap.name}</h3>
                        {roadmap.isNew && <span className="new-badge">New</span>}
                      </div>
                      <div className="roadmap-card-footer">
                        <span className="roadmap-link-text">Explore Roadmap →</span>
                      </div>
                    </div>
                    <div className="card-glow"></div>
                  </Card>
                ))}
              </div>
            </div>
          </section>

          {/* Skill-based Roadmaps Section */}
          <section className="roadmaps-section bg-gray-50">
            <div className="container">
              <div className="section-header">
                <h2 className="section-title">
                  <span className="section-icon">🛠️</span>
                  Skill-based Roadmaps
                </h2>
                <p className="section-description">
                  Master specific technologies, frameworks, and tools with detailed learning paths.
                </p>
              </div>
              <div className="roadmaps-grid">
                {skillBasedRoadmaps.map((roadmap, index) => (
                  <Card
                    key={index}
                    variant="elevated"
                    padding="lg"
                    className="roadmap-card"
                    onClick={() => handleRoadmapClick(roadmap.url)}
                  >
                    <div className="roadmap-card-content">
                      <div className="roadmap-icon-wrapper">
                        <span className="roadmap-icon">{getRoadmapIcon(roadmap.name)}</span>
                      </div>
                      <div className="roadmap-card-header">
                        <h3 className="roadmap-name">{roadmap.name}</h3>
                        {roadmap.isNew && <span className="new-badge">New</span>}
                      </div>
                      <div className="roadmap-card-footer">
                        <span className="roadmap-link-text">Explore Roadmap →</span>
                      </div>
                    </div>
                    <div className="card-glow"></div>
                  </Card>
                ))}
              </div>
            </div>
          </section>

          {/* Project Ideas Section */}
          <section className="roadmaps-section">
            <div className="container">
              <div className="section-header">
                <h2 className="section-title">
                  <span className="section-icon">💡</span>
                  Project Ideas
                </h2>
                <p className="section-description">
                  Get inspired with project ideas to practice and showcase your skills.
                </p>
              </div>
              <div className="roadmaps-grid">
                {projectIdeas.map((roadmap, index) => (
                  <Card
                    key={index}
                    variant="elevated"
                    padding="lg"
                    className="roadmap-card"
                    onClick={() => handleRoadmapClick(roadmap.url)}
                  >
                    <div className="roadmap-card-content">
                      <div className="roadmap-icon-wrapper">
                        <span className="roadmap-icon">{getRoadmapIcon(roadmap.name)}</span>
                      </div>
                      <div className="roadmap-card-header">
                        <h3 className="roadmap-name">{roadmap.name}</h3>
                      </div>
                      <div className="roadmap-card-footer">
                        <span className="roadmap-link-text">View Projects →</span>
                      </div>
                    </div>
                    <div className="card-glow"></div>
                  </Card>
                ))}
              </div>
            </div>
          </section>

          {/* Best Practices Section */}
          <section className="roadmaps-section bg-gray-50">
            <div className="container">
              <div className="section-header">
                <h2 className="section-title">
                  <span className="section-icon">⭐</span>
                  Best Practices
                </h2>
                <p className="section-description">
                  Learn industry best practices and standards for building better software.
                </p>
              </div>
              <div className="roadmaps-grid">
                {bestPractices.map((roadmap, index) => (
                  <Card
                    key={index}
                    variant="elevated"
                    padding="lg"
                    className="roadmap-card"
                    onClick={() => handleRoadmapClick(roadmap.url)}
                  >
                    <div className="roadmap-card-content">
                      <div className="roadmap-icon-wrapper">
                        <span className="roadmap-icon">{getRoadmapIcon(roadmap.name)}</span>
                      </div>
                      <div className="roadmap-card-header">
                        <h3 className="roadmap-name">{roadmap.name}</h3>
                      </div>
                      <div className="roadmap-card-footer">
                        <span className="roadmap-link-text">View Best Practices →</span>
                      </div>
                    </div>
                    <div className="card-glow"></div>
                  </Card>
                ))}
              </div>
            </div>
          </section>
        </>
      )}
    </div>
  );
};

export default Roadmaps;
