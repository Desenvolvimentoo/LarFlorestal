import React, { useState, useEffect } from 'react';
import './style.css';
import plantandoArvore from './img/plantando-arvore.png';
import { useNavigate } from 'react-router-dom';

const Signup = () => {
    const [matricula, setMatricula] = useState('');
    const [senha, setSenha] = useState('');
    const [mensagem, setMensagem] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        const isLoggedIn = localStorage.getItem('isLoggedIn');
        if (isLoggedIn) {
            navigate('/home');
            window.location.reload();
        }
    }, [navigate]);

    const handleLogin = async () => {
        try {
            const response = await fetch(`https://api-florestal.vercel.app/usuarios?matricula=${matricula}`);

            if (response.ok) {
                const data = await response.json();
                if (data.length > 0) {
                    const user = data[0];
                    if (user.password === senha) {
                        setMensagem('Usuário logado com sucesso');

                        localStorage.setItem('matricula', user.matricula);

                        localStorage.setItem('isLoggedIn', true);
                        navigate('/home');
                        window.location.reload();
                    } else {
                        setMensagem('Senha incorreta');
                    }
                } else {
                    setMensagem('Matrícula não encontrada');
                }
            } else {
                console.error('Erro ao fazer login:', response.statusText);
                setMensagem('Erro ao fazer login');
            }
        } catch (error) {
            console.error('Erro ao fazer login:', error);
            setMensagem('Erro ao fazer login');
        }
    };

    return (
        <div className="main-login">
            <div className="left-login">
                <h1>Faça Login<br/>E comece a usar o Lar Florestal</h1>
                <img src={plantandoArvore} alt="Plantando árvore" className='left-login-img'/>
            </div>
            <div className="right-login">
                <div className="card-login">
                    <h1>Login</h1>
                    <div className="textfield">
                        <label htmlFor="usuario">Matrícula</label>
                        <input type="number" name="usuario" placeholder="Matrícula" value={matricula} onChange={e => setMatricula(e.target.value)} />
                    </div>
                    <div className="textfield">
                        <label htmlFor="senha">Senha</label>
                        <input type="password" name="senha" placeholder="Senha" value={senha} onChange={e => setSenha(e.target.value)} />
                    </div>
                    <button className="btn-login" onClick={handleLogin}>Login</button>
                    <a className='redcad' href="../Signin">Cadastre-se</a>
                    {mensagem && <p>{mensagem}</p>}
                </div>
            </div>
        </div>
    );
};

export default Signup;

