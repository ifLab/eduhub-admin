import React, {useState} from 'react';
import {Button, Form, Layout, Menu, Popconfirm, Table} from 'antd';
import {
    AppstoreOutlined,
    DatabaseOutlined,
    BulbOutlined,
    SettingOutlined,
    SkinOutlined,
    UserOutlined,
    QuestionOutlined
} from '@ant-design/icons';

const { Header, Content, Sider } = Layout;

const AdminPage = () => {
    const [selectedMenu, setSelectedMenu] = useState('1');
    const [data, setData] = useState([
        {
            key: '1',
            name: '应用1',
            api: '/api/v1/app1',
        },
        {
            key: '2',
            name: '应用2',
            api: '/api/v2/app2',
        },
    ]);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [currentRecord, setCurrentRecord] = useState(null);
    const [form] = Form.useForm();

    const handleAdd = () => {
        setCurrentRecord(null);
        setIsModalVisible(true);
    };

    const handleEdit = (record) => {
        setCurrentRecord(record);
        setIsModalVisible(true);
        form.setFieldsValue(record);
    };

    const handleDelete = (key) => {
        setData(data.filter(item => item.key !== key));
    };

    const handleOk = () => {
        form.validateFields().then(values => {
            if (currentRecord) {
                // Edit
                setData(data.map(item => item.key === currentRecord.key ? { ...item, ...values } : item));
            } else {
                // Add
                setData([...data, { ...values, key: Date.now().toString() }]);
            }
            setIsModalVisible(false);
            form.resetFields();
        });
    };

    const handleCancel = () => {
        setIsModalVisible(false);
        form.resetFields();
    };

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
    return (
        <Layout style={{ minHeight: '100vh' }}>
            <Header className="header" style={{ color: 'white', fontSize: '20px' }}>
                BISTU Copilot 后台管理
            </Header>
            <Layout>
                <Sider width={200} className="site-layout-background">
                    <Menu
                        mode="inline"
                        defaultSelectedKeys={['1']}
                        // defaultOpenKeys={['sub1']}
                        style={{ height: '100%', borderRight: 0 }}
                        onSelect={({ key }) => setSelectedMenu(key)}
                    >
                        <Menu.Item key="1" icon={<AppstoreOutlined />}>应用管理</Menu.Item>
                        <Menu.Item key="2" icon={<DatabaseOutlined />}>目录管理</Menu.Item>
                        <Menu.Item key="3" icon={<BulbOutlined />}>提示词管理</Menu.Item>
                        <Menu.Item key="4" icon={<SettingOutlined />}>配置</Menu.Item>
                        <Menu.Item key="5" icon={<SkinOutlined />}>外观</Menu.Item>
                        <Menu.Item key="6" icon={<UserOutlined />}>用户管理</Menu.Item>
                        <Menu.Item key="7" icon={<QuestionOutlined />}>帮助管理</Menu.Item>
                    </Menu>
                </Sider>
                <Layout style={{ padding: '24px' }}>
                    <Content
                        className="site-layout-background"
                        style={{
                            padding: 24,
                            margin: 0,
                            minHeight: 280,
                            backgroundColor: 'white',
                        }}
                    >
                        {/* Content goes here */}
                        {/*选择一个栏目以开始管理*/}
                        {/*//TODO 不同的栏目用不同的内容*/}
                        {selectedMenu === '1' && <Table columns={columns} dataSource={data} />}
                    </Content>
                </Layout>
            </Layout>
        </Layout>
    );
};

export default AdminPage;