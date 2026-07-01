const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const db = require('./database');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(bodyParser.json({ limit: '50mb' })); // Increased limit for base64 images if needed
app.use(bodyParser.urlencoded({ extended: true, limit: '50mb' }));

// Static files for uploaded images
const UPLOADS_DIR = path.join(__dirname, 'uploads');
if (!fs.existsSync(UPLOADS_DIR)) {
    fs.mkdirSync(UPLOADS_DIR);
}
app.use('/uploads', express.static(UPLOADS_DIR));

// Multer setup for file uploads
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, UPLOADS_DIR);
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});
const upload = multer({ storage: storage }); // Accept any files

// API Routes

// GET /api/forms - Get all forms (summary)
app.get('/api/forms', (req, res) => {
    const sql = "SELECT id, fullName, email, dateSigned, submissionType, createdAt FROM release_forms ORDER BY createdAt DESC";
    db.all(sql, [], (err, rows) => {
        if (err) {
            res.status(400).json({ "error": err.message });
            return;
        }
        res.json({
            "message": "success",
            "data": rows
        });
    });
});

// GET /api/forms/:id - Get single form
app.get('/api/forms/:id', (req, res) => {
    const sql = "SELECT * FROM release_forms WHERE id = ?";
    db.get(sql, [req.params.id], (err, row) => {
        if (err) {
            res.status(400).json({ "error": err.message });
            return;
        }
        if (row) {
            // Parse the formData JSON string back to object
            const fullData = JSON.parse(row.formData);
            res.json({
                "message": "success",
                "data": fullData
            });
        } else {
            res.status(404).json({ "message": "Form not found" });
        }
    });
});

// POST /api/forms - Submit new form
app.post('/api/forms', upload.any(), (req, res) => {
    // If files are uploaded via Multer, they are in req.files
    // However, the frontend might be sending base64 strings or file URLs if we don't change the frontend logic significantly.
    // For this implementation, we'll assume the frontend sends the JSON body, and we might handle file uploads separately or 
    // if the frontend sends FormData with files.

    // Given the current frontend structure, it sends a JSON object. 
    // If we want to support file uploads properly, we should handle multipart/form-data.
    // But to minimize frontend changes, let's see what comes in.

    // If the request is multipart/form-data (which it should be for files), req.body will be populated by multer
    // but nested objects might be flattened or need parsing.

    let formData = req.body;

    // If we received files, we need to update the formData with the file paths
    if (req.files && req.files.length > 0) {
        req.files.forEach(file => {
            // Assuming the fieldname matches the key in formData
            // e.g. identificationFile
            const fileUrl = `${req.protocol}://${req.get('host')}/uploads/${file.filename}`;
            formData[`${file.fieldname}Url`] = fileUrl;
        });
    }

    // Generate ID if not present
    const id = formData.id || `form_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    formData.id = id;

    const { fullName, email, phone, dateSigned, submissionType } = formData;

    const sql = `INSERT INTO release_forms (id, fullName, email, phone, dateSigned, submissionType, formData) VALUES (?,?,?,?,?,?,?)`;
    const params = [id, fullName, email, phone, dateSigned, submissionType, JSON.stringify(formData)];

    db.run(sql, params, function (err) {
        if (err) {
            res.status(400).json({ "error": err.message });
            return;
        }

        // Check for marketing subscription
        if (formData.subscribeToMarketing && email) {
            const marketingSql = `INSERT OR IGNORE INTO marketing_list (name, email, source) VALUES (?,?,?)`;
            db.run(marketingSql, [fullName, email, 'Release Form'], (err) => {
                if (err) console.error("Error adding to marketing list:", err);
            });
        }

        res.json({
            "message": "success",
            "data": formData,
            "id": id
        });
    });
});

// POST /api/subscribe - Marketing subscription only
app.post('/api/subscribe', (req, res) => {
    const { name, email } = req.body;
    if (!email) {
        res.status(400).json({ "error": "Email is required" });
        return;
    }

    const sql = `INSERT OR IGNORE INTO marketing_list (name, email, source) VALUES (?,?,?)`;
    db.run(sql, [name, email, 'Website Signup'], function (err) {
        if (err) {
            res.status(400).json({ "error": err.message });
            return;
        }
        res.json({
            "message": "success",
            "id": this.lastID
        });
    });
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
