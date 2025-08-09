import './index.scss'
import Header from "../../component/Header";
import {useState} from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

function Login() {
    const[activeTab, setActiveTab] = useState('login');
    const navigate = useNavigate();
    const [formData, setFormData] = useState({ username: '', password: '' }); // 表单数据
    const [message, setMessage] = useState(''); // 提示消息


    const handleTabClick = (tab) => {
        setActiveTab(tab);
        setFormData({ username: '', password: '' });
    };

   
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleLogin = async () => {
        try {
            const response = await axios.post('http://127.0.0.1:8000/login', formData);
            const { data } = response;
            

            if (data.status === 200) {
                localStorage.setItem('token', data.data.token); // 保存token
                setMessage(data.message);

            // 跳转到不同页面
            navigate(data.isFirstLogin ? '/tagchoose' : '/'); // 根据是否第一次登录跳转
            }
        } catch (error) {
            setMessage(error.response?.data?.message || '登录失败');
        }
    };

    // 处理注册
    const handleRegister = async () => {
        try {
            const response = await axios.post('http://127.0.0.1:8000/register', formData);
            const token = response.data.token;
            const { data } = response;
            setMessage(data.message);

            if (data.status === 200) {
                alert('注册成功，请登录');
                setActiveTab('login'); // 自动切换到登录
            }
        } catch (error) {
            setMessage(error.response?.data?.message || '注册失败');
        }
    };



    return(
        <div className="loginPage">
            <Header />
            <div className="loginContainer">
                <div className="loginRec">
                    <div className="loginTitle">
                        <div className="loginTitleText">
                            <a 
                                className={`loginTitleTextLogin ${activeTab === 'login' ? 'active' : ''}`}
                                onClick={() => handleTabClick('login')}>
                                    登录
                            </a>
                            <a 
                                className={`loginTitleTextRegister ${activeTab === 'register' ? 'active' : ''}`}
                                onClick={() => handleTabClick('register')}>
                                    注册
                            </a>
                        </div>
                    </div>
                    <div className="loginContent">
                    {activeTab === 'login' && 
                        <div className="loginRecContent">
                            <input
                                type="text"
                                name="username"
                                placeholder="用户名"
                                value={formData.username}
                                onChange={handleChange}
                            />
                            <input
                                type="password"
                                name="password"
                                placeholder="密码"
                                value={formData.password}
                                onChange={handleChange}
                            />
                            <button onClick={handleLogin}>登录</button>
                        </div>}
                    {activeTab === 'register' && 
                        <div className="registerRecContent">
                            <input
                                type="text"
                                name="username"
                                placeholder="用户名"
                                value={formData.username}
                                onChange={handleChange}
                            />
                            <input
                                type="password"
                                name="password"
                                placeholder="密码"
                                value={formData.password}
                                onChange={handleChange}
                            />
                            <button onClick={handleRegister}>注册</button>
                        </div>}
                    </div>
                    <div className="loginFooter">
                        <div className="loginFooterContent">其他平台</div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Login