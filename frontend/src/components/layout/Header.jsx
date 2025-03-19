const Header = () => {
  return (
    <header className="bg-white shadow-md py-4">
      <div className="container mx-auto px-4 flex justify-between items-center">
        <div className="text-2xl font-bold text-primary">Subject Line Pro</div>
        <div className="hidden md:block">
          <button className="bg-primary text-white px-4 py-2 rounded hover:bg-primary/80 transition-colors">
            Login
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
