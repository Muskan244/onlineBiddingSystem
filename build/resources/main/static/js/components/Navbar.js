/**
 * Navbar component for the application
 */
const Navbar = () => {
    const [user, setUser] = React.useState(null);
    
    // Function to check and update user login status
    const checkUserStatus = () => {
        const currentUser = API.auth.getCurrentUser();
        setUser(currentUser);
    };
    
    React.useEffect(() => {
        // Check if user is logged in when component mounts
        checkUserStatus();
        
        // Add event listener for storage changes (for when user logs in/out in another tab)
        window.addEventListener('storage', (e) => {
            if (e.key === 'user') {
                checkUserStatus();
            }
        });
        
        // Add custom event listener for auth changes
        window.addEventListener('authChange', checkUserStatus);
        
        // Check user status every 30 seconds
        const interval = setInterval(checkUserStatus, 30000);
        
        return () => {
            window.removeEventListener('storage', checkUserStatus);
            window.removeEventListener('authChange', checkUserStatus);
            clearInterval(interval);
        };
    }, []);
    
    const handleLogout = (e) => {
        e.preventDefault();
        API.auth.logout();
        // Update the user state immediately
        setUser(null);
        // Dispatch custom event to notify other components
        window.dispatchEvent(new Event('authChange'));
        // Redirect to home page
        window.location.href = '#/';
    };
    
    return (
        <nav className="navbar navbar-expand-lg navbar-dark">
            <div className="container">
                <a className="navbar-brand" href="#/">
                    <i className="fas fa-gavel me-2"></i>
                    BidMaster
                </a>
                
                <button 
                    className="navbar-toggler" 
                    type="button" 
                    data-bs-toggle="collapse" 
                    data-bs-target="#navbarNav"
                >
                    <span className="navbar-toggler-icon"></span>
                </button>
                
                <div className="collapse navbar-collapse" id="navbarNav">
                    <ul className="navbar-nav me-auto">
                        <li className="nav-item">
                            <a className="nav-link" href="#/">Home</a>
                        </li>
                        <li className="nav-item">
                            <a className="nav-link" href="#/items">Browse Items</a>
                        </li>
                    </ul>
                    
                    <ul className="navbar-nav">
                        {user ? (
                            <>
                                <li className="nav-item dropdown">
                                    <a className="nav-link dropdown-toggle" href="#" id="navbarDropdown" role="button" data-bs-toggle="dropdown" aria-expanded="false">
                                        <i className="fas fa-user-circle me-1"></i>
                                        {user.name || user.username || 'My Account'}
                                    </a>
                                    <ul className="dropdown-menu dropdown-menu-end" aria-labelledby="navbarDropdown">
                                        <li>
                                            <a className="dropdown-item" href="#/profile">
                                                <i className="fas fa-user me-2"></i>
                                                My Profile
                                            </a>
                                        </li>
                                        <li>
                                            <a className="dropdown-item" href="#/my-bids">
                                                <i className="fas fa-gavel me-2"></i>
                                                My Bids
                                            </a>
                                        </li>
                                        <li><hr className="dropdown-divider" /></li>
                                        <li>
                                            <a className="dropdown-item text-danger" href="#" onClick={handleLogout}>
                                                <i className="fas fa-sign-out-alt me-2"></i>
                                                Logout
                                            </a>
                                        </li>
                                    </ul>
                                </li>
                            </>
                        ) : (
                            <>
                                <li className="nav-item">
                                    <a className="nav-link" href="#/login">
                                        <i className="fas fa-sign-in-alt me-1"></i>
                                        Login
                                    </a>
                                </li>
                                <li className="nav-item">
                                    <a className="nav-link" href="#/register">
                                        <i className="fas fa-user-plus me-1"></i>
                                        Register
                                    </a>
                                </li>
                            </>
                        )}
                    </ul>
                </div>
            </div>
        </nav>
    );
};
