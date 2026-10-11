# Student Performance Analytics System
**EWB Courses | Python with AI Assignment**  
*Submission Deadline: 15 October 2026 (or before)*  
*Student Name: Python with AI Scholar*  
*GitHub Repository: [https://github.com/student/student-performance-analytics](https://github.com/student/student-performance-analytics)*

---

## 1. Project Title
**Student Performance Analytics System**  
Developed as part of the **EWB Courses: Python with AI** curriculum to evaluate and demonstrate practical competency in core Python programming, NumPy numerical array processing, and Pandas data manipulation.

---

## 2. Objective
Educational institutions often struggle to swiftly evaluate multi-subject student academic data across diverse departments. Manual record management is prone to errors, delays in identifying at-risk students, and lack of aggregate statistical clarity.

This project solves these challenges by:
- Ingesting raw CSV student score records.
- Standardizing and cleaning academic datasets.
- Utilizing vectorized numerical arrays for high-performance score summaries.
- Applying unambiguous institutional grading formulas and pass/fail thresholds.
- Generating subject-wise and department-wise performance metrics.
- Highlighting top academic achievers and students with attendance shortages.

---

## 3. Technologies Used
- **Python 3.10+**: Core programming language, high-level control flow, and functions.
- **NumPy (1.24+)**: Vectorized array operations, matrix mathematics (`np.sum`, `np.mean`, `np.std`, `np.median`, `np.max`, `np.min`, `np.argmax`, `np.round`).
- **Pandas (1.5+)**: DataFrame ingestion, tabular structuring, column manipulation, filtering, and grouped aggregations.
- **Standard Libraries**: `sys`, `os`, `json`, `typing`.

---

## 4. Dataset Description
The system operates on `students.csv`, comprising **20 student records** across 5 academic departments with realistic scoring and attendance rates:

| Column Header | Data Type | Description | Range / Values |
|---|---|---|---|
| `student_id` | String | Unique student identifier | `STU101` – `STU120` |
| `name` | String | Full name of student | Real names |
| `department` | String | Academic department | CS, IT, Mechanical, Electrical, Civil |
| `math` | Float / Int | Marks in Mathematics | 0 – 100 |
| `physics` | Float / Int | Marks in Physics | 0 – 100 |
| `chemistry` | Float / Int | Marks in Chemistry | 0 – 100 |
| `computer_science` | Float / Int | Marks in Computer Science | 0 – 100 |
| `english` | Float / Int | Marks in English | 0 – 100 |
| `attendance` | Float | Percentage attendance | 60.0% – 100.0% |

---

## 5. Step-by-Step Implementation

### Step 1 – Dataset Preparation
Created a realistic dataset containing 20 records spanning high achievers (scores > 90%), average students (60%–80%), and students needing academic assistance (< 50% or single-subject failures).

### Step 2 – Reading and Validating Data
Using `pandas.read_csv()`, string sanitization, and explicit type casting (`pd.to_numeric`) with error coercion to ensure null-safe downstream computation.

### Step 3 – Processing Data
- **NumPy Matrix Formulation**: Converted the five subject columns into a 2D NumPy array (`marks_array = df[subjects].to_numpy()`).
- **Vectorized Aggregation**: Row-wise totals and averages computed in a single vectorized instruction:
  - `totals = np.sum(marks_array, axis=1)`
  - `averages = np.round(np.mean(marks_array, axis=1), 2)`
- **Loop-based Status Evaluation**: Iterated across records to evaluate subject-specific passing cutoffs (`>= 40.0`) and attendance thresholds (`>= 75.0%`).
- **Grading Rule Enforcement**:
  - `A+` : 90.0% – 100% (Outstanding)
  - `A`  : 80.0% – 89.9% (Excellent)
  - `B`  : 70.0% – 79.9% (Very Good)
  - `C`  : 60.0% – 69.9% (Good)
  - `D`  : 50.0% – 59.9% (Satisfactory)
  - `F`  : Below 50.0% (Fail)

### Step 4 – Analytical Question Answering
- **Highest Student Average**: `Ananya Iyer (STU104)` with **93.0%** (Total 465.0).
- **Best Subject Average**: `Computer Science` with average **74.15%**.
- **Passing Students Count**: **17 out of 20** students passed (**85.0%** pass rate).
- **Overall Class Average**: **71.71%**.

### Step 5 – Output Generation
Outputs are presented in formatted ASCII terminal format or machine-readable JSON via `main.py --json`.

---

## 6. Key Features Implemented
1. **Modular Architecture**: Clean separation between execution (`main.py`) and calculation routines (`functions.py`).
2. **Explicit Use of Python Functions & Loops**: Iterative evaluations over subjects, departments, and individual candidate edge-cases.
3. **NumPy Numerical Calculation Engine**: Computation of standard deviations, medians, maximums, and minima.
4. **Attendance Shortage Alert**: Flags students below institutional requirement of 75%.
5. **Departmental Comparison**: Grouped analytics showing Computer Science as top department (89.72% average).

---

## 7. Output & Results Summary

### Core Performance Metrics
- **Total Students Evaluated**: 20
- **Overall Class Average**: 71.71%
- **Pass Rate**: 85.0% (17 Passed, 3 Failed)
- **Top Scorer**: Ananya Iyer (93.00%)
- **Top Subject**: Computer Science (74.15% Mean, 100% Pass Rate)

### Subject-Wise Statistics
- **Math**: Mean 71.00% | High 95.0 | Low 35.0 | Pass 90.0%
- **Physics**: Mean 71.45% | High 94.0 | Low 39.0 | Pass 95.0%
- **Chemistry**: Mean 70.55% | High 95.0 | Low 38.0 | Pass 95.0%
- **Computer Science**: Mean 74.15% | High 98.0 | Low 42.0 | Pass 100.0%
- **English**: Mean 71.40% | High 93.0 | Low 40.0 | Pass 100.0%

---

## 8. Final Outcome
The system successfully met all specified rubrics:
- Ingested 20 records cleanly with zero data loss.
- Accurately applied grading rules without hardcoding.
- Validated individual subject requirements alongside aggregate marks.
- Generated clear reports understandable without reviewing source code.

---

## 9. Challenges & Learning
1. **NumPy vs Pandas Interoperability**: Learned when to convert a DataFrame slice into a NumPy ndarray (`to_numpy()`) for numerical processing versus keeping it as a Series for label preservation.
2. **Subject-level vs Aggregate Failure**: Learned that a student could have an aggregate average over 40% but still fail due to a single subject below 40.0; implemented fine-grained checking.
3. **Edge Case Sanitization**: Handled whitespace trimming, missing attendance numbers, and float formatting precision.

---

## 10. GitHub Submission Checklist
- [x] Repository is public / accessible.
- [x] Main Python file (`main.py`) is uploaded.
- [x] Reusable functions file (`functions.py`) is modular and tested.
- [x] Dataset (`students.csv`) is uploaded with 20 records.
- [x] `README.md` and `PROJECT_DOCUMENTATION.md` included.
- [x] Project runs successfully with `python3 main.py`.
- [x] Repository URL ready for EWB Google Form submission.
