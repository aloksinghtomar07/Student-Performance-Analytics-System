"""
Student Performance Analytics System - Core Functions Module
Course: EWB Courses | Python with AI
Assignment: Python Project Assignment
Submission Deadline: 15 October 2026

This module provides reusable analytical functions utilizing Python,
NumPy, and Pandas to process student academic data, calculate metrics,
assign letter grades, evaluate pass/fail criteria, and generate statistical insights.
Includes full native NumPy/Pandas execution with a robust pure-Python fallback.
"""

from typing import List, Dict, Any, Tuple, Union
import sys
import os
import glob
import csv
import math

# Target academic subjects present in the dataset
SUBJECT_COLUMNS = ['math', 'physics', 'chemistry', 'computer_science', 'english']

# Grading scale definition (ordered from highest to lowest)
# (min_percentage, grade, performance_label)
GRADING_SCALE = [
    (90.0, 'A+', 'Outstanding'),
    (80.0, 'A',  'Excellent'),
    (70.0, 'B',  'Very Good'),
    (60.0, 'C',  'Good'),
    (50.0, 'D',  'Satisfactory'),
    (0.0,  'F',  'Fail')
]

# Standard passing threshold per subject
SUBJECT_PASSING_MARK = 40.0

# Minimum attendance percentage required for academic eligibility
MINIMUM_ATTENDANCE_PERCENT = 75.0

# Prepend package search directories
_base_dir = os.path.dirname(os.path.abspath(__file__))
_search_dirs = [
    os.path.join(_base_dir, "python_packages"),
    "/python_packages",
    "/app/applet/python_packages",
    os.path.expanduser("~/.local/lib/python3.10/site-packages"),
]
for _p in glob.glob(os.path.expanduser("~/.local/lib/python*/site-packages")):
    if _p not in _search_dirs:
        _search_dirs.append(_p)

for _d in _search_dirs:
    if os.path.isdir(_d) and _d not in sys.path:
        sys.path.insert(0, _d)

# Try importing native NumPy and Pandas
NUMPY_PANDAS_NATIVE = False
try:
    import numpy as np
    import pandas as pd
    # Test basic instantiation to avoid partial/corrupted wheel issues
    _test_arr = np.array([1, 2, 3])
    _test_df = pd.DataFrame({'a': [1, 2]})
    NUMPY_PANDAS_NATIVE = True
except Exception:
    NUMPY_PANDAS_NATIVE = False

