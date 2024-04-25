import React, { useState } from 'react';
import './style.css';
import voltar from './img/voltar.png'

const Signin = () => {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [matricula, setMatricula] = useState('');

  const createPost = (usuario) => {
    if (navigator.onLine) {
      const backendEndpoint = 'https://api-florestal.vercel.app/usuarios';
      fetch(backendEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(usuario),
      })
        .then((resp) => resp.json())
        .then((data) => {
          console.log(data);
          clearFieldsAndShowMessage();
        })
        .catch((err) => console.log(err));
    } else {
      alert('Você precisa estar conectado');
    }
  };

  const clearFieldsAndShowMessage = () => {
    setEmail('');
    setName('');
    setPassword('');
    setConfirmPassword('');
    setMatricula('');
    setMessage('Usuário cadastrado com sucesso');
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    const usuario = {
      email,
      name,
      password,
      matricula,
    };

    if (navigator.onLine) {
      createPost(usuario);
    } else {

      localStorage.setItem('usuarioOffline', JSON.stringify(usuario));
      alert(
        'Dados salvos localmente. Eles serão enviados quando houver conexão com a internet.'
      );
      clearFieldsAndShowMessage();
    }
  };

  return (
    <div className='main-container'>
                <h1>Cadastre um novo usuário</h1>
                <button onClick={() => window.history.back()}>
                    <img src={voltar} alt="" />
                </button>
      <form id='register-form' onSubmit={handleSubmit}>
        <div className='full-box'>
          <label htmlFor='email'>E-mail</label>
          <input
            type='email'
            name='email'
            id='email'
            placeholder='Digite seu e-mail'
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <div className='half-box spacing'>
          <label htmlFor='matricula'>Matricula</label>
          <input
            type='number'
            name='matricula'
            id='matricula'
            placeholder='Digite sua matrícula'
            value={matricula}
            onChange={(e) => setMatricula(e.target.value)}
          />
        </div>
        <div className='half-box '>
          <label htmlFor='name'>Nome</label>
          <input
            type='text'
            name='name'
            id='name'
            placeholder='Digite seu nome'
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>
        <div className='half-box spacing'>
          <label htmlFor='password'>Senha</label>
          <input
            type='password'
            name='password'
            id='password'
            placeholder='Digite sua senha'
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        <div className='half-box'>
          <label htmlFor='confirmPassword'>Confirme sua Senha</label>
          <input
            type='password'
            name='confirmPassword'
            id='confirmPassword'
            placeholder='Confirme sua senha'
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />
        </div>
        <div className='full-box'>
          <input type='submit' name='cadastro' id='cadastro' value='Registrar' />
        </div>
      </form>
      {message && <p>{message}</p>}
    </div>
  );
};

export default Signin;

