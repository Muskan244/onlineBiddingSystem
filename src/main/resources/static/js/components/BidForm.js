/**
 * BidForm component for placing bids on items
 */
const BidForm = ({ item, onBidPlaced }) => {
    const [amount, setAmount] = React.useState('');
    const [error, setError] = React.useState('');
    const [loading, setLoading] = React.useState(false);
    const [success, setSuccess] = React.useState('');
    const user = API.auth.getCurrentUser();
    
    // Minimum bid amount is the current price + 1 or the starting price if no current price
    const minBidAmount = item.currentPrice 
        ? parseFloat(item.currentPrice) + 1 
        : parseFloat(item.startingPrice);
    
    // Check if bidding has ended
    const isBiddingEnded = () => {
        if (!item.biddingEndTime) return false;
        
        const endTime = new Date(item.biddingEndTime);
        const now = new Date();
        
        return now > endTime;
    };
    
    // Check if the current user is the seller
    const isUserSeller = () => {
        return user && item.seller && user.id === item.seller.id;
    };
    
    const handleSubmit = async (e) => {
        e.preventDefault();
        
        // Reset states
        setError('');
        setSuccess('');
        
        // Validate user is logged in
        if (!user) {
            setError('You must be logged in to place a bid');
            return;
        }
        
        // Validate bidding hasn't ended
        if (isBiddingEnded()) {
            setError('Bidding has ended for this item');
            return;
        }
        
        // Validate user is not the seller
        if (isUserSeller()) {
            setError('You cannot bid on your own item');
            return;
        }
        
        // Validate bid amount
        const bidAmount = parseFloat(amount);
        if (isNaN(bidAmount) || bidAmount < minBidAmount) {
            setError(`Bid amount must be at least ₹{minBidAmount.toFixed(2)}`);
            return;
        }
        
        // Submit bid
        try {
            setLoading(true);
            
            const bidData = {
                itemId: item.id,
                userId: user.id,
                amount: bidAmount
            };
            
            const response = await API.bids.place(bidData);
            
            setSuccess('Your bid has been placed successfully!');
            setAmount('');
            
            // Send notification to the seller
            if (item.seller && item.seller.id) {
                console.log('Sending notification to seller:', item.seller.id);
                
                // Create notification data
                const notificationData = {
                    userId: item.seller.id,
                    message: `${user.name || 'Someone'} placed a bid of ₹${bidAmount.toFixed(2)} on your item "${item.name}"`,
                    link: `#/item/${item.id}`
                };
                
                // Store notification directly in localStorage for the seller
                const storageKey = `notifications_${item.seller.id}`;
                const existingNotifications = localStorage.getItem(storageKey);
                const notifications = existingNotifications ? JSON.parse(existingNotifications) : [];
                
                // Add new notification
                const newNotification = {
                    id: Date.now(),
                    message: notificationData.message,
                    timestamp: new Date().toISOString(),
                    read: false,
                    link: notificationData.link
                };
                
                notifications.unshift(newNotification);
                localStorage.setItem(storageKey, JSON.stringify(notifications));
                
                // Also dispatch event for real-time notification if seller is currently logged in
                const notificationEvent = new CustomEvent('newNotification', {
                    detail: notificationData
                });
                window.dispatchEvent(notificationEvent);
                console.log('Notification event dispatched');
            }
            
            // Call the callback function to update the parent component
            if (onBidPlaced) {
                onBidPlaced(response);
            }
        } catch (error) {
            setError(error.message || 'Failed to place bid');
        } finally {
            setLoading(false);
        }
    };
    
    // If bidding has ended or user is the seller, disable the form
    const isFormDisabled = !user || isBiddingEnded() || isUserSeller();
    
    return (
        <div className="bid-form">
            <h3>Place a Bid</h3>
            
            {!user && (
                <div className="alert alert-warning">
                    <i className="fas fa-exclamation-triangle me-2"></i>
                    You must be <a href="#/login">logged in</a> to place a bid.
                </div>
            )}
            
            {isBiddingEnded() && (
                <div className="alert alert-info">
                    <i className="fas fa-info-circle me-2"></i>
                    Bidding has ended for this item.
                </div>
            )}
            
            {isUserSeller() && (
                <div className="alert alert-info">
                    <i className="fas fa-info-circle me-2"></i>
                    You cannot bid on your own item.
                </div>
            )}
            
            {error && (
                <div className="alert alert-danger">
                    <i className="fas fa-exclamation-circle me-2"></i>
                    {error}
                </div>
            )}
            
            {success && (
                <div className="alert alert-success">
                    <i className="fas fa-check-circle me-2"></i>
                    {success}
                </div>
            )}
            
            <form onSubmit={handleSubmit}>
                <div className="mb-3">
                    <label htmlFor="bidAmount" className="form-label">
                        Your Bid Amount (minimum: ₹{minBidAmount.toFixed(2)})
                    </label>
                    <div className="input-group">
                        <span className="input-group-text">₹</span>
                        <input
                            type="number"
                            className="form-control"
                            id="bidAmount"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            min={minBidAmount}
                            step="0.01"
                            disabled={isFormDisabled || loading}
                            required
                        />
                    </div>
                </div>
                
                <button 
                    type="submit" 
                    className="btn btn-bid w-100"
                    disabled={isFormDisabled || loading}
                >
                    {loading ? (
                        <>
                            <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                            Processing...
                        </>
                    ) : (
                        <>
                            <i className="fas fa-gavel me-2"></i>
                            Place Bid
                        </>
                    )}
                </button>
            </form>
        </div>
    );
};
