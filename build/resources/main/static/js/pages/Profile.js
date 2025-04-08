/**
 * Profile page component
 */
const Profile = () => {
    const [user, setUser] = React.useState(null);
    const [userItems, setUserItems] = React.useState([]);
    const [userBids, setUserBids] = React.useState([]);
    const [loading, setLoading] = React.useState(true);
    const [error, setError] = React.useState('');
    const [activeTab, setActiveTab] = React.useState('profile');
    
    React.useEffect(() => {
        // Check if user is logged in
        const currentUser = API.auth.getCurrentUser();
        if (!currentUser) {
            window.location.hash = '#/login';
            return;
        }
        
        // Fetch user data and related items/bids
        const fetchUserData = async () => {
            try {
                setLoading(true);
                
                // Get fresh user data
                const userData = await API.users.getById(currentUser.id);
                setUser(userData);
                
                // Get user's items (if they're a seller)
                if (userData.items) {
                    setUserItems(userData.items);
                }
                
                // Get user's bids
                if (userData.id) {
                    const bidsData = await API.bids.getByUserId(userData.id);
                    setUserBids(bidsData);
                }
            } catch (error) {
                console.error('Error fetching user data:', error);
                setError('Failed to load user data. Please try again later.');
            } finally {
                setLoading(false);
            }
        };
        
        fetchUserData();
    }, []);
    
    // Format the date for display
    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        
        const date = new Date(dateString);
        return date.toLocaleString();
    };
    
    if (loading) {
        return (
            <div className="container py-5 text-center">
                <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Loading...</span>
                </div>
                <p className="mt-3">Loading profile data...</p>
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
    
    if (!user) {
        return (
            <div className="container py-5 text-center">
                <i className="fas fa-exclamation-triangle fa-3x text-warning mb-3"></i>
                <h3>Not Logged In</h3>
                <p className="text-muted">Please log in to view your profile.</p>
                <a href="#/login" className="btn btn-primary mt-3">
                    <i className="fas fa-sign-in-alt me-2"></i>
                    Login
                </a>
            </div>
        );
    }
    
    return (
        <div className="container py-5">
            <div className="profile-page">
                <div className="profile-header">
                    <h2>{user.name}</h2>
                    <p className="text-muted">@{user.username}</p>
                </div>
                
                <ul className="nav nav-tabs" id="profileTabs" role="tablist">
                    <li className="nav-item" role="presentation">
                        <button 
                            className={`nav-link ${activeTab === 'profile' ? 'active' : ''}`} 
                            onClick={() => setActiveTab('profile')}
                        >
                            <i className="fas fa-user me-2"></i>
                            Profile
                        </button>
                    </li>
                    <li className="nav-item" role="presentation">
                        <button 
                            className={`nav-link ${activeTab === 'bids' ? 'active' : ''}`}
                            onClick={() => setActiveTab('bids')}
                        >
                            <i className="fas fa-gavel me-2"></i>
                            My Bids
                        </button>
                    </li>
                    <li className="nav-item" role="presentation">
                        <button 
                            className={`nav-link ${activeTab === 'items' ? 'active' : ''}`}
                            onClick={() => setActiveTab('items')}
                        >
                            <i className="fas fa-box me-2"></i>
                            My Items
                        </button>
                    </li>
                </ul>
                
                <div className="tab-content" id="profileTabsContent">
                    {/* Profile Tab */}
                    <div className={`tab-pane fade ${activeTab === 'profile' ? 'show active' : ''}`}>
                        <div className="card">
                            <div className="card-body">
                                <h5 className="card-title">Account Information</h5>
                                <div className="row mb-3">
                                    <div className="col-md-3 fw-bold">Name:</div>
                                    <div className="col-md-9">{user.name}</div>
                                </div>
                                <div className="row mb-3">
                                    <div className="col-md-3 fw-bold">Username:</div>
                                    <div className="col-md-9">{user.username}</div>
                                </div>
                                <div className="row mb-3">
                                    <div className="col-md-3 fw-bold">Email:</div>
                                    <div className="col-md-9">{user.email}</div>
                                </div>
                                <div className="row mb-3">
                                    <div className="col-md-3 fw-bold">Role:</div>
                                    <div className="col-md-9">{user.role || 'User'}</div>
                                </div>
                                <div className="row mb-3">
                                    <div className="col-md-3 fw-bold">Account Status:</div>
                                    <div className="col-md-9">
                                        {user.enabled ? (
                                            <span className="badge bg-success">Active</span>
                                        ) : (
                                            <span className="badge bg-warning">Inactive</span>
                                        )}
                                    </div>
                                </div>
                                <div className="text-end">
                                    <a href="#/edit-profile" className="btn btn-primary">
                                        <i className="fas fa-edit me-2"></i>
                                        Edit Profile
                                    </a>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    {/* Bids Tab */}
                    <div className={`tab-pane fade ${activeTab === 'bids' ? 'show active' : ''}`}>
                        <h5 className="mb-3">Your Bids</h5>
                        
                        {userBids.length === 0 ? (
                            <div className="alert alert-info">
                                <i className="fas fa-info-circle me-2"></i>
                                You haven't placed any bids yet.
                            </div>
                        ) : (
                            <div className="table-responsive">
                                <table className="table table-striped">
                                    <thead>
                                        <tr>
                                            <th>Item</th>
                                            <th>Bid Amount</th>
                                            <th>Bid Time</th>
                                            <th>Status</th>
                                            <th>Action</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {userBids.map(bid => (
                                            <tr key={bid.id}>
                                                <td>{bid.item ? bid.item.name : 'Unknown Item'}</td>
                                                <td>${parseFloat(bid.amount).toFixed(2)}</td>
                                                <td>{formatDate(bid.bidTime)}</td>
                                                <td>
                                                    {bid.item && bid.item.currentPrice === bid.amount ? (
                                                        <span className="badge bg-success">Highest Bid</span>
                                                    ) : (
                                                        <span className="badge bg-secondary">Outbid</span>
                                                    )}
                                                </td>
                                                <td>
                                                    <a href={`#/item/${bid.item ? bid.item.id : ''}`} className="btn btn-sm btn-primary">
                                                        View Item
                                                    </a>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                    
                    {/* Items Tab */}
                    <div className={`tab-pane fade ${activeTab === 'items' ? 'show active' : ''}`}>
                        <div className="d-flex justify-content-between align-items-center mb-3">
                            <h5>Your Items</h5>
                            <a href="#/sell" className="btn btn-success">
                                <i className="fas fa-plus me-2"></i>
                                List New Item
                            </a>
                        </div>
                        
                        {userItems.length === 0 ? (
                            <div className="alert alert-info">
                                <i className="fas fa-info-circle me-2"></i>
                                You haven't listed any items yet.
                            </div>
                        ) : (
                            <div className="row">
                                {userItems.map(item => (
                                    <ItemCard key={item.id} item={item} />
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};
