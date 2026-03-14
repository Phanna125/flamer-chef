import { Link } from 'react-router-dom';
import { Search, User } from 'lucide-react';
import { externalProfiles } from '../data/siteLinks';
import './Navbar.css';

function Navbar() {
  return (
    <nav className="navbar">
      <div className="container nav-content">
        <Link to="/" className="logo">
          <div className="logo-icon"></div>
          <span className="logo-text">
            <span>Flamer</span>
            <span>&amp; Chef</span>
          </span>
        </Link>

        <div className="nav-links">
          <Link to="/" className="nav-link active">ម្ហូប</Link>
          <Link to="/search" className="nav-link">រុករក</Link>
          <a
            href={externalProfiles.portfolio}
            className="nav-link"
            target="_blank"
            rel="noreferrer"
          >
            អំពីខ្ញុំ
          </a>
        </div>

        <div className="nav-actions">
          <div className="nav-search">
            <Search size={18} className="search-icon" />
            <input type="text" placeholder="ស្វែងរកម្ហូប..." />
          </div>
          <Link to="/admin" className="user-btn" aria-label="Admin dashboard">
            <User size={20} />
          </Link>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
