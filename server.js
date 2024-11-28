
// server.js
const express = require('express');
const bodyParser = require('body-parser');
const nodemailer = require('nodemailer');
const mysql = require('mysql2');
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs'); 
const multer = require('multer');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const mkdirp = require('mkdirp');

require('dotenv').config();

const app = express();
app.use(bodyParser.json());
app.use(express.static('public'));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'root',
    database: 'Elektrolabs_admin_page'
});

// Connect to the database
db.connect((err) => {
    if (err) return res.status(500).json({ error: err.message });
    console.log('Connected to MySQL');
});



// Initialize upload directory
const uploadDir = path.join(__dirname, 'uploads');

// Check if the uploads directory exists, and only create it if it doesn't
if (!fs.existsSync(uploadDir)) {
    mkdirp.sync(uploadDir);
    console.log('Uploads directory created');
} else {
    console.log('Uploads directory already exists');
}

// Set up multer to handle file uploads
const storageFile = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, './uploads');  // Use the uploads directory
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + path.extname(file.originalname));  // Use original filename
    }
});

const uploading = multer({ storage: storageFile }).array('tenderDocument');

app.use(express.static('uploads'));
// Serve the login page (index.html) when accessing the root URL '/'


app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'login.html'));
});

// Login route
app.post('/login', (req, res) => {
    const { username, password } = req.body;
    db.query('SELECT * FROM change_admin_password WHERE username = ?', [username], (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        if (results.length === 0) return res.status(401).json({ error: 'User not found.' });

        const user = results[0];

        // Compare plaintext password
        if (password !== user.password) {
            return res.status(401).json({ error: 'Invalid credentials.' });
        }

        const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET);
        res.json({ token });
    });
});

// Serve the admin page when accessing '/admin'
app.get('/admin', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'admin.html'));
});

// **********************************************************

// Set up multer to handle file uploads
const storage = multer.memoryStorage(); // Store files in memory
const upload = multer({ storage: storage });

// ******************************************************
// project section


app.post('/add-project', uploading, (req, res) => {
    console.log(req.body); // Log the request body

    const { tenderId, tenderName, tenderPortal, tia, tenderAdditionDate, remark, startDate, endDate, status, employeeId, employeeName, role } = req.body;

    // Validate employee arrays
    if (!Array.isArray(employeeId) || !Array.isArray(employeeName) || !Array.isArray(role) ||
        employeeId.length !== employeeName.length || employeeId.length !== role.length) {
        return res.status(400).json({ success: false, message: 'Employee data is invalid.' });
    }

    // SQL insert statement for adding the project
    const sql = 'INSERT INTO Adminprojects (tender_id, tender_name, tender_portal, tia, tender_addition_date, remark, start_date, end_date, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)';

    db.query(sql, [tenderId, tenderName, tenderPortal, tia, tenderAdditionDate, remark, startDate, endDate, status], (error, results) => {
        if (error) {
            console.error("Error inserting project data:", error);
            return res.status(500).json({ success: false, message: error.message });
        }

        const projectId = results.insertId;

        // Insert uploaded files into Admin_project_files table
        if (req.files && req.files.length > 0) {
            const fileInsertPromises = req.files.map(file => {
                const fileType = path.extname(file.originalname).toLowerCase();
                const filePath = path.join('uploads', file.filename);

                const fileSql = 'INSERT INTO Admin_project_files (project_id, file_name, file_path, file_type) VALUES (?, ?, ?, ?)';
                return new Promise((resolve, reject) => {
                    db.query(fileSql, [projectId, file.originalname, filePath, fileType], (err) => {
                        if (err) return reject(err);
                        resolve();
                    });
                });
            });

            // Wait for all file insertions to complete
            Promise.all(fileInsertPromises)
                .catch(err => {
                    console.error("Error inserting files:", err);
                    return res.status(500).json({ success: false, message: err.message });
                });
        }

        // Insert roles for employees
        const roleInsertPromises = employeeId.map((id, index) => {
            return new Promise((resolve, reject) => {
                const sqlRole = 'INSERT INTO roles_assigned (project_id, employee_id, employee_name, role) VALUES (?, ?, ?, ?)';
                db.query(sqlRole, [projectId, id, employeeName[index], role[index]], (err) => {
                    if (err) {
                        console.error("Error inserting role:", err);
                        return reject(err);
                    }
                    resolve();
                });
            });
        });

        // Execute all role inserts
        Promise.all(roleInsertPromises)
            .then(() => {
                res.json({ success: true });
            })
            .catch((err) => {
                console.error("Error inserting roles:", err);
                res.status(500).json({ success: false, message: err.message });
            });
    });
});


// Fetch all projects
app.get('/api/projects', (req, res) => {
    const sql = 'SELECT * FROM Adminprojects';
    db.query(sql, (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results);
    });
});

// Get project file endpoint
app.get('/get-project-file/:projectId', (req, res) => {
    const projectId = req.params.projectId;
    
    // Get project from DB (adjust to your DB)
    const project = getProjectFromDatabase(projectId);
  
    if (project && project.files && project.files.length > 0) {
      res.json({ success: true, filePath: `/uploads/${project.files[0]}` }); // Return the file path
    } else {
      res.json({ success: false, message: 'File not found' });
    }
  });
  
  // Save project data to your database (pseudo-code)
  function saveProjectToDatabase(project) {
    // Database logic here
    return Math.floor(Math.random() * 1000); // Return a mock project ID
  }
  
  // Get project data from your database (pseudo-code)
  function getProjectFromDatabase(projectId) {
    // Fetch project from DB logic
    return {
      id: projectId,
      files: ['file1.pdf'] // Return a mock file
    };
  }

