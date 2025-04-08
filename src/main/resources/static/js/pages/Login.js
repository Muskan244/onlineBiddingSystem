/**
 * Login page component
 */
const Login = () => {
    const [email, setEmail] = React.useState('');
    const [password, setPassword] = React.useState('');
    const [error, setError] = React.useState('');
    const [loading, setLoading] = React.useState(false);
    
    // Check if user is already logged in
    React.useEffect(() => {
        const user = API.auth.getCurrentUser();
        if (user) {
            window.location.hash = '#/';
        }
    }, []);
    
    const handleSubmit = async (e) => {
        e.preventDefault();
        
        // Reset error
        setError('');
        
        // Validate form
        if (!email || !password) {
            setError('Please fill in all fields');
            return;
        }
        
        try {
            setLoading(true);
            
            // Attempt login
            const userData = await API.auth.login(email, password);
            
            // Dispatch custom event to notify other components about auth change
            window.dispatchEvent(new Event('authChange'));
            
            // Redirect to home page on success
            window.location.hash = '#/';
        } catch (error) {
            setError(error.message || 'Invalid email or password');
        } finally {
            setLoading(false);
        }
    };
    
    return (
        <div className="container py-5">
            <div className="auth-form">
                <h2>Login to Your Account</h2>
                
                {error && (
                    <div className="alert alert-danger">
                        <i className="fas fa-exclamation-circle me-2"></i>
                        {error}
                    </div>
                )}
                
                <form onSubmit={handleSubmit}>
                    <div className="mb-3">
                        <label htmlFor="email" className="form-label">Email Address</label>
                        <input
                            type="email"
                            className="form-control"
                            id="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>
                    
                    <div className="mb-4">
                        <label htmlFor="password" className="form-label">Password</label>
                        <input
                            type="password"
                            className="form-control"
                            id="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>
                    
                    <button 
                        type="submit" 
                        className="btn btn-primary"
                        disabled={loading}
                    >
                        {loading ? (
                            <>
                                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                Logging in...
                            </>
                        ) : (
                            <>
                                <i className="fas fa-sign-in-alt me-2"></i>
                                Login
                            </>
                        )}
                    </button>
                    
                    <div className="form-text">
                        Don't have an account? <a href="#/register">Register here</a>
                    </div>
                </form>
            </div>
        </div>
    );
};
