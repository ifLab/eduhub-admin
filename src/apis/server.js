const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const fs = require('fs');
const app = express();
const port = 3001; // 确保此端口不与其他服务冲突
const path = require('path');
const filePath = path.join(__dirname, '..', 'store', 'account.json');


//后端
app.use(cors());
app.use(bodyParser.json());

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

app.listen(port, () => {
    console.log(`Server listening at http://localhost:${port}`);
});
app.use(cors({
    origin: 'http://localhost:3000' // 只允许来自此源的请求
}));