# Robust pure-Python fallback classes if native C-libraries are missing
if not NUMPY_PANDAS_NATIVE:
    class FallbackNumPy:
        """Pure Python fallback providing NumPy numerical operations."""
        @staticmethod
        def array(data):
            return list(data)

        @staticmethod
        def sum(a, axis=None):
            if axis == 1:
                return [float(sum(row)) for row in a]
            if axis == 0:
                return [float(sum(col)) for col in zip(*a)]
            flat = [x for row in a for x in (row if isinstance(row, (list, tuple)) else [row])] if hasattr(a, '__iter__') else [a]
            return float(sum(flat))

        @staticmethod
        def mean(a, axis=None):
            if axis == 1:
                return [float(sum(row) / len(row)) if len(row) > 0 else 0.0 for row in a]
            if axis == 0:
                cols = list(zip(*a))
                return [float(sum(col) / len(col)) if len(col) > 0 else 0.0 for col in cols]
            flat = [x for row in a for x in (row if isinstance(row, (list, tuple)) else [row])] if hasattr(a, '__iter__') else [a]
            return float(sum(flat) / len(flat)) if flat else 0.0

        @staticmethod
        def std(a, axis=None):
            flat = [float(x) for row in a for x in (row if isinstance(row, (list, tuple)) else [row])] if hasattr(a, '__iter__') else [float(a)]
            if not flat or len(flat) == 1:
                return 0.0
            avg = sum(flat) / len(flat)
            variance = sum((x - avg) ** 2 for x in flat) / len(flat)
            return float(math.sqrt(variance))

        @staticmethod
        def median(a):
            flat = sorted([float(x) for row in a for x in (row if isinstance(row, (list, tuple)) else [row])] if hasattr(a, '__iter__') else [float(a)])
            n = len(flat)
            if n == 0:
                return 0.0
            mid = n // 2
            if n % 2 == 1:
                return float(flat[mid])
            return float((flat[mid - 1] + flat[mid]) / 2.0)

        @staticmethod
        def min(a):
            flat = [float(x) for row in a for x in (row if isinstance(row, (list, tuple)) else [row])] if hasattr(a, '__iter__') else [float(a)]
            return float(min(flat)) if flat else 0.0

        @staticmethod
        def max(a):
            flat = [float(x) for row in a for x in (row if isinstance(row, (list, tuple)) else [row])] if hasattr(a, '__iter__') else [float(a)]
            return float(max(flat)) if flat else 0.0

        @staticmethod
        def argmax(a):
            flat = [float(x) for row in a for x in (row if isinstance(row, (list, tuple)) else [row])] if hasattr(a, '__iter__') else [float(a)]
            return int(flat.index(max(flat))) if flat else 0

        @staticmethod
        def round(a, decimals=2):
            if isinstance(a, (list, tuple)):
                return [round(float(x), decimals) for x in a]
            return round(float(a), decimals)

    class FallbackSeries(list):
        """Pure Python fallback for a Pandas Series."""
        def __init__(self, data=None, name=None):
            super().__init__(data or [])
            self.name = name

        def to_numpy(self):
            return list(self)

        def mean(self):
            nums = [float(x) for x in self if x is not None]
            return sum(nums) / len(nums) if nums else 0.0

        def unique(self):
            seen = set()
            out = []
            for item in self:
                if item not in seen:
                    seen.add(item)
                    out.append(item)
            return out

        def value_counts(self):
            counts = {}
            for item in self:
                counts[item] = counts.get(item, 0) + 1
            class CountsDict(dict):
                def to_dict(self):
                    return dict(self)
            return CountsDict(counts)

        def rank(self, ascending=False, method='min'):
            indexed = list(enumerate(self))
            indexed.sort(key=lambda x: x[1], reverse=ascending)
            ranks = [0] * len(self)
            for rank_idx, (orig_idx, _) in enumerate(indexed, 1):
                ranks[orig_idx] = rank_idx
            return FallbackSeries(ranks, name='rank')

        def idxmax(self):
            if not self:
                return 0
            m = max(self)
            return self.index(m)

        def idxmin(self):
            if not self:
                return 0
            m = min(self)
            return self.index(m)

    class FallbackDataFrame:
        """Pure Python fallback for Pandas DataFrame."""
        def __init__(self, data=None):
            if isinstance(data, list):
                self._rows = [dict(r) for r in data]
                self.columns = list(self._rows[0].keys()) if self._rows else []
            elif isinstance(data, dict):
                keys = list(data.keys())
                num_rows = len(data[keys[0]]) if keys else 0
                self._rows = []
                for i in range(num_rows):
                    self._rows.append({k: data[k][i] for k in keys})
                self.columns = keys
            else:
                self._rows = []
                self.columns = []

        def __len__(self):
            return len(self._rows)

        def __getitem__(self, key):
            if isinstance(key, str):
                vals = [r.get(key) for r in self._rows]
                return FallbackSeries(vals, name=key)
            elif isinstance(key, list):
                # Multiple columns or boolean mask
                if key and isinstance(key[0], bool):
                    sub_rows = [r for r, keep in zip(self._rows, key) if keep]
                    return FallbackDataFrame(sub_rows)
                sub_rows = [{k: r.get(k) for k in key} for r in self._rows]
                return FallbackDataFrame(sub_rows)
            raise KeyError(key)

        def __setitem__(self, key, value):
            if key not in self.columns:
                self.columns.append(key)
            if isinstance(value, (list, tuple, FallbackSeries)):
                for idx, val in enumerate(value):
                    if idx < len(self._rows):
                        self._rows[idx][key] = val
            else:
                for r in self._rows:
                    r[key] = value

        def copy(self):
            return FallbackDataFrame([dict(r) for r in self._rows])

        def to_numpy(self):
            return [[r.get(col) for col in self.columns] for r in self._rows]

        def iterrows(self):
            for idx, r in enumerate(self._rows):
                yield idx, r

        def select_dtypes(self, include=None):
            class DTypesProxy:
                def __init__(self, cols):
                    self.columns = cols
            obj_cols = [c for c in self.columns if any(isinstance(r.get(c), str) for r in self._rows)]
            return DTypesProxy(obj_cols)

        def sort_values(self, by, ascending=True):
            sorted_rows = sorted(self._rows, key=lambda r: r.get(by, 0), reverse=not ascending)
            return FallbackDataFrame(sorted_rows)

        def to_dict(self, orient="records"):
            if orient == "records":
                return [dict(r) for r in self._rows]
            return {c: [r.get(c) for r in self._rows] for c in self.columns}

        @property
        def iloc(self):
            class ILocIndexer:
                def __init__(self, parent):
                    self.parent = parent
                def __getitem__(self, idx):
                    return self.parent._rows[idx]
            return ILocIndexer(self)

        @property
        def loc(self):
            class LocIndexer:
                def __init__(self, parent):
                    self.parent = parent
                def __getitem__(self, idx):
                    return self.parent._rows[idx]
            return LocIndexer(self)

        def head(self, n=5):
            return FallbackDataFrame(self._rows[:n])

    class FallbackPandas:
        """Pure Python fallback providing Pandas utilities."""
        DataFrame = FallbackDataFrame
        Series = FallbackSeries

        @staticmethod
        def read_csv(filepath: str):
            rows = []
            with open(filepath, mode='r', encoding='utf-8') as f:
                reader = csv.DictReader(f)
                for r in reader:
                    rows.append({k.strip(): v.strip() for k, v in r.items()})
            return FallbackDataFrame(rows)

        @staticmethod
        def to_numeric(val, errors='coerce'):
            if isinstance(val, (list, tuple, FallbackSeries)):
                out = []
                for x in val:
                    try:
                        out.append(float(x) if '.' in str(x) else int(x))
                    except (ValueError, TypeError):
                        out.append(0.0 if errors == 'coerce' else x)
                return FallbackSeries(out)
            try:
                return float(val) if '.' in str(val) else int(val)
            except (ValueError, TypeError):
                return 0.0

    np = FallbackNumPy
    pd = FallbackPandas


