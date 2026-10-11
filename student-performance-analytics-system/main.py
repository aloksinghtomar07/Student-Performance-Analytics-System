#!/usr/bin/env python3
"""
Student Performance Analytics System
Course: EWB Courses | Python with AI
Assignment: Python Project Assignment
Submission Deadline: 15 October 2026

Main script to load student records, process analytics using NumPy and Pandas,
evaluate grading criteria and pass/fail rules, and display formatted analytical reports.
"""

import sys
import os
import json
from typing import Dict, Any

from functions import (
    SUBJECT_COLUMNS,
    GRADING_SCALE,
    SUBJECT_PASSING_MARK,
    MINIMUM_ATTENDANCE_PERCENT,
    load_student_dataset,
    process_student_data,
    get_top_performers,
    analyze_subject_performance,
    analyze_department_performance,
    answer_practical_questions,
    compute_grade_distribution
)


def print_banner():
    print("=" * 80)
    print("           EWB COURSES | PYTHON WITH AI ASSIGNMENT")
    print("              STUDENT PERFORMANCE ANALYTICS SYSTEM")
    print("             Submission Deadline: 15 October 2026")
    print("=" * 80)


def print_section(title: str):
    print("\n" + "-" * 80)
    print(f"▶ {title.upper()}")
    print("-" * 80)


def display_console_report(
    df_raw,
    df_processed,
    practical_answers: Dict[str, Any],
    top_students,
    subject_stats,
    dept_stats,
    grade_distribution
):
    print_banner()

    # Step 1 & 2: Dataset Overview
    print_section("Step 1 & 2: Dataset Loading and Initial Overview")
    print(f"Total Student Records Loaded: {len(df_raw)}")
    print(f"Columns Identified: {list(df_raw.columns)}")
    print(f"Academic Subjects: {[s.replace('_', ' ').title() for s in SUBJECT_COLUMNS]}")
    print(f"Grading Criteria Thresholds:")
    for thresh, grade, desc in GRADING_SCALE:
        print(f"   {grade:2s} : >= {thresh:4.1f}% ({desc})")
    print(f"Passing Rules: Subject Mark >= {SUBJECT_PASSING_MARK} and Attendance >= {MINIMUM_ATTENDANCE_PERCENT}%")

    # Step 3: Processed Records Table Preview
    print_section("Step 3: Processed Student Performance Summary (Sample Records)")
    columns_to_show = ['student_id', 'name', 'department', 'total_marks', 'average_marks', 'grade', 'status', 'attendance']
    print(f"{'ID':<8} {'Name':<18} {'Dept':<22} {'Total':<7} {'Avg%':<7} {'Grade':<6} {'Status':<7} {'Att%':<6}")
    print("." * 80)
    for _, row in df_processed.iterrows():
        print(f"{row['student_id']:<8} {row['name'][:17]:<18} {row['department'][:21]:<22} {row['total_marks']:<7.1f} {row['average_marks']:<7.2f} {row['grade']:<6} {row['status']:<7} {row['attendance']:<6.1f}")

    # Step 4: Practical Questions Answered
    print_section("Step 4: Practical Analysis Questions & Answers")
    q1 = practical_answers['question_1_highest_student']
    q2 = practical_answers['question_2_best_subject']
    q3 = practical_answers['question_3_pass_count']
    q4 = practical_answers['question_4_class_average']

    print(f"1. {q1['question']}")
    print(f"   => {q1['answer']} (Department: {q1['department']}, Total: {q1['total']})")

    print(f"\n2. {q2['question']}")
    print(f"   => {q2['answer']}")
    print(f"   (Lowest scoring subject: {q2['lowest_subject']['subject_name']} with average {q2['lowest_subject']['average']}%)")

    print(f"\n3. {q3['question']}")
    print(f"   => {q3['answer']}")
    print(f"   Passed: {q3['passed_count']} | Failed: {q3['failed_count']} | Pass Rate: {q3['pass_percentage']}%")

    print(f"\n4. {q4['question']}")
    print(f"   => {q4['answer']}")

    # Top Performers
    print_section("Top-Performing Students (Top 5 Ranking)")
    print(f"{'Rank':<6} {'ID':<8} {'Name':<18} {'Department':<22} {'Total':<8} {'Average':<8} {'Grade'}")
    print("-" * 80)
    for idx, (_, student) in enumerate(top_students.iterrows(), 1):
        print(f"#{idx:<5} {student['student_id']:<8} {student['name']:<18} {student['department']:<22} {student['total_marks']:<8.1f} {student['average_marks']:<8.2f} {student['grade']} ({student['grade_label']})")

    # Subject-wise Analysis
    print_section("Subject-Wise Performance Analysis (NumPy Statistics)")
    print(f"{'Subject':<18} {'Avg%':<8} {'Highest':<9} {'Lowest':<8} {'StdDev':<8} {'Pass%':<8} {'Top Scorer'}")
    print("-" * 80)
    for sub_key, stats in subject_stats.items():
        print(f"{stats['subject_name']:<18} {stats['average']:<8.2f} {stats['highest']:<9.1f} {stats['lowest']:<8.1f} {stats['std_dev']:<8.2f} {stats['pass_rate']:<8.1f} {stats['top_scorer']}")

    # Department-wise Analysis
    print_section("Department-Wise Performance Breakdown")
    print(f"{'Department':<24} {'Students':<10} {'Avg Marks':<11} {'Pass Rate':<11} {'Avg Att%'}")
    print("-" * 80)
    for dept_name, d_stat in dept_stats.items():
        print(f"{dept_name:<24} {d_stat['student_count']:<10} {d_stat['average_marks']:<11.2f} {d_stat['pass_percentage']:<11.1f}% {d_stat['average_attendance']:<8.1f}%")

    # Grade Distribution
    print_section("Overall Grade Distribution")
    for grade, count in grade_distribution.items():
        bar = "█" * count
        print(f"Grade {grade:2s}: {count:2d} students {bar}")

    print("\n" + "=" * 80)
    print("✔ Analytics execution completed successfully!")
    print("=" * 80)


