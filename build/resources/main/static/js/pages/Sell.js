/**
 * Sell page component for listing items for auction
 */
const Sell = () => {
    const [formData, setFormData] = React.useState({
        name: '',
        description: '',
        startingPrice: '',
        biddingEndTime: '',
        imageUrl: ''
    });
    
    const [error, setError] = React.useState('');
    const [success, setSuccess] = React.useState('');
    const [loading, setLoading] = React.useState(false);
    const [user, setUser] = React.useState(null);
    
    // Check if user is logged in
    React.useEffect(() => {
        const currentUser = API.auth.getCurrentUser();
        setUser(currentUser);
        
        // Redirect to login if not logged in
        if (!currentUser) {
            window.location.hash = '#/login';
        }
    }, []);
    
    // Set minimum date for bidding end time (tomorrow)
    const getMinDate = () => {
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        return tomorrow.toISOString().split('T')[0];
    };
    
    // Handle form input changes
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value
        });
    };
    
    // Handle form submission
    const handleSubmit = async (e) => {
        e.preventDefault();
        
        // Reset messages
        setError('');
        setSuccess('');
        
        // Validate form
        if (!formData.name || !formData.description || !formData.startingPrice || !formData.biddingEndTime) {
            setError('Please fill in all required fields');
            return;
        }
        
        if (parseFloat(formData.startingPrice) <= 0) {
            setError('Starting price must be greater than zero');
            return;
        }
        
        try {
            setLoading(true);
            
            // Format the item data
            const itemData = {
                name: formData.name,
                description: formData.description,
                startingPrice: parseFloat(formData.startingPrice),
                currentPrice: parseFloat(formData.startingPrice),
                biddingEndTime: new Date(formData.biddingEndTime).toISOString(),
                imageUrl: formData.imageUrl,
                seller: {
                    id: user.id
                }
            };
            
            // Submit the item to the API
            const response = await API.items.create(itemData);
            
            // Show success message
            setSuccess('Your item has been listed for auction!');
            
            // Reset form
            setFormData({
                name: '',
                description: '',
                startingPrice: '',
                biddingEndTime: '',
                imageUrl: ''
            });
            
            // Redirect to item page after a delay
            setTimeout(() => {
                window.location.hash = `#/item/${response.id}`;
            }, 2000);
            
        } catch (err) {
            console.error('Error listing item:', err);
            setError(err.message || 'Failed to list your item. Please try again.');
        } finally {
            setLoading(false);
        }
    };
    
    // If not logged in, show login prompt
    if (!user) {
        return (
            <div className="container py-5">
                <div className="alert alert-warning">
                    <i className="fas fa-exclamation-triangle me-2"></i>
                    You must be logged in to sell items. Please <a href="#/login">login</a> or <a href="#/register">register</a>.
                </div>
            </div>
        );
    }
    
    return (
        <div className="container py-5">
            <div className="row justify-content-center">
                <div className="col-lg-8">
                    <div className="card shadow-sm">
                        <div className="card-header bg-primary text-white">
                            <h2 className="h4 mb-0">
                                <i className="fas fa-tag me-2"></i>
                                List an Item for Auction
                            </h2>
                        </div>
                        <div className="card-body">
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
                                    <label htmlFor="name" className="form-label">Item Name *</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        id="name"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>
                                
                                <div className="mb-3">
                                    <label htmlFor="description" className="form-label">Description *</label>
                                    <textarea
                                        className="form-control"
                                        id="description"
                                        name="description"
                                        rows="4"
                                        value={formData.description}
                                        onChange={handleChange}
                                        required
                                    ></textarea>
                                    <div className="form-text">Provide detailed information about your item.</div>
                                </div>
                                
                                <div className="mb-3">
                                    <label htmlFor="startingPrice" className="form-label">Starting Price (₹) *</label>
                                    <input
                                        type="number"
                                        className="form-control"
                                        id="startingPrice"
                                        name="startingPrice"
                                        min="0.01"
                                        step="0.01"
                                        value={formData.startingPrice}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>
                                
                                <div className="mb-3">
                                    <label htmlFor="biddingEndTime" className="form-label">Auction End Date *</label>
                                    <input
                                        type="date"
                                        className="form-control"
                                        id="biddingEndTime"
                                        name="biddingEndTime"
                                        min={getMinDate()}
                                        value={formData.biddingEndTime}
                                        onChange={handleChange}
                                        required
                                    />
                                    <div className="form-text">The auction will end at 11:59 PM on this date.</div>
                                </div>
                                
                                <div className="mb-4">
                                    <label htmlFor="imageUrl" className="form-label">Image URL</label>
                                    <input
                                        type="url"
                                        className="form-control"
                                        id="imageUrl"
                                        name="imageUrl"
                                        placeholder="https://example.com/image.jpg"
                                        value={formData.imageUrl}
                                        onChange={handleChange}
                                    />
                                    <div className="form-text">Provide a URL to an image of your item. If left blank, a default image will be used.</div>
                                </div>
                                
                                <div className="d-grid">
                                    <button
                                        type="submit"
                                        className="btn btn-primary"
                                        disabled={loading}
                                    >
                                        {loading ? (
                                            <>
                                                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                                Listing Item...
                                            </>
                                        ) : (
                                            <>
                                                <i className="fas fa-gavel me-2"></i>
                                                List Item for Auction
                                            </>
                                        )}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