def load_student_dataset(filepath: str):
    """
    Step 2: Read data from CSV file using Pandas.
    Validates presence of required columns and cleans data types.
    """
    df = pd.read_csv(filepath)
    
    # Strip whitespace from string columns
    for col in df.select_dtypes(include=['object']).columns:
        df[col] = [str(x).strip() for x in df[col]]
        
    # Ensure numerical subject marks and attendance are float/int
    for col in SUBJECT_COLUMNS:
        if col in df.columns:
            df[col] = pd.to_numeric(df[col], errors='coerce')
            
    if 'attendance' in df.columns:
        df['attendance'] = pd.to_numeric(df['attendance'], errors='coerce')
        
    return df


def calculate_grade(average_score: float) -> Tuple[str, str]:
    """
    Assigns a letter grade and label based on clearly defined grading rule.
    """
    for threshold, grade, label in GRADING_SCALE:
        if average_score >= threshold:
            return grade, label
    return 'F', 'Fail'


def evaluate_student_status(row: Union[dict, Any], subjects: List[str] = SUBJECT_COLUMNS) -> Dict[str, Any]:
    """
    Evaluates individual student pass/fail condition and attendance status.
    """
    marks = [float(row[sub]) for sub in subjects]
    failed_subs = [subjects[i] for i, mark in enumerate(marks) if mark < SUBJECT_PASSING_MARK]
    
    is_academic_pass = len(failed_subs) == 0
    has_attendance = float(row['attendance']) >= MINIMUM_ATTENDANCE_PERCENT
    
    final_result = 'PASS' if is_academic_pass else 'FAIL'
        
    return {
        'status': final_result,
        'failed_subjects': failed_subs,
        'failed_count': len(failed_subs),
        'attendance_eligible': has_attendance
    }


