import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import HomePage from './pages/HomePage';
import SearchResults from './pages/SearchResults';
import RecipeDetail from './pages/RecipeDetail';
import CookingMode from './pages/CookingMode';
import AdminPage from './pages/AdminPage';
import Footer from './components/Footer';
import { AuthProvider } from './context/AuthContext';
import { RecipesProvider } from './context/RecipesContext';

function App() {
  return (
    <AuthProvider>
      <RecipesProvider>
        <Router>
          <div className="app-container">
            <Navbar />
            <main className="main-content">
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/search" element={<SearchResults />} />
                <Route path="/recipe/:id" element={<RecipeDetail />} />
                <Route path="/cooking/:id" element={<CookingMode />} />
                <Route path="/admin" element={<AdminPage />} />
              </Routes>
            </main>
            <Footer />
          </div>
        </Router>
      </RecipesProvider>
    </AuthProvider>
  );
}

export default App;