// Add a new project (if you haven't added this route)
app.post('/api/projects', upload.array('tenderDocument'), (req, res) => {
    const { tenderId, tenderName, tenderPortal, tia, tenderAdditionDate, remark, startDate, endDate, status } = req.body;
    
    // Ensure status is included
    const sql = 'INSERT INTO Adminprojects (tender_id, tender_name, tender_portal, tia, tender_addition_date, remark, start_date, end_date, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)';

    db.query(sql, [tenderId, tenderName, tenderPortal, tia, tenderAdditionDate, remark, startDate, endDate, status], (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: 'Project added successfully', projectId: results.insertId });
 });
});

// Fetch a specific project by ID
// Fetch project details including documents
app.get('/api/projects/:projectId', (req, res) => {
    const { projectId } = req.params;
    const query = `
        SELECT p.*, ra.employee_id, ra.role, ra.employee_name, pf.file_name, pf.file_path, pf.file_type
        FROM Adminprojects p
        LEFT JOIN roles_assigned ra ON p.id = ra.project_id
        LEFT JOIN Admin_project_files pf ON p.id = pf.project_id
        WHERE p.id = ?;
    `;

    db.query(query, [projectId], (err, results) => {
        if (err) {
            return res.status(500).json({ error: 'Database error' });
        }
        if (results.length === 0) {
            return res.status(404).json({ error: 'Project not found' });
        }

        // Create a project object and include assigned employees and files
        const project = {
            ...results[0], // Main project data
            assignedEmployees: results
                .map(row => ({
                    employee_id: row.employee_id,
                    name: row.employee_name,
                    role: row.role
                }))
                .filter(emp => emp.name), // Filter out null or empty names
            status: results[0].status,
            files: results.map(row => ({
                file_name: row.file_name,
                file_path: row.file_path,
                file_type: row.file_type
            }))
        };

        res.json(project);
    });
});


// Update project details
app.put('/api/projects/:projectId', (req, res) => {
    const { projectId } = req.params;
    const { updatedData, rolesToUpdate } = req.body;

    console.log('Received data:', req.body); // Log the received data to check if it's valid

    // Update project details in Adminprojects table, including status
    const projectQuery = `
        UPDATE Adminprojects
        SET tender_id = ?, tender_name = ?, tender_portal = ?, tia = ?, remark = ?, start_date = ?, end_date = ?, tender_documents = ?, status = ?
        WHERE id = ?;
    `;
    db.query(projectQuery, [
        updatedData.tender_id,
        updatedData.tender_name,
        updatedData.tender_portal,
        updatedData.tia,
        updatedData.remark,
        updatedData.start_date,
        updatedData.end_date,
        updatedData.tender_documents,
        updatedData.status,  // Include status here
        projectId
    ], (err) => {
        if (err) {
            console.log('Error updating project details:', err);
            return res.status(500).json({ error: 'Error updating project details', message: err.message });
        }

        // Handle roles update (as you have in your existing code)
        const deleteRolesQuery = 'DELETE FROM roles_assigned WHERE project_id = ?;';
        db.query(deleteRolesQuery, [projectId], (err) => {
            if (err) {
                console.log('Error deleting previous roles:', err);
                return res.status(500).json({ error: 'Error deleting previous roles', message: err.message });
            }

            // Insert new roles for each employee
            if (Array.isArray(rolesToUpdate) && rolesToUpdate.length > 0) {
                const insertRoleQuery = `
                    INSERT INTO roles_assigned (project_id, employee_id, role, employee_name)
                    VALUES (?, ?, ?, ?);
                `;
                const roleInsertPromises = rolesToUpdate.map(role => {
                    return new Promise((resolve, reject) => {
                        db.query(insertRoleQuery, [projectId, role.employeeId, role.role, role.employeeName], (err) => {
                            if (err) {
                                console.log('Error inserting role for employee:', role.employeeId, err);
                                return reject(err);
                            }
                            resolve();
                        });
                    });
                });

                // Wait for all role insertions to complete
                Promise.all(roleInsertPromises)
                    .then(() => {
                        res.json({ message: 'Project and roles updated successfully' });
                    })
                    .catch((err) => {
                        console.log('Error inserting roles:', err);
                        res.status(500).json({ error: 'Error inserting new roles', message: err.message });
                    });
            } else {
                res.status(400).json({ error: 'No roles provided for update' });
            }
        });
    });
});

// number of employee count
// Fetch the number of employees assigned to a specific project
app.get('/api/projects/:projectId/employee-count', (req, res) => {
    const { projectId } = req.params;

    // Query to count the number of employees assigned to the project
    const query = `
        SELECT COUNT(*) AS employeeCount
        FROM roles_assigned
        WHERE project_id = ?;
    `;

    db.query(query, [projectId], (err, results) => {
        if (err) {
            return res.status(500).json({ error: 'Database error', message: err.message });
        }

        // Check if we got results
        if (results.length > 0) {
            const employeeCount = results[0].employeeCount;
            return res.json({ employeeCount });
        } else {
            return res.status(404).json({ error: 'Project not found or no employees assigned' });
        }
    });
});

// Delete a project
app.delete('/api/projects/:id', (req, res) => {
    const { id } = req.params;
    db.query('DELETE FROM Adminprojects WHERE id = ?', [id], (err) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: 'Project deleted successfully.' });
    });
});

// Start the server
const PORT = process.env.PORT || 2000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
