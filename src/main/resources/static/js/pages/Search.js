/**
 * Search page component for browsing items
 */
const Search = () => {
    const [items, setItems] = React.useState([]);
    const [filteredItems, setFilteredItems] = React.useState([]);
    const [searchTerm, setSearchTerm] = React.useState('');
    const [loading, setLoading] = React.useState(true);
    const [error, setError] = React.useState('');
    const [sortOption, setSortOption] = React.useState('newest');
    
    // Check if user is logged in
    const [user, setUser] = React.useState(null);
    
    React.useEffect(() => {
        // Get current user
        const currentUser = API.auth.getCurrentUser();
        setUser(currentUser);
        
        // Fetch all items
        const fetchItems = async () => {
            try {
                setLoading(true);
                const data = await API.items.getAll();
                
                // Filter out items whose bidding has ended
                const now = new Date();
                const activeItems = data.filter(item => {
                    const endTime = new Date(item.biddingEndTime);
                    return endTime > now;
                });
                
                setItems(activeItems);
                setFilteredItems(activeItems);
            } catch (err) {
                console.error('Error fetching items:', err);
                setError('Failed to load items. Please try again later.');
            } finally {
                setLoading(false);
            }
        };
        
        fetchItems();
    }, []);
    
    // Handle search input change
    const handleSearchChange = (e) => {
        const value = e.target.value;
        setSearchTerm(value);
        
        // Filter items based on search term
        if (value.trim() === '') {
            setFilteredItems(items);
        } else {
            const filtered = items.filter(item => 
                item.name.toLowerCase().includes(value.toLowerCase()) || 
                item.description.toLowerCase().includes(value.toLowerCase())
            );
            setFilteredItems(filtered);
        }
    };
    
    // Handle sort option change
    const handleSortChange = (e) => {
        const option = e.target.value;
        setSortOption(option);
        
        // Sort items based on selected option
        const sorted = [...filteredItems];
        
        switch (option) {
            case 'newest':
                sorted.sort((a, b) => new Date(b.biddingEndTime) - new Date(a.biddingEndTime));
                break;
            case 'oldest':
                sorted.sort((a, b) => new Date(a.biddingEndTime) - new Date(b.biddingEndTime));
                break;
            case 'price_high':
                sorted.sort((a, b) => (b.currentPrice || b.startingPrice) - (a.currentPrice || a.startingPrice));
                break;
            case 'price_low':
                sorted.sort((a, b) => (a.currentPrice || a.startingPrice) - (b.currentPrice || b.startingPrice));
                break;
            default:
                break;
        }
        
        setFilteredItems(sorted);
    };
    
    return (
        <div className="container py-5">
            <h1 className="mb-4">Browse Items</h1>
            
            {!user && (
                <div className="alert alert-info mb-4">
                    <i className="fas fa-info-circle me-2"></i>
                    Please <a href="#/login">login</a> to bid on items.
                </div>
            )}
            
            {/* Search and Filter Section */}
            <div className="card mb-4">
                <div className="card-body">
                    <div className="row g-3">
                        <div className="col-md-8">
                            <div className="input-group">
                                <span className="input-group-text">
                                    <i className="fas fa-search"></i>
                                </span>
                                <input
                                    type="text"
                                    className="form-control"
                                    placeholder="Search by name or description..."
                                    value={searchTerm}
                                    onChange={handleSearchChange}
                                />
                            </div>
                        </div>
                        <div className="col-md-4">
                            <select 
                                className="form-select" 
                                value={sortOption}
                                onChange={handleSortChange}
                            >
                                <option value="newest">Newest First</option>
                                <option value="oldest">Oldest First</option>
                                <option value="price_high">Price: High to Low</option>
                                <option value="price_low">Price: Low to High</option>
                            </select>
                        </div>
                    </div>
                </div>
            </div>
            
            {/* Items Display Section */}
            {loading ? (
                <div className="text-center py-5">
                    <div className="spinner-border text-primary" role="status">
                        <span className="visually-hidden">Loading...</span>
                    </div>
                    <p className="mt-3">Loading items...</p>
                </div>
            ) : error ? (
                <div className="alert alert-danger" role="alert">
                    <i className="fas fa-exclamation-circle me-2"></i>
                    {error}
                </div>
            ) : filteredItems.length === 0 ? (
                <div className="text-center py-5">
                    <i className="fas fa-search fa-3x mb-3 text-muted"></i>
                    <h3>No items found</h3>
                    <p className="text-muted">Try adjusting your search criteria.</p>
                </div>
            ) : (
                <div className="row">
                    {filteredItems.map(item => (
                        <ItemCard key={item.id} item={item} />
                    ))}
                </div>
            )}
        </div>
    );
};
