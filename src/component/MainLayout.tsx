import React, { ReactNode } from "react";
import Header from "./Header"; // Assuming Header is in the same directory

interface MainLayoutProps {
  children: ReactNode;
  // onSettingsClick: () => void; // REMOVE THIS LINE
}

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  // REMOVE onSettingsClick
  return (
    <React.Fragment>
      <Header />
      <main
        id="main-content"
        className="container mx-auto p-4 min-h-[calc(100vh-200px)]"
      >
        {children}
      </main>
      <footer className="text-center text-gray-500 mt-8 py-4 border-t border-gray-200">
        <p>
          &copy; {new Date().getFullYear()} Einbürgerungstest Practice by
          Himanshu
        </p>
      </footer>
    </React.Fragment>
  );
};

export default MainLayout;
