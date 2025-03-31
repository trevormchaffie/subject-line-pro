// src/components/layout/Header.jsx
import { Link } from "react-router-dom";
import routes from "../../config/routeConfig";

const Header = () => {
  return (
    <header className="bg-white shadow-md py-4">
      <div className="container mx-auto px-4 flex justify-between items-center">
        <div className="text-2xl font-bold text-primary">Subject Line Pro</div>
        <div>
          <Link
            to={routes.public.login}
            className="bg-primary text-white px-4 py-2 rounded hover:bg-primary/80 transition-colors"
          >
            Admin Login
          </Link>
        </div>
      </div>
    </header>
  );
};

export default Header;
