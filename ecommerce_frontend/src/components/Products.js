import React, { useEffect, useState,useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

const API_BASE_URL = 'http://127.0.0.1:8000/api';

function Products() {
    const { categoryId } = useParams();
    const navigate = useNavigate();

    // States
    const [products, setProducts] = useState([]);
    const [error, setError] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [filters, setFilters] = useState({ minPrice: '', maxPrice: '', inStock: false });
    const [searchQuery, setSearchQuery] = useState('');
    const [showFilter, setShowFilter] = useState(false); // State to toggle filter visibility

    // Fetch Products
    // useEffect(() => {
    //     fetchProducts();
    // }, [currentPage, filters, searchQuery,fetchProducts]);

    const fetchProducts = useCallback(async () => {
        try {
            // Build Query Parameters
            const query = new URLSearchParams({
                page: currentPage,
                ...(filters.minPrice && { min_price: filters.minPrice }),
                ...(filters.maxPrice && { max_price: filters.maxPrice }),
                ...(filters.inStock && { in_stock: 'true' }),
                ...(searchQuery && { search: searchQuery }),
            });

            const endpoint = categoryId
                ? `${API_BASE_URL}/products/${categoryId}/?${query.toString()}`
                : `${API_BASE_URL}/products/?${query.toString()}`;

            const response = await axios.get(endpoint);

            // Update State
            setProducts(response.data.results);
            setTotalPages(Math.ceil(response.data.count / 5));
        } catch (err) {
            setError('Failed to fetch products. Please try again later.');
        }
    },[categoryId, currentPage, filters, searchQuery]);

    useEffect(() => {
        fetchProducts();
    }, [fetchProducts]);

    // Handle Input Changes
    const handleFilterChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFilters((prev) => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value,
        }));
    };

    const handleSearch = (e) => {
        setSearchQuery(e.target.value);
        setCurrentPage(1);
    };

    const applyFilters = () => {
        setCurrentPage(1);
        setShowFilter(false); // Close the filter section after applying filters
    };

    return (
        <div>
            {/* Navbar */}
            {error && <p style={{ color: 'red', textAlign: 'center' }}>{error}</p>}
            <nav style={styles.navbar}>
                <button onClick={() => navigate('/home')} style={styles.goBackButton}>
                    Go Back
                </button>
                <h2 style={styles.navbarHeading}>Products</h2>
                <input
                    type="text"
                    placeholder="Search products..."
                    value={searchQuery}
                    onChange={handleSearch}
                    style={styles.searchInput}
                />
            </nav>

            {/* Filter Toggle Button */}
            <div style={styles.filterToggleContainer}>
                <button
                    onClick={() => setShowFilter((prev) => !prev)}
                    style={styles.filterToggleButton}
                >
                    {showFilter ? 'Close Filters' : 'Show Filters'}
                </button>
            </div>

            {/* Filter Section */}
            {showFilter && (
                <div style={styles.filterContainer}>
                    <input
                        type="number"
                        name="minPrice"
                        placeholder="Min Price"
                        value={filters.minPrice}
                        onChange={handleFilterChange}
                        style={styles.filterInput}
                    />
                    <input
                        type="number"
                        name="maxPrice"
                        placeholder="Max Price"
                        value={filters.maxPrice}
                        onChange={handleFilterChange}
                        style={styles.filterInput}
                    />
                    <label style={styles.filterLabel}>
                        <input
                            type="checkbox"
                            name="inStock"
                            checked={filters.inStock}
                            onChange={handleFilterChange}
                            style={styles.filterCheckbox}
                        />
                        In Stock Only
                    </label>
                    <button onClick={applyFilters} style={styles.applyButton}>
                        Apply Filters
                    </button>
                </div>
            )}

            {/* Products Table */}
            <table style={styles.table}>
                <thead>
                    <tr>
                        <th>S.No</th>
                        <th>Product Name</th>
                        <th>Price</th>
                        <th>Stock</th>
                    </tr>
                </thead>
                <tbody>
                    {products.length > 0 ? (
                        products.map((product, index) => (
                            <tr key={product.id}>
                                <td>{(currentPage - 1) * 5 + index + 1}</td>
                                <td>{product.name}</td>
                                <td>{product.price.toFixed(2)}</td>
                                <td>{product.stock}</td>
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan="4" style={styles.noProducts}>
                                No products found.
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>

            {/* Pagination */}
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
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '10px 20px',
        backgroundColor: 'red',
        color: 'white',
    },
    navbarHeading: {
        margin: 0,
        fontSize: '24px',
        textAlign: 'center',
        flex: 1,
        color:'white'
    },
    goBackButton: {
        backgroundColor: 'white',
        color: '#007bff',
        border: 'none',
        padding: '10px 15px',
        borderRadius: '5px',
        cursor: 'pointer',
    },
    searchInput: {
        padding: '10px',
        borderRadius: '10px',
        border: '1px solid #ccc',
        fontSize: '14px',
        text:'black'
    },
    filterToggleContainer: {
        padding: '10px 20px',
        textAlign: 'right',
    },
    filterToggleButton: {
        backgroundColor: '#28a745',
        color: 'white',
        border: 'none',
        padding: '10px 15px',
        borderRadius: '5px',
        cursor: 'pointer',
    },
    filterContainer: {
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        padding: '10px 20px',
        backgroundColor: '#f9f9f9',
        borderRadius: '8px',
        marginBottom: '20px',
    },
    filterInput: {
        padding: '10px',
        borderRadius: '4px',
        border: '1px solid #ccc',
        flex: 1,
    },
    filterLabel: {
        display: 'flex',
        alignItems: 'center',
        gap: '5px',
    },
    filterCheckbox: {
        marginLeft: '5px',
    },
    applyButton: {
        backgroundColor: '#007bff',
        color: 'white',
        padding: '10px 15px',
        border: 'none',
        borderRadius: '5px',
        cursor: 'pointer',
    },
    // table: {
    //     // width: '100%',
    //     borderCollapse: 'collapse',
    //     margin: '20px 0',
    // },
    // tableHeader: {
    //     backgroundColor: '#f4f4f4',
    //     textAlign: 'left',
    // },
    noProducts: {
        textAlign: 'center',
        color: '#888',
        padding: '20px',
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

export default Products