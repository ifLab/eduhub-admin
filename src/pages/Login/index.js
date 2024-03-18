import React, { useState } from 'react';
import { Card, Form, Input, Button } from 'antd';
// import { useHistory } from 'react-router-dom';

function Login() {
    const [form] = Form.useForm();
    // const history = useHistory(); // 用于后续跳转

    // const onFinish = (values) => {
    //     console.log('登录信息', values);
    // };
    const onFinish = (values) => {
        console.log("11111111111111111")
        fetch('http://localhost:3001/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(values),
        })
            .then(response => {
                console.log("22222222222222222")
                console.log("response",response)
                if (response.ok) {
                    return response.json();
                }
                throw new Error('登录失败');
            })
            .then(data => {
                console.log('登录成功:', data);
                // this.props.history.push('/login')
                // history.push('/AdminPage'); // 登录成功后跳转
            })
            .catch(error => {
                console.log("3333333333333333")
                console.error('登录错误:', error);
            });
    };

    return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
            <Card title="登录" style={{ width: 300 }}>
                <Form
                    form={form}
                    name="login"
                    onFinish={onFinish}
                    layout="vertical"
                >
                    <Form.Item
                        name="username"
                        label="用户名"
                        rules={[{ required: true, message: '请输入用户名!' }]}
                    >
                        <Input />
                    </Form.Item>
                    <Form.Item
                        name="password"
                        label="密码"
                        rules={[{ required: true, message: '请输入密码!' }]}
                    >
                        <Input.Password />
                    </Form.Item>
                    <Form.Item>
                        <Button type="primary" htmlType="submit" style={{ width: '100%' }}>
                            登录
                        </Button>
                    </Form.Item>
                </Form>
            </Card>
        </div>
    );
}

export default Login;