/**
 * Notification component for displaying notifications to users
 */
const Notification = () => {
    const [notifications, setNotifications] = React.useState([]);
    const [show, setShow] = React.useState(false);
    const [unreadCount, setUnreadCount] = React.useState(0);
    const user = API.auth.getCurrentUser();
    
    React.useEffect(() => {
        if (!user) return;
        
        // Load notifications from localStorage
        const loadNotifications = () => {
            console.log('Loading notifications for user:', user.id);
            const storedNotifications = localStorage.getItem(`notifications_${user.id}`);
            if (storedNotifications) {
                try {
                    const parsedNotifications = JSON.parse(storedNotifications);
                    console.log('Found notifications:', parsedNotifications.length);
                    setNotifications(parsedNotifications);
                    
                    // Count unread notifications
                    const unread = parsedNotifications.filter(n => !n.read).length;
                    setUnreadCount(unread);
                } catch (error) {
                    console.error('Error parsing notifications:', error);
                    localStorage.removeItem(`notifications_${user.id}`);
                }
            } else {
                console.log('No notifications found for user');
            }
        };
        
        loadNotifications();
        
        // Check for new notifications periodically
        const checkInterval = setInterval(loadNotifications, 5000);
        
        // Listen for new notifications
        const handleNewNotification = (e) => {
            console.log('Received notification event:', e.detail);
            if (!e.detail || !e.detail.userId || e.detail.userId !== user.id) {
                console.log('Notification not for current user');
                return;
            }
            
            console.log('Processing notification for current user');
            
            // Reload from localStorage to ensure we have the latest
            loadNotifications();
            
            // Show notification toast
            try {
                const toast = new bootstrap.Toast(document.getElementById('notificationToast'));
                document.getElementById('toastBody').textContent = e.detail.message;
                toast.show();
                console.log('Toast notification shown');
            } catch (error) {
                console.error('Error showing toast:', error);
            }
        };
        
        window.addEventListener('newNotification', handleNewNotification);
        
        // Also listen for auth changes
        const handleAuthChange = () => {
            const currentUser = API.auth.getCurrentUser();
            if (currentUser && currentUser.id !== user.id) {
                // User changed, reset notifications
                setNotifications([]);
                setUnreadCount(0);
                loadNotifications();
            }
        };
        
        window.addEventListener('authChange', handleAuthChange);
        
        return () => {
            window.removeEventListener('newNotification', handleNewNotification);
            window.removeEventListener('authChange', handleAuthChange);
        };
    }, [user]);
    
    const markAllAsRead = () => {
        if (!user) return;
        
        const updatedNotifications = notifications.map(n => ({ ...n, read: true }));
        setNotifications(updatedNotifications);
        setUnreadCount(0);
        
        // Update localStorage
        localStorage.setItem(`notifications_${user.id}`, JSON.stringify(updatedNotifications));
    };
    
    const markAsRead = (id) => {
        if (!user) return;
        
        const updatedNotifications = notifications.map(n => 
            n.id === id ? { ...n, read: true } : n
        );
        
        setNotifications(updatedNotifications);
        
        // Update unread count
        const unread = updatedNotifications.filter(n => !n.read).length;
        setUnreadCount(unread);
        
        // Update localStorage
        localStorage.setItem(`notifications_${user.id}`, JSON.stringify(updatedNotifications));
    };
    
    const formatTime = (timestamp) => {
        const date = new Date(timestamp);
        return date.toLocaleString();
    };
    
    if (!user) return null;
    
    return (
        <>
            {/* Notification Bell */}
            <li className="nav-item dropdown">
                <a 
                    className="nav-link position-relative" 
                    href="#" 
                    id="notificationDropdown" 
                    role="button" 
                    data-bs-toggle="dropdown" 
                    aria-expanded="false"
                    onClick={() => setShow(!show)}
                >
                    <i className="fas fa-bell"></i>
                    {unreadCount > 0 && (
                        <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">
                            {unreadCount}
                            <span className="visually-hidden">unread notifications</span>
                        </span>
                    )}
                </a>
                <div 
                    className={`dropdown-menu dropdown-menu-end notification-dropdown ${show ? 'show' : ''}`} 
                    aria-labelledby="notificationDropdown"
                    style={{ minWidth: '300px', maxHeight: '400px', overflowY: 'auto' }}
                >
                    <div className="d-flex justify-content-between align-items-center px-3 py-2 border-bottom">
                        <h6 className="mb-0">Notifications</h6>
                        {unreadCount > 0 && (
                            <button 
                                className="btn btn-sm text-primary" 
                                onClick={markAllAsRead}
                            >
                                Mark all as read
                            </button>
                        )}
                    </div>
                    
                    {notifications.length === 0 ? (
                        <div className="dropdown-item text-center text-muted py-3">
                            <i className="fas fa-bell-slash me-2"></i>
                            No notifications
                        </div>
                    ) : (
                        notifications.map(notification => (
                            <a 
                                key={notification.id} 
                                className={`dropdown-item py-2 ${notification.read ? '' : 'bg-light'}`}
                                href={notification.link || '#'}
                                onClick={() => markAsRead(notification.id)}
                            >
                                <div className="d-flex justify-content-between">
                                    <div className="notification-content">
                                        <p className="mb-1">{notification.message}</p>
                                        <small className="text-muted">{formatTime(notification.timestamp)}</small>
                                    </div>
                                    {!notification.read && (
                                        <span className="badge bg-primary rounded-pill align-self-start">New</span>
                                    )}
                                </div>
                            </a>
                        ))
                    )}
                </div>
            </li>
            
            {/* Toast for new notifications */}
            <div className="position-fixed bottom-0 end-0 p-3" style={{ zIndex: 11 }}>
                <div id="notificationToast" className="toast" role="alert" aria-live="assertive" aria-atomic="true">
                    <div className="toast-header">
                        <i className="fas fa-bell me-2 text-primary"></i>
                        <strong className="me-auto">New Notification</strong>
                        <small>Just now</small>
                        <button type="button" className="btn-close" data-bs-dismiss="toast" aria-label="Close"></button>
                    </div>
                    <div id="toastBody" className="toast-body">
                        You have a new notification.
                    </div>
                </div>
            </div>
        </>
    );
};
