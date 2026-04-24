import { useLocation } from "react-router-dom";
import { useEffect, useState, ReactNode } from "react";

interface PageTransitionProps {
  children: ReactNode;
}

const PageTransition = ({ children }: PageTransitionProps) => {
  const location = useLocation();
  const [displayLocation, setDisplayLocation] = useState(location);
  const [transitionStage, setTransitionStage] = useState("fade-in");

  useEffect(() => {
    // Trigger exit animation
    setTransitionStage("fade-out");
    
    // After exit animation, update location and trigger enter
    const timer = setTimeout(() => {
      setDisplayLocation(location);
      setTransitionStage("fade-in");
    }, 200);

    return () => clearTimeout(timer);
  }, [location.pathname]);

  return (
    <div
      className={`page-transition ${transitionStage}`}
      key={displayLocation.pathname}
    >
      {children}
    </div>
  );
};

export default PageTransition;