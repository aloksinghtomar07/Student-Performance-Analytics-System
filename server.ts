import express from 'express';
import path from 'path';
import fs from 'fs';
import { exec } from 'child_process';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

const PROJECT_FILES = [
  'main.py',
  'functions.py',
  'students.csv',
  'requirements.txt',
  'README.md',
  'PROJECT_DOCUMENTATION.md'
];

const DEFAULT_CSV_CONTENT = `student_id,name,department,math,physics,chemistry,computer_science,english,attendance
STU101,Aarav Sharma,Computer Science,92,88,95,98,90,94.5
STU102,Diya Patel,Information Technology,85,78,82,88,84,91.0
STU103,Rohan Verma,Mechanical Engineering,64,70,58,62,65,82.0
STU104,Ananya Iyer,Computer Science,95,92,89,96,93,96.5
STU105,Vikram Singh,Electrical Engineering,48,52,45,55,50,72.0
STU106,Neha Gupta,Information Technology,78,84,80,82,79,88.5
STU107,Kabir Mehta,Civil Engineering,38,42,40,45,44,68.0
STU108,Sneha Reddy,Computer Science,88,90,85,92,86,93.0
STU109,Aditya Nair,Mechanical Engineering,72,68,74,70,69,85.0
STU110,Pooja Joshi,Civil Engineering,55,60,52,58,62,79.5
STU111,Rahul Desai,Electrical Engineering,82,85,79,88,80,90.0
STU112,Tanvi Saxena,Computer Science,91,94,88,95,89,95.0
STU113,Arjun Rao,Information Technology,42,39,45,48,40,70.5
STU114,Meera Nambiar,Electrical Engineering,76,72,78,74,75,86.0
STU115,Karan Kapoor,Mechanical Engineering,35,40,38,42,45,64.0
STU116,Isha Malhotra,Computer Science,84,80,86,85,82,89.0
STU117,Siddharth Das,Civil Engineering,68,65,70,66,67,81.5
STU118,Riya Sen,Information Technology,90,86,92,94,88,92.5
STU119,Manish Yadav,Electrical Engineering,58,62,60,65,59,76.0
STU120,Kavya Pillai,Mechanical Engineering,79,82,75,80,81,87.0
`;

// API: Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', python: '3.10', packages: ['numpy', 'pandas'] });
});

// API: Get all project files with content
app.get('/api/files', (req, res) => {
  try {
    const filesData = PROJECT_FILES.map((filename) => {
      const filePath = path.join(__dirname, filename);
      let content = '';
      let exists = false;
      if (fs.existsSync(filePath)) {
        content = fs.readFileSync(filePath, 'utf-8');
        exists = true;
      }
      return { filename, content, exists };
    });
    res.json({ files: filesData });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// API: Save or update a project file
app.post('/api/save-file', (req, res) => {
  try {
    const { filename, content } = req.body;
    if (!PROJECT_FILES.includes(filename)) {
      return res.status(400).json({ error: 'Disallowed filename' });
    }
    const filePath = path.join(__dirname, filename);
    fs.writeFileSync(filePath, content, 'utf-8');
    res.json({ success: true, filename });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// API: Reset dataset to default
app.post('/api/reset-dataset', (req, res) => {
  try {
    const filePath = path.join(__dirname, 'students.csv');
    fs.writeFileSync(filePath, DEFAULT_CSV_CONTENT, 'utf-8');
    res.json({ success: true, message: 'Dataset reset to 20 original records' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// API: Add a student record
app.post('/api/add-student', (req, res) => {
  try {
    const { student_id, name, department, math, physics, chemistry, computer_science, english, attendance } = req.body;
    
    if (!student_id || !name || !department) {
      return res.status(400).json({ error: 'Missing required student details' });
    }

    const row = `${student_id.trim()},${name.trim()},${department.trim()},${Number(math) || 0},${Number(physics) || 0},${Number(chemistry) || 0},${Number(computer_science) || 0},${Number(english) || 0},${Number(attendance) || 0}\n`;
    const filePath = path.join(__dirname, 'students.csv');
    fs.appendFileSync(filePath, row, 'utf-8');

    res.json({ success: true, student_id });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Python execution options with explicit PYTHONPATH resolution
const getPythonOptions = () => {
  const localPkgDir = path.join(__dirname, 'python_packages');
  const rootPkgDir = '/python_packages';
  const userSiteDir = path.join(process.env.HOME || '/root', '.local/lib/python3.10/site-packages');
  const pythonPath = [localPkgDir, rootPkgDir, userSiteDir, process.env.PYTHONPATH].filter(Boolean).join(':');
  const userBin = path.join(process.env.HOME || '/root', '.local/bin');
  const sysPath = [userBin, '/root/.local/bin', process.env.PATH].filter(Boolean).join(':');

  return {
    cwd: __dirname,
    env: {
      ...process.env,
      PYTHONPATH: pythonPath,
      PATH: sysPath,
    }
  };
};

// API: Run python main.py and return raw terminal output
app.post('/api/run-terminal', (req, res) => {
  const startTime = Date.now();
  exec('python3 main.py', getPythonOptions(), (error, stdout, stderr) => {
    const executionTimeMs = Date.now() - startTime;
    res.json({
      stdout,
      stderr,
      exitCode: error ? error.code || 1 : 0,
      executionTimeMs,
      timestamp: new Date().toISOString()
    });
  });
});

// API: Run python main.py --json and return structured analytics
app.get('/api/analytics', (req, res) => {
  const startTime = Date.now();
  exec('python3 main.py --json', getPythonOptions(), (error, stdout, stderr) => {
    const executionTimeMs = Date.now() - startTime;
    if (error) {
      return res.status(500).json({
        error: 'Failed to execute Python analytics script',
        stderr,
        exitCode: error.code
      });
    }

    try {
      const parsed = JSON.parse(stdout);
      res.json({
        ...parsed,
        executionTimeMs
      });
    } catch (parseErr: any) {
      res.status(500).json({
        error: 'Failed to parse Python JSON output',
        rawOutput: stdout,
        stderr
      });
    }
  });
});

// API: Install or verify dependencies
app.post('/api/install-deps', (req, res) => {
  const options = getPythonOptions();
  exec('pip install -r requirements.txt || python3 -m pip install -r requirements.txt', options, (error, stdout, stderr) => {
    res.json({
      success: !error,
      stdout,
      stderr,
      exitCode: error ? error.code || 1 : 0
    });
  });
});

// API: Download single file
app.get('/api/download/:filename', (req, res) => {
  const { filename } = req.params;
  if (!PROJECT_FILES.includes(filename)) {
    return res.status(404).send('File not found');
  }
  const filePath = path.join(__dirname, filename);
  if (!fs.existsSync(filePath)) {
    return res.status(404).send('File not found');
  }
  res.download(filePath, filename);
});

// Setup Vite middleware in development or serve static files in production
async function startServer() {
  const isProd = process.env.NODE_ENV === 'production';

  if (!isProd) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(Number(PORT), '0.0.0.0', () => {
    console.log(`Server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer();
