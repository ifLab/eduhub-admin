const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const fs = require('fs');
const app = express();
const port = 3001; // 确保此端口不与其他服务冲突
const path = require('path');
// const uuidv4 = require("uuidv4");
const { v4: uuidv4 } = require('uuid');
const {message} = require("antd");
const filePath = path.join(__dirname, '..', 'data', 'account.json');
const dify_keys = path.join(__dirname, '..', 'data', 'dify_keys.json');
const studentChatPath =path.join(__dirname, '..', 'data', 'studentChat.json');
const teacherChatPath =path.join(__dirname, '..', 'data', 'teacherChat.json');
const promptPath =path.join(__dirname, '..', 'data', 'prompt.json');
const helpPath =path.join(__dirname, '..', 'data', 'help.json');
const lookPath =path.join(__dirname, '..', 'data', 'looks.json');


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
app.post('/editChatName', (req, res) => {
    const { originalName, newName } = req.body;
    fs.readFile(studentChatPath, 'utf8', (err, data) => {
        if (err) {
            console.error(err);
            res.status(500).send('Error reading studentChat.json');
            return;
        }

        let studentChatData = JSON.parse(data);
        let updated = false;

        // 更新所有名称匹配的聊天
        studentChatData.Chats.forEach(chat => {
            if (chat.name === originalName) {
                chat.name = newName;
                updated = true;
            }
        });

        if (!updated) {
            res.send('No chat found with the original name, no update needed.');
            return;
        }
        fs.writeFile(studentChatPath, JSON.stringify(studentChatData, null, 2), 'utf8', (err) => {
            if (err) {
                console.error(err);
                res.status(500).send('Error writing to studentChat.json');
                return;
            }
            res.send('studentChat.json updated successfully');
        });
    });
});
app.post('/deleteKeyData', (req, res) => {
    const { name } = req.body;

    fs.readFile(studentChatPath, 'utf8', (err, data) => {
        if (err) {
            console.error(err);
            res.status(500).send('Error reading studentChat.json');
            return;
        }

        const studentChatData = JSON.parse(data);
        const chatExists = studentChatData.Chats.some(chat => chat.name === name);

        if (chatExists) {
            res.status(400).send('删除失败,该应用已存在');
            return;
        }
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
                        // console.error(err);
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
    // 读取现有数据

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

app.get('/getTeacherChat', (req, res) => {
    fs.readFile(teacherChatPath, 'utf8', (err, data) => {
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

app.post('/editChatTeacher', (req, res) => {
    const { id, newName, newIcon, newFolderName } = req.body;
    fs.readFile(teacherChatPath, 'utf8', (err, data) => {
        if (err) {
            res.status(500).send('Error reading data file');
            return;
        }
        const teacherChatData = JSON.parse(data);
        const chatIndex = teacherChatData.Chats.findIndex(chat => chat.id === id);
        if (chatIndex === -1) {
            res.status(404).send('Chat not found');
            return;
        }
        // 查找新文件夹的ID
        const newFolder = teacherChatData.Folders.find(folder => folder.name === newFolderName);
        if (!newFolder) {
            res.status(404).send('Folder not found');
            return;
        }
        // 更新聊天项数据
        teacherChatData.Chats[chatIndex] = {
            ...teacherChatData.Chats[chatIndex],
            id: uuidv4(), // 生成新的UUID
            name: newName,
            icon: newIcon,
            folderId: newFolder.id
        };
        fs.writeFile(teacherChatPath, JSON.stringify(teacherChatData, null, 2), 'utf8', (err) => {
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

app.delete('/deleteChatTeacher/:id', (req, res) => {
    const { id } = req.params;
    fs.readFile(teacherChatPath, 'utf8', (err, data) => {
        if (err) {
            console.error(err);
            res.status(500).send('Error reading data file');
            return;
        }
        let teacherChatData = JSON.parse(data);
        const chatIndex = teacherChatData.Chats.findIndex(chat => chat.id === id);
        if (chatIndex === -1) {
            res.status(404).send('Chat not found');
            return;
        }
        // 删除指定的聊天记录
        teacherChatData.Chats.splice(chatIndex, 1);
        fs.writeFile(teacherChatPath, JSON.stringify(teacherChatData, null, 2), 'utf8', (err) => {
            if (err) {
                console.error(err);
                res.status(500).send('Error writing to file');
                return;
            }
            res.send('Chat deleted successfully');
        });
    });
});

app.get('/getAppNames', (req, res) => {
    fs.readFile(dify_keys, 'utf8', (err, data) => {
        if (err) {
            console.error(err);
            res.status(500).send('Error reading dify_keys.json');
            return;
        }
        try {
            const jsonData = JSON.parse(data);
            const appNames = Object.keys(jsonData); // 获取所有键（应用名称）作为数组
            res.json(appNames); // 发送应用名称数组作为响应
        } catch (parseError) {
            console.error(parseError);
            res.status(500).send('Error parsing dify_keys.json');
        }
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

app.post('/addChatTeacher', (req, res) => {
    const { name, icon, folderId } = req.body; // 假设请求体中已包含所有必要的聊天记录信息，包括API字段
    fs.readFile(teacherChatPath, 'utf8', (err, data) => {
        if (err) {
            console.error(err);
            res.status(500).send('Error reading data file');
            return;
        }
        let teacherChatData = JSON.parse(data);
        const newChat = {
            id: uuidv4(), // 自动生成UUID
            name,
            icon,
            folderId
        };
        teacherChatData.Chats.push(newChat); // 将新聊天记录添加到数组中

        fs.writeFile(teacherChatPath, JSON.stringify(teacherChatData, null, 2), 'utf8', (err) => {
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

app.post('/addFolder', (req, res) => {
    const { name, type, deletable } = req.body;

    // 简单的验证
    if (!name || !type) {
        return res.status(400).send('Name and type are required');
    }

    // 读取现有的JSON文件
    fs.readFile(studentChatPath, (err, data) => {
        if (err) {
            console.error('Failed to read JSON file:', err);
            return res.status(500).send('Failed to read data');
        }

        // 解析JSON数据
        const json = JSON.parse(data.toString());
        const newFolder = {
            id: uuidv4(), // 生成唯一ID
            name,
            type,
            deletable: !!deletable,
        };

        // 添加新文件夹到Folders数组
        json.Folders.push(newFolder);

        // 将更新后的数据写回JSON文件
        fs.writeFile(studentChatPath, JSON.stringify(json, null, 2), (err) => {
            if (err) {
                console.error('Failed to write JSON file:', err);
                return res.status(500).send('Failed to save data');
            }

            res.status(201).json(newFolder);
        });
    });
});

app.post('/addFolderTeacher', (req, res) => {
    const { name, type, deletable } = req.body;

    // 简单的验证
    if (!name || !type) {
        return res.status(400).send('Name and type are required');
    }

    // 读取现有的JSON文件
    fs.readFile(teacherChatPath, (err, data) => {
        if (err) {
            console.error('Failed to read JSON file:', err);
            return res.status(500).send('Failed to read data');
        }

        // 解析JSON数据
        const json = JSON.parse(data.toString());
        const newFolder = {
            id: uuidv4(), // 生成唯一ID
            name,
            type,
            deletable: !!deletable,
        };

        // 添加新文件夹到Folders数组
        json.Folders.push(newFolder);

        // 将更新后的数据写回JSON文件
        fs.writeFile(teacherChatPath, JSON.stringify(json, null, 2), (err) => {
            if (err) {
                console.error('Failed to write JSON file:', err);
                return res.status(500).send('Failed to save data');
            }

            res.status(201).json(newFolder);
        });
    });
});


app.put('/editFolder/:id', (req, res) => {
    const { id } = req.params;
    const updatedFolder = req.body;

    fs.readFile(studentChatPath, (err, data) => {
        if (err) {
            res.status(500).send('Error reading JSON file');
            return;
        }

        const json = JSON.parse(data);
        const folders = json.Folders;
        const folderIndex = folders.findIndex(folder => folder.id === id);

        if (folderIndex === -1) {
            res.status(404).send('Folder not found');
            return;
        }

        // 更新文件夹信息
        folders[folderIndex] = { ...folders[folderIndex], ...updatedFolder };

        fs.writeFile(studentChatPath, JSON.stringify(json, null, 2), (err) => {
            if (err) {
                res.status(500).send('Error writing JSON file');
                return;
            }

            res.json(folders[folderIndex]);
        });
    });
});


app.put('/editFolderTeacher/:id', (req, res) => {
    const { id } = req.params;
    const updatedFolder = req.body;

    fs.readFile(teacherChatPath, (err, data) => {
        if (err) {
            res.status(500).send('Error reading JSON file');
            return;
        }

        const json = JSON.parse(data);
        const folders = json.Folders;
        const folderIndex = folders.findIndex(folder => folder.id === id);

        if (folderIndex === -1) {
            res.status(404).send('Folder not found');
            return;
        }

        // 更新文件夹信息
        folders[folderIndex] = { ...folders[folderIndex], ...updatedFolder };

        fs.writeFile(teacherChatPath, JSON.stringify(json, null, 2), (err) => {
            if (err) {
                res.status(500).send('Error writing JSON file');
                return;
            }

            res.json(folders[folderIndex]);
        });
    });
});

app.delete('/deleteFolder/:id', (req, res) => {
    const { id } = req.params;

    fs.readFile(studentChatPath, (err, data) => {
        if (err) {
            res.status(500).send('Error reading JSON file');
            return;
        }

        const json = JSON.parse(data);
        const folders = json.Folders;
        const chats = json.Chats;

        // 检查是否有属于该文件夹的聊天
        const hasChats = chats.some(chat => chat.folderId === id);
        if (hasChats) {
            res.status(400).send('Cannot delete folder because it contains chats');
            return;
        }

        // 删除文件夹
        const updatedFolders = folders.filter(folder => folder.id !== id);
        json.Folders = updatedFolders;

        fs.writeFile(studentChatPath, JSON.stringify(json, null, 2), (err) => {
            if (err) {
                res.status(500).send('Error writing JSON file');
                return;
            }

            res.send('Folder deleted successfully');
        });
    });
});

app.delete('/deleteFolderTeacher/:id', (req, res) => {
    const { id } = req.params;

    fs.readFile(teacherChatPath, (err, data) => {
        if (err) {
            res.status(500).send('Error reading JSON file');
            return;
        }

        const json = JSON.parse(data);
        const folders = json.Folders;
        const chats = json.Chats;

        // 检查是否有属于该文件夹的聊天
        const hasChats = chats.some(chat => chat.folderId === id);
        if (hasChats) {
            res.status(400).send('Cannot delete folder because it contains chats');
            return;
        }

        // 删除文件夹
        const updatedFolders = folders.filter(folder => folder.id !== id);
        json.Folders = updatedFolders;

        fs.writeFile(teacherChatPath, JSON.stringify(json, null, 2), (err) => {
            if (err) {
                res.status(500).send('Error writing JSON file');
                return;
            }

            res.send('Folder deleted successfully');
        });
    });
});


app.post('/updateFoldersOrder', (req, res) => {
    const { Folders } = req.body;
    fs.readFile(studentChatPath, 'utf8', (err, data) => {
        if (err) {
            console.error('Error reading file:', err);
            return res.status(500).json({ error: 'An error occurred while reading the file.' });
        }

        const jsonData = JSON.parse(data);
        jsonData.Folders = Folders;

        fs.writeFile(studentChatPath, JSON.stringify(jsonData, null, 2), 'utf8', (err) => {
            if (err) {
                console.error('Error writing file:', err);
                return res.status(500).json({ error: 'An error occurred while writing to the file.' });
            }
            res.status(200).json({ message: 'File updated successfully' });
        });
    });
});

app.post('/updateFoldersOrderTeacher', (req, res) => {
    const { Folders } = req.body;
    fs.readFile(teacherChatPath, 'utf8', (err, data) => {
        if (err) {
            console.error('Error reading file:', err);
            return res.status(500).json({ error: 'An error occurred while reading the file.' });
        }

        const jsonData = JSON.parse(data);
        jsonData.Folders = Folders;

        fs.writeFile(teacherChatPath, JSON.stringify(jsonData, null, 2), 'utf8', (err) => {
            if (err) {
                console.error('Error writing file:', err);
                return res.status(500).json({ error: 'An error occurred while writing to the file.' });
            }
            res.status(200).json({ message: 'File updated successfully' });
        });
    });
});


app.put('/updatePrompt/:id', (req, res) => {
    const { id } = req.params;
    const updatedPrompt = req.body;

    fs.readFile(promptPath, (err, data) => {
        if (err) {
            res.status(500).send('Error reading data file');
            return;
        }

        let jsonData = JSON.parse(data);
        let prompts = jsonData.defaultPrompts;
        const promptIndex = prompts.findIndex(prompt => prompt.id === id);

        if (promptIndex === -1) {
            res.status(404).send('Prompt not found');
            return;
        }

        prompts[promptIndex] = { ...prompts[promptIndex], ...updatedPrompt };
        jsonData.defaultPrompts = prompts;

        fs.writeFile(promptPath, JSON.stringify(jsonData, null, 2), (err) => {
            if (err) {
                res.status(500).send('Error writing data file');
                return;
            }
            res.json(prompts[promptIndex]);
        });
    });
});

app.delete('/deletePrompt/:id', (req, res) => {
    const { id } = req.params;

    fs.readFile(promptPath, (err, data) => {
        if (err) {
            res.status(500).send('Error reading data file');
            return;
        }

        let jsonData = JSON.parse(data);
        const prompts = jsonData.defaultPrompts;
        const filteredPrompts = prompts.filter(prompt => prompt.id !== id);

        if (prompts.length === filteredPrompts.length) {
            res.status(404).send('Prompt not found');
            return;
        }

        jsonData.defaultPrompts = filteredPrompts;

        fs.writeFile(promptPath, JSON.stringify(jsonData, null, 2), (err) => {
            if (err) {
                res.status(500).send('Error writing data file');
                return;
            }
            res.send('Prompt deleted successfully');
        });
    });
});

app.post('/addPrompt', (req, res) => {
    const newPrompt = req.body;
    // 生成一个简单的UUID，实际应用中可能需要更复杂的生成逻辑
    newPrompt.id = uuidv4();

    fs.readFile(promptPath, (err, data) => {
        if (err) {
            res.status(500).send('Error reading data file');
            return;
        }

        const jsonData = JSON.parse(data);
        jsonData.defaultPrompts.push(newPrompt);

        fs.writeFile(promptPath, JSON.stringify(jsonData, null, 2), (err) => {
            if (err) {
                res.status(500).send('Error writing data file');
                return;
            }
            res.json(newPrompt);
        });
    });
});

app.post('/updatePromptsOrder', (req, res) => {
    const updatedData = req.body;

    fs.readFile(promptPath, (err, data) => {
        if (err) {
            console.error('Failed to read file:', err);
            return res.status(500).send('Failed to read file');
        }

        const jsonData = JSON.parse(data);
        jsonData.defaultPrompts = updatedData.defaultPrompts; // 更新数据

        fs.writeFile(promptPath, JSON.stringify(jsonData, null, 2), (err) => {
            if (err) {
                console.error('Failed to write file:', err);
                return res.status(500).send('Failed to write file');
            }

            res.send({ message: 'Prompts order updated successfully' });
        });
    });
});








app.post('/updateHelpData', (req, res) => {
    const newData = req.body;
    fs.writeFileSync(helpPath, JSON.stringify(newData, null, 2));
    res.send('Data updated successfully');
});
app.get('/helpData', (req, res) => {
    const helpData = JSON.parse(fs.readFileSync(helpPath));
    res.json(helpData);
});
app.post(helpPath, (req, res) => {
    const newData = req.body;

    // 将新数据写入到JSON文件中
    fs.writeFile('helpPath', JSON.stringify(newData, null, 2), (err) => {
        if (err) {
            console.error(err);
            res.status(500).send('Error updating data: ' + err.message); // 将错误信息返回给前端
        } else {
            console.log('Data updated successfully');
            res.send('Data updated successfully');
        }
    });
});

app.get('/getAppearanceData', (req, res) => {
    const data = JSON.parse(fs.readFileSync(lookPath));
    res.json(data);
});

app.post('/saveAppearanceData', (req, res) => {
    const newData = req.body;
    fs.writeFile(lookPath, JSON.stringify(newData), (err) => {
        if (err) {
            console.error('保存外观数据失败:', err);
            res.status(500).send('保存失败');
        } else {
            res.json(newData);
        }
    });
});
app.listen(port, () => {
    console.log(`Server listening at http://localhost:${port}`);
});
app.use(cors({
    origin: 'http://localhost:3000' // 只允许来自此源的请求
}));