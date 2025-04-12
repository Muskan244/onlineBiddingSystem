/**
 * MyBids component for displaying a user's bid history
 */
const MyBids = () => {
    const [bids, setBids] = React.useState([]);
    const [loading, setLoading] = React.useState(true);
    const [error, setError] = React.useState('');
    const [user, setUser] = React.useState(null);

    React.useEffect(() => {
        const fetchUserBids = async () => {
            try {
                const currentUser = API.auth.getCurrentUser();
                setUser(currentUser);
                
                if (!currentUser) {
                    window.location.href = '#/login';
                    return;
                }
                
                setLoading(true);
                const userBids = await API.bids.getByUserId(currentUser.id);
                
                // Sort bids by date (newest first)
                const sortedBids = userBids.sort((a, b) => {
                    return new Date(b.bidTime) - new Date(a.bidTime);
                });
                
                setBids(sortedBids);
            } catch (error) {
                console.error('Error fetching bids:', error);
                setError('Failed to load your bids. Please try again later.');
            } finally {
                setLoading(false);
            }
        };
        
        fetchUserBids();
        
        // Listen for authentication changes
        const handleAuthChange = () => {
            fetchUserBids();
        };
        
        window.addEventListener('authChange', handleAuthChange);
        
        return () => {
            window.removeEventListener('authChange', handleAuthChange);
        };
    }, []);
    
    // Format the price with rupee symbol
    const formatPrice = (price) => {
        return price ? `₹${parseFloat(price).toFixed(2)}` : 'N/A';
    };
    
    // Format date for display
    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        
        const date = new Date(dateString);
        return date.toLocaleString();
    };
    
    // Check if user is winning the auction
    const isWinningBid = (bid) => {
        if (!bid.item) return false;
        
        const currentPrice = bid.item.currentPrice || bid.item.startingPrice;
        return parseFloat(bid.amount) >= parseFloat(currentPrice);
    };
    
    // Check if an auction has ended
    const isAuctionEnded = (endTime) => {
        if (!endTime) return false;
        return new Date(endTime) <= new Date();
    };
    
    // Get bid status text and class
    const getBidStatus = (bid) => {
        if (!bid.item) {
            return { text: 'Item Unavailable', className: 'text-muted' };
        }
        
        if (isAuctionEnded(bid.item.biddingEndTime)) {
            if (isWinningBid(bid)) {
                return { text: 'Won', className: 'text-success fw-bold' };
            } else {
                return { text: 'Lost', className: 'text-danger' };
            }
        } else {
            if (isWinningBid(bid)) {
                return { text: 'Winning', className: 'text-success' };
            } else {
                return { text: 'Outbid', className: 'text-warning' };
            }
        }
    };

    // If not logged in, show login prompt
    if (!user) {
        return (
            <div className="container py-5">
                <div className="alert alert-warning">
                    <i className="fas fa-exclamation-triangle me-2"></i>
                    You must be logged in to view your bids. Please <a href="#/login">login</a> or <a href="#/register">register</a>.
                </div>
            </div>
        );
    }

    return (
        <div className="container py-5">
            <h1 className="mb-4">My Bids</h1>
            
            {loading ? (
                <div className="text-center py-5">
                    <div className="spinner-border text-primary" role="status">
                        <span className="visually-hidden">Loading...</span>
                    </div>
                    <p className="mt-3">Loading your bids...</p>
                </div>
            ) : error ? (
                <div className="alert alert-danger" role="alert">
                    <i className="fas fa-exclamation-circle me-2"></i>
                    {error}
                </div>
            ) : bids.length === 0 ? (
                <div className="text-center py-5">
                    <i className="fas fa-gavel fa-3x mb-3 text-muted"></i>
                    <h3>You haven't placed any bids yet</h3>
                    <p className="text-muted mb-4">Start bidding on items to see your bid history here</p>
                    <a href="#/items" className="btn btn-primary">
                        <i className="fas fa-search me-2"></i>
                        Browse Items
                    </a>
                </div>
            ) : (
                <div className="table-responsive">
                    <table className="table table-striped table-hover">
                        <thead className="table-dark">
                            <tr>
                                <th>Item</th>
                                <th>Your Bid</th>
                                <th>Current Price</th>
                                <th>Bid Time</th>
                                <th>End Time</th>
                                <th>Status</th>
                                <th>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {bids.map(bid => {
                                const status = getBidStatus(bid);
                                return (
                                    <tr key={bid.id}>
                                        <td>
                                            {bid.item ? (
                                                <a href={`#/item/${bid.item.id}`} className="text-decoration-none">
                                                    {bid.item.name}
                                                </a>
                                            ) : (
                                                'Item Unavailable'
                                            )}
                                        </td>
                                        <td>{formatPrice(bid.amount)}</td>
                                        <td>
                                            {bid.item ? formatPrice(bid.item.currentPrice || bid.item.startingPrice) : 'N/A'}
                                        </td>
                                        <td>{formatDate(bid.bidTime)}</td>
                                        <td>
                                            {bid.item ? formatDate(bid.item.biddingEndTime) : 'N/A'}
                                        </td>
                                        <td>
                                            <span className={status.className}>
                                                {status.text}
                                            </span>
                                        </td>
                                        <td>
                                            {bid.item && !isAuctionEnded(bid.item.biddingEndTime) && (
                                                <a 
                                                    href={`#/item/${bid.item.id}`} 
                                                    className="btn btn-sm btn-outline-primary"
                                                >
                                                    <i className="fas fa-eye me-1"></i>
                                                    View
                                                </a>
                                            )}
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};
