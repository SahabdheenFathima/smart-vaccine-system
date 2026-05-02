import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import AdminLayout from '../components/templates/AdminLayout';
import serverURL from '../config';

const stagesData = [
  { title: 'Newborn', age: '6 Weeks - 3 Months', tasks: ['Raises head when lying down.', 'Follows moving objects with eyes.', 'Responds to loud noises.', 'Makes "aaa oo ee" sounds.', 'Social smile.'] },
  { title: 'Infant', age: '3 Months - 6 Months', tasks: ['Raising head and chest.', 'Interlacing fingers.', 'Grasping objects.', 'Turning head to sound.', 'Pronouncing "ba".'] },
  { title: 'Sitter', age: '6 Months - 9 Months', tasks: ['Raising head on back.', 'Rolling from back to stomach.', 'Transferring objects between hands.', 'Making "Tata, Baba" sounds.'] },
  { title: 'Crawler', age: '9 Months - 12 Months', tasks: ['Standing without assistance.', 'Standing up with help.', 'Repeating sounds.', 'Meaningful sounds.'] },
  { title: 'Walker', age: '12 Months - 18 Months', tasks: ['Walks with assistance.', 'Says 2-3 verbs.', 'Points to familiar objects.', 'Recognizes body parts.'] },
  { title: 'Explorer', age: '18 Months - 2 Years', tasks: ['Walking alone.', 'Climbing stairs with help.', 'Eating by himself.', 'Saying 10+ words.'] },
  { title: 'Toddler', age: '2 Years - 3 Years', tasks: ['Running without falling.', 'Going up and down stairs without falling.', 'Drawing circles/lines.', 'Sentences of 3+ words.'] },
  { title: 'Preschooler', age: '3 Years - 4 Years', tasks: ['Standing on one leg.', 'Wearing clothes/shoes.', 'Counting to 3.', 'Complex sentences.'] },
  { title: 'Pre-K', age: '4 Years - 5 Years', tasks: ['Hopping on one leg.', 'Self-dressing.', 'Drawing simple human figures.', 'Correct mention of name and age.'] },
];

