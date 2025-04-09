/**
 * ItemCard component for displaying an item in a grid
 */
const ItemCard = ({ item }) => {
    // Format the current price with 2 decimal places using rupee symbol
    const formatPrice = (price) => {
        return price ? `₹${parseFloat(price).toFixed(2)}` : 'No bids yet';
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
            return `${diffDays} day${diffDays !== 1 ? 's' : ''} left`;
        } else if (diffHours > 0) {
            return `${diffHours} hour${diffHours !== 1 ? 's' : ''} left`;
        } else {
            return `${diffMinutes} minute${diffMinutes !== 1 ? 's' : ''} left`;
        }
    };
    
    // Process the image URL
    const getImageUrl = () => {
        if (!item.imageUrl) {
            return '/images/no-image.svg'; // Local fallback image
        }
        
        // Check if the image URL is a full URL or a relative path
        if (item.imageUrl.startsWith('http://') || item.imageUrl.startsWith('https://')) {
            return item.imageUrl;
        } else {
            // Assume it's a relative path to the images directory
            return `/images/${item.imageUrl}`;
        }
    };
    
    const imageUrl = getImageUrl();
    
    return (
        <div className="col-md-4 mb-4">
            <div className="card item-card">
                <img 
                    src={imageUrl} 
                    className="card-img-top" 
                    alt={item.name}
                />
                <div className="card-body">
                    <h5 className="card-title">{item.name}</h5>
                    <p className="card-text">
                        {item.description && item.description.length > 100
                            ? `${item.description.substring(0, 100)}...`
                            : item.description}
                    </p>
                    <div className="d-flex justify-content-between align-items-center mb-2">
                        <span className="price">
                            {formatPrice(item.currentPrice || item.startingPrice)}
                        </span>
                        <span className="time-left">
                            <i className="far fa-clock me-1"></i>
                            {calculateTimeLeft(item.biddingEndTime)}
                        </span>
                    </div>
                    <a href={`#/item/${item.id}`} className="btn btn-primary w-100">
                        View Details
                    </a>
                </div>
            </div>
        </div>
    );
};