def build_analytics_payload(filepath: str = "students.csv") -> Dict[str, Any]:
    """Builds a complete serializable JSON payload of all analytical results."""
    df_raw = load_student_dataset(filepath)
    df_processed = process_student_data(df_raw, SUBJECT_COLUMNS)
    practical_answers = answer_practical_questions(df_processed, SUBJECT_COLUMNS)
    top_students = get_top_performers(df_processed, top_n=5)
    subject_stats = analyze_subject_performance(df_processed, SUBJECT_COLUMNS)
    dept_stats = analyze_department_performance(df_processed)
    grade_dist = compute_grade_distribution(df_processed)

    # Convert DataFrames to dictionary records for JSON serialization
    processed_records = df_processed.to_dict(orient="records")
    top_students_records = top_students.to_dict(orient="records")

    return {
        "metadata": {
            "title": "Student Performance Analytics System",
            "course": "EWB Courses | Python with AI",
            "deadline": "15 October 2026",
            "total_students": len(df_raw),
            "subjects": SUBJECT_COLUMNS,
            "passing_mark": SUBJECT_PASSING_MARK,
            "min_attendance": MINIMUM_ATTENDANCE_PERCENT,
            "grading_scale": [{"threshold": t, "grade": g, "label": l} for t, g, l in GRADING_SCALE]
        },
        "summary": {
            "total_students": len(df_processed),
            "class_average": practical_answers["question_4_class_average"]["student_average_mean"],
            "overall_marks_average": practical_answers["question_4_class_average"]["overall_marks_average"],
            "passed_count": practical_answers["question_3_pass_count"]["passed_count"],
            "failed_count": practical_answers["question_3_pass_count"]["failed_count"],
            "pass_percentage": practical_answers["question_3_pass_count"]["pass_percentage"],
            "highest_student": practical_answers["question_1_highest_student"],
            "lowest_student": practical_answers["lowest_performing_student"],
            "best_subject": practical_answers["question_2_best_subject"],
            "average_attendance": round(float(df_processed["attendance"].mean()), 2)
        },
        "practical_answers": practical_answers,
        "students": processed_records,
        "top_performers": top_students_records,
        "subject_analysis": subject_stats,
        "department_analysis": dept_stats,
        "grade_distribution": grade_dist
    }


def main():
    csv_path = "students.csv"
    if not os.path.exists(csv_path):
        # Look in current directory or script directory
        script_dir = os.path.dirname(os.path.abspath(__file__))
        csv_path = os.path.join(script_dir, "students.csv")

    if "--json" in sys.argv:
        payload = build_analytics_payload(csv_path)
        print(json.dumps(payload, indent=2))
        return

    # Normal console execution
    df_raw = load_student_dataset(csv_path)
    df_processed = process_student_data(df_raw, SUBJECT_COLUMNS)
    practical_answers = answer_practical_questions(df_processed, SUBJECT_COLUMNS)
    top_students = get_top_performers(df_processed, top_n=5)
    subject_stats = analyze_subject_performance(df_processed, SUBJECT_COLUMNS)
    dept_stats = analyze_department_performance(df_processed)
    grade_dist = compute_grade_distribution(df_processed)

    display_console_report(
        df_raw,
        df_processed,
        practical_answers,
        top_students,
        subject_stats,
        dept_stats,
        grade_dist
    )


if __name__ == "__main__":
    main()
