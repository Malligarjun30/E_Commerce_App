import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './components/Login';
import Registration from './components/Registration';
import Home from './components/Home';
import Products from './components/Products';
import './styles.css';


function App() {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<Login />} />
                <Route path="/register" element={<Registration />} />
                <Route path="/home" element={<Home/>}/>
                <Route path="/products" element={<Products />} />
                <Route path="/products/:categoryId" element={<Products />}/>
            </Routes>
        </Router>
    );
}

export default App;
