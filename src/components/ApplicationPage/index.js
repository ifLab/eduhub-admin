import React, {useEffect, useState} from 'react';
import {Table, Button, Popconfirm, Form, Modal, Input} from 'antd';

const ApplicationPage = () => {

    const columns = [
        {
            title: '名称',
            dataIndex: 'name',
            key: 'name',
        },
        {
            title: 'API',
            dataIndex: 'api',
            key: 'api',
        },
        {
            title: '操作',
            key: 'action',
            render: (_, record) => (
                <>
                    <Button type="link" onClick={() => handleEdit(record)}>修改</Button>
                    <Popconfirm title="确定删除吗?" onConfirm={() => handleDelete(record.key)}>
                        <Button type="link">删除</Button>
                    </Popconfirm>
                </>
            ),
        },
    ];
    const [data, setData] = useState([
    ]);
    const [currentRecord, setCurrentRecord] = useState(null);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [form] = Form.useForm();
    useEffect(() => {
        fetch('http://localhost:3001/getDify_keys')
            .then(response => response.json())
            .then(data => {
                console.log("data",data)
                // 将对象转换为数组，并添加key属性以供Ant Design的Table组件使用
                const formattedData = Object.entries(data).map(([key, value], index) => ({
                    key: index.toString(),
                    name: key,
                    api: value,
                }));
                setData(formattedData);
            })
            .catch(error => console.error('Failed to fetch data:', error));
    }, []);
    const handleEdit = (record) => {
        setCurrentRecord(record);
        setIsModalVisible(true);
        form.setFieldsValue({
            name: record.name,
            api: record.api,
        });
    };
    const handleDelete = (key) => {
        setData(data.filter(item => item.key !== key));
    };
    const handleOk = () => {
        form
            .validateFields()
            .then(values => {
                // 这里可以处理表单提交逻辑，例如更新数据
                console.log('Received values of form: ', values);
                setIsModalVisible(false);
                fetch('http://localhost:3001/updateKeysData', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        [values.name]: values.api,// 仅发送修改的键值对
                    }),
                })
                    .then(response => response.text())
                    .then(message => {
                        console.log(message);
                        // setIsModalVisible(false);
                        // 可能需要重新获取更新后的数据
                    })
                    .catch(error => console.error('Failed to update data:', error));
                // 更新表格数据等逻辑...
            })
            .catch(info => {
                console.log('Validate Failed:', info);
            });
    };
    const handleCancel = () => {
        setIsModalVisible(false);
    };

    // 注意：handleEdit 和 handleDelete 需要被实现，或者从外部传入
    // 如果这些函数依赖于外部状态，你可能需要将它们作为props传入

    // return <Table columns={columns} dataSource={data} />;
    return (
        <>
            <Table columns={columns} dataSource={data} />
            <Modal title="修改" visible={isModalVisible} onOk={handleOk} onCancel={handleCancel}>
                <Form form={form} layout="vertical" name="form_in_modal">
                    <Form.Item
                        name="name"
                        label="名称"
                        rules={[{ required: true, message: '请输入名称!' }]}
                    >
                        <Input />
                    </Form.Item>
                    <Form.Item
                        name="api"
                        label="API"
                        rules={[{ required: true, message: '请输入API!' }]}
                    >
                        <Input />
                    </Form.Item>
                </Form>
            </Modal>
        </>
    );
};

export default ApplicationPage;