"""
Student Performance Analytics System - Core Functions Module
Course: EWB Courses | Python with AI
Author: Python with AI Student
Assignment Deadline: 15 October 2026

This module provides reusable analytical functions utilizing Python,
NumPy, and Pandas to process student academic data, calculate metrics,
assign letter grades, evaluate pass/fail criteria, and generate statistical insights.
"""

from typing import List, Dict, Any, Tuple
import numpy as np
import pandas as pd

# List of target academic subjects present in the dataset
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


def load_student_dataset(filepath: str) -> pd.DataFrame:
    """
    Step 2: Read data from CSV file using Pandas.
    Validates presence of required columns and cleans data types.
    
    Args:
        filepath: Path to the students CSV file.
        
    Returns:
        Pandas DataFrame containing cleaned student records.
    """
    df = pd.read_csv(filepath)
    
    # Strip whitespace from string columns
    for col in df.select_dtypes(include=['object']).columns:
        df[col] = df[col].astype(str).str.strip()
        
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
    
    Grading Scale:
      90% and above  : A+ (Outstanding)
      80% to 89.99%  : A  (Excellent)
      70% to 79.99%  : B  (Very Good)
      60% to 69.99%  : C  (Good)
      50% to 59.99%  : D  (Satisfactory)
      Below 50%      : F  (Fail)
      
    Args:
        average_score: Numeric percentage / average marks.
        
    Returns:
        Tuple of (grade_letter, grade_label)
    """
    for threshold, grade, label in GRADING_SCALE:
        if average_score >= threshold:
            return grade, label
    return 'F', 'Fail'


def evaluate_student_status(row: pd.Series, subjects: List[str] = SUBJECT_COLUMNS) -> Dict[str, Any]:
    """
    Evaluates individual student pass/fail condition and attendance status.
    
    Clearly defined condition:
      1. Academic Pass: Student must score >= 40.0 in ALL subjects.
      2. If any subject < 40.0, the student fails that subject and overall status is FAIL.
      3. Attendance Status: Satisfactory if >= 75.0%, else Shortage Alert.
      
    Args:
        row: Pandas Series representing a student row.
        subjects: List of subject column names.
        
    Returns:
        Dictionary with status flags and failed subjects if any.
    """
    marks = [row[sub] for sub in subjects]
    failed_subs = [subjects[i] for i, mark in enumerate(marks) if mark < SUBJECT_PASSING_MARK]
    
    is_academic_pass = len(failed_subs) == 0
    has_attendance = row['attendance'] >= MINIMUM_ATTENDANCE_PERCENT
    
    if is_academic_pass:
        final_result = 'PASS'
    else:
        final_result = 'FAIL'
        
    return {
        'status': final_result,
        'failed_subjects': failed_subs,
        'failed_count': len(failed_subs),
        'attendance_eligible': has_attendance
    }


def process_student_data(df: pd.DataFrame, subjects: List[str] = SUBJECT_COLUMNS) -> pd.DataFrame:
    """
    Step 3: Process the data using NumPy and Pandas.
    Calculates total marks, average marks, grade, and pass/fail status.
    Uses loops and vectorized NumPy operations where appropriate.
    
    Args:
        df: Raw student DataFrame.
        subjects: List of subject columns.
        
    Returns:
        Processed DataFrame with calculated columns.
    """
    df_processed = df.copy()
    
    # Extract marks matrix as NumPy 2D array for fast numerical computation
    marks_array = df_processed[subjects].to_numpy()
    
    # Use NumPy to calculate row-wise sums and means
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
    
    # Explicit loop over student records for detailed status determination
    for idx, row in df_processed.iterrows():
        grade, label = calculate_grade(row['average_marks'])
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
    df_processed['rank'] = df_processed['average_marks'].rank(ascending=False, method='min').astype(int)
    
    return df_processed


def get_top_performers(df: pd.DataFrame, top_n: int = 5) -> pd.DataFrame:
    """
    Identifies the top performing students by average marks.
    
    Args:
        df: Processed DataFrame.
        top_n: Number of top students to return.
        
    Returns:
        DataFrame sorted by average_marks descending.
    """
    return df.sort_values(by='average_marks', ascending=False).head(top_n).copy()


def analyze_subject_performance(df: pd.DataFrame, subjects: List[str] = SUBJECT_COLUMNS) -> Dict[str, Dict[str, Any]]:
    """
    Generates subject-wise performance analysis using NumPy numerical routines.
    Computes highest, lowest, average, standard deviation, and pass rate per subject.
    Uses loops over subjects.
    
    Args:
        df: Processed DataFrame.
        subjects: List of subject columns.
        
    Returns:
        Dictionary mapping each subject to its statistical analysis.
    """
    subject_analysis = {}
    
    # Loop through each subject
    for subject in subjects:
        # Convert subject column into NumPy array for calculation
        marks = df[subject].to_numpy()
        
        highest = float(np.max(marks))
        lowest = float(np.min(marks))
        average = float(np.round(np.mean(marks), 2))
        std_dev = float(np.round(np.std(marks), 2))
        median = float(np.median(marks))
        
        # Calculate passing count and pass rate
        passed_count = int(np.sum(marks >= SUBJECT_PASSING_MARK))
        total_students = len(marks)
        pass_rate = float(np.round((passed_count / total_students) * 100, 2)) if total_students > 0 else 0.0
        
        # Identify top scorer for this subject
        top_student_idx = np.argmax(marks)
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


def analyze_department_performance(df: pd.DataFrame) -> Dict[str, Dict[str, Any]]:
    """
    Analyzes student performance grouped by department using Pandas and loops.
    
    Args:
        df: Processed DataFrame.
        
    Returns:
        Dictionary of department statistics.
    """
    dept_analysis = {}
    departments = df['department'].unique()
    
    # Loop over departments
    for dept in departments:
        dept_df = df[df['department'] == dept]
        dept_averages = dept_df['average_marks'].to_numpy()
        
        total_students = len(dept_df)
        passed_students = int(np.sum(dept_df['status'] == 'PASS'))
        
        dept_analysis[dept] = {
            'student_count': total_students,
            'average_marks': float(np.round(np.mean(dept_averages), 2)),
            'highest_average': float(np.max(dept_averages)),
            'lowest_average': float(np.min(dept_averages)),
            'pass_count': passed_students,
            'pass_percentage': float(np.round((passed_students / total_students) * 100, 2)),
            'average_attendance': float(np.round(np.mean(dept_df['attendance'].to_numpy()), 2))
        }
        
    return dept_analysis


def answer_practical_questions(df: pd.DataFrame, subjects: List[str] = SUBJECT_COLUMNS) -> Dict[str, Any]:
    """
    Step 4: Answers the practical questions outlined in the assignment instructions:
      1. Which student has the highest average?
      2. Which subject has the best average?
      3. How many students passed?
      4. What is the overall class average?
      
    Args:
        df: Processed DataFrame.
        subjects: Subject list.
        
    Returns:
        Dictionary containing direct answers and supporting data.
    """
    # 1. Which student has the highest average?
    highest_idx = df['average_marks'].idxmax()
    highest_student = df.loc[highest_idx]
    
    lowest_idx = df['average_marks'].idxmin()
    lowest_student = df.loc[lowest_idx]
    
    # 2. Which subject has the best average?
    subject_stats = analyze_subject_performance(df, subjects)
    best_subject_key = max(subject_stats, key=lambda s: subject_stats[s]['average'])
    lowest_subject_key = min(subject_stats, key=lambda s: subject_stats[s]['average'])
    
    # 3. How many students passed?
    passed_count = int(np.sum(df['status'] == 'PASS'))
    failed_count = int(np.sum(df['status'] == 'FAIL'))
    total_students = len(df)
    pass_percentage = round((passed_count / total_students) * 100, 2)
    
    # 4. What is the overall class average?
    all_marks = df[subjects].to_numpy().flatten()
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


def compute_grade_distribution(df: pd.DataFrame) -> Dict[str, int]:
    """
    Computes count of students in each grade category.
    
    Args:
        df: Processed DataFrame.
        
    Returns:
        Dictionary mapping grade letters to student counts.
    """
    grade_counts = {grade: 0 for _, grade, _ in GRADING_SCALE}
    counts = df['grade'].value_counts().to_dict()
    for g, count in counts.items():
        grade_counts[g] = int(count)
    return grade_counts
