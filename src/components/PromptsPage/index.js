import React, { useState, useEffect } from 'react';
import { Table, Button, Modal, Form, Input, Select, message } from 'antd';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { API_URL } from '../../config/config';

const PromptsPage = () => {
    const [prompts, setPrompts] = useState([]);
    const [folders, setFolders] = useState([]);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [currentPrompt, setCurrentPrompt] = useState(null);
    const [form] = Form.useForm();
    const [isAddModalVisible, setIsAddModalVisible] = useState(false);

    useEffect(() => {
        fetchPrompts();
    }, []);

    const fetchPrompts = async () => {
        try {
            const response = await fetch(`${API_URL}/getPrompts`);
            const data = await response.json();
            setPrompts(data.Prompts);
            setFolders(data.Folders);
        } catch (error) {
            console.error('Failed to fetch prompts:', error);
        }
    };
    const showModal = (prompt) => {
        setCurrentPrompt(prompt);
        setIsModalVisible(true);
        form.setFieldsValue(prompt);
    };


    const handleCancel = () => {
        setIsModalVisible(false);
        form.resetFields();
        setCurrentPrompt(null);
    };

    const handleDeletePrompt = (id) => {
        // 假设这里调用API删除提示词
        console.log(`Deleting prompt with id: ${id}`);
        // 实际应用中，这里应该是一个API调用，以下是伪代码
        fetch(`${API_URL}/deletePrompt/${id}`, {
            method: 'DELETE',
        })
            .then(() => {
                message.success('提示词删除成功');
                fetchPrompts(); // 重新获取提示词列表
            })
            .catch(error => {
                console.error('删除提示词失败:', error);
                message.error('删除提示词失败');
            });
    };

    const deletePrompt = (id) => {
        Modal.confirm({
            title: '确定要删除这个提示词吗？',
            content: '此操作无法撤销',
            okText: '是',
            okType: 'danger',
            cancelText: '否',
            onOk() {
                handleDeletePrompt(id);
            },
        });
    };

    const updatePrompt = (values,id) => {
        console.log('Form Values:', values);
        if (!values.folderId){
            values.folderId=null;
        }
        fetch(`${API_URL}/updatePrompt/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(values), // 表单中的新值
        })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                    return response.json();
            })
            .then(data => {
                message.success('提示词更新成功!');
                setIsModalVisible(false); // 关闭模态框
                fetchPrompts(); // 重新获取提示词列表以更新UI
            })
            .catch(error => {
                console.error('更新提示词失败:', error);
                message.error('更新提示词失败');
            });
    }



    const columns = [
        {
            title: 'Name',
            dataIndex: 'name',
            key: 'name',
        },
        {
            title: 'Description',
            dataIndex: 'description',
            key: 'description',
        },
        {
            title: 'Content',
            dataIndex: 'content',
            key: 'content',
        },
        {
            title: 'Action',
            key: 'action',
            render: (_, record) => (
                <span>
                    <Button type="link" onClick={() => showModal(record)}>Edit</Button>
                    <Button type="link" danger onClick={() => deletePrompt(record.id)}>Delete</Button>
                </span>
            ),
        },
    ];

    const showAddModal = () => {
        setIsAddModalVisible(true);
        // 清空表单
        form.resetFields();
        setCurrentPrompt(null); // 确保不在编辑状态
    };

    const addPrompt = async (values) => {
        try {
            const response = await fetch(`${API_URL}/addPrompt`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(values), // 将表单数据转换为JSON字符串
            });
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            const newPrompt = await response.json();
            message.success('提示词添加成功!');
            setIsAddModalVisible(false); // 关闭新建提示词的模态框
            fetchPrompts(); // 重新获取提示词列表以更新UI
        } catch (error) {
            console.error('添加提示词失败:', error);
            message.error('添加提示词失败');
        }
    };

    const onDragEnd = async (result) => {
        const {source, destination} = result;

        // 如果目标位置不存在或者拖拽位置没有变化，则不做任何操作
        if (!destination || (source.droppableId === destination.droppableId && source.index === destination.index)) {
            return;
        }

        // 根据拖拽结果更新提示词的顺序
        const startFolderId = source.droppableId;
        const finishFolderId = destination.droppableId;

        // 创建新的提示词数组副本
        const newPrompts = Array.from(prompts);
        // 移除源位置的提示词
        const [reorderedPrompt] = newPrompts.splice(source.index, 1);

        // 如果跨文件夹移动，更新提示词的 folderId
        if (startFolderId !== finishFolderId) {
            reorderedPrompt.folderId = finishFolderId === 'noFolder' ? null : finishFolderId;
        }

        // 插入到新位置
        newPrompts.splice(destination.index, 0, reorderedPrompt);

        // 更新状态以反映拖拽操作的结果
        setPrompts(newPrompts);

        // 可以在这里调用API更新服务器上的提示词顺序
        try {
            const response = await fetch(`${API_URL}/updatePromptsOrder`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    prompts: newPrompts.map((prompt, index) => ({
                        id: prompt.id,
                        order: index
                    }))
                }),
            });

            if (!response.ok) {
                throw new Error('Failed to update prompts order');
            }

            // 可选：如果需要，处理服务器响应
            const data = await response.json();
            message.success("Prompts order updated successfully");
        } catch (error) {
            // console.error('Error updating prompts order:', error);
            message.error("Failed to update prompts order");
        }
    };
    const DroppableComponent = (provided) => ({ children }) => (
        <tbody ref={provided.innerRef} {...provided.droppableProps}>
        {children}
        {provided.placeholder}
        </tbody>
    );

    const DraggableComponent = ({  children, className, style, ...restProps }) => {
        const index = (() => {
            for (let i = 0; i < prompts.length; i++) {
                if (prompts[i].id === restProps['data-row-key']) {
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
                            backgroundColor: snapshot.isDragging ? 'lightgreen' : '',
                        }}
                    >
                        {children}
                    </tr>
                )}
            </Draggable>
        );
    }


    return (
        <div style={{background: '#ECECEC', padding: '30px'}}>
            <Button type="primary" onClick={showAddModal} style={{marginBottom: 16}}>
                新建提示词
            </Button>
            <DragDropContext onDragEnd={onDragEnd}>
                {folders.map((folder, index) => (
                    <Droppable droppableId={folder.id} key={folder.id}>
                        {(provided, snapshot) => (
                            <div ref={provided.innerRef} {...provided.droppableProps} style={{ marginBottom: 20 }}>
                                <h2>{folder.name}</h2>
                                <Table
                                    dataSource={prompts.filter(prompt => prompt.folderId === folder.id).map((item, index) => ({...item, index}))}
                                    rowKey="id"
                                    columns={columns}
                                    pagination={false}
                                    components={{
                                        body: {
                                            wrapper: DroppableComponent(provided),
                                            row: DraggableComponent,
                                        },
                                    }}
                                />
                                {provided.placeholder}
                            </div>
                        )}
                    </Droppable>
                ))}
                {/* 无文件夹的提ds示词 */}
                <Droppable droppableId="noFolder">
                    {(provided, snapshot) => (
                        <div ref={provided.innerRef} {...provided.droppableProps} style={{ marginBottom: 20 }}>
                            <h2>无文件夹的提示词</h2>
                            <Table
                                dataSource={prompts.filter(prompt => !prompt.folderId).map((item, index) => ({...item, index}))}
                                rowKey="id"
                                columns={columns}
                                pagination={false}
                                components={{
                                    body: {
                                        wrapper: DroppableComponent(provided),
                                        row: DraggableComponent,
                                    },
                                }}
                            />
                            {provided.placeholder}
                        </div>
                    )}
                </Droppable>
            </DragDropContext>
            <Modal
                title="新建提示词"
                visible={isAddModalVisible}
                onCancel={() => setIsAddModalVisible(false)}
                footer={null} // 使用表单的提交按钮
            >
                <Form
                    form={form}
                    onFinish={currentPrompt ? (values) => updatePrompt(values, currentPrompt.id) : addPrompt}
                >
                    <Form.Item
                        name="name"
                        label="名称"
                        rules={[{required: true, message: '请输入提示词名称!'}]}
                    >
                        <Input/>
                    </Form.Item>
                    <Form.Item
                        name="description"
                        label="描述"
                        rules={[{required: true, message: '请输入提示词描述!'}]}
                    >
                        <Input/>
                    </Form.Item>
                    <Form.Item
                        name="content"
                        label="内容"
                        rules={[{required: true, message: '请输入提示词内容!'}]}
                    >
                        <Input.TextArea rows={4}/>
                    </Form.Item>
                    <Form.Item
                        name="folderId"
                        label="文件夹"
                    >
                        <Select allowClear>
                            {folders.map(folder => (
                                <Select.Option key={folder.id} value={folder.id}>{folder.name}</Select.Option>
                            ))}
                        </Select>
                    </Form.Item>
                    <Form.Item>
                        <Button type="primary" htmlType="submit">
                            创建
                        </Button>
                    </Form.Item>
                </Form>
            </Modal>

            <Modal
                title="编辑提示词"
                visible={isModalVisible}
                onOk={form.submit}
                onCancel={handleCancel}
            >
                <Form
                    form={form}
                    initialValues={currentPrompt}
                    onFinish={(values) => {
                        console.log('Form Values:', values);
                        // 这里应该是调用API更新提示词的逻辑
                        setIsModalVisible(false);
                        updatePrompt(values, currentPrompt.id)
                    }}
                    on
                >
                    <Form.Item
                        name="name"
                        label="名称"
                        rules={[{required: true, message: '请输入提示词名称!'}]}
                    >
                        <Input/>
                    </Form.Item>
                    <Form.Item
                        name="description"
                        label="描述"
                        rules={[{required: true, message: '请输入提示词描述!'}]}
                    >
                        <Input/>
                    </Form.Item>
                    <Form.Item
                        name="content"
                        label="内容"
                        rules={[{required: true, message: '请输入提示词内容!'}]}
                    >
                        <Input.TextArea rows={4}/>
                    </Form.Item>
                    <Form.Item
                        name="folderId"
                        label="文件夹"
                    >
                        <Select allowClear>
                            {folders.map(folder => (
                                <Select.Option key={folder.id} value={folder.id}>{folder.name}</Select.Option>
                            ))}
                        </Select>
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
};
;


export default PromptsPage;
