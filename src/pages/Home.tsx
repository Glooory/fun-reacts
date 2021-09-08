import React, { FC } from 'react';
// import { Link } from 'react-router-dom';
import Link from '../../packages/router/Link';

const Home: FC = () => {
  return (
    <div>
      <div>Home</div>
      <Link to="/heroes">Heroes</Link>
    </div>
  )
};

export default Home;
