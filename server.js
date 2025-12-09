const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');
const mysql = require('mysql2/promise');

const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

// Global DB Connection (Simple session-like behavior for single user)
let dbConnection = null;
let currentDbConfig = null;

// Routes

// 1. Connect
app.post('/api/connect', async (req, res) => {
    const { host, user, password, database } = req.body;
    try {
        if (dbConnection) {
            await dbConnection.end(); // Close previous connection
        }
        dbConnection = await mysql.createConnection({
            host, user, password, database
        });
        currentDbConfig = { host, user, database };
        res.json({ success: true, message: 'Connected successfully' });
    } catch (error) {
        console.error("Connection failed:", error);
        res.status(401).json({ success: false, message: error.message });
    }
});

// Middleware to check connection
const requireDb = (req, res, next) => {
    if (!dbConnection) {
        return res.status(401).json({ success: false, message: 'Not connected to database. Please login.' });
    }
    next();
};

// 2. Dashboard Stats
app.get('/api/stats', requireDb, async (req, res) => {
    try {
        // Table count
        const [tables] = await dbConnection.query('SHOW TABLES');
        const tableCount = tables.length;

        // DB Size & Table Average
        const [sizeResult] = await dbConnection.query(`
            SELECT 
                SUM(data_length + index_length) / 1024 / 1024 AS totalSizeMB,
                AVG(data_length + index_length) / 1024 / 1024 AS avgTableSizeMB
            FROM information_schema.TABLES 
            WHERE table_schema = ?
        `, [currentDbConfig.database]);

        // Get individual table sizes for chart
        const [tablesSizes] = await dbConnection.query(`
            SELECT 
                table_name as name,
                (data_length + index_length) / 1024 / 1024 AS size
            FROM information_schema.TABLES 
            WHERE table_schema = ?
            ORDER BY size DESC
            LIMIT 10
        `, [currentDbConfig.database]);

        // Indexes Count
        let indexCount = 0;
        // This can be slow for many tables, but sticking to simple query for now.
        // A better way is querying information_schema.STATISTICS
        const [indexResult] = await dbConnection.query(`
            SELECT COUNT(*) as count 
            FROM information_schema.STATISTICS 
            WHERE table_schema = ?
        `, [currentDbConfig.database]);
        indexCount = indexResult[0].count;

        // Primary/Foreign Keys
        // Count from information_schema.KEY_COLUMN_USAGE
        const [keysResult] = await dbConnection.query(`
            SELECT 
                SUM(CASE WHEN CONSTRAINT_NAME = 'PRIMARY' THEN 1 ELSE 0 END) as pkCount,
                SUM(CASE WHEN REFERENCED_TABLE_NAME IS NOT NULL THEN 1 ELSE 0 END) as fkCount
            FROM information_schema.KEY_COLUMN_USAGE
            WHERE table_schema = ?
        `, [currentDbConfig.database]);

        res.json({
            success: true,
            stats: {
                tableCount,
                totalSizeMB: parseFloat(sizeResult[0].totalSizeMB || 0).toFixed(2),
                avgTableSizeMB: parseFloat(sizeResult[0].avgTableSizeMB || 0).toFixed(2),
                indexCount,
                pkCount: keysResult[0].pkCount || 0,
                fkCount: keysResult[0].fkCount || 0,
                dbName: currentDbConfig.database,
                user: currentDbConfig.user,
                elementSizes: tablesSizes // sending as elementSizes to match logic
            }
        });

    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// 3. List Tables
app.get('/api/tables', requireDb, async (req, res) => {
    try {
        const [rows] = await dbConnection.query('SHOW TABLES');
        // Robust way to get the first value regardless of the key name (which depends on DB name)
        const tables = rows.map(row => Object.values(row)[0]);
        res.json({ success: true, tables });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// 4. Table Schema
app.get('/api/tables/:name/schema', requireDb, async (req, res) => {
    try {
        const tableName = req.params.name;
        const [columns] = await dbConnection.query(`SHOW FULL COLUMNS FROM \`${tableName}\``);
        // Also get indexes
        const [indexes] = await dbConnection.query(`SHOW INDEX FROM \`${tableName}\``);

        res.json({ success: true, columns, indexes });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// 5. Table Content
app.get('/api/tables/:name/content', requireDb, async (req, res) => {
    try {
        const tableName = req.params.name;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 50;
        const offset = (page - 1) * limit;
        const sortCol = req.query.sort;
        const sortDir = req.query.dir === 'desc' ? 'DESC' : 'ASC';

        let query = `SELECT * FROM \`${tableName}\``;
        if (sortCol) {
            // Very basic SQL injection prevention (whitelist or escaping) needed
            // For now, escaping provided by driver for values, but identifier needs backticks.
            // Ideally we check if sortCol exists in columns. Skipping for brevity but note it.
            query += ` ORDER BY \`${sortCol}\` ${sortDir}`;
        }
        query += ` LIMIT ? OFFSET ?`;

        const [rows] = await dbConnection.query(query, [limit, offset]);

        // Count total for pagination
        const [countResult] = await dbConnection.query(`SELECT COUNT(*) as total FROM \`${tableName}\``);

        res.json({
            success: true,
            data: rows,
            total: countResult[0].total,
            page,
            totalPages: Math.ceil(countResult[0].total / limit)
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// 6. SQL Query
app.post('/api/query', requireDb, async (req, res) => {
    try {
        const sql = req.body.query;
        // Simple basic check to determine type, but executing it will give the real answer
        const [result, fields] = await dbConnection.query(sql);

        let meta = {};
        if (fields) {
            meta = {
                columns: fields.map(f => f.name)
            };
        }

        res.json({
            success: true,
            data: result,
            meta,
            message: Array.isArray(result) ? `${result.length} rows returned` : `Query OK, ${result.affectedRows} rows affected.`
        });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
});


app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
