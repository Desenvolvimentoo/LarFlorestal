// Em routes.js

import React, { Fragment } from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import Home from '../pages/Home';
import Signin from '../pages/Signin';
import Signup from '../pages/Signup';
import CadOperacao from '../pages/CadOperacao';
import CadParadas from '../pages/CadParadas';
import Visualizacoes from '../pages/Visualizacoes';

export const Private = ({ isLoggedIn, Component }) => {
    return isLoggedIn ? <Component /> : <Signup />;
}

const RoutesApp = () => {

    const isLoggedIn = localStorage.getItem('isLoggedIn');

    return (
        <BrowserRouter>
            <Fragment>
                <Routes>
                    <Route exact path='/home' element={<Private isLoggedIn={isLoggedIn} Component={Home} />} />
                    <Route exact path='/signup' element={<Signup />} />
                    <Route path='/signin' element={<Signin />} />
                    <Route path='/cadastroOperacoes' element={<Private isLoggedIn={isLoggedIn} Component={CadOperacao} />} />
                    <Route path='/cadastroParadas' element={<Private isLoggedIn={isLoggedIn} Component={CadParadas} />} />
                    <Route path='/visualizacoes' element={<Private isLoggedIn={isLoggedIn} Component={Visualizacoes} />} />
                    <Route path='*' element={<Signup />} />
                </Routes>
            </Fragment>
        </BrowserRouter>
    );
}

export default RoutesApp;
