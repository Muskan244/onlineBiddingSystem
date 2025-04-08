/**
 * ItemDetail page component for displaying a single item and its bids
 */
const ItemDetail = () => {
    const [item, setItem] = React.useState(null);
    const [bids, setBids] = React.useState([]);
    const [loading, setLoading] = React.useState(true);
    const [error, setError] = React.useState('');
    
    // Get the item ID from the URL hash
    const getItemId = () => {
        const hash = window.location.hash;
        const match = hash.match(/#\/item\/(\d+)/);
        return match ? parseInt(match[1]) : null;
    };
    
    const itemId = getItemId();
    
    React.useEffect(() => {
        // Redirect if no item ID
        if (!itemId) {
            window.location.hash = '#/';
            return;
        }
        
        // Fetch item and its bids
        const fetchItemAndBids = async () => {
            try {
                setLoading(true);
                
                // Fetch item details
                const itemData = await API.items.getById(itemId);
                setItem(itemData);
                
                // Fetch bids for the item
                const bidsData = await API.bids.getByItemId(itemId);
                setBids(bidsData);
            } catch (error) {
                console.error('Error fetching item details:', error);
                setError('Failed to load item details. Please try again later.');
            } finally {
                setLoading(false);
            }
        };
        
        fetchItemAndBids();
    }, [itemId]);
    
    // Handle new bid placement
    const handleBidPlaced = (newBid) => {
        // Update the item with the new current price
        setItem({
            ...item,
            currentPrice: newBid.amount
        });
        
        // Add the new bid to the bids list
        setBids([newBid, ...bids]);
    };
    
    // Format the date for display
    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        
        const date = new Date(dateString);
        return date.toLocaleString();
    };
    
    // Calculate time left for bidding
    const calculateTimeLeft = (endTime) => {
        if (!endTime) return 'No end time set';
        
        const end = new Date(endTime);
        const now = new Date();
        
        if (now > end) return 'Bidding ended';
        
        const diffMs = end - now;
        const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
        const diffHours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
        
        if (diffDays > 0) {
            return `${diffDays} day${diffDays !== 1 ? 's' : ''}, ${diffHours} hour${diffHours !== 1 ? 's' : ''}`;
        } else if (diffHours > 0) {
            return `${diffHours} hour${diffHours !== 1 ? 's' : ''}, ${diffMinutes} minute${diffMinutes !== 1 ? 's' : ''}`;
        } else {
            return `${diffMinutes} minute${diffMinutes !== 1 ? 's' : ''}`;
        }
    };
    
    // Default image if none provided
    const imageUrl = item?.imageUrl || 'https://via.placeholder.com/600x400?text=No+Image';
    
    if (loading) {
        return (
            <div className="container py-5 text-center">
                <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Loading...</span>
                </div>
                <p className="mt-3">Loading item details...</p>
            </div>
        );
    }
    
    if (error) {
        return (
            <div className="container py-5">
                <div className="alert alert-danger" role="alert">
                    <i className="fas fa-exclamation-circle me-2"></i>
                    {error}
                </div>
                <div className="text-center mt-4">
                    <a href="#/" className="btn btn-primary">
                        <i className="fas fa-arrow-left me-2"></i>
                        Back to Home
                    </a>
                </div>
            </div>
        );
    }
    
    if (!item) {
        return (
            <div className="container py-5 text-center">
                <i className="fas fa-exclamation-triangle fa-3x text-warning mb-3"></i>
                <h3>Item Not Found</h3>
                <p className="text-muted">The item you're looking for doesn't exist or has been removed.</p>
                <a href="#/" className="btn btn-primary mt-3">
                    <i className="fas fa-arrow-left me-2"></i>
                    Back to Home
                </a>
            </div>
        );
    }
    
    return (
        <div className="container py-5">
            <div className="row">
                <div className="col-lg-8">
                    <div className="item-detail mb-4">
                        <img 
                            src={imageUrl} 
                            className="item-image mb-4" 
                            alt={item.name}
                        />
                        
                        <h1 className="item-title">{item.name}</h1>
                        
                        <div className="d-flex justify-content-between align-items-center mb-3">
                            <div className="item-price">
                                Current Bid: ${parseFloat(item.currentPrice || item.startingPrice).toFixed(2)}
                            </div>
                            <div className="item-time-left">
                                <i className="far fa-clock me-1"></i>
                                {calculateTimeLeft(item.biddingEndTime)}
                            </div>
                        </div>
                        
                        <div className="seller-info">
                            <strong>Seller:</strong> {item.seller ? item.seller.name : 'Unknown'}
                        </div>
                        
                        <div className="item-description">
                            <h4>Description</h4>
                            <p>{item.description || 'No description provided.'}</p>
                        </div>
                        
                        <div className="item-details mt-4">
                            <h4>Details</h4>
                            <ul className="list-group">
                                <li className="list-group-item d-flex justify-content-between align-items-center">
                                    <span>Starting Price:</span>
                                    <span>${parseFloat(item.startingPrice).toFixed(2)}</span>
                                </li>
                                <li className="list-group-item d-flex justify-content-between align-items-center">
                                    <span>Current Price:</span>
                                    <span>${parseFloat(item.currentPrice || item.startingPrice).toFixed(2)}</span>
                                </li>
                                <li className="list-group-item d-flex justify-content-between align-items-center">
                                    <span>Bidding Ends:</span>
                                    <span>{formatDate(item.biddingEndTime)}</span>
                                </li>
                                <li className="list-group-item d-flex justify-content-between align-items-center">
                                    <span>Total Bids:</span>
                                    <span>{bids.length}</span>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
                
                <div className="col-lg-4">
                    <BidForm item={item} onBidPlaced={handleBidPlaced} />
                    
                    <div className="bid-history">
                        <h3>Bid History</h3>
                        
                        {bids.length === 0 ? (
                            <div className="alert alert-info">
                                <i className="fas fa-info-circle me-2"></i>
                                No bids have been placed yet.
                            </div>
                        ) : (
                            <div className="table-responsive">
                                <table className="table table-striped">
                                    <thead>
                                        <tr>
                                            <th>Bidder</th>
                                            <th>Amount</th>
                                            <th>Time</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {bids.map(bid => (
                                            <tr key={bid.id}>
                                                <td>{bid.bidder ? bid.bidder.name : 'Unknown'}</td>
                                                <td>${parseFloat(bid.amount).toFixed(2)}</td>
                                                <td>{formatDate(bid.bidTime)}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};
