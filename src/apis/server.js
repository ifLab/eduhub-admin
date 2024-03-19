const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const fs = require('fs');
const app = express();
const port = 3001; // 确保此端口不与其他服务冲突
const path = require('path');
const filePath = path.join(__dirname, '..', 'data', 'account.json');
const dify_keys = path.join(__dirname, '..', 'data', 'dify_keys.json');



//后端
app.use(cors());
app.use(bodyParser.json());

// 登录接口
app.post('/login', (req, res) => {
    console.log("登录请求")
    console.log(req.body);
    const { username, password } = req.body;
    const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    const user = data.users.find(u => u.username === username && u.password === password);
    console.log("@@@@@@@@@@@@@@@@@")

    if (user) {
        res.json({ success: true, message: '登录成功' });
    } else {
        res.status(401).json({ success: false, message: '用户名或密码错误' });
    }
});

// 获取dify_keys数据
app.get('/getDify_keys', (req, res) => {
    fs.readFile(dify_keys, 'utf8', (err, data) => {
        if (err) {
            res.status(500).send('Error reading data file');
            return;
        }
        res.json(JSON.parse(data));
        console.log("res.json",res.json)
    });
});

app.post('/updateKeysData', (req, res) => {
    const updateData = req.body; // 前端传来的更新数据
    // const filePath = path.join(__dirname, 'data.json');
    // 先读取现有的文件内容
    fs.readFile(dify_keys, 'utf8', (err, data) => {
        if (err) {
            console.error(err);
            res.status(500).send('Error reading from file');
            return;
        }

        // 解析文件内容为JSON对象
        const jsonData = JSON.parse(data);
        // 更新数据
        Object.keys(updateData).forEach(key => {
            jsonData[key] = updateData[key];
        });

        // 将更新后的数据写回文件
        fs.writeFile(dify_keys, JSON.stringify(jsonData, null, 2), 'utf8', (err) => {
            if (err) {
                console.error(err);
                res.status(500).send('Error writing to file');
                return;
            }
            res.send('Data updated successfully');
        });
    });
});



app.listen(port, () => {
    console.log(`Server listening at http://localhost:${port}`);
});
app.use(cors({
    origin: 'http://localhost:3000' // 只允许来自此源的请求
}));