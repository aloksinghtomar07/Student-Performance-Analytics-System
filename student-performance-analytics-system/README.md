# Student Performance Analytics System
> **EWB Courses | Python with AI Assignment**  
> *Deadline: 15 October 2026*

A complete data-analysis system built with **Python**, **NumPy**, and **Pandas** to process academic student records, perform statistical analytics, evaluate institutional grading criteria, and extract key insights.

---

## 📁 Repository Structure
```
├── main.py                     # Main execution program and report generator
├── functions.py                # Reusable functions, grading rules, & NumPy calculations
├── students.csv                # Student dataset with 20 records across 5 subjects
├── README.md                   # Repository overview and instructions
└── PROJECT_DOCUMENTATION.md    # Complete 10-section assignment documentation
```

---

## 🚀 Quick Start

### 1. Requirements
- Python 3.8 or higher
- NumPy
- Pandas

### 2. Installation
```bash
pip install numpy pandas
```

### 3. Running the Analysis
To view the formatted terminal analysis report:
```bash
python main.py
```

To output raw structured JSON (for integrations/APIs):
```bash
python main.py --json
```

---

## 📊 Key Highlights & Features
- **Data Ingestion**: Loads student records with Pandas DataFrame.
- **NumPy Matrix Computations**: Fast row-wise and column-wise calculations for totals, averages, standard deviations, and percentiles.
- **Grading & Pass/Fail Rules**: Institutional evaluation including individual subject cutoffs (40%) and attendance criteria (75%).
- **Practical Problem Solutions**:
  1. Identifies student with highest average (`Ananya Iyer` - 93.0%).
  2. Identifies subject with highest average (`Computer Science` - 74.15%).
  3. Computes exact pass count and percentage (`17 passed`, 85.0%).
  4. Computes overall class average (`71.71%`).
- **Subject & Department Breakdowns**: Comprehensive stats per course and department.

---

## 📝 Assignment Assessment Rubric Compliance
- **Python Fundamentals**: Proper functions, loops, conditions, and structured type hints.
- **NumPy**: Matrix conversion, `np.sum`, `np.mean`, `np.std`, `np.max`, `np.min`, `np.argmax`.
- **Pandas**: `pd.read_csv`, DataFrame filtering, column transformations, grouping.
- **Code Quality**: Meaningful variable names, docstrings, modular design.
