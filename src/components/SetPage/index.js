import React, { useState, useEffect } from 'react';
import {Table, Button, Modal, Form, Input, Select, message} from 'antd';
import { v4 as uuidv4 } from 'uuid';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';

const SetPage = () => {
    // const [folders, setFolders] = useState([]);
    const [folders, setFolders] = useState([]);
    const [chats, setChats] = useState([]);
    const [appNames, setAppNames] = useState([]);
    const [isFolderModalVisible, setIsFolderModalVisible] = useState(false);

    // const [isFolderModalVisible, setIsFolderModalVisible] = useState(false); // 控制模态框显示
    const [folderForm] = Form.useForm(); // Ant Design Form实例
    const [currentFolder, setCurrentFolder] = useState(null); // 当前正在编辑的文件夹，nu
    const fetchAppNames = () => {
        fetch('http://localhost:3001/getAppNames') // 假设这是获取应用名称列表的API
            .then(response => response.json())
            .then(data => {
                setAppNames(data); // 假设返回的数据是应用名称列表
            })
            .catch(error => console.error('Failed to fetch app names:', error));
    };
    // 假设 jsonData 是从文件、API 或其他方式获取的 JSON 数据

    //获取studentChat数据
    useEffect(() => {
        getData();
        fetchAppNames();
    }, []);

    const getData = () => {
        fetch('http://localhost:3001/getStudentChat')
            .then(response => response.json())
            .then(data => {
                console.log("data",data)
                setFolders(data.Folders);
                setChats(data.Chats);
            })
            .catch(error => console.error('Failed to fetch data:', error));
    }

    const showFolderModal = (folder) => {
        setCurrentFolder(folder); // 设置当前正在编辑的文件夹，如果是添加操作，则为null
        folderForm.setFieldsValue({
            name: folder ? folder.name : '', // 如果folder存在，则使用folder的name，否则默认为空字符串
            type: folder ? folder.type : 'chat', // 如果folder存在，则使用folder的type，否则默认为'chat'
            deletable: folder ? folder.deletable.toString() : 'false', // 如果folder存在，则使用folder的deletable，否则默认为false
        });
        setIsFolderModalVisible(true); // 显示模态框
    };

    const handleAddFolder = (folder) => {
        const folderWithCorrectDeletable = {
            ...folder,
            deletable: folder.deletable === 'true', // 将字符串转换为布尔值
        };
        fetch('http://localhost:3001/addFolder', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },

            body: JSON.stringify(folderWithCorrectDeletable),
        })
            .then(response => response.json())
            .then(data => {
                setIsFolderModalVisible(false);
                message.success("添加文件夹成功");
                getData(); // 重新获取数据以更新UI
            })
            .catch(error => {
                console.error('Failed to add folder:', error);
                message.error("添加文件夹失败");
            });
        // 从表单获取数据，然后发送API请求
        // 假设你有一个表单来收集文件夹的数据
    };

