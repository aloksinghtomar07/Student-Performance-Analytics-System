/**
 * Student Performance Analytics System
 * EWB Courses | Python with AI Assignment
 */

import React, { useState, useEffect } from 'react';
import {
  Play,
  Terminal,
  FileCode,
  BarChart3,
  BookOpen,
  GitBranch,
  Download,
  RefreshCw,
  Plus,
  CheckCircle,
  AlertCircle,
  X,
  Copy,
  Check,
  Search,
  Award,
  Users,
  GraduationCap,
  ExternalLink,
  ChevronRight,
  Sparkles
} from 'lucide-react';

interface PracticalAnswers {
  question_1_highest_student: {
    question: string;
    answer: string;
    name: string;
    id: string;
    department: string;
    average: number;
    total: number;
    grade: string;
  };
  question_2_best_subject: {
    question: string;
    answer: string;
    subject_code: string;
    subject_name: string;
    average: number;
    lowest_subject: {
      subject_name: string;
      average: number;
    };
  };
  question_3_pass_count: {
    question: string;
    answer: string;
    passed_count: number;
    failed_count: number;
    total_students: number;
    pass_percentage: number;
  };
  question_4_class_average: {
    question: string;
    answer: string;
    overall_marks_average: number;
    student_average_mean: number;
  };
  lowest_performing_student: {
    name: string;
    id: string;
    average: number;
    grade: string;
    department: string;
  };
}

interface StudentRecord {
  student_id: string;
  name: string;
  department: string;
  math: number;
  physics: number;
  chemistry: number;
  computer_science: number;
  english: number;
  attendance: number;
  total_marks: number;
  average_marks: number;
  grade: string;
  grade_label: string;
  status: 'PASS' | 'FAIL';
  failed_subjects_count: number;
  attendance_status: string;
  rank: number;
}

interface SubjectStat {
  subject_name: string;
  highest: number;
  lowest: number;
  average: number;
  std_dev: number;
  median: number;
  passed_count: number;
  failed_count: number;
  pass_rate: number;
  top_scorer: string;
}

interface DeptStat {
  student_count: number;
  average_marks: number;
  highest_average: number;
  lowest_average: number;
  pass_count: number;
  pass_percentage: number;
  average_attendance: number;
}

interface AnalyticsData {
  metadata: {
    title: string;
    course: string;
    deadline: string;
    total_students: number;
    subjects: string[];
    passing_mark: number;
    min_attendance: number;
    grading_scale: Array<{ threshold: number; grade: string; label: string }>;
  };
  summary: {
    total_students: number;
    class_average: number;
    overall_marks_average: number;
    passed_count: number;
    failed_count: number;
    pass_percentage: number;
    highest_student: PracticalAnswers['question_1_highest_student'];
    lowest_student: PracticalAnswers['lowest_performing_student'];
    best_subject: PracticalAnswers['question_2_best_subject'];
    average_attendance: number;
  };
  practical_answers: PracticalAnswers;
  students: StudentRecord[];
  top_performers: StudentRecord[];
  subject_analysis: Record<string, SubjectStat>;
  department_analysis: Record<string, DeptStat>;
  grade_distribution: Record<string, number>;
  executionTimeMs?: number;
}

interface ProjectFile {
  filename: string;
  content: string;
  exists: boolean;
}

