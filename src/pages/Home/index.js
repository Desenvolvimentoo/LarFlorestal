import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './style.css';
import th1 from './img/th.png';
import th1Mob from './img/th-mob.png';
import th2 from './img/th2.png';
import th2Mob from './img/th2-mob.png';
import th3 from './img/th3.png';
import th3Mob from './img/th3-mob.png';

const Home = () => {
    const [isActive, setIsActive] = useState(false);
    const [currentSlide, setCurrentSlide] = useState(1);

    const handleMobileMenuClick = () => {
        setIsActive(!isActive);
    };

    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.removeItem('isLoggedIn');
        navigate('/');
    };

    useEffect(() => {
        const interval = setInterval(() => {
            proximaImg();
        }, 5000);
        return () => clearInterval(interval);
    }, [currentSlide]);

    const proximaImg = () => {
        setCurrentSlide((prevSlide) => (prevSlide % 3) + 1);
    };

    return (
        <header>
            <nav className={isActive ? 'active' : ''}>
                <a className='logo' href="/home">Lar Florestal</a>
                <div className='mobile-menu' onClick={handleMobileMenuClick}>
                    <div className='line1'></div>
                    <div className='line2'></div>
                    <div className='line3'></div>
                </div>
                <ul className={`nav-list ${isActive ? 'active' : ''}`}>
                    <li><a href='/cadastroOperacoes'>Cadastrar Operações</a></li>
                    <li><a href='/cadastroParadas'>Cadastrar Paradas</a></li>
                    <li><a href='/visualizacoes'>Visualizar</a></li>
                    <li><a href='/'>Gráficos</a></li>
                    <li><a href='/'>Custos</a></li>
                    <li><button className='logout-button' onClick={handleLogout}>Sair</button></li>
                </ul>
            </nav>
            <section className='slider'>
                <div className='slider-content'>
                    <input 
                        type='radio' 
                        name='btn-radio' 
                        id='radio1' 
                        checked={currentSlide === 1} 
                        onChange={() => setCurrentSlide(1)} 
                    />
                    <input 
                        type='radio' 
                        name='btn-radio' 
                        id='radio2' 
                        checked={currentSlide === 2} 
                        onChange={() => setCurrentSlide(2)} 
                    />
                    <input 
                        type='radio' 
                        name='btn-radio' 
                        id='radio3' 
                        checked={currentSlide === 3} 
                        onChange={() => setCurrentSlide(3)} 
                    />

                    <div className={`slide-box ${currentSlide === 1 ? 'primeiro' : ''}`}>
                        <img className='img-desktop' src={th1} alt="img1"/>
                        <img className='img-mobile' src={th1Mob} alt="img1"/>
                    </div>

                    <div className={`slide-box ${currentSlide === 2 ? 'primeiro' : ''}`}>
                        <img className='img-desktop' src={th2} alt="img2"/>
                        <img className='img-mobile' src={th2Mob} alt="img2"/>
                    </div>

                    <div className={`slide-box ${currentSlide === 3 ? 'primeiro' : ''}`}>
                        <img className='img-desktop'src={th3} alt="img3"/>
                        <img className='img-mobile' src={th3Mob} alt="img3"/>
                    </div>

                    <div className='nev-auto'>
                        <div className={`auto-btn-1 ${currentSlide === 1 ? 'active' : ''}`}></div>
                        <div className={`auto-btn-2 ${currentSlide === 2 ? 'active' : ''}`}></div>
                        <div className={`auto-btn-3 ${currentSlide === 3 ? 'active' : ''}`}></div>
                    </div>

                    <div className='nev-manual'>
                        <label htmlFor="radio1" className='manual-btn'></label>
                        <label htmlFor="radio2" className='manual-btn'></label>
                        <label htmlFor="radio3" className='manual-btn'></label>
                    </div>
                </div>
            </section>
        </header>
    );
}

export default Home;
