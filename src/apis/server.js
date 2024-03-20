const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const fs = require('fs');
const app = express();
const port = 3001; // 确保此端口不与其他服务冲突
const path = require('path');
// const uuidv4 = require("uuidv4");
const { v4: uuidv4 } = require('uuid');
const filePath = path.join(__dirname, '..', 'data', 'account.json');
const dify_keys = path.join(__dirname, '..', 'data', 'dify_keys.json');
const studentChatPath =path.join(__dirname, '..', 'data', 'studentChat.json');
const promptPath =path.join(__dirname, '..', 'data', 'prompt.json');


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

// 更新dify_keys数据
app.post('/updateKeysData', (req, res) => {
    const { originalName, newName, newValue } = req.body;
    // const filePath = path.join(__dirname, 'data.json');
    // 先读取现有的文件内容
    fs.readFile(dify_keys, 'utf8', (err, data) => {
        if (err) {
            console.error(err);
            res.status(500).send('Error reading from file');
            return;
        }

        const jsonData = JSON.parse(data);
        // 如果原始名称和新名称不同，且新名称不为空，则处理键的修改
        if (originalName !== newName && newName.trim() !== "") {
            delete jsonData[originalName]; // 删除旧键
            jsonData[newName] = newValue; // 添加新键
        } else {
            // 如果名称未改变，只更新值
            jsonData[originalName] = newValue;
        }

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
// 删除dify_keys数据
app.post('/deleteKeyData', (req, res) => {
    const { name } = req.body;
    // 读取现有数据
    fs.readFile(dify_keys, 'utf8', (err, data) => {
        if (err) {
            console.error(err);
            res.status(500).send('Error reading from file');
            return;
        }
        const jsonData = JSON.parse(data);
        // 检查要删除的键是否存在
        if (jsonData.hasOwnProperty(name)) {
            // 删除键
            delete jsonData[name];
            // 将更新后的数据写回文件
            fs.writeFile(dify_keys, JSON.stringify(jsonData, null, 2), 'utf8', (err) => {
                if (err) {
                    console.error(err);
                    res.status(500).send('Error writing to file');
                    return;
                }
                res.send('Data deleted successfully');
            });
        } else {
            res.status(404).send('Key not found');
        }
    });
});
// 添加dify_keys数据
app.post('/addApplication', (req, res) => {
    const { name, api } = req.body;
    // 读取现有数据
    fs.readFile(dify_keys, 'utf8', (err, data) => {
        if (err) {
            console.error(err);
            res.status(500).send('Error reading from file');
            return;
        }

        const jsonData = JSON.parse(data);
        // 检查要添加的键是否已存在
        if (jsonData.hasOwnProperty(name)) {
            res.status(400).send('Application already exists');
            return;
        }
        // 添加新的应用信息
        jsonData[name] = api;

        // 将更新后的数据写回文件
        fs.writeFile(dify_keys, JSON.stringify(jsonData, null, 2), 'utf8', (err) => {
            if (err) {
                console.error(err);
                res.status(500).send('Error writing to file');
                return;
            }
            res.send('Application added successfully');
        });
    });
});
// 获取studentChat数据
app.get('/getStudentChat', (req, res) => {
    fs.readFile(studentChatPath, 'utf8', (err, data) => {
        if (err) {
            res.status(500).send('Error reading data file');
            return;
        }
        res.json(JSON.parse(data));
    });
});
//编辑studentChat数据
app.post('/editChat', (req, res) => {
    const { id, newName, newIcon, newFolderName } = req.body;
    fs.readFile(studentChatPath, 'utf8', (err, data) => {
        if (err) {
            res.status(500).send('Error reading data file');
            return;
        }
        const studentChatData = JSON.parse(data);
        const chatIndex = studentChatData.Chats.findIndex(chat => chat.id === id);
        if (chatIndex === -1) {
            res.status(404).send('Chat not found');
            return;
        }
        // 查找新文件夹的ID
        const newFolder = studentChatData.Folders.find(folder => folder.name === newFolderName);
        if (!newFolder) {
            res.status(404).send('Folder not found');
            return;
        }
        // 更新聊天项数据
        studentChatData.Chats[chatIndex] = {
            ...studentChatData.Chats[chatIndex],
            id: uuidv4(), // 生成新的UUID
            name: newName,
            icon: newIcon,
            folderId: newFolder.id
        };
        fs.writeFile(studentChatPath, JSON.stringify(studentChatData, null, 2), 'utf8', (err) => {
            if (err) {
                res.status(500).send('Error writing to file');
                return;
            }
            res.send('Chat updated successfully');
        });
    });
});

app.delete('/deleteChat/:id', (req, res) => {
    const { id } = req.params;
    fs.readFile(studentChatPath, 'utf8', (err, data) => {
        if (err) {
            console.error(err);
            res.status(500).send('Error reading data file');
            return;
        }
        let studentChatData = JSON.parse(data);
        const chatIndex = studentChatData.Chats.findIndex(chat => chat.id === id);
        if (chatIndex === -1) {
            res.status(404).send('Chat not found');
            return;
        }
        // 删除指定的聊天记录
        studentChatData.Chats.splice(chatIndex, 1);
        fs.writeFile(studentChatPath, JSON.stringify(studentChatData, null, 2), 'utf8', (err) => {
            if (err) {
                console.error(err);
                res.status(500).send('Error writing to file');
                return;
            }
            res.send('Chat deleted successfully');
        });
    });
});

app.post('/addChat', (req, res) => {
    const { name, icon, folderId } = req.body; // 假设请求体中已包含所有必要的聊天记录信息，包括API字段
    fs.readFile(studentChatPath, 'utf8', (err, data) => {
        if (err) {
            console.error(err);
            res.status(500).send('Error reading data file');
            return;
        }
        let studentChatData = JSON.parse(data);
        const newChat = {
            id: uuidv4(), // 自动生成UUID
            name,
            icon,
            folderId
        };
        studentChatData.Chats.push(newChat); // 将新聊天记录添加到数组中

        fs.writeFile(studentChatPath, JSON.stringify(studentChatData, null, 2), 'utf8', (err) => {
            if (err) {
                console.error(err);
                res.status(500).send('Error writing to file');
                return;
            }
            res.send('Chat added successfully');
        });
    });
});

app.get('/getPrompts', (req, res) => {
    fs.readFile( promptPath, 'utf8', (err, data) => {
        if (err) {
            console.error('Error reading file:', err);
            res.status(500).send('Error reading prompt file');
            return;
        }
        res.json(JSON.parse(data));
    });
});



app.listen(port, () => {
    console.log(`Server listening at http://localhost:${port}`);
});
app.use(cors({
    origin: 'http://localhost:3000' // 只允许来自此源的请求
}));