import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const API_BASE_URL = 'http://127.0.0.1:8000/api';

function Home() {
    const [categories, setCategories] = useState([]);
    const [error, setError] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const response = await axios.get(`${API_BASE_URL}/categories/?page=${currentPage}`);
                setCategories(response.data.results);
                setTotalPages(Math.ceil(response.data.count / 5)); // Assuming 5 items per page
            } catch (err) {
                setError('Failed to fetch categories.');
                console.error(err);
            }
        };

        fetchCategories();
    }, [currentPage]);

    const handleLogout = () => {
        document.cookie = 'access=; Max-Age=0; path=/;'; // Clear JWT token cookie
        navigate('/'); // Redirect to login page
    };

    const handleShowAllProducts = () => {
        navigate('/products'); // Redirect to the Products page
    };

    const handleCategoryClick = (categoryId) => {
        navigate(`/products/${categoryId}`);
    };

    // const goToPage = (page) => {
    //     if (page >= 1 && page <= totalPages) {
    //         setCurrentPage(page);
    //     }
    // };

    return (
        <div>
            {/* Navbar */}
            <nav style={styles.navbar}>
                <h1 style={styles.heading}>Categories</h1>
                <button style={styles.logoutButton} onClick={handleLogout}>
                    Logout
                </button>
            </nav>

            {/* Show All Products Button */}
            <div style={styles.showAllProductsContainer}>
                <button style={styles.showAllProductsButton} onClick={handleShowAllProducts}>
                    Show All Products
                </button>
            </div>

            {error && <p style={{ color: 'red', textAlign: 'center' }}>{error}</p>}

            <table>
                <thead>
                    <tr>
                        <th>S.No</th>
                        <th>Category Name</th>
                        <th>Date of Commencement</th>
                    </tr>
                </thead>
                <tbody>
                    {categories.map((category, index) => (
                        <tr key={category.id} onClick={() => handleCategoryClick(category.id)} style={styles.categoryRow}>
                            <td>{(currentPage - 1) * 5 + index + 1}</td>
                            <td>{category.name}</td>
                            <td>{new Date(category.created_at).toLocaleDateString()}</td>
                        </tr>
                    ))}
                    {categories.length === 0 && (
                        <tr>
                            <td colSpan="3" style={{ textAlign: 'center' }}>
                                No categories found.
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>

            <div style={styles.paginationContainer}>
                <button
                    onClick={() => setCurrentPage((prev) => prev - 1)}
                    disabled={currentPage === 1}
                    style={styles.paginationButton}
                >
                    Previous
                </button>
                <span>
                    Page {currentPage} of {totalPages}
                </span>
                <button
                    onClick={() => setCurrentPage((prev) => prev + 1)}
                    disabled={currentPage === totalPages}
                    style={styles.paginationButton}
                >
                    Next
                </button>
            </div>
        </div>
    );
}

const styles = {
    navbar: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '10px 20px',
        backgroundColor: 'red',
        color: 'white',
    },
    heading: {
        margin: 0,
        fontSize: '24px',
        textAlign: 'center',
        flex: 1,
        color:'white',
    },
    logoutButton: {
        padding: '10px 15px',
        backgroundColor: '',
        color: 'white',
        border: 'none',
        borderRadius: '5px',
        cursor: 'pointer',
    },
    showAllProductsContainer: {
        display: 'flex',
        justifyContent: 'flex-end',
        padding: '10px 20px',
    },
    showAllProductsButton: {
        padding: '10px 15px',
        backgroundColor: '#28a745',
        color: 'white',
        border: 'none',
        borderRadius: '5px',
        cursor: 'pointer',
    },
    categoryRow: {
        cursor: 'pointer',
    },
    paginationContainer: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '10px 20px',
    },
    paginationButton: {
        backgroundColor: '#007bff',
        color: 'white',
        border: 'none',
        padding: '10px 15px',
        borderRadius: '5px',
        cursor: 'pointer',
        margin: '0 5px',
    },
};

export default Home;