// 处理编辑文件夹
    const handleEditFolder = (id, folder) => {
        fetch(`http://localhost:3001/editFolder/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(folder),
        })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json();
            })
            .then(data => {
                setIsFolderModalVisible(false);
                message.success("文件夹更新成功");
                getData(); // 重新获取数据以更新UI
            })
            .catch(error => {
                console.error('Failed to edit folder:', error);
                message.error("更新文件夹失败");
            });
    };

// 处理删除文件夹
    const handleDeleteFolder = (folderId) => {
        Modal.confirm({
            title: '确定要删除这个文件夹吗？',
            content: '此操作不可撤销',
            onOk: () => {
                fetch(`http://localhost:3001/deleteFolder/${folderId}`, {
                    method: 'DELETE',
                })
                    .then(response => {
                        if (!response.ok) {
                            throw new Error('Network response was not ok');
                        }
                        return response.text();
                    })
                    .then(data => {
                        message.success("文件夹删除成功");
                        getData(); // 重新获取数据以更新UI
                    })
                    .catch(error => {
                        console.error('Failed to delete folder:', error);
                        message.error("删除文件夹失败");
                    });
            },
        });
    };

    const folderColumns = [
        {
            title: '名字',
            dataIndex: 'name',
            key: 'name',
        },
        {
            title: 'UUID',
            dataIndex: 'id',
            key: 'id',
        },
        {
            title: '类型',
            dataIndex: 'type',
            key: 'type',
        },
        {
            title: '是否能删除',
            dataIndex: 'deletable',
            key: 'deletable',
            render: deletable => (deletable ? '是' : '否'),
        },
        {
            title: '操作',
            key: 'action',
            render: (_, folder) => (
                <>
                    <Button onClick={() => showFolderModal(folder)} style={{ marginRight: 8 }}>编辑</Button>
                    <Button onClick={() => handleDeleteFolder(folder.id)} danger>删除</Button>
                </>
            ),
        }

    ];

    const reorder = (list, startIndex, endIndex) => {
        const result = Array.from(list);
        const [removed] = result.splice(startIndex, 1);
        result.splice(endIndex, 0, removed);
        return result;
    };

    const onDragEnd = (result) => {
        if (!result.destination) {
            return;
        }

        const items = reorder(
            folders,
            result.source.index,
            result.destination.index
        );

        setFolders(items);
        updateFoldersOnServer(items);
        // Here you would also call an API or perform an action to persist the order change
    };

    const updateFoldersOnServer = (folders) => {
        fetch('http://localhost:3001/updateFoldersOrder', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ Folders: folders }),
        })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json(); // 确保响应的内容类型是 application/json
            })
            .then(data => {
                message.success(data.message); // 使用服务器返回的消息
            })
            .catch(error => {
                console.error('Failed to update folder order:', error);
                message.error("更新文件夹顺序失败");
            });
    };
    const DraggableComponent = ({ children, className, style, ...restProps }) => {
        // We need to pass the index and draggableId which we can take from restProps['data-row-key']
        // const index = folders.findIndex((folder) => folder.id === restProps['data-row-key']);
        const index = (() => {
            for (let i = 0; i < folders.length; i++) {
                if (folders[i].id === restProps['data-row-key']) {
                    return i;
                }
            }
            return -1; // 如果没有找到匹配项，返回-1
        })();
        return (
            <Draggable draggableId={restProps['data-row-key']} index={index}>
                {(provided, snapshot) => (
                    <tr
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}
                        className={className}
                        style={{
                            ...style,
                            ...provided.draggableProps.style,
                            backgroundColor: snapshot.isDragging ? 'lightgreen' : 'white',
                        }}
                    >
                        {children}
                    </tr>
                )}
            </Draggable>
        );
    };

    return (
        <>
            <h2>文件夹</h2>
            <Button type="primary" onClick={() => showFolderModal(null)} style={{ marginBottom: 16, float: 'right' }}>
                新增文件夹
            </Button>
            <Table dataSource={folders} columns={folderColumns} rowKey="id"/>

            <DragDropContext onDragEnd={onDragEnd}>
                <Table
                    dataSource={folders}
                    columns={folderColumns}
                    rowKey="id"
                    pagination={false}
                    components={{
                        body: {
                            wrapper: DroppableComponent,
                            row: DraggableComponent,
                        },
                    }}
                />
            </DragDropContext>
            <Modal
                title={currentFolder ? "编辑文件夹" : "新增文件夹"}
                visible={isFolderModalVisible}
                onOk={() => {
                    folderForm
                        .validateFields()
                        .then(values => {
                            if (currentFolder) {
                                // 如果currentFolder存在，执行编辑文件夹的逻辑
                                handleEditFolder(currentFolder.id, values);
                            } else {
                                // 否则执行添加文件夹的逻辑
                                handleAddFolder(values);
                            }
                        })
                        .catch(info => {
                            console.log('Validate Failed:', info);
                        });
                }}
                onCancel={() => setIsFolderModalVisible(false)}
            >
                <Form form={folderForm} layout="vertical">
                    <Form.Item name="name" label="名字" rules={[{ required: true, message: '请输入文件夹名字!' }]}>
                        <Input />
                    </Form.Item>
                    <Form.Item name="type" label="类型" rules={[{ required: true, message: '请选择文件夹类型!' }]}>
                        <Select>
                            <Select.Option value="chat">chat</Select.Option>
                            //TODO 不确定是不是prompt
                            <Select.Option value="prompt">prompt</Select.Option>
                        </Select>
                    </Form.Item>
                    <Form.Item name="deletable" label="是否可删除"rules={[{ required: true, message: '请选择是否可删除!' }]}>
                        <Select>
                            <Select.Option value={true}>true</Select.Option>
                            <Select.Option value={false}>false</Select.Option>
                        </Select>
                    </Form.Item>
                </Form>
            </Modal>
        </>
    );
};

const DroppableComponent = (props) => (
    <Droppable droppableId="droppable">
        {(provided, snapshot) => (
            <tbody
                ref={provided.innerRef}
                {...provided.droppableProps}
                style={{ backgroundColor: snapshot.isDraggingOver ? 'lightblue' : 'white' }}
            >
            {props.children}
            {provided.placeholder}
            </tbody>
        )}
    </Droppable>
);

// Draggable component for each table row

export default SetPage;