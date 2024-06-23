const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const app = express();
const cors = require('cors');
const PORT = process.env.PORT || 3000;

// 使用CORS中间件  
app.use(cors()); // 允许所有源  
// 或者，你可以指定允许的源  
// app.use(cors({  
//   origin: 'http://192.168.5.16:8091', // 只允许来自http://192.168.5.16:8091的请求  
//   methods: ['GET', 'PUT'], // 只允许GET和PUT请求  
//   allowedHeaders: ['Content-Type', 'Authorization'], // 允许请求头中的字段  
// }));  

// 连接到SQLite数据库（假设已存在名为'user_profiles.db'的数据库文件）  
const db = new sqlite3.Database('./user_profiles.db', (err) => {
    if (err) {
        return console.error(err.message);
    }
    console.log('Connected to the SQLite database.');
    // 创建一个profiles表（如果它还不存在）  
    db.run(`  
    CREATE TABLE IF NOT EXISTS profiles (  
      id INTEGER PRIMARY KEY AUTOINCREMENT,  
      username TEXT NOT NULL,  
      age INTEGER,  
      email TEXT NOT NULL UNIQUE,  
      phone TEXT  
    )  
  `, (err) => {
        if (err) {
            return console.error(err.message);
        }
        console.log('profiles table created or already exists.');
    });
});

// 中间件设置  
app.use(express.json());

// 添加新用户  
app.post('/profile', (req, res) => {
    const { username, age, email, phone } = req.body;

    // 检查必要字段是否已提供  
    if (!username || !email) {
        return res.status(400).json({ error: 'Username and email are required.' });
    }

    // 插入新用户到profiles表  
    db.run(`INSERT INTO profiles (username, age, email, phone) VALUES (?, ?, ?, ?)`,
        [username, age, email, phone], (err) => {
            if (err) {
                // 可能存在重复邮箱等错误，你可以检查err.code来获取更多信息  
                return res.status(500).json({ error: 'Failed to create user.' });
            }
            res.json({ message: 'User created successfully.' });
        });
});

// 获取用户Profile  
app.get('/profile', (req, res) => {
    db.get('SELECT * FROM profiles WHERE id = ?', [1], (err, row) => {
        if (err) {
            return console.error(err.message);
        }
        res.json(row);
    });
});

// 更新用户Profile  
app.put('/profile', (req, res) => {
    const { username, age, email, phone } = req.body;
    db.run(`UPDATE profiles SET username = ?, age = ?, email = ?, phone = ? WHERE id = ?`,
        [username, age, email, phone, 1], (err) => {
            if (err) {
                return console.error(err.message);
            }
            res.send('Profile updated successfully.');
        });
});

// 启动服务器  
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}.`);
});