def process_student_data(df: Any, subjects: List[str] = SUBJECT_COLUMNS):
    """
    Step 3: Process the data using NumPy and Pandas.
    Calculates total marks, average marks, grade, and pass/fail status.
    """
    df_processed = df.copy()
    
    # Extract marks matrix as 2D array for numerical computation
    marks_array = df_processed[subjects].to_numpy()
    
    # Calculate row-wise sums and means using NumPy
    totals = np.sum(marks_array, axis=1)
    averages = np.round(np.mean(marks_array, axis=1), 2)
    
    df_processed['total_marks'] = totals
    df_processed['average_marks'] = averages
    
    # Use loops to apply grading rules and pass/fail evaluations
    grades = []
    grade_labels = []
    statuses = []
    failed_counts = []
    attendance_flags = []
    
    for idx, row in df_processed.iterrows():
        grade, label = calculate_grade(float(row['average_marks']))
        status_eval = evaluate_student_status(row, subjects)
        
        grades.append(grade)
        grade_labels.append(label)
        statuses.append(status_eval['status'])
        failed_counts.append(status_eval['failed_count'])
        attendance_flags.append('Normal' if status_eval['attendance_eligible'] else 'Shortage')
        
    df_processed['grade'] = grades
    df_processed['grade_label'] = grade_labels
    df_processed['status'] = statuses
    df_processed['failed_subjects_count'] = failed_counts
    df_processed['attendance_status'] = attendance_flags
    
    # Add rank based on average marks (descending)
    df_processed['rank'] = [int(r) for r in df_processed['average_marks'].rank(ascending=False, method='min')]
    
    return df_processed


def get_top_performers(df: Any, top_n: int = 5):
    """Identifies the top performing students by average marks."""
    return df.sort_values(by='average_marks', ascending=False).head(top_n).copy()


def analyze_subject_performance(df: Any, subjects: List[str] = SUBJECT_COLUMNS) -> Dict[str, Dict[str, Any]]:
    """Generates subject-wise performance analysis using NumPy numerical routines."""
    subject_analysis = {}
    
    for subject in subjects:
        marks = df[subject].to_numpy()
        
        highest = float(np.max(marks))
        lowest = float(np.min(marks))
        average = float(np.round(np.mean(marks), 2))
        std_dev = float(np.round(np.std(marks), 2))
        median = float(np.median(marks))
        
        passed_count = sum(1 for m in marks if float(m) >= SUBJECT_PASSING_MARK)
        total_students = len(marks)
        pass_rate = float(np.round((passed_count / total_students) * 100, 2)) if total_students > 0 else 0.0
        
        top_student_idx = int(np.argmax(marks))
        top_student_name = df.iloc[top_student_idx]['name']
        
        subject_analysis[subject] = {
            'subject_name': subject.replace('_', ' ').title(),
            'highest': highest,
            'lowest': lowest,
            'average': average,
            'std_dev': std_dev,
            'median': median,
            'passed_count': passed_count,
            'failed_count': total_students - passed_count,
            'pass_rate': pass_rate,
            'top_scorer': top_student_name
        }
        
    return subject_analysis


def analyze_department_performance(df: Any) -> Dict[str, Dict[str, Any]]:
    """Analyzes student performance grouped by department."""
    dept_analysis = {}
    departments = df['department'].unique()
    
    for dept in departments:
        # Filter matching rows
        dept_rows = [r for _, r in df.iterrows() if r['department'] == dept]
        dept_df = pd.DataFrame(dept_rows) if hasattr(pd, 'DataFrame') else FallbackDataFrame(dept_rows)
        
        dept_averages = dept_df['average_marks'].to_numpy()
        total_students = len(dept_df)
        passed_students = sum(1 for _, r in dept_df.iterrows() if r['status'] == 'PASS')
        
        dept_analysis[dept] = {
            'student_count': total_students,
            'average_marks': float(np.round(np.mean(dept_averages), 2)),
            'highest_average': float(np.max(dept_averages)),
            'lowest_average': float(np.min(dept_averages)),
            'pass_count': passed_students,
            'pass_percentage': float(np.round((passed_students / total_students) * 100, 2)) if total_students > 0 else 0.0,
            'average_attendance': float(np.round(np.mean(dept_df['attendance'].to_numpy()), 2))
        }
        
    return dept_analysis


