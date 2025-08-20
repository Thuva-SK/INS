// Update this page (the content is just a fallback if you fail to update the page)
import logo from '@/assets/log.png';

const Index = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-2 sm:px-0">
      <div className="text-center">
        <span className="mx-auto mb-6 w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-white shadow-elegant flex items-center justify-center overflow-hidden">
          <img src={logo} alt="INS Online College Logo" className="w-full h-auto object-cover" />
        </span>
        <h1 className="text-2xl sm:text-4xl font-bold mb-4">Welcome to Your Blank App</h1>
        <p className="text-base sm:text-xl text-muted-foreground">Start building your amazing project here!</p>
      </div>
    </div>
  );
};

export default Index;
