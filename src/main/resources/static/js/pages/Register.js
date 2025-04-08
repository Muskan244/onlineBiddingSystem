/**
 * Register page component
 */
const Register = () => {
    const [formData, setFormData] = React.useState({
        name: '',
        username: '',
        email: '',
        password: '',
        confirmPassword: ''
    });
    const [error, setError] = React.useState('');
    const [success, setSuccess] = React.useState('');
    const [loading, setLoading] = React.useState(false);
    
    // Check if user is already logged in
    React.useEffect(() => {
        const user = API.auth.getCurrentUser();
        if (user) {
            window.location.hash = '#/';
        }
    }, []);
    
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value
        });
    };
    
    const handleSubmit = async (e) => {
        e.preventDefault();
        
        // Reset messages
        setError('');
        setSuccess('');
        
        // Validate form
        if (!formData.name || !formData.username || !formData.email || !formData.password || !formData.confirmPassword) {
            setError('Please fill in all fields');
            return;
        }
        
        if (formData.password !== formData.confirmPassword) {
            setError('Passwords do not match');
            return;
        }
        
        if (formData.password.length < 6) {
            setError('Password must be at least 6 characters long');
            return;
        }
        
        try {
            setLoading(true);
            
            // Prepare data for API
            const userData = {
                name: formData.name,
                username: formData.username,
                email: formData.email,
                password: formData.password
            };
            
            // Attempt registration
            const response = await API.auth.register(userData);
            
            // Show success message
            setSuccess('Registration successful! You can now login.');
            
            // Reset form
            setFormData({
                name: '',
                username: '',
                email: '',
                password: '',
                confirmPassword: ''
            });
            
            // Redirect to login after a delay
            setTimeout(() => {
                window.location.hash = '#/login';
            }, 2000);
        } catch (error) {
            setError(error.message || 'Registration failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };
    
    return (
        <div className="container py-5">
            <div className="auth-form">
                <h2>Create an Account</h2>
                
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
                        <label htmlFor="name" className="form-label">Full Name</label>
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
                        <label htmlFor="username" className="form-label">Username</label>
                        <input
                            type="text"
                            className="form-control"
                            id="username"
                            name="username"
                            value={formData.username}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    
                    <div className="mb-3">
                        <label htmlFor="email" className="form-label">Email Address</label>
                        <input
                            type="email"
                            className="form-control"
                            id="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    
                    <div className="mb-3">
                        <label htmlFor="password" className="form-label">Password</label>
                        <input
                            type="password"
                            className="form-control"
                            id="password"
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            required
                        />
                        <div className="form-text">Password must be at least 6 characters long.</div>
                    </div>
                    
                    <div className="mb-4">
                        <label htmlFor="confirmPassword" className="form-label">Confirm Password</label>
                        <input
                            type="password"
                            className="form-control"
                            id="confirmPassword"
                            name="confirmPassword"
                            value={formData.confirmPassword}
                            onChange={handleChange}
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
                                Registering...
                            </>
                        ) : (
                            <>
                                <i className="fas fa-user-plus me-2"></i>
                                Register
                            </>
                        )}
                    </button>
                    
                    <div className="form-text">
                        Already have an account? <a href="#/login">Login here</a>
                    </div>
                </form>
            </div>
        </div>
    );
};
