import React from 'react';
import { Link } from 'react-router-dom';

const Home = () => {
  return (
    <div>
      <div>Home</div>
      <Link to="/heroes">Case List</Link>
    </div>
  )
};

export default Home;