def answer_practical_questions(df: Any, subjects: List[str] = SUBJECT_COLUMNS) -> Dict[str, Any]:
    """
    Step 4: Answers practical questions:
      1. Which student has the highest average?
      2. Which subject has the best average?
      3. How many students passed?
      4. What is the overall class average?
    """
    highest_idx = df['average_marks'].idxmax()
    highest_student = df.loc[highest_idx]
    
    lowest_idx = df['average_marks'].idxmin()
    lowest_student = df.loc[lowest_idx]
    
    subject_stats = analyze_subject_performance(df, subjects)
    best_subject_key = max(subject_stats, key=lambda s: subject_stats[s]['average'])
    lowest_subject_key = min(subject_stats, key=lambda s: subject_stats[s]['average'])
    
    passed_count = sum(1 for _, r in df.iterrows() if r['status'] == 'PASS')
    failed_count = sum(1 for _, r in df.iterrows() if r['status'] == 'FAIL')
    total_students = len(df)
    pass_percentage = round((passed_count / total_students) * 100, 2) if total_students > 0 else 0.0
    
    all_marks = [float(r[sub]) for _, r in df.iterrows() for sub in subjects]
    overall_class_average = float(np.round(np.mean(all_marks), 2))
    student_average_mean = float(np.round(np.mean(df['average_marks'].to_numpy()), 2))
    
    return {
        'question_1_highest_student': {
            'question': 'Which student has the highest average?',
            'answer': f"{highest_student['name']} ({highest_student['student_id']}) with an average of {highest_student['average_marks']}%",
            'name': highest_student['name'],
            'id': highest_student['student_id'],
            'department': highest_student['department'],
            'average': float(highest_student['average_marks']),
            'total': float(highest_student['total_marks']),
            'grade': highest_student['grade']
        },
        'question_2_best_subject': {
            'question': 'Which subject has the best average?',
            'answer': f"{subject_stats[best_subject_key]['subject_name']} with an average of {subject_stats[best_subject_key]['average']}%",
            'subject_code': best_subject_key,
            'subject_name': subject_stats[best_subject_key]['subject_name'],
            'average': subject_stats[best_subject_key]['average'],
            'lowest_subject': {
                'subject_name': subject_stats[lowest_subject_key]['subject_name'],
                'average': subject_stats[lowest_subject_key]['average']
            }
        },
        'question_3_pass_count': {
            'question': 'How many students passed?',
            'answer': f"{passed_count} out of {total_students} students passed ({pass_percentage}%)",
            'passed_count': passed_count,
            'failed_count': failed_count,
            'total_students': total_students,
            'pass_percentage': pass_percentage
        },
        'question_4_class_average': {
            'question': 'What is the overall class average?',
            'answer': f"{overall_class_average}% across all subjects ({student_average_mean}% student mean)",
            'overall_marks_average': overall_class_average,
            'student_average_mean': student_average_mean
        },
        'lowest_performing_student': {
            'name': lowest_student['name'],
            'id': lowest_student['student_id'],
            'average': float(lowest_student['average_marks']),
            'grade': lowest_student['grade'],
            'department': lowest_student['department']
        }
    }


def compute_grade_distribution(df: Any) -> Dict[str, int]:
    """Computes count of students in each grade category."""
    grade_counts = {grade: 0 for _, grade, _ in GRADING_SCALE}
    counts = df['grade'].value_counts().to_dict()
    for g, count in counts.items():
        grade_counts[g] = int(count)
    return grade_counts
