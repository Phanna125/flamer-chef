import { createElement } from 'react';
import { Link } from 'react-router-dom';
import { Facebook, Github, Globe, Instagram, Mail, Music2 } from 'lucide-react';
import { externalProfiles, siteOwner } from '../data/siteLinks';
import './Footer.css';

const socialLinks = [
  { label: 'Facebook', href: externalProfiles.facebook, icon: Facebook },
  { label: 'Instagram', href: externalProfiles.instagram, icon: Instagram },
  { label: 'TikTok', href: externalProfiles.tiktok, icon: Music2 },
  { label: 'GitHub', href: externalProfiles.github, icon: Github },
  { label: 'Portfolio', href: externalProfiles.portfolio, icon: Globe },
];

const navigationLinks = [
  { label: 'ទំព័រដើម', to: '/' },
  { label: 'ស្វែងរកម្ហូប', to: '/search' },
  { label: 'Portfolio', href: externalProfiles.portfolio },
  { label: 'GitHub', href: externalProfiles.github },
];

const contactLinks = [
  { label: siteOwner.email, href: `mailto:${siteOwner.email}`, icon: Mail },
  { label: 'github.com/Phanna125', href: externalProfiles.github, icon: Github },
  { label: 'Portfolio Website', href: externalProfiles.portfolio, icon: Globe },
];

function Footer() {
  return (
    <footer className="footer-container">
      <div className="container footer-content">
        <div className="footer-col brand-col">
          <div className="footer-logo">
            <div className="logo-icon-small"></div>
            <span>Flamer &amp; Chef</span>
          </div>
          <p className="footer-description">
            Flamer &amp; Chef ជាវេទិការូបមន្តម្ហូបសម្រាប់អ្នកស្រឡាញ់ការធ្វើម្ហូបខ្មែរ និងចង់ស្វែងរក
            មុខម្ហូបថ្មីៗដែលងាយស្រួលធ្វើនៅផ្ទះ។
          </p>
          <p className="footer-owner">បង្កើតដោយ {siteOwner.name}</p>
          <div className="social-links">
            {socialLinks.map(({ label, href, icon }) => (
              <a
                key={label}
                href={href}
                className="social-circle"
                target="_blank"
                rel="noreferrer"
                aria-label={label}
                title={label}
              >
                {createElement(icon, { size: 18 })}
              </a>
            ))}
          </div>
        </div>

        <div className="footer-col links-col">
          <h4>រុករក</h4>
          <ul className="footer-link-list">
            {navigationLinks.map(({ label, to, href }) => (
              <li key={label}>
                {to ? (
                  <Link to={to}>{label}</Link>
                ) : (
                  <a href={href} target="_blank" rel="noreferrer">
                    {label}
                  </a>
                )}
              </li>
            ))}
          </ul>
        </div>

        <div className="footer-col links-col">
          <h4>ទំនាក់ទំនង</h4>
          <ul className="contact-list">
            {contactLinks.map(({ label, href, icon }) => (
              <li key={label}>
                <a href={href} className="contact-link" target="_blank" rel="noreferrer">
                  <span className="contact-icon">
                    {createElement(icon, { size: 16 })}
                  </span>
                  <span>{label}</span>
                </a>
              </li>
            ))}
          </ul>
        </div>

        <div className="footer-col subscribe-col">
          <h4>តាមដានខ្ញុំ</h4>
          <p className="footer-note">
            តាមដានការងារ UI/UX និងគម្រោងថ្មីៗរបស់ខ្ញុំតាមបណ្ដាញសង្គម ឬទាក់ទងមកខ្ញុំដោយផ្ទាល់។
          </p>
          <div className="footer-cta-group">
            <a
              href={externalProfiles.portfolio}
              target="_blank"
              rel="noreferrer"
              className="footer-pill-link"
            >
              មើល Portfolio
            </a>
            <a href={`mailto:${siteOwner.email}`} className="footer-pill-link footer-pill-secondary">
              ផ្ញើអ៊ីមែល
            </a>
          </div>
        </div>
      </div>

      <div className="container footer-bottom">
        <p>
          © {new Date().getFullYear()} Flamer &amp; Chef. បង្កើតដោយ {siteOwner.name} សម្រាប់អ្នកស្រឡាញ់ម្ហូបខ្មែរ។
        </p>
      </div>
    </footer>
  );
}

export default Footer;
