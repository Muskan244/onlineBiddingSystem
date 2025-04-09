/**
 * Main App component that handles routing
 */
const App = () => {
    const [currentPage, setCurrentPage] = React.useState('home');
    
    // Simple router function to determine which page to show
    const getPage = () => {
        const hash = window.location.hash || '#/';
        
        if (hash === '#/' || hash === '') {
            return <Home />;
        } else if (hash.startsWith('#/item/')) {
            return <ItemDetail />;
        } else if (hash === '#/login') {
            return <Login />;
        } else if (hash === '#/register') {
            return <Register />;
        } else if (hash === '#/profile') {
            return <Profile />;
        } else if (hash === '#/items') {
            return <Search />;
        } else if (hash === '#/sell') {
            return <Sell />;
        } else if (hash === '#/my-items') {
            return <MyItems />;
        } else {
            return <Home />;
        }
    };
    
    // Update current page when hash changes
    React.useEffect(() => {
        const handleHashChange = () => {
            setCurrentPage(window.location.hash);
        };
        
        window.addEventListener('hashchange', handleHashChange);
        
        return () => {
            window.removeEventListener('hashchange', handleHashChange);
        };
    }, []);
    
    return (
        <>
            <Navbar />
            <main className="content">
                {getPage()}
            </main>
            <Footer />
        </>
    );
};
