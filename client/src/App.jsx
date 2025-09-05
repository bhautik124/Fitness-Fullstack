import React, { useEffect } from "react";
import Reg from "./components/Reg";
import Log from "./components/Log";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
} from "react-router-dom";
import Nav from "./components/Nav";
import Dashboard from "./components/Dashboard";
import Workout from "./components/Workout";
import Blog from "./components/Blog";
import Contect from "./components/Contect";
import Writeblog from "./components/Writeblog";
import { Helmet } from "react-helmet";

const App = () => {
  const location = useLocation();

  useEffect(() => {
    let pageTitle = "Fitness App";

    switch (location.pathname) {
      case "/":
        pageTitle = "Register - Fitness App";
        break;
      case "/login":
        pageTitle = "Login - Fitness App";
        break;
      case "/dashboard":
        pageTitle = "Dashboard - Fitness App";
        break;
      case "/workout":
        pageTitle = "Workouts - Fitness App";
        break;
      case "/blogs":
        pageTitle = "Blogs - Fitness App";
        break;
      case "/write":
        pageTitle = "Write a Blog - Fitness App";
        break;
      case "/contact":
        pageTitle = "Contact - Fitness App";
        break;
      default:
        pageTitle = "Fitness App";
    }

    document.title = pageTitle;
  }, [location.pathname]);

  return (
    <div className="w-full min-h-screen">
      <Helmet>
        <title>{document.title}</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </Helmet>

      {location.pathname !== "/" && location.pathname !== "/login" && <Nav />}

      <Routes>
        <Route path="/" element={<Reg />} />
        <Route path="/login" element={<Log />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/workout" element={<Workout />} />
        <Route path="/blogs" element={<Blog />} />
        <Route path="/write" element={<Writeblog />} />
        <Route path="/contact" element={<Contect />} />
      </Routes>
    </div>
  );
};

export default App;
