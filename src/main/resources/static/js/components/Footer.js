/**
 * Footer component for the application
 */
const Footer = () => {
    const currentYear = new Date().getFullYear();
    
    return (
        <footer className="footer">
            <div className="container">
                <div className="row">
                    <div className="col-md-4 mb-4 mb-md-0">
                        <h5>BidMaster</h5>
                        <p>Your trusted platform for online bidding and auctions. Find unique items or sell your valuables to the highest bidder.</p>
                        <div className="social-icons">
                            <a href="#" title="Facebook"><i className="fab fa-facebook"></i></a>
                            <a href="#" title="Twitter"><i className="fab fa-twitter"></i></a>
                            <a href="#" title="Instagram"><i className="fab fa-instagram"></i></a>
                            <a href="#" title="LinkedIn"><i className="fab fa-linkedin"></i></a>
                        </div>
                    </div>
                    
                    <div className="col-md-2 mb-4 mb-md-0">
                        <h5>Links</h5>
                        <ul className="list-unstyled">
                            <li><a href="#/">Home</a></li>
                            <li><a href="#/items">Browse Items</a></li>
                            <li><a href="#/about">About Us</a></li>
                            <li><a href="#/contact">Contact</a></li>
                        </ul>
                    </div>
                    
                    <div className="col-md-3 mb-4 mb-md-0">
                        <h5>Categories</h5>
                        <ul className="list-unstyled">
                            <li><a href="#/category/electronics">Electronics</a></li>
                            <li><a href="#/category/collectibles">Collectibles</a></li>
                            <li><a href="#/category/fashion">Fashion</a></li>
                            <li><a href="#/category/home">Home & Garden</a></li>
                            <li><a href="#/category/art">Art</a></li>
                        </ul>
                    </div>
                    
                    <div className="col-md-3">
                        <h5>Contact Us</h5>
                        <ul className="list-unstyled">
                            <li><i className="fas fa-map-marker-alt me-2"></i> 123 Auction St, Bidding City</li>
                            <li><i className="fas fa-phone me-2"></i> (123) 456-7890</li>
                            <li><i className="fas fa-envelope me-2"></i> info@bidmaster.com</li>
                        </ul>
                    </div>
                </div>
                
                <div className="copyright">
                    <p>&copy; {currentYear} BidMaster. All rights reserved.</p>
                </div>
            </div>
        </footer>
    );
};
