/**
 * MyItems component for managing user's own items
 */
const MyItems = () => {
    const [items, setItems] = React.useState([]);
    const [loading, setLoading] = React.useState(true);
    const [error, setError] = React.useState('');
    const [editItem, setEditItem] = React.useState(null);
    const [formData, setFormData] = React.useState({
        name: '',
        description: '',
        startingPrice: '',
        biddingEndTime: '',
        imageUrl: ''
    });
    const [formErrors, setFormErrors] = React.useState({});
    const [success, setSuccess] = React.useState('');

    React.useEffect(() => {
        fetchUserItems();
    }, []);

    // Fetch items created by the current user
    const fetchUserItems = async () => {
        try {
            setLoading(true);
            const user = API.auth.getCurrentUser();
            
            if (!user) {
                window.location.href = '#/login';
                return;
            }
            
            const allItems = await API.items.getAll();
            const userItems = allItems.filter(item => item.seller && item.seller.id === user.id);
            setItems(userItems);
        } catch (error) {
            console.error('Error fetching user items:', error);
            setError('Failed to load your items. Please try again later.');
        } finally {
            setLoading(false);
        }
    };

    // Handle edit button click
    const handleEdit = (item) => {
        setEditItem(item);
        setFormData({
            name: item.name,
            description: item.description,
            startingPrice: item.startingPrice,
            biddingEndTime: formatDateTimeForInput(item.biddingEndTime),
            imageUrl: item.imageUrl || ''
        });
        window.scrollTo(0, 0);
    };

    // Format date for datetime-local input
    const formatDateTimeForInput = (dateTimeStr) => {
        const date = new Date(dateTimeStr);
        return date.toISOString().slice(0, 16);
    };

    // Handle delete button click
    const handleDelete = async (itemId) => {
        if (!confirm('Are you sure you want to delete this item?')) {
            return;
        }
        
        try {
            await API.items.delete(itemId);
            setSuccess('Item deleted successfully');
            // Refresh the items list
            fetchUserItems();
            setTimeout(() => setSuccess(''), 3000);
        } catch (error) {
            console.error('Error deleting item:', error);
            setError('Failed to delete item. Please try again later.');
            setTimeout(() => setError(''), 3000);
        }
    };

    // Handle form input changes
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value
        });
    };

    // Validate form data
    const validateForm = () => {
        const errors = {};
        
        if (!formData.name.trim()) {
            errors.name = 'Item name is required';
        }
        
        if (!formData.description.trim()) {
            errors.description = 'Description is required';
        }
        
        if (!formData.startingPrice || isNaN(formData.startingPrice) || parseFloat(formData.startingPrice) <= 0) {
            errors.startingPrice = 'Starting price must be a positive number';
        }
        
        if (!formData.biddingEndTime) {
            errors.biddingEndTime = 'Bidding end time is required';
        } else {
            const endTime = new Date(formData.biddingEndTime);
            const now = new Date();
            if (endTime <= now) {
                errors.biddingEndTime = 'Bidding end time must be in the future';
            }
        }
        
        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    // Handle form submission
    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!validateForm()) {
            return;
        }
        
        try {
            const itemData = {
                ...editItem,
                name: formData.name,
                description: formData.description,
                startingPrice: parseFloat(formData.startingPrice),
                biddingEndTime: new Date(formData.biddingEndTime).toISOString(),
                imageUrl: formData.imageUrl,
                // Preserve the seller relationship
                seller: editItem.seller
            };
            
            await API.items.update(editItem.id, itemData);
            
            setSuccess('Item updated successfully!');
            setEditItem(null);
            setFormData({
                name: '',
                description: '',
                startingPrice: '',
                biddingEndTime: '',
                imageUrl: ''
            });
            
            // Refresh the items list
            fetchUserItems();
            
            setTimeout(() => setSuccess(''), 3000);
        } catch (error) {
            console.error('Update item error:', error);
            setError('Failed to update item. Please try again later.');
            setTimeout(() => setError(''), 3000);
        }
    };

    // Cancel editing
    const handleCancel = () => {
        setEditItem(null);
        setFormData({
            name: '',
            description: '',
            startingPrice: '',
            biddingEndTime: '',
            imageUrl: ''
        });
        setFormErrors({});
    };

    // Format the price with rupee symbol
    const formatPrice = (price) => {
        return price ? `₹${parseFloat(price).toFixed(2)}` : 'No bids yet';
    };

    // Check if an auction has ended
    const isAuctionEnded = (endTime) => {
        return new Date(endTime) <= new Date();
    };

    return (
        <div className="container py-5">
            <h1 className="mb-4">My Items</h1>
            
            {/* Edit Form */}
            {editItem && (
                <div className="card mb-5">
                    <div className="card-header bg-primary text-white">
                        <h5 className="mb-0">Edit Item</h5>
                    </div>
                    <div className="card-body">
                        {error && (
                            <div className="alert alert-danger" role="alert">
                                <i className="fas fa-exclamation-circle me-2"></i>
                                {error}
                            </div>
                        )}
                        
                        {success && (
                            <div className="alert alert-success" role="alert">
                                <i className="fas fa-check-circle me-2"></i>
                                {success}
                            </div>
                        )}
                        
                        <form onSubmit={handleSubmit}>
                            <div className="mb-3">
                                <label htmlFor="name" className="form-label">Item Name</label>
                                <input
                                    type="text"
                                    className={`form-control ${formErrors.name ? 'is-invalid' : ''}`}
                                    id="name"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                />
                                {formErrors.name && <div className="invalid-feedback">{formErrors.name}</div>}
                            </div>
                            
                            <div className="mb-3">
                                <label htmlFor="description" className="form-label">Description</label>
                                <textarea
                                    className={`form-control ${formErrors.description ? 'is-invalid' : ''}`}
                                    id="description"
                                    name="description"
                                    rows="3"
                                    value={formData.description}
                                    onChange={handleChange}
                                ></textarea>
                                {formErrors.description && <div className="invalid-feedback">{formErrors.description}</div>}
                            </div>
                            
                            <div className="mb-3">
                                <label htmlFor="startingPrice" className="form-label">Starting Price (₹)</label>
                                <input
                                    type="number"
                                    className={`form-control ${formErrors.startingPrice ? 'is-invalid' : ''}`}
                                    id="startingPrice"
                                    name="startingPrice"
                                    min="0.01"
                                    step="0.01"
                                    value={formData.startingPrice}
                                    onChange={handleChange}
                                />
                                {formErrors.startingPrice && <div className="invalid-feedback">{formErrors.startingPrice}</div>}
                            </div>
                            
                            <div className="mb-3">
                                <label htmlFor="biddingEndTime" className="form-label">Bidding End Time</label>
                                <input
                                    type="datetime-local"
                                    className={`form-control ${formErrors.biddingEndTime ? 'is-invalid' : ''}`}
                                    id="biddingEndTime"
                                    name="biddingEndTime"
                                    value={formData.biddingEndTime}
                                    onChange={handleChange}
                                />
                                {formErrors.biddingEndTime && <div className="invalid-feedback">{formErrors.biddingEndTime}</div>}
                            </div>
                            
                            <div className="mb-3">
                                <label htmlFor="imageUrl" className="form-label">Image URL (optional)</label>
                                <input
                                    type="url"
                                    className="form-control"
                                    id="imageUrl"
                                    name="imageUrl"
                                    value={formData.imageUrl}
                                    onChange={handleChange}
                                />
                                <div className="form-text">Enter a URL for an image of your item</div>
                            </div>
                            
                            <div className="d-flex gap-2">
                                <button type="submit" className="btn btn-primary">
                                    <i className="fas fa-save me-2"></i>
                                    Save Changes
                                </button>
                                <button type="button" className="btn btn-secondary" onClick={handleCancel}>
                                    <i className="fas fa-times me-2"></i>
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
            
            {/* Items List */}
            {loading ? (
                <div className="text-center py-5">
                    <div className="spinner-border text-primary" role="status">
                        <span className="visually-hidden">Loading...</span>
                    </div>
                    <p className="mt-3">Loading your items...</p>
                </div>
            ) : error && !editItem ? (
                <div className="alert alert-danger" role="alert">
                    <i className="fas fa-exclamation-circle me-2"></i>
                    {error}
                </div>
            ) : items.length === 0 ? (
                <div className="text-center py-5">
                    <i className="fas fa-box-open fa-3x mb-3 text-muted"></i>
                    <h3>You haven't listed any items yet</h3>
                    <p className="text-muted mb-4">Start selling by listing your first item</p>
                    <a href="#/sell" className="btn btn-primary">
                        <i className="fas fa-plus me-2"></i>
                        Sell an Item
                    </a>
                </div>
            ) : (
                <>
                    {!editItem && success && (
                        <div className="alert alert-success" role="alert">
                            <i className="fas fa-check-circle me-2"></i>
                            {success}
                        </div>
                    )}
                    
                    <div className="row">
                        {items.map(item => (
                            <div key={item.id} className="col-lg-6 mb-4">
                                <div className={`card h-100 ${isAuctionEnded(item.biddingEndTime) ? 'border-danger' : ''}`}>
                                    {isAuctionEnded(item.biddingEndTime) && (
                                        <div className="card-header bg-danger text-white">
                                            <i className="fas fa-clock me-2"></i>
                                            Auction Ended
                                        </div>
                                    )}
                                    <div className="row g-0">
                                        <div className="col-md-4">
                                            <img 
                                                src={item.imageUrl || 'https://via.placeholder.com/150?text=No+Image'} 
                                                className="img-fluid rounded-start h-100" 
                                                alt={item.name}
                                                style={{ objectFit: 'cover' }}
                                            />
                                        </div>
                                        <div className="col-md-8">
                                            <div className="card-body">
                                                <h5 className="card-title">{item.name}</h5>
                                                <p className="card-text text-truncate">{item.description}</p>
                                                <p className="card-text">
                                                    <small className="text-muted">Current Price: </small>
                                                    <strong>{formatPrice(item.currentPrice || item.startingPrice)}</strong>
                                                </p>
                                                <p className="card-text">
                                                    <small className="text-muted">Ends: </small>
                                                    <span>{new Date(item.biddingEndTime).toLocaleString()}</span>
                                                </p>
                                                <div className="d-flex gap-2 mt-3">
                                                    <button 
                                                        className="btn btn-sm btn-primary" 
                                                        onClick={() => handleEdit(item)}
                                                        disabled={isAuctionEnded(item.biddingEndTime)}
                                                    >
                                                        <i className="fas fa-edit me-1"></i>
                                                        Edit
                                                    </button>
                                                    <button 
                                                        className="btn btn-sm btn-danger" 
                                                        onClick={() => handleDelete(item.id)}
                                                    >
                                                        <i className="fas fa-trash me-1"></i>
                                                        Delete
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </>
            )}
        </div>
    );
};
