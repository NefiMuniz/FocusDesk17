import { useEffect } from "react";

const Home = () => {
    useEffect(() => {
      document.title = "Home | FocusDesk17";
    }, []);

    return <div>Home</div>;
};
  

export default Home;