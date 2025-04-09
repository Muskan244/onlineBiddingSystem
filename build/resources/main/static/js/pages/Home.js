/**
 * Home page component
 */
const Home = () => {
    const [featuredItems, setFeaturedItems] = React.useState([]);
    const [loading, setLoading] = React.useState(true);
    const [error, setError] = React.useState('');
    
    React.useEffect(() => {
        // Fetch all items and select a few for featured display
        const fetchItems = async () => {
            try {
                setLoading(true);
                const items = await API.items.getAll();
                
                // Filter out items whose bidding has ended
                const now = new Date();
                const activeItems = items.filter(item => {
                    const endTime = new Date(item.biddingEndTime);
                    return endTime > now;
                });
                
                // Sort by most recent and take the first 6
                const sorted = activeItems.sort((a, b) => {
                    return new Date(b.biddingEndTime) - new Date(a.biddingEndTime);
                });
                
                setFeaturedItems(sorted.slice(0, 6));
            } catch (error) {
                console.error('Error fetching items:', error);
                setError('Failed to load items. Please try again later.');
            } finally {
                setLoading(false);
            }
        };
        
        fetchItems();
    }, []);
    
    return (
        <div className="home-page">
            {/* Hero Section */}
            <section className="hero bg-dark text-white py-5 mb-5">
                <div className="container">
                    <div className="row align-items-center">
                        <div className="col-lg-6">
                            <h1 className="display-4 fw-bold mb-3">Find Unique Items or Sell to the Highest Bidder</h1>
                            <p className="lead mb-4">BidMaster is your trusted platform for online auctions. Browse exclusive items or list your own for auction.</p>
                            <div className="d-flex gap-3">
                                <a href="#/items" className="btn btn-primary btn-lg">
                                    <i className="fas fa-search me-2"></i>
                                    Browse Items
                                </a>
                                <a href="#/sell" className="btn btn-outline-light btn-lg">
                                    <i className="fas fa-tag me-2"></i>
                                    Sell an Item
                                </a>
                            </div>
                        </div>
                        <div className="col-lg-6 d-none d-lg-block">
                            <img 
                                src="https://static.startuptalky.com/2022/05/online-auction-websites-StartupTalky--1-.jpg" 
                                alt="Auction" 
                                className="img-fluid rounded"
                                style={{ maxHeight: '400px', objectFit: 'cover', width: '100%' }}
                            />
                        </div>
                    </div>
                </div>
            </section>
            
            {/* Featured Items Section */}
            <section className="featured-items py-5">
                <div className="container">
                    <h2 className="text-center mb-5">Featured Items</h2>
                    
                    {loading ? (
                        <div className="text-center py-5">
                            <div className="spinner-border text-primary" role="status">
                                <span className="visually-hidden">Loading...</span>
                            </div>
                            <p className="mt-3">Loading featured items...</p>
                        </div>
                    ) : error ? (
                        <div className="alert alert-danger text-center" role="alert">
                            <i className="fas fa-exclamation-circle me-2"></i>
                            {error}
                        </div>
                    ) : featuredItems.length === 0 ? (
                        <div className="text-center py-5">
                            <i className="fas fa-box-open fa-3x mb-3 text-muted"></i>
                            <h3>No items available</h3>
                            <p className="text-muted">Check back soon for new auction items!</p>
                        </div>
                    ) : (
                        <div className="row">
                            {featuredItems.map(item => (
                                <ItemCard key={item.id} item={item} />
                            ))}
                        </div>
                    )}
                    
                    <div className="text-center mt-4">
                        <a href="#/items" className="btn btn-outline-primary">
                            View All Items
                            <i className="fas fa-arrow-right ms-2"></i>
                        </a>
                    </div>
                </div>
            </section>
            
            {/* How It Works Section */}
            <section className="how-it-works py-5 bg-light">
                <div className="container">
                    <h2 className="text-center mb-5">How It Works</h2>
                    
                    <div className="row g-4">
                        <div className="col-md-4">
                            <div className="card h-100 border-0 shadow-sm">
                                <div className="card-body text-center p-4">
                                    <div className="icon-wrapper mb-3">
                                        <i className="fas fa-user-plus fa-3x text-primary"></i>
                                    </div>
                                    <h4>Create an Account</h4>
                                    <p className="text-muted">Sign up for free and set up your profile to start bidding or selling items.</p>
                                </div>
                            </div>
                        </div>
                        
                        <div className="col-md-4">
                            <div className="card h-100 border-0 shadow-sm">
                                <div className="card-body text-center p-4">
                                    <div className="icon-wrapper mb-3">
                                        <i className="fas fa-search fa-3x text-primary"></i>
                                    </div>
                                    <h4>Find or List Items</h4>
                                    <p className="text-muted">Browse through available items or list your own items for auction.</p>
                                </div>
                            </div>
                        </div>
                        
                        <div className="col-md-4">
                            <div className="card h-100 border-0 shadow-sm">
                                <div className="card-body text-center p-4">
                                    <div className="icon-wrapper mb-3">
                                        <i className="fas fa-gavel fa-3x text-primary"></i>
                                    </div>
                                    <h4>Bid and Win</h4>
                                    <p className="text-muted">Place your bids on items you're interested in and win auctions!</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
            
            {/* Testimonials Section */}
            <section className="testimonials py-5">
                <div className="container">
                    <h2 className="text-center mb-5">What Our Users Say</h2>
                    
                    <div className="row">
                        <div className="col-lg-4 mb-4">
                            <div className="card h-100 border-0 shadow-sm">
                                <div className="card-body p-4">
                                    <div className="d-flex mb-3">
                                        <i className="fas fa-star text-warning"></i>
                                        <i className="fas fa-star text-warning"></i>
                                        <i className="fas fa-star text-warning"></i>
                                        <i className="fas fa-star text-warning"></i>
                                        <i className="fas fa-star text-warning"></i>
                                    </div>
                                    <p className="card-text mb-3">"I've been using BidMaster for months now and have found some amazing collectibles. The bidding process is transparent and secure."</p>
                                    <div className="d-flex align-items-center">
                                        <div className="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center me-3" style={{ width: '50px', height: '50px' }}>JD</div>
                                        <div>
                                            <h6 className="mb-0">John Doe</h6>
                                            <small className="text-muted">Collector</small>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        <div className="col-lg-4 mb-4">
                            <div className="card h-100 border-0 shadow-sm">
                                <div className="card-body p-4">
                                    <div className="d-flex mb-3">
                                        <i className="fas fa-star text-warning"></i>
                                        <i className="fas fa-star text-warning"></i>
                                        <i className="fas fa-star text-warning"></i>
                                        <i className="fas fa-star text-warning"></i>
                                        <i className="fas fa-star text-warning"></i>
                                    </div>
                                    <p className="card-text mb-3">"As a seller, I've had great success with BidMaster. The platform makes it easy to list items and the bidding process is smooth."</p>
                                    <div className="d-flex align-items-center">
                                        <div className="rounded-circle bg-success text-white d-flex align-items-center justify-content-center me-3" style={{ width: '50px', height: '50px' }}>JS</div>
                                        <div>
                                            <h6 className="mb-0">Jane Smith</h6>
                                            <small className="text-muted">Seller</small>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        <div className="col-lg-4 mb-4">
                            <div className="card h-100 border-0 shadow-sm">
                                <div className="card-body p-4">
                                    <div className="d-flex mb-3">
                                        <i className="fas fa-star text-warning"></i>
                                        <i className="fas fa-star text-warning"></i>
                                        <i className="fas fa-star text-warning"></i>
                                        <i className="fas fa-star text-warning"></i>
                                        <i className="fas fa-star-half-alt text-warning"></i>
                                    </div>
                                    <p className="card-text mb-3">"The user interface is intuitive and the customer service is excellent. I've won several auctions and have been very satisfied with my purchases."</p>
                                    <div className="d-flex align-items-center">
                                        <div className="rounded-circle bg-info text-white d-flex align-items-center justify-content-center me-3" style={{ width: '50px', height: '50px' }}>RJ</div>
                                        <div>
                                            <h6 className="mb-0">Robert Johnson</h6>
                                            <small className="text-muted">Buyer</small>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
};