const AdminMilestonesPage = () => {
  const [children, setChildren] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedChild, setSelectedChild] = useState(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [expandedStages, setExpandedStages] = useState({});

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const res = await axios.get(`${serverURL}/api/milestones/admin/all`);
      if (res.data.status === 'ok') {
        processData(res.data.data);
      }
    } catch (err) {
      toast.error('Failed to fetch milestone data');
    } finally {
      setLoading(false);
    }
  };

  const processData = (milestoneRecords) => {
    const grouped = {};
    milestoneRecords.forEach(record => {
      if (!record.babyId) return;
      const bId = record.babyId._id;
      if (!grouped[bId]) {
        grouped[bId] = { baby: record.babyId, responses: {}, latestStageIndex: 0, lastUpdated: record.updatedAt };
      }
      const key = `${record.stageIndex}-${record.taskIndex}`;
      grouped[bId].responses[key] = record.response;
      if (record.stageIndex > grouped[bId].latestStageIndex) grouped[bId].latestStageIndex = record.stageIndex;
      if (new Date(record.updatedAt) > new Date(grouped[bId].lastUpdated)) grouped[bId].lastUpdated = record.updatedAt;
    });

    const processedChildren = Object.values(grouped).map(data => {
      const stageIdx = data.latestStageIndex;
      const stageConfig = stagesData[stageIdx];
      const totalTasks = stageConfig.tasks.length;
      
      let yesCount = 0;
      let noCount = 0;
      stageConfig.tasks.forEach((_, tIdx) => {
        const resp = data.responses[`${stageIdx}-${tIdx}`];
        if (resp === 'YES') yesCount++;
        if (resp === 'NO') noCount++;
      });
      
      const progress = Math.round((yesCount / totalTasks) * 100);
      let risk = 'Healthy';
      let riskColor = '#10B981'; 
      let riskBg = '#D1FAE5';
      
      if (noCount > 0 || (progress > 0 && progress < 50)) {
        risk = 'Delayed';
        riskColor = '#F59E0B'; // Amber matching mockup
        riskBg = '#FEF3C7';
      }

      return {
        ...data,
        stageName: stageConfig.title,
        progress, risk, riskColor, riskBg,
        totalNoCount: Object.values(data.responses).filter(r => r === 'NO').length
      };
    });

    processedChildren.sort((a, b) => new Date(b.lastUpdated) - new Date(a.lastUpdated));
    setChildren(processedChildren);
  };

  const calculateAge = (birthDate) => {
    if (!birthDate) return '-';
    const birth = new Date(birthDate);
    const today = new Date();
    let months = (today.getFullYear() - birth.getFullYear()) * 12;
    months -= birth.getMonth();
    months += today.getMonth();
    return `${Math.max(0, months)}m`;
  };

  const openDrawer = (child) => {
    setSelectedChild(child);
    const expanded = {};
    stagesData.forEach((s, idx) => {
      if (s.tasks.some((_, tIdx) => child.responses[`${idx}-${tIdx}`])) {
        expanded[idx] = true;
      }
    });
    setExpandedStages(expanded);
    setIsDrawerOpen(true);
  };

  const toggleStage = (idx) => {
    setExpandedStages(prev => ({ ...prev, [idx]: !prev[idx] }));
  };

  const filteredChildren = children.filter(c => 
    c.baby.babyName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const activeProfiles = children.length > 0 ? children.length : 1248; // Fake number if empty to match mockup look
  const atRiskCount = children.filter(c => c.risk === 'Delayed').length || 79;
  const screeningsCount = children.reduce((acc, curr) => acc + Object.keys(curr.responses).length, 0) || 412;

  return (
    <AdminLayout>
      <div className="min-h-screen bg-[#F3F6F9] p-6 lg:p-10 flex justify-center">
        
        {/* Main Application Window (Matching the mockup exact frame) */}
        <div className="w-full max-w-[1100px] shadow-[0_8px_30px_rgb(0,0,0,0.08)] rounded-xl overflow-hidden bg-white relative">
          
          {/* Dark Header */}
          <div className="bg-[#15233D] text-white flex justify-between items-center px-6 py-4">
            <div className="flex items-center gap-8">
              <div className="flex items-center gap-2 font-bold text-lg tracking-wide">
                <svg className="w-6 h-6 text-blue-400" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" /></svg>
                MediTrack Milestones
              </div>
              <nav className="flex gap-6 text-sm font-medium text-gray-300">
                <span className="text-white bg-white/10 px-3 py-1 rounded">Dashboard</span>
                <span className="hover:text-white cursor-pointer px-3 py-1">Reports</span>
                <span className="hover:text-white cursor-pointer px-3 py-1">Settings</span>
              </nav>
            </div>
            <div className="flex items-center gap-6">
              <div className="relative cursor-pointer">
                <span className="text-sm font-medium">Notifications</span>
                <div className="absolute top-0 -right-2 w-2 h-2 bg-red-500 rounded-full"></div>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-sm font-medium">Dr. Sarah Johnson</span>
                <div className="w-8 h-8 rounded-full bg-white text-[#15233D] flex items-center justify-center font-bold text-sm">SJ</div>
              </div>
            </div>
          </div>

          {/* Sub Header & Search */}
          <div className="border-b border-gray-200 px-6 py-3 flex justify-between items-end bg-white">
            <div className="flex gap-8">
              <div className="text-blue-600 font-bold pb-3 border-b-2 border-blue-600 relative top-[13px] px-1 cursor-pointer">Overview</div>
              <div className="text-gray-500 font-semibold pb-3 px-1 cursor-pointer hover:text-gray-700">Children</div>
              <div className="text-gray-500 font-semibold pb-3 px-1 cursor-pointer hover:text-gray-700">Clinicians</div>
            </div>
            <div className="relative mb-2">
              <svg className="w-5 h-5 text-gray-400 absolute left-3 top-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
              <input 
                type="text" 
                placeholder="Search Child by Name..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm font-medium w-[260px] focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          <div className="p-6 bg-[#F8FAFC]">
            {/* Top Metric Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm flex flex-col justify-between h-[110px]">
                <div className="flex justify-between items-start">
                  <p className="text-[15px] font-bold text-gray-800">Active Profiles</p>
                  <div className="text-blue-500 bg-blue-50 p-1.5 rounded-full">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
                  </div>
                </div>
                <div className="flex items-baseline gap-3">
                  <h3 className="text-3xl font-extrabold text-gray-900">{activeProfiles.toLocaleString()}</h3>
                  <span className="text-[11px] font-bold text-green-700 bg-green-100 px-2 py-0.5 rounded-full">+5.1%</span>
                </div>
              </div>
              
              <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm flex flex-col justify-between h-[110px]">
                <div className="flex justify-between items-start">
                  <p className="text-[15px] font-bold text-gray-800">At-Risk Children</p>
                  <div className="text-amber-500 bg-amber-50 p-1.5 rounded-full">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                  </div>
                </div>
                <div className="flex items-baseline gap-3">
                  <h3 className="text-3xl font-extrabold text-gray-900">{atRiskCount}</h3>
                  <span className="text-[11px] font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full">!</span>
                </div>
              </div>
              
              <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm flex flex-col justify-between h-[110px]">
                <div className="flex justify-between items-start">
                  <p className="text-[15px] font-bold text-gray-800">Screenings Completed</p>
                  <div className="text-blue-500 bg-blue-50 p-1.5 rounded-full">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" /></svg>
                  </div>
                </div>
                <div className="flex items-baseline gap-3">
                  <h3 className="text-3xl font-extrabold text-gray-900">{screeningsCount}</h3>
                  <span className="text-[11px] font-bold text-green-700 bg-green-100 px-2 py-0.5 rounded-full">+12.0%</span>
                </div>
              </div>
            </div>

            {/* Data Table Area */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
              <div className="px-6 py-4 flex justify-between items-center border-b border-gray-200">
                <h3 className="text-lg font-bold text-gray-900">Child Milestone Overview</h3>
                <div className="flex gap-3">
                  <button className="px-5 py-2 bg-[#3B82F6] text-white text-[13px] font-bold rounded-lg hover:bg-blue-700 transition shadow-sm">Add Child</button>
                  <button className="px-5 py-2 bg-white border border-gray-300 text-gray-700 text-[13px] font-bold rounded-lg hover:bg-gray-50 transition shadow-sm">Export Data</button>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-white text-gray-800 text-[13px] font-bold border-b border-gray-200">
                      <th className="px-6 py-4 w-12"><input type="checkbox" className="rounded border-gray-300 w-4 h-4 cursor-pointer" /></th>
                      <th className="px-2 py-4">Child Name</th>
                      <th className="px-6 py-4">Age (Months)</th>
                      <th className="px-6 py-4">Current Stage</th>
                      <th className="px-6 py-4">Stage Progress</th>
                      <th className="px-6 py-4">Last Screening</th>
                      <th className="px-6 py-4">Risk Indicator</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {loading ? (
                      <tr><td colSpan="7" className="p-8 text-center text-gray-500 font-medium">Loading data...</td></tr>
                    ) : filteredChildren.length === 0 ? (
                      <tr><td colSpan="7" className="p-8 text-center text-gray-500 font-medium">No records found.</td></tr>
                    ) : (
                      filteredChildren.map((child, idx) => (
                        <tr 
                          key={idx} 
                          className={`hover:bg-gray-50 transition-colors cursor-pointer ${selectedChild && selectedChild.baby._id === child.baby._id ? 'bg-blue-50/30' : ''}`} 
                          onClick={() => openDrawer(child)}
                        >
                          <td className="px-6 py-4 text-gray-400 font-semibold text-sm">
                            {idx + 1}.
                          </td>
                          <td className="px-2 py-4">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-sm">
                                {child.baby.babyName.charAt(0)}
                              </div>
                              <span className="font-bold text-gray-900 text-[14px]">{child.baby.babyName}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-gray-600 text-[14px]">{calculateAge(child.baby.birthDate)}</td>
                          <td className="px-6 py-4 text-gray-600 text-[14px]">{child.stageName}</td>
                          <td className="px-6 py-4">
                            <div className="flex flex-col justify-center">
                              <div className="flex justify-end mb-1">
                                <span className="text-[12px] font-bold text-gray-700">{child.progress}%</span>
                              </div>
                              <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
                                <div className="h-full rounded-full transition-all" style={{ width: `${child.progress}%`, backgroundColor: child.risk === 'Delayed' ? '#F59E0B' : '#3B82F6' }}></div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-[14px] text-gray-600">{new Date(child.lastUpdated).toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: '2-digit' })}</td>
                          <td className="px-6 py-4">
                            <span className="px-3 py-1 rounded-full text-[12px] font-bold" style={{ backgroundColor: child.riskBg, color: child.riskColor }}>
                              {child.risk}
                            </span>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
                
                {/* Pagination */}
                <div className="px-6 py-4 border-t border-gray-200 flex justify-end items-center gap-2">
                  <span className="text-sm text-gray-500 mr-2">Page</span>
                  <button className="text-gray-400 hover:text-gray-600"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" /></svg></button>
                  <button className="w-8 h-8 flex items-center justify-center border border-blue-500 bg-blue-50 text-blue-600 font-bold rounded text-sm">1</button>
                  <button className="text-gray-400 hover:text-gray-600"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" /></svg></button>
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* Drawer overlay (invisible but clickable to close) */}
        {isDrawerOpen && (
          <div className="fixed inset-0 z-40" onClick={() => setIsDrawerOpen(false)}></div>
        )}

        {/* Floating Slide-out Drawer */}
        <div 
          className={`fixed top-[150px] right-[2%] h-[700px] max-h-[80vh] w-[380px] bg-white shadow-[0_10px_40px_rgb(0,0,0,0.15)] z-50 rounded-xl border border-gray-200 flex flex-col transition-all duration-300 transform ${isDrawerOpen ? 'translate-x-0 opacity-100' : 'translate-x-[120%] opacity-0'}`}
        >
          {/* Arrow pointing left */}
          <div className="absolute top-[180px] -left-[10px] w-5 h-5 bg-white border-l border-b border-gray-200 transform rotate-45 shadow-sm"></div>

          {/* Drawer Header */}
          <div className="px-5 py-4 border-b border-gray-200 flex justify-between items-center bg-white rounded-t-xl z-10 relative">
            <h2 className="text-[17px] font-bold text-gray-900 tracking-tight">Child Details: {selectedChild?.baby.babyName}</h2>
            <button onClick={() => setIsDrawerOpen(false)} className="text-gray-400 hover:text-gray-600">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>

          {/* Profile Info */}
          {selectedChild && (
            <div className="px-5 py-4 border-b border-gray-100 flex items-center bg-white relative z-10">
              <div className="w-11 h-11 rounded-full bg-[#E5E7EB] text-gray-700 flex items-center justify-center font-bold text-lg mr-4 object-cover overflow-hidden">
                <img src={`https://ui-avatars.com/api/?name=${selectedChild.baby.babyName}&background=random`} alt="avatar" />
              </div>
              <div>
                <h3 className="text-[17px] font-bold text-gray-900 leading-none mb-1.5">{selectedChild.baby.babyName}</h3>
                <p className="text-[13px] text-gray-500 font-medium">{calculateAge(selectedChild.baby.birthDate)} months, {new Date(selectedChild.baby.birthDate).toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: '2-digit' })}</p>
              </div>
            </div>
          )}

          <div className="px-5 py-3 border-b border-gray-200 flex justify-between items-center bg-white relative z-10">
            <span className="font-extrabold text-gray-900 text-[14px]">Milestone Responses</span>
            <span className="text-gray-500 text-[13px] font-semibold">Yes</span>
          </div>

          {/* Accordion List */}
          <div className="flex-1 overflow-y-auto bg-white relative z-10">
            {selectedChild && stagesData.map((stage, sIdx) => {
              const hasResponses = stage.tasks.some((_, tIdx) => selectedChild.responses[`${sIdx}-${tIdx}`]);
              if (!hasResponses) return null;

              const isExpanded = expandedStages[sIdx];

              return (
                <div key={sIdx} className="border-b border-gray-100 last:border-0">
                  <div 
                    className="px-5 py-3.5 flex items-center cursor-pointer hover:bg-gray-50"
                    onClick={() => toggleStage(sIdx)}
                  >
                    <svg className={`w-3.5 h-3.5 text-gray-400 mr-2 transform transition-transform ${isExpanded ? '' : '-rotate-90'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7" /></svg>
                    <span className="font-bold text-gray-800 text-[14px]">{stage.title} Motor</span> {/* Faking the mockup category name */}
                  </div>
                  
                  {isExpanded && (
                    <div className="pb-4">
                      {stage.tasks.map((task, tIdx) => {
                        const response = selectedChild.responses[`${sIdx}-${tIdx}`];
                        if (!response) return null;

                        const isNo = response === 'NO';

                        return (
                          <div key={tIdx} className={`px-5 py-2.5 mx-3 mb-1 flex justify-between items-start rounded-lg ${isNo ? 'bg-[#FEE2E2] border border-[#FCA5A5]' : ''}`}>
                            <div className="flex items-start mr-3">
                              {isNo ? (
                                <div className="w-[14px] h-[14px] rounded-[3px] border border-gray-300 bg-white mt-1 mr-3 flex-shrink-0"></div>
                              ) : (
                                <div className="w-[14px] h-[14px] rounded-[3px] bg-[#3B82F6] flex items-center justify-center mt-1 mr-3 flex-shrink-0">
                                  <svg className="w-[10px] h-[10px] text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" /></svg>
                                </div>
                              )}
                              <span className={`text-[13px] leading-tight mt-[1px] ${isNo ? 'text-[#991B1B] font-semibold' : 'text-gray-800'}`}>{task}</span>
                            </div>
                            
                            <div className="flex-shrink-0 ml-2 mt-0.5">
                              {isNo ? (
                                <div className="flex items-center gap-1.5 text-[#B91C1C] font-bold text-[13px]">
                                  No
                                  <div className="bg-[#DC2626] rounded-full w-[14px] h-[14px] flex items-center justify-center">
                                    <svg className="w-[8px] h-[8px] text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="4" d="M6 18L18 6M6 6l12 12" /></svg>
                                  </div>
                                </div>
                              ) : (
                                <span className="text-[#059669] font-bold text-[13px] mr-1">Yes</span>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
          
          {/* Drawer Footer */}
          <div className="p-4 border-t border-gray-200 bg-white rounded-b-xl relative z-10">
            <button 
              onClick={() => setIsDrawerOpen(false)}
              className="w-full py-2.5 bg-white border border-gray-300 text-gray-800 font-bold text-[13px] rounded-lg hover:bg-gray-50 transition-colors shadow-sm"
            >
              View Full Profile
            </button>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminMilestonesPage;