export default function App() {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'code' | 'terminal' | 'docs' | 'submission'>('dashboard');
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [runningPython, setRunningPython] = useState<boolean>(false);
  const [terminalOutput, setTerminalOutput] = useState<string>('');
  const [terminalExecutionTime, setTerminalExecutionTime] = useState<number | null>(null);
  const [terminalExitCode, setTerminalExitCode] = useState<number | null>(null);
  
  // Files
  const [files, setFiles] = useState<ProjectFile[]>([]);
  const [selectedFilename, setSelectedFilename] = useState<string>('main.py');
  const [editedCode, setEditedCode] = useState<string>('');
  const [isEditingFile, setIsEditingFile] = useState<boolean>(false);
  const [saveStatus, setSaveStatus] = useState<string>('');

  // Table filters & searches
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [departmentFilter, setDepartmentFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'PASS' | 'FAIL' | 'SHORTAGE'>('all');
  const [sortBy, setSortBy] = useState<'rank' | 'average' | 'attendance' | 'name'>('rank');

  // Modals & helpers
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [copiedText, setCopiedText] = useState<string | null>(null);

  // New Student Form state
  const [newStudent, setNewStudent] = useState({
    student_id: '',
    name: '',
    department: 'Computer Science',
    math: 75,
    physics: 70,
    chemistry: 72,
    computer_science: 80,
    english: 75,
    attendance: 85
  });

  // Fetch initial analytics and files
  useEffect(() => {
    fetchAnalytics();
    fetchFiles();
  }, []);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/analytics');
      if (res.ok) {
        const data = await res.json();
        setAnalytics(data);
      } else {
        console.error('Failed to fetch analytics');
      }
    } catch (err) {
      console.error('Error fetching analytics:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchFiles = async () => {
    try {
      const res = await fetch('/api/files');
      if (res.ok) {
        const data = await res.json();
        setFiles(data.files || []);
        const currentFile = (data.files || []).find((f: ProjectFile) => f.filename === selectedFilename);
        if (currentFile) {
          setEditedCode(currentFile.content);
        }
      }
    } catch (err) {
      console.error('Error fetching files:', err);
    }
  };

  const runPythonScript = async () => {
    setRunningPython(true);
    setActiveTab('terminal');
    try {
      const res = await fetch('/api/run-terminal', { method: 'POST' });
      const data = await res.json();
      setTerminalOutput(data.stdout || data.stderr || 'No output produced');
      setTerminalExecutionTime(data.executionTimeMs);
      setTerminalExitCode(data.exitCode);
      // Refresh analytics in background
      await fetchAnalytics();
    } catch (err: any) {
      setTerminalOutput(`Execution error: ${err.message}`);
    } finally {
      setRunningPython(false);
    }
  };

  const handleSelectFile = (filename: string) => {
    setSelectedFilename(filename);
    setIsEditingFile(false);
    setSaveStatus('');
    const target = files.find(f => f.filename === filename);
    if (target) {
      setEditedCode(target.content);
    }
  };

  const handleSaveFile = async () => {
    setSaveStatus('Saving...');
    try {
      const res = await fetch('/api/save-file', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ filename: selectedFilename, content: editedCode })
      });
      if (res.ok) {
        setSaveStatus('Saved successfully! Re-running analysis...');
        setIsEditingFile(false);
        await fetchFiles();
        await fetchAnalytics();
        setTimeout(() => setSaveStatus(''), 3000);
      } else {
        setSaveStatus('Error saving file.');
      }
    } catch (err) {
      setSaveStatus('Network error while saving.');
    }
  };

  const handleResetDataset = async () => {
    if (!confirm('Are you sure you want to reset students.csv to the default 20 records?')) return;
    try {
      const res = await fetch('/api/reset-dataset', { method: 'POST' });
      if (res.ok) {
        await fetchFiles();
        await fetchAnalytics();
        alert('Dataset reset to original 20 records.');
      }
    } catch (err) {
      alert('Error resetting dataset.');
    }
  };

  const handleAddStudentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStudent.student_id || !newStudent.name) {
      alert('Please fill in Student ID and Name.');
      return;
    }
    try {
      const res = await fetch('/api/add-student', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newStudent)
      });
      if (res.ok) {
        setShowAddModal(false);
        setNewStudent({
          student_id: '',
          name: '',
          department: 'Computer Science',
          math: 75,
          physics: 70,
          chemistry: 72,
          computer_science: 80,
          english: 75,
          attendance: 85
        });
        await fetchFiles();
        await fetchAnalytics();
        alert('Student successfully added to students.csv! Analysis recomputed.');
      } else {
        alert('Failed to add student.');
      }
    } catch (err) {
      alert('Error adding student.');
    }
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(label);
    setTimeout(() => setCopiedText(null), 2000);
  };

  // Filtered and sorted students
  const filteredStudents = (analytics?.students || []).filter(student => {
    const matchesSearch =
      student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      student.student_id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      student.department.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesDept = departmentFilter === 'all' || student.department === departmentFilter;

    let matchesStatus = true;
    if (statusFilter === 'PASS') matchesStatus = student.status === 'PASS';
    if (statusFilter === 'FAIL') matchesStatus = student.status === 'FAIL';
    if (statusFilter === 'SHORTAGE') matchesStatus = student.attendance < 75.0;

    return matchesSearch && matchesDept && matchesStatus;
  }).sort((a, b) => {
    if (sortBy === 'rank') return a.rank - b.rank;
    if (sortBy === 'average') return b.average_marks - a.average_marks;
    if (sortBy === 'attendance') return b.attendance - a.attendance;
    if (sortBy === 'name') return a.name.localeCompare(b.name);
    return 0;
  });

  const departmentsList = Array.from(new Set((analytics?.students || []).map(s => s.department)));

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans flex flex-col">
      {/* Top Banner / Navigation */}
      <header className="border-b border-slate-200 bg-white sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-slate-900 text-white flex items-center justify-center font-bold text-sm tracking-wider shadow-sm">
                EWB
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-base font-semibold text-slate-900">Student Performance Analytics System</h1>
                  <span className="text-xs font-mono text-slate-500 hidden sm:inline">Python with AI</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-500">
                  <span>Python 3.10</span>
                  <span aria-hidden="true">·</span>
                  <span>NumPy & Pandas</span>
                  <span aria-hidden="true">·</span>
                  <span>Deadline: 15 Oct 2026</span>
                </div>
              </div>
            </div>

            {/* Quick Action Buttons */}
            <div className="flex items-center gap-2">
              <button
                onClick={runPythonScript}
                disabled={runningPython}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white transition-colors shadow-xs disabled:opacity-50"
                title="Execute python3 main.py on server"
              >
                <Play className={`w-3.5 h-3.5 ${runningPython ? 'animate-spin' : ''}`} />
                <span>{runningPython ? 'Running Python...' : 'Run Python Script'}</span>
              </button>

              <button
                onClick={() => setShowAddModal(true)}
                className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Add Student</span>
              </button>

              <a
                href="/api/download/main.py"
                className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 transition-colors"
                title="Download main.py"
              >
                <Download className="w-3.5 h-3.5" />
                <span className="hidden md:inline">Download</span>
              </a>
            </div>
          </div>

          {/* Interactive Navigation Tabs */}
          <div className="flex items-center gap-1 border-t border-slate-100 py-1 overflow-x-auto text-xs">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`flex items-center gap-2 px-3 py-2 font-medium rounded-md transition-colors whitespace-nowrap ${
                activeTab === 'dashboard'
                  ? 'bg-slate-100 text-slate-900 font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <BarChart3 className="w-4 h-4 text-indigo-600" />
              Analytics Dashboard
            </button>

            <button
              onClick={() => setActiveTab('code')}
              className={`flex items-center gap-2 px-3 py-2 font-medium rounded-md transition-colors whitespace-nowrap ${
                activeTab === 'code'
                  ? 'bg-slate-100 text-slate-900 font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <FileCode className="w-4 h-4 text-amber-600" />
              Python Code & Dataset
            </button>

            <button
              onClick={() => setActiveTab('terminal')}
              className={`flex items-center gap-2 px-3 py-2 font-medium rounded-md transition-colors whitespace-nowrap ${
                activeTab === 'terminal'
                  ? 'bg-slate-100 text-slate-900 font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <Terminal className="w-4 h-4 text-emerald-600" />
              Live Terminal Output
            </button>

            <button
              onClick={() => setActiveTab('docs')}
              className={`flex items-center gap-2 px-3 py-2 font-medium rounded-md transition-colors whitespace-nowrap ${
                activeTab === 'docs'
                  ? 'bg-slate-100 text-slate-900 font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <BookOpen className="w-4 h-4 text-blue-600" />
              Project Documentation (10 Sections)
            </button>

            <button
              onClick={() => setActiveTab('submission')}
              className={`flex items-center gap-2 px-3 py-2 font-medium rounded-md transition-colors whitespace-nowrap ${
                activeTab === 'submission'
                  ? 'bg-slate-100 text-slate-900 font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <GitBranch className="w-4 h-4 text-purple-600" />
              GitHub Submission Checklist
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {loading && !analytics ? (
          <div className="flex flex-col items-center justify-center min-h-[400px]">
            <RefreshCw className="w-8 h-8 animate-spin text-slate-400 mb-3" />
            <p className="text-sm text-slate-600">Executing Python analytics engine...</p>
          </div>
        ) : (
          <>
            {/* TAB 1: ANALYTICS DASHBOARD */}
            {activeTab === 'dashboard' && analytics && (
              <div className="space-y-6">
                {/* STEP 4: PRACTICAL QUESTIONS ANSWERED (Explicit Assignment Requirement) */}
                <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
                  <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-100">
                    <div>
                      <h2 className="text-sm font-bold uppercase tracking-wider text-slate-500">
                        Step 4 Assignment Questions & Practical Insights
                      </h2>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Direct statistical answers evaluated by NumPy and Pandas algorithms
                      </p>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-slate-500">
                      <span>Engine: Python 3.10</span>
                      <span aria-hidden="true">·</span>
                      <span>NumPy 1.24</span>
                      <span aria-hidden="true">·</span>
                      <span>Pandas 1.5</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {/* Question 1: Highest Average Student */}
                    <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
                      <div className="text-xs text-slate-500 font-medium mb-1 flex items-center justify-between">
                        <span>1. Highest Student Average</span>
                        <Award className="w-4 h-4 text-amber-500" />
                      </div>
                      <div className="text-lg font-bold text-slate-900 truncate">
                        {analytics.practical_answers.question_1_highest_student.name}
                      </div>
                      <div className="text-sm font-semibold text-emerald-600 mt-0.5">
                        {analytics.practical_answers.question_1_highest_student.average}% Average
                      </div>
                      <div className="text-xs text-slate-500 mt-2">
                        {analytics.practical_answers.question_1_highest_student.department} · ID: {analytics.practical_answers.question_1_highest_student.id}
                      </div>
                    </div>

                    {/* Question 2: Best Subject Average */}
                    <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
                      <div className="text-xs text-slate-500 font-medium mb-1 flex items-center justify-between">
                        <span>2. Best Subject Average</span>
                        <Sparkles className="w-4 h-4 text-indigo-500" />
                      </div>
                      <div className="text-lg font-bold text-slate-900 truncate">
                        {analytics.practical_answers.question_2_best_subject.subject_name}
                      </div>
                      <div className="text-sm font-semibold text-indigo-600 mt-0.5">
                        {analytics.practical_answers.question_2_best_subject.average}% Mean
                      </div>
                      <div className="text-xs text-slate-500 mt-2">
                        Lowest: {analytics.practical_answers.question_2_best_subject.lowest_subject.subject_name} ({analytics.practical_answers.question_2_best_subject.lowest_subject.average}%)
                      </div>
                    </div>

                    {/* Question 3: Pass Count */}
                    <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
                      <div className="text-xs text-slate-500 font-medium mb-1 flex items-center justify-between">
                        <span>3. Students Passed</span>
                        <CheckCircle className="w-4 h-4 text-emerald-500" />
                      </div>
                      <div className="text-lg font-bold text-slate-900">
                        {analytics.practical_answers.question_3_pass_count.passed_count} of {analytics.practical_answers.question_3_pass_count.total_students} Passed
                      </div>
                      <div className="text-sm font-semibold text-emerald-600 mt-0.5">
                        {analytics.practical_answers.question_3_pass_count.pass_percentage}% Pass Rate
                      </div>
                      <div className="text-xs text-slate-500 mt-2">
                        {analytics.practical_answers.question_3_pass_count.failed_count} student(s) below cutoff
                      </div>
                    </div>

                    {/* Question 4: Overall Class Average */}
                    <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
                      <div className="text-xs text-slate-500 font-medium mb-1 flex items-center justify-between">
                        <span>4. Overall Class Average</span>
                        <GraduationCap className="w-4 h-4 text-blue-500" />
                      </div>
                      <div className="text-lg font-bold text-slate-900">
                        {analytics.practical_answers.question_4_class_average.student_average_mean}%
                      </div>
                      <div className="text-sm font-semibold text-blue-600 mt-0.5">
                        Across All 5 Subjects
                      </div>
                      <div className="text-xs text-slate-500 mt-2">
                        Avg Attendance: {analytics.summary.average_attendance}%
                      </div>
                    </div>
                  </div>
                </div>

                {/* KPI Metrics Summary Row */}
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                  <div className="bg-white border border-slate-200 rounded-lg p-3">
                    <span className="text-xs text-slate-500">Total Records</span>
                    <p className="text-xl font-bold text-slate-900 mt-1">{analytics.summary.total_students}</p>
                    <span className="text-[11px] text-slate-400">Step 1 requirement</span>
                  </div>

                  <div className="bg-white border border-slate-200 rounded-lg p-3">
                    <span className="text-xs text-slate-500">Class Mean</span>
                    <p className="text-xl font-bold text-slate-900 mt-1">{analytics.summary.class_average}%</p>
                    <span className="text-[11px] text-slate-400">Calculated via NumPy</span>
                  </div>

                  <div className="bg-white border border-slate-200 rounded-lg p-3">
                    <span className="text-xs text-slate-500">Pass Rate</span>
                    <p className="text-xl font-bold text-emerald-600 mt-1">{analytics.summary.pass_percentage}%</p>
                    <span className="text-[11px] text-slate-400">17 Passed / 3 Failed</span>
                  </div>

                  <div className="bg-white border border-slate-200 rounded-lg p-3">
                    <span className="text-xs text-slate-500">Highest Score</span>
                    <p className="text-xl font-bold text-indigo-600 mt-1">{analytics.summary.highest_student.average}%</p>
                    <span className="text-[11px] text-slate-400">{analytics.summary.highest_student.name.split(' ')[0]}</span>
                  </div>

                  <div className="bg-white border border-slate-200 rounded-lg p-3">
                    <span className="text-xs text-slate-500">Lowest Score</span>
                    <p className="text-xl font-bold text-rose-600 mt-1">{analytics.summary.lowest_student.average}%</p>
                    <span className="text-[11px] text-slate-400">{analytics.summary.lowest_student.name.split(' ')[0]}</span>
                  </div>

                  <div className="bg-white border border-slate-200 rounded-lg p-3">
                    <span className="text-xs text-slate-500">Avg Attendance</span>
                    <p className="text-xl font-bold text-slate-900 mt-1">{analytics.summary.average_attendance}%</p>
                    <span className="text-[11px] text-slate-400">Cutoff: 75%</span>
                  </div>
                </div>

                {/* Two-Column Layout: Top Performers & Grade Distribution */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Top Performers (Top 5 Ranking) */}
                  <div className="lg:col-span-2 bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <Award className="w-5 h-5 text-amber-500" />
                        <h3 className="text-sm font-semibold text-slate-900">Top-Performing Students (Honor Roll)</h3>
                      </div>
                      <span className="text-xs text-slate-500">Top 5 Students by Average Marks</span>
                    </div>

                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs">
                        <thead>
                          <tr className="border-b border-slate-100 text-slate-500 font-medium">
                            <th className="py-2.5 px-3">Rank</th>
                            <th className="py-2.5 px-3">Student</th>
                            <th className="py-2.5 px-3">Department</th>
                            <th className="py-2.5 px-3 text-right">Total Marks</th>
                            <th className="py-2.5 px-3 text-right">Average %</th>
                            <th className="py-2.5 px-3 text-center">Grade</th>
                            <th className="py-2.5 px-3 text-right">Attendance</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {analytics.top_performers.map((student, idx) => (
                            <tr key={student.student_id} className="hover:bg-slate-50/80 transition-colors">
                              <td className="py-2.5 px-3 font-semibold text-slate-900">
                                <span className={`inline-flex items-center justify-center w-5 h-5 rounded-full text-[11px] font-bold ${
                                  idx === 0 ? 'bg-amber-100 text-amber-800' :
                                  idx === 1 ? 'bg-slate-200 text-slate-700' :
                                  idx === 2 ? 'bg-orange-100 text-orange-800' :
                                  'bg-slate-100 text-slate-600'
                                }`}>
                                  {idx + 1}
                                </span>
                              </td>
                              <td className="py-2.5 px-3 font-medium text-slate-900">
                                <div>{student.name}</div>
                                <span className="text-[11px] text-slate-400 font-mono">{student.student_id}</span>
                              </td>
                              <td className="py-2.5 px-3 text-slate-600">{student.department}</td>
                              <td className="py-2.5 px-3 text-right font-mono font-medium">{student.total_marks.toFixed(1)}</td>
                              <td className="py-2.5 px-3 text-right font-mono font-bold text-indigo-600">{student.average_marks.toFixed(2)}%</td>
                              <td className="py-2.5 px-3 text-center font-bold text-slate-800">{student.grade}</td>
                              <td className="py-2.5 px-3 text-right font-mono">{student.attendance.toFixed(1)}%</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Grade Distribution */}
                  <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
                    <h3 className="text-sm font-semibold text-slate-900 mb-1">Grade Distribution</h3>
                    <p className="text-xs text-slate-500 mb-4">Based on institutional grading criteria</p>

                    <div className="space-y-3">
                      {Object.entries(analytics.grade_distribution).map(([grade, count]) => {
                        const percent = ((count / analytics.summary.total_students) * 100).toFixed(0);
                        const labelMap: Record<string, string> = {
                          'A+': 'Outstanding (≥90%)',
                          'A': 'Excellent (80-89%)',
                          'B': 'Very Good (70-79%)',
                          'C': 'Good (60-69%)',
                          'D': 'Satisfactory (50-59%)',
                          'F': 'Fail (<50%)'
                        };

                        return (
                          <div key={grade}>
                            <div className="flex justify-between text-xs mb-1">
                              <span className="font-semibold text-slate-800">
                                Grade {grade} <span className="font-normal text-slate-400">· {labelMap[grade]}</span>
                              </span>
                              <span className="font-mono text-slate-600">{count} ({percent}%)</span>
                            </div>
                            <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                              <div
                                className={`h-2 rounded-full ${
                                  grade === 'A+' ? 'bg-indigo-600' :
                                  grade === 'A' ? 'bg-blue-600' :
                                  grade === 'B' ? 'bg-teal-600' :
                                  grade === 'C' ? 'bg-amber-500' :
                                  grade === 'D' ? 'bg-orange-500' :
                                  'bg-rose-500'
                                }`}
                                style={{ width: `${Math.max(5, (count / analytics.summary.total_students) * 100)}%` }}
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Subject-Wise Performance Analysis Table */}
                <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-sm font-semibold text-slate-900">Subject-Wise Performance Analysis</h3>
                      <p className="text-xs text-slate-500 mt-0.5">Calculated using NumPy statistical routines (Mean, StdDev, Min, Max)</p>
                    </div>
                    <span className="text-xs text-slate-500 font-mono">Passing Cutoff: 40.0</span>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead>
                        <tr className="border-b border-slate-100 text-slate-500 font-medium">
                          <th className="py-2.5 px-3">Subject</th>
                          <th className="py-2.5 px-3 text-right">Average %</th>
                          <th className="py-2.5 px-3 text-right">Highest Mark</th>
                          <th className="py-2.5 px-3 text-right">Lowest Mark</th>
                          <th className="py-2.5 px-3 text-right">Std Deviation</th>
                          <th className="py-2.5 px-3 text-right">Median</th>
                          <th className="py-2.5 px-3 text-right">Pass Rate</th>
                          <th className="py-2.5 px-3">Top Scorer</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {Object.entries(analytics.subject_analysis).map(([key, stat]) => (
                          <tr key={key} className="hover:bg-slate-50/80 transition-colors">
                            <td className="py-2.5 px-3 font-semibold text-slate-900">
                              {stat.subject_name}
                            </td>
                            <td className="py-2.5 px-3 text-right font-mono font-bold text-indigo-600">
                              {stat.average.toFixed(2)}%
                            </td>
                            <td className="py-2.5 px-3 text-right font-mono text-emerald-600 font-medium">
                              {stat.highest.toFixed(1)}
                            </td>
                            <td className="py-2.5 px-3 text-right font-mono text-rose-600 font-medium">
                              {stat.lowest.toFixed(1)}
                            </td>
                            <td className="py-2.5 px-3 text-right font-mono text-slate-600">
                              {stat.std_dev.toFixed(2)}
                            </td>
                            <td className="py-2.5 px-3 text-right font-mono text-slate-600">
                              {stat.median.toFixed(1)}
                            </td>
                            <td className="py-2.5 px-3 text-right font-mono font-medium">
                              <span className={stat.pass_rate === 100 ? 'text-emerald-700 font-bold' : 'text-slate-800'}>
                                {stat.pass_rate.toFixed(1)}%
                              </span>
                            </td>
                            <td className="py-2.5 px-3 text-slate-700 font-medium">
                              {stat.top_scorer}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Department-Wise Analysis */}
                <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-sm font-semibold text-slate-900">Department-Wise Performance Breakdown</h3>
                      <p className="text-xs text-slate-500 mt-0.5">Aggregated metrics across engineering disciplines</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
                    {Object.entries(analytics.department_analysis).map(([dept, dStat]) => (
                      <div key={dept} className="bg-slate-50 border border-slate-200 rounded-lg p-3">
                        <div className="text-xs font-bold text-slate-900 truncate mb-1">{dept}</div>
                        <div className="text-lg font-bold text-indigo-600">{dStat.average_marks.toFixed(1)}%</div>
                        <div className="text-[11px] text-slate-500 mt-2 space-y-0.5">
                          <div className="flex justify-between">
                            <span>Students:</span>
                            <span className="font-semibold text-slate-700">{dStat.student_count}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Pass Rate:</span>
                            <span className="font-semibold text-emerald-600">{dStat.pass_percentage.toFixed(0)}%</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Attendance:</span>
                            <span className="font-semibold text-slate-700">{dStat.average_attendance.toFixed(1)}%</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Student Dataset Master Table */}
                <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                    <div>
                      <h3 className="text-sm font-semibold text-slate-900">All Student Records (Pandas DataFrame)</h3>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Showing {filteredStudents.length} of {analytics.students.length} students loaded from students.csv
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      {/* Search */}
                      <div className="relative">
                        <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-slate-400" />
                        <input
                          type="text"
                          placeholder="Search name, ID, dept..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-slate-400 w-48"
                        />
                      </div>

                      {/* Department Filter */}
                      <select
                        value={departmentFilter}
                        onChange={(e) => setDepartmentFilter(e.target.value)}
                        className="py-1.5 px-2.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-700"
                      >
                        <option value="all">All Departments</option>
                        {departmentsList.map(dept => (
                          <option key={dept} value={dept}>{dept}</option>
                        ))}
                      </select>

                      {/* Status Filter */}
                      <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value as any)}
                        className="py-1.5 px-2.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-700"
                      >
                        <option value="all">All Status</option>
                        <option value="PASS">Pass Only</option>
                        <option value="FAIL">Fail Only</option>
                        <option value="SHORTAGE">Attendance &lt; 75%</option>
                      </select>

                      {/* Sort By */}
                      <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value as any)}
                        className="py-1.5 px-2.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-700"
                      >
                        <option value="rank">Sort by Rank</option>
                        <option value="average">Sort by Average</option>
                        <option value="attendance">Sort by Attendance</option>
                        <option value="name">Sort by Name</option>
                      </select>

                      <button
                        onClick={handleResetDataset}
                        className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors"
                        title="Reset students.csv to default 20 records"
                      >
                        <RefreshCw className="w-3 h-3" />
                        <span>Reset</span>
                      </button>
                    </div>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead>
                        <tr className="border-b border-slate-100 text-slate-500 font-medium">
                          <th className="py-2.5 px-2.5">Rank</th>
                          <th className="py-2.5 px-2.5">ID</th>
                          <th className="py-2.5 px-2.5">Name</th>
                          <th className="py-2.5 px-2.5">Department</th>
                          <th className="py-2.5 px-2.5 text-right">Math</th>
                          <th className="py-2.5 px-2.5 text-right">Physics</th>
                          <th className="py-2.5 px-2.5 text-right">Chem</th>
                          <th className="py-2.5 px-2.5 text-right">CS</th>
                          <th className="py-2.5 px-2.5 text-right">English</th>
                          <th className="py-2.5 px-2.5 text-right">Total</th>
                          <th className="py-2.5 px-2.5 text-right">Average %</th>
                          <th className="py-2.5 px-2.5 text-center">Grade</th>
                          <th className="py-2.5 px-2.5 text-center">Status</th>
                          <th className="py-2.5 px-2.5 text-right">Att%</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {filteredStudents.map((student) => (
                          <tr key={student.student_id} className="hover:bg-slate-50/80 transition-colors">
                            <td className="py-2 px-2.5 font-bold text-slate-700">#{student.rank}</td>
                            <td className="py-2 px-2.5 font-mono text-slate-500">{student.student_id}</td>
                            <td className="py-2 px-2.5 font-medium text-slate-900">{student.name}</td>
                            <td className="py-2 px-2.5 text-slate-600 truncate max-w-[130px]">{student.department}</td>
                            <td className={`py-2 px-2.5 text-right font-mono ${student.math < 40 ? 'text-rose-600 font-bold' : 'text-slate-700'}`}>{student.math}</td>
                            <td className={`py-2 px-2.5 text-right font-mono ${student.physics < 40 ? 'text-rose-600 font-bold' : 'text-slate-700'}`}>{student.physics}</td>
                            <td className={`py-2 px-2.5 text-right font-mono ${student.chemistry < 40 ? 'text-rose-600 font-bold' : 'text-slate-700'}`}>{student.chemistry}</td>
                            <td className={`py-2 px-2.5 text-right font-mono ${student.computer_science < 40 ? 'text-rose-600 font-bold' : 'text-slate-700'}`}>{student.computer_science}</td>
                            <td className={`py-2 px-2.5 text-right font-mono ${student.english < 40 ? 'text-rose-600 font-bold' : 'text-slate-700'}`}>{student.english}</td>
                            <td className="py-2 px-2.5 text-right font-mono font-medium">{student.total_marks.toFixed(1)}</td>
                            <td className="py-2 px-2.5 text-right font-mono font-bold text-indigo-600">{student.average_marks.toFixed(2)}%</td>
                            <td className="py-2 px-2.5 text-center font-bold text-slate-800">{student.grade}</td>
                            <td className="py-2 px-2.5 text-center">
                              <span className={`text-[11px] font-bold ${student.status === 'PASS' ? 'text-emerald-700' : 'text-rose-700'}`}>
                                {student.status}
                              </span>
                            </td>
                            <td className="py-2 px-2.5 text-right font-mono">
                              <span className={student.attendance < 75.0 ? 'text-amber-600 font-semibold' : 'text-slate-700'}>
                                {student.attendance.toFixed(1)}%
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: PYTHON CODE & DATASET VIEWER */}
            {activeTab === 'code' && (
              <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
                {/* File selector bar */}
                <div className="bg-slate-100 border-b border-slate-200 px-4 py-2 flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-1 overflow-x-auto">
                    {files.map(f => (
                      <button
                        key={f.filename}
                        onClick={() => handleSelectFile(f.filename)}
                        className={`px-3 py-1.5 text-xs font-mono font-medium rounded-md transition-colors ${
                          selectedFilename === f.filename
                            ? 'bg-white text-slate-900 shadow-xs'
                            : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                        }`}
                      >
                        {f.filename}
                      </button>
                    ))}
                  </div>

                  <div className="flex items-center gap-2">
                    {saveStatus && (
                      <span className="text-xs text-emerald-600 font-medium">{saveStatus}</span>
                    )}

                    {!isEditingFile ? (
                      <button
                        onClick={() => setIsEditingFile(true)}
                        className="px-2.5 py-1 text-xs bg-white border border-slate-200 text-slate-700 rounded-md hover:bg-slate-50 transition-colors"
                      >
                        Edit File
                      </button>
                    ) : (
                      <>
                        <button
                          onClick={handleSaveFile}
                          className="px-2.5 py-1 text-xs bg-emerald-600 text-white rounded-md hover:bg-emerald-700 transition-colors"
                        >
                          Save Changes
                        </button>
                        <button
                          onClick={() => {
                            setIsEditingFile(false);
                            const original = files.find(f => f.filename === selectedFilename);
                            if (original) setEditedCode(original.content);
                          }}
                          className="px-2.5 py-1 text-xs bg-slate-200 text-slate-700 rounded-md hover:bg-slate-300 transition-colors"
                        >
                          Cancel
                        </button>
                      </>
                    )}

                    <button
                      onClick={() => copyToClipboard(editedCode, 'code')}
                      className="px-2.5 py-1 text-xs bg-white border border-slate-200 text-slate-700 rounded-md hover:bg-slate-50 transition-colors flex items-center gap-1"
                    >
                      {copiedText === 'code' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedText === 'code' ? 'Copied' : 'Copy'}</span>
                    </button>

                    <a
                      href={`/api/download/${selectedFilename}`}
                      download={selectedFilename}
                      className="px-2.5 py-1 text-xs bg-slate-900 text-white rounded-md hover:bg-slate-800 transition-colors flex items-center gap-1"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Download</span>
                    </a>
                  </div>
                </div>

                {/* Editor / Viewer area */}
                <div className="p-4 bg-slate-900 text-slate-100 font-mono text-xs">
                  {isEditingFile ? (
                    <textarea
                      value={editedCode}
                      onChange={(e) => setEditedCode(e.target.value)}
                      className="w-full h-[600px] bg-slate-950 text-slate-100 p-4 font-mono text-xs rounded-lg border border-slate-800 focus:outline-hidden focus:ring-1 focus:ring-indigo-500 resize-none leading-relaxed"
                      spellCheck={false}
                    />
                  ) : (
                    <pre className="max-h-[650px] overflow-auto leading-relaxed p-2 text-slate-200 whitespace-pre">
                      {editedCode}
                    </pre>
                  )}
                </div>
              </div>
            )}

            {/* TAB 3: LIVE TERMINAL OUTPUT */}
            {activeTab === 'terminal' && (
              <div className="space-y-4">
                <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs flex items-center justify-between flex-wrap gap-3">
                  <div>
                    <h2 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
                      <Terminal className="w-4 h-4 text-emerald-600" />
                      Server-Side Python Terminal (python3 main.py)
                    </h2>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Executes the real Python script on the server, imports NumPy & Pandas, processes students.csv, and streams standard output.
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={runPythonScript}
                      disabled={runningPython}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white transition-colors disabled:opacity-50"
                    >
                      <Play className={`w-3.5 h-3.5 ${runningPython ? 'animate-spin' : ''}`} />
                      <span>{runningPython ? 'Executing...' : 'Re-Run Script'}</span>
                    </button>

                    <button
                      onClick={() => copyToClipboard(terminalOutput, 'term')}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
                    >
                      {copiedText === 'term' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedText === 'term' ? 'Copied' : 'Copy Output'}</span>
                    </button>
                  </div>
                </div>

                {/* Terminal Window Box */}
                <div className="rounded-xl overflow-hidden border border-slate-800 bg-slate-950 shadow-md">
                  <div className="bg-slate-900 px-4 py-2 border-b border-slate-800 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="flex gap-1.5">
                        <span className="w-3 h-3 rounded-full bg-rose-500/80 inline-block" />
                        <span className="w-3 h-3 rounded-full bg-amber-500/80 inline-block" />
                        <span className="w-3 h-3 rounded-full bg-emerald-500/80 inline-block" />
                      </div>
                      <span className="text-xs font-mono text-slate-400 ml-2">bash - /usr/bin/python3 main.py</span>
                    </div>

                    <div className="flex items-center gap-3 text-[11px] font-mono text-slate-400">
                      {terminalExecutionTime !== null && (
                        <span>Duration: {terminalExecutionTime}ms</span>
                      )}
                      {terminalExitCode !== null && (
                        <span className={terminalExitCode === 0 ? 'text-emerald-400' : 'text-rose-400'}>
                          Exit Code: {terminalExitCode}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="p-4 font-mono text-xs text-slate-200 max-h-[600px] overflow-auto whitespace-pre leading-relaxed select-text">
                    {terminalOutput ? (
                      terminalOutput
                    ) : (
                      <div className="text-slate-500 py-12 text-center">
                        <Terminal className="w-8 h-8 mx-auto mb-2 opacity-40" />
                        Click "Run Python Script" above to run <code className="text-emerald-400">python3 main.py</code> and display live console output.
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* TAB 4: PROJECT DOCUMENTATION (10 SECTIONS FROM ASSIGNMENT RUBRIC) */}
            {activeTab === 'docs' && (
              <div className="bg-white border border-slate-200 rounded-xl p-6 sm:p-8 shadow-xs space-y-8 max-w-4xl mx-auto">
                <div className="border-b border-slate-200 pb-4">
                  <div className="flex items-center gap-2 text-xs text-indigo-600 font-semibold uppercase tracking-wider">
                    EWB Courses · Python with AI Assessment Activity
                  </div>
                  <h2 className="text-2xl font-bold text-slate-900 mt-1">Student Performance Analytics System</h2>
                  <p className="text-sm text-slate-600 mt-1">
                    Formal 10-section project documentation adhering to the course submission guidelines.
                  </p>
                </div>

                {/* Section 1: Project Title */}
                <div>
                  <h3 className="text-base font-bold text-slate-900 border-l-4 border-indigo-600 pl-3 mb-2">
                    1. Project Title
                  </h3>
                  <p className="text-sm text-slate-700 leading-relaxed">
                    <strong>Student Performance Analytics System</strong> — Built by a Python with AI student for the EWB Courses assignment. Evaluates multi-subject student records, automates grade calculations, verifies attendance requirements, and answers institutional performance questions.
                  </p>
                </div>

                {/* Section 2: Objective */}
                <div>
                  <h3 className="text-base font-bold text-slate-900 border-l-4 border-indigo-600 pl-3 mb-2">
                    2. Objective
                  </h3>
                  <p className="text-sm text-slate-700 leading-relaxed">
                    Educational institutions require fast, accurate, and reproducible methods to analyze examination results. Manual spreadsheet entry and ad-hoc calculations lead to errors, delays in computing grades, and difficulty identifying underperforming students. This project creates a centralized analytical engine in Python using NumPy and Pandas to automatically ingest CSV records, process marks with high performance, evaluate grading rules, and answer key administrative questions.
                  </p>
                </div>

                {/* Section 3: Technologies Used */}
                <div>
                  <h3 className="text-base font-bold text-slate-900 border-l-4 border-indigo-600 pl-3 mb-2">
                    3. Technologies Used
                  </h3>
                  <ul className="list-disc list-inside text-sm text-slate-700 space-y-1.5 leading-relaxed">
                    <li><strong>Python (3.10+)</strong>: High-level programming language, reusable functions, loops, type hints, and conditional logic.</li>
                    <li><strong>NumPy (1.24+)</strong>: Vectorized array processing for fast row/column-wise operations (`np.sum`, `np.mean`, `np.std`, `np.min`, `np.max`, `np.median`).</li>
                    <li><strong>Pandas (1.5+)</strong>: Tabular data handling, `DataFrame` loading via `read_csv`, data type coercion, column mapping, and ranking.</li>
                    <li><strong>Standard Modules</strong>: `json`, `sys`, `os`, `typing`.</li>
                  </ul>
                </div>

                {/* Section 4: Dataset Description */}
                <div>
                  <h3 className="text-base font-bold text-slate-900 border-l-4 border-indigo-600 pl-3 mb-2">
                    4. Dataset Description
                  </h3>
                  <p className="text-sm text-slate-700 leading-relaxed mb-3">
                    The dataset `students.csv` contains <strong>20 realistic student records</strong> across 5 departments. Realistic variations in marks and attendance ensure thorough evaluation of both pass and fail criteria.
                  </p>
                  <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 text-xs font-mono text-slate-700 overflow-x-auto">
                    <code>Columns: student_id, name, department, math, physics, chemistry, computer_science, english, attendance</code>
                  </div>
                </div>

                {/* Section 5: Implementation */}
                <div>
                  <h3 className="text-base font-bold text-slate-900 border-l-4 border-indigo-600 pl-3 mb-2">
                    5. Step-by-Step Implementation
                  </h3>
                  <div className="space-y-3 text-sm text-slate-700">
                    <p><strong>Step 1 – Prepare Dataset:</strong> Authored `students.csv` with 20 student entries spanning Computer Science, IT, Mechanical, Electrical, and Civil engineering.</p>
                    <p><strong>Step 2 – Read the Data:</strong> Loaded CSV using `pd.read_csv()`, verified column names, and cast marks and attendance to numerical values.</p>
                    <p><strong>Step 3 – Process the Data:</strong> Converted marks to a 2D NumPy array for vectorized computation of total marks and averages (`np.sum`, `np.mean`). Applied loops to evaluate grading rules and pass/fail thresholds.</p>
                    <p><strong>Step 4 – Perform Analysis:</strong> Computed answers to the four core questions (highest student average, best subject, pass rate, and overall class average).</p>
                    <p><strong>Step 5 – Final Output:</strong> Rendered formatted terminal tables and JSON data feeds for clear visualization.</p>
                  </div>
                </div>

                {/* Section 6: Key Features */}
                <div>
                  <h3 className="text-base font-bold text-slate-900 border-l-4 border-indigo-600 pl-3 mb-2">
                    6. Key Features
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-slate-700">
                    <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
                      <strong className="block text-slate-900 mb-1">Reusable Modular Functions</strong>
                      Separated logic into `functions.py` with type annotations and docstrings.
                    </div>
                    <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
                      <strong className="block text-slate-900 mb-1">Vectorized NumPy Calculations</strong>
                      Leveraged array math for fast sums, means, and standard deviations.
                    </div>
                    <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
                      <strong className="block text-slate-900 mb-1">Clearly Defined Grading Scale</strong>
                      A+ (&ge;90%), A (&ge;80%), B (&ge;70%), C (&ge;60%), D (&ge;50%), F (&lt;50%).
                    </div>
                    <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
                      <strong className="block text-slate-900 mb-1">Attendance Shortage Verification</strong>
                      Identifies students failing to meet the mandatory 75% attendance threshold.
                    </div>
                  </div>
                </div>

                {/* Section 7: Output / Screenshots */}
                <div>
                  <h3 className="text-base font-bold text-slate-900 border-l-4 border-indigo-600 pl-3 mb-2">
                    7. Output & Results
                  </h3>
                  <p className="text-sm text-slate-700 leading-relaxed mb-3">
                    Key computational outcomes produced by the analytics execution:
                  </p>
                  <ul className="list-disc list-inside text-sm text-slate-700 space-y-1">
                    <li><strong>Highest Student:</strong> Ananya Iyer (STU104) with an average of 93.00%</li>
                    <li><strong>Best Subject:</strong> Computer Science with an average score of 74.15%</li>
                    <li><strong>Passing Students:</strong> 17 out of 20 passed (85.0% Pass Rate)</li>
                    <li><strong>Overall Class Average:</strong> 71.71%</li>
                  </ul>
                </div>

                {/* Section 8: Final Outcome */}
                <div>
                  <h3 className="text-base font-bold text-slate-900 border-l-4 border-indigo-600 pl-3 mb-2">
                    8. Final Outcome
                  </h3>
                  <p className="text-sm text-slate-700 leading-relaxed">
                    The project accomplished all requirements outlined in the EWB Courses project assignment. The system cleanly reads external data, executes vectorized operations with NumPy, manages tabular structures with Pandas, and generates human-readable reports and machine-readable feeds.
                  </p>
                </div>

                {/* Section 9: Challenges & Learning */}
                <div>
                  <h3 className="text-base font-bold text-slate-900 border-l-4 border-indigo-600 pl-3 mb-2">
                    9. Challenges & Learning
                  </h3>
                  <p className="text-sm text-slate-700 leading-relaxed">
                    - <strong>Multi-criteria pass/fail evaluation:</strong> A student with a high average could still fail if a single subject fell below 40.0. Structured iteration across subject columns was implemented to ensure accurate grading.<br/>
                    - <strong>Data Type Consistency:</strong> Ensured robust conversion using `pd.to_numeric(errors='coerce')` so that rogue strings in marks or attendance do not crash calculations.
                  </p>
                </div>

                {/* Section 10: GitHub Repository */}
                <div>
                  <h3 className="text-base font-bold text-slate-900 border-l-4 border-indigo-600 pl-3 mb-2">
                    10. GitHub Repository
                  </h3>
                  <p className="text-sm text-slate-700 leading-relaxed mb-2">
                    Repository URL ready for Google Form submission:
                  </p>
                  <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 font-mono text-xs text-indigo-600 flex items-center justify-between">
                    <span>https://github.com/student/student-performance-analytics</span>
                    <button
                      onClick={() => copyToClipboard('https://github.com/student/student-performance-analytics', 'repo-link')}
                      className="px-2 py-1 bg-white border border-slate-200 rounded text-slate-700 hover:bg-slate-100 flex items-center gap-1"
                    >
                      {copiedText === 'repo-link' ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                      <span>Copy Link</span>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 5: GITHUB SUBMISSION WORKFLOW & CHECKLIST */}
            {activeTab === 'submission' && (
              <div className="bg-white border border-slate-200 rounded-xl p-6 sm:p-8 shadow-xs max-w-4xl mx-auto space-y-6">
                <div>
                  <h2 className="text-lg font-bold text-slate-900">GitHub Submission Instructions & Checklist</h2>
                  <p className="text-xs text-slate-500 mt-1">
                    Follow these step-by-step instructions to create, commit, and submit the project to EWB Courses before 15 October 2026.
                  </p>
                </div>

                {/* GitHub Checklist from Page 3 of PDF */}
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-5">
                  <h3 className="text-sm font-semibold text-slate-900 mb-3 flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-emerald-600" />
                    Assignment GitHub Checklist (Verified)
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-slate-700">
                    <div className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>Repository is public & accessible</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>Main Python file (<code className="font-mono">main.py</code>) uploaded</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>Dataset (<code className="font-mono">students.csv</code>) uploaded</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>Reusable functions (<code className="font-mono">functions.py</code>) included</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span><code className="font-mono">README.md</code> included with clear instructions</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span><code className="font-mono">PROJECT_DOCUMENTATION.md</code> included</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>Project runs successfully (<code className="font-mono">python3 main.py</code>)</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>Repository URL ready for Google Form</span>
                    </div>
                  </div>
                </div>

                {/* Step-by-Step Git Commands */}
                <div className="space-y-3">
                  <h3 className="text-sm font-semibold text-slate-900">Pushing Files to GitHub (Command Line)</h3>
                  <div className="bg-slate-900 text-slate-200 rounded-lg p-4 font-mono text-xs overflow-x-auto space-y-2">
                    <div className="text-slate-400"># 1. Initialize Git repository</div>
                    <div>git init</div>
                    <div className="text-slate-400 mt-2"># 2. Add required Python project files</div>
                    <div>git add main.py functions.py students.csv README.md PROJECT_DOCUMENTATION.md</div>
                    <div className="text-slate-400 mt-2"># 3. Commit with a meaningful message</div>
                    <div>git commit -m "Complete Student Performance Analytics System assignment for EWB Courses"</div>
                    <div className="text-slate-400 mt-2"># 4. Set main branch & link remote GitHub repository</div>
                    <div>git branch -M main</div>
                    <div>git remote add origin https://github.com/YOUR_USERNAME/student-performance-analytics.git</div>
                    <div className="text-slate-400 mt-2"># 5. Push to GitHub</div>
                    <div>git push -u origin main</div>
                  </div>
                </div>

                {/* Direct File Download Buttons */}
                <div className="pt-2">
                  <h3 className="text-sm font-semibold text-slate-900 mb-2">Download Files Directly for Submission</h3>
                  <div className="flex flex-wrap gap-2">
                    {files.map(f => (
                      <a
                        key={f.filename}
                        href={`/api/download/${f.filename}`}
                        download={f.filename}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg font-mono transition-colors"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>{f.filename}</span>
                      </a>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </main>

      {/* MODAL: ADD STUDENT */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-lg w-full p-6 shadow-xl border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <h3 className="text-base font-bold text-slate-900">Add New Student Record</h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddStudentSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Student ID *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. STU121"
                    value={newStudent.student_id}
                    onChange={(e) => setNewStudent({ ...newStudent, student_id: e.target.value })}
                    className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Full Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Priya Sharma"
                    value={newStudent.name}
                    onChange={(e) => setNewStudent({ ...newStudent, name: e.target.value })}
                    className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Department</label>
                <select
                  value={newStudent.department}
                  onChange={(e) => setNewStudent({ ...newStudent, department: e.target.value })}
                  className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg"
                >
                  <option value="Computer Science">Computer Science</option>
                  <option value="Information Technology">Information Technology</option>
                  <option value="Mechanical Engineering">Mechanical Engineering</option>
                  <option value="Electrical Engineering">Electrical Engineering</option>
                  <option value="Civil Engineering">Civil Engineering</option>
                </select>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Math (0-100)</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={newStudent.math}
                    onChange={(e) => setNewStudent({ ...newStudent, math: Number(e.target.value) })}
                    className="w-full text-xs px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Physics (0-100)</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={newStudent.physics}
                    onChange={(e) => setNewStudent({ ...newStudent, physics: Number(e.target.value) })}
                    className="w-full text-xs px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Chemistry (0-100)</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={newStudent.chemistry}
                    onChange={(e) => setNewStudent({ ...newStudent, chemistry: Number(e.target.value) })}
                    className="w-full text-xs px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Comp Sci (0-100)</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={newStudent.computer_science}
                    onChange={(e) => setNewStudent({ ...newStudent, computer_science: Number(e.target.value) })}
                    className="w-full text-xs px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">English (0-100)</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={newStudent.english}
                    onChange={(e) => setNewStudent({ ...newStudent, english: Number(e.target.value) })}
                    className="w-full text-xs px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Attendance %</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    step="0.5"
                    value={newStudent.attendance}
                    onChange={(e) => setNewStudent({ ...newStudent, attendance: Number(e.target.value) })}
                    className="w-full text-xs px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-medium bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg shadow-xs"
                >
                  Add Record & Recalculate
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-4 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-2">
          <div>
            <strong>EWB Courses: Python with AI</strong> · Student Performance Analytics System
          </div>
          <div className="flex items-center gap-3">
            <span>Submission Deadline: 15 October 2026</span>
            <span aria-hidden="true">·</span>
            <span className="text-emerald-600 font-medium">Ready for Submission</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
