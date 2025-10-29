import React, { useContext } from "react";
import Navbar from "./Navbar";
import Sidebar from "./Sidebar";
import Footer from "./Footer";
import { AuthContext } from "../context/AuthContext";

const AppLayout = ({ children }) => {
  const { user } = useContext(AuthContext);
  return (
    <div className="layout">
      <Navbar />
      <div className="layout-row">
        <Sidebar role={user?.role} />
        <main className="app-content">
          {children}
          <Footer />
        </main>
      </div>
    </div>
  );
};

export default AppLayout;


