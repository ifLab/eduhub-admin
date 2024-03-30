import React, { useEffect, useState } from 'react';
import {Card, Row, Col, Modal, Button, message, Form, Input} from 'antd';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';

const PromptsPage = () => {
    const [prompts, setPrompts] = useState([]);
    const [selectedPrompt, setSelectedPrompt] = useState(null);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [isAddModalVisible, setIsAddModalVisible] = useState(false);

    useEffect(() => {
        fetchPrompts();
    }, []);

    const fetchPrompts = () => {
        fetch('http://localhost:3001/getPrompts')
            .then(response => response.json())
            .then(data => {
                setPrompts(data.defaultPrompts);
            })
            .catch(error => console.error('Failed to fetch prompts:', error));
    };
    const showModal = (prompt) => {
        setSelectedPrompt(prompt);
        setIsModalVisible(true);
    };
    const showAddPromptModal = () => {
        setIsAddModalVisible(true);
    };
    const handleOk = () => {
        setIsModalVisible(false);
        //TODO: 更新
    };

    const handleCancel = () => {
        setSelectedPrompt(null);
        setIsModalVisible(false);
    };
    const addNewPrompt = (values) => {
        fetch('http://localhost:3001/addPrompt', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(values),
        })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json();
            })
            .then(data => {
                message.success('提示词添加成功!');
                setIsAddModalVisible(false); // 关闭模态框
                fetchPrompts(); // 重新获取提示列表以更新UI
            })
            .catch(error => {
                console.error('Failed to add new prompt:', error);
                message.error('添加提示词失败');
            });
    };
    const updatePrompt = (id, values) => {
        fetch(`http://localhost:3001/updatePrompt/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(values),
        })
            .then(response => response.json())
            .then(data => {
                console.log('Prompt updated:', data);
                message.success('Prompt updated successfully');
                setSelectedPrompt(null);
                setIsModalVisible(false);
                // 重新获取提示列表以更新UI
                fetchPrompts();
            })
            .catch(error => {
                console.error('Failed to update prompt:', error);
                message.error('Failed to update prompt');
            });
    };
    const deletePrompt = (id) => {
        Modal.confirm({
            title: 'Are you sure delete this prompt?',
            content: 'This action cannot be undone',
            okText: 'Yes',
            okType: 'danger',
            cancelText: 'No',
            onOk() {
                // TODO 删除逻辑，可能需要调用 API 删除后端数据
                // setPrompts(prompts.filter(prompt => prompt.id !== id));
                // message.success('Prompt deleted successfully');
                fetch(`http://localhost:3001/deletePrompt/${id}`, {
                    method: 'DELETE',
                })
                    .then(response => {
                        if (!response.ok) {
                            throw new Error('Network response was not ok');
                        }
                        return response.text();
                    })
                    .then(() => {
                        message.success('提示词删除成功!');
                        // 重新获取提示列表以更新UI
                        fetchPrompts();
                    })
                    .catch(error => {
                        console.error('Failed to delete prompt:', error);
                        message.error('Failed to delete prompt');
                    });
            },
        });
    };

    const onDragEnd = (result) => {
        if (!result.destination) {
            return;
        }

        const items = Array.from(prompts);
        const [reorderedItem] = items.splice(result.source.index, 1);
        items.splice(result.destination.index, 0, reorderedItem);

        setPrompts(items);
        // 这里你可以添加代码来更新后端数据
        updatePromptsOrderOnServer(items);
    };

    const updatePromptsOrderOnServer = (updatedPrompts) => {
        fetch('http://localhost:3001/updatePromptsOrder', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ defaultPrompts: updatedPrompts }),
        })
            .then(response => response.json())
            .then(data => {
                console.log('Order updated successfully', data);
            })
            .catch(error => {
                console.error('Failed to update order:', error);
            });
    };

    return (

        <DragDropContext onDragEnd={onDragEnd}>
            <Droppable droppableId="prompts">
                {(provided) => (
                    <div {...provided.droppableProps} ref={provided.innerRef} style={{ background: '#ECECEC', padding: '30px' }}>
                        <Button type="primary" onClick={() => showAddPromptModal()} style={{ marginBottom: 16 }}>新增提示词</Button>
                        {isAddModalVisible && (
                            <Modal
                                title="新增提示词"
                                visible={isAddModalVisible}
                                onCancel={() => setIsAddModalVisible(false)}
                                footer={null}
                            >
                                <Form
                                    id="addPromptForm"
                                    onFinish={addNewPrompt}
                                    layout="vertical"
                                >
                                    <Form.Item name="name" label="Name" rules={[{ required: true, message: 'Please input the name!' }]}>
                                        <Input />
                                    </Form.Item>
                                    <Form.Item name="description" label="Description" rules={[{ required: true, message: 'Please input the description!' }]}>
                                        <Input />
                                    </Form.Item>
                                    <Form.Item name="content" label="Content" rules={[{ required: true, message: 'Please input the content!' }]}>
                                        <Input.TextArea rows={4} />
                                    </Form.Item>
                                    <Form.Item>
                                        <Button type="primary" htmlType="submit"  style={{ marginBottom: 16, float: 'right'}}>
                                            Submit
                                        </Button>
                                    </Form.Item>
                                </Form>
                            </Modal>
                        )}
                        <Row gutter={16}>
                            {prompts.map((prompt, index) => (
                                <Draggable key={prompt.id} draggableId={prompt.id} index={index}>
                                    {(provided) => (
                                        <Col span={8} ref={provided.innerRef} {...provided.draggableProps} {...provided.dragHandleProps}>
                                            <Card
                                                title={prompt.name}
                                                bordered={false}
                                                hoverable
                                                style={{ marginBottom: '20px' }}
                                                onClick={() => showModal(prompt)}
                                                extra={<Button type="danger" onClick={(e) => {e.stopPropagation(); deletePrompt(prompt.id);}}>Delete</Button>}
                                            >
                                                <p><strong>Description:</strong> {prompt.description}</p>
                                                <p><strong>Content:</strong></p>
                                                <pre style={{ whiteSpace: 'pre-wrap', wordWrap: 'break-word' }}>
                                                    {prompt.content.length > 100 ? prompt.content.substring(0, 100) + '...' : prompt.content}
                                                </pre>
                                            </Card>
                                        </Col>
                                    )}
                                </Draggable>
                            ))}
                            {provided.placeholder}
                        </Row>
                        {selectedPrompt && (
                            <Modal title="Edit Prompt" visible={isModalVisible}  onCancel={handleCancel}
                                   footer={[
                                       <Button key="back" onClick={handleCancel}>
                                           Cancel
                                       </Button>,
                                       <Button key="submit" type="primary" form="editPromptForm" htmlType="submit">
                                           Save
                                       </Button>,
                                   ]}>
                                <Form id="editPromptForm" initialValues={ selectedPrompt } onFinish={values => updatePrompt(selectedPrompt.id, values)}>
                                    <Form.Item name="name" label="Name">
                                        <Input />
                                    </Form.Item>
                                    <Form.Item name="description" label="Description">
                                        <Input />
                                    </Form.Item>
                                    <Form.Item name="content" label="Content">
                                        <Input.TextArea rows={4} />
                                    </Form.Item>
                                </Form>
                            </Modal>
                        )}
                    </div>
                )}
            </Droppable>
        </DragDropContext>
        // </div>

    );
};

export default PromptsPage;
