import React, { FC } from 'react';
import { Link } from 'react-router-dom';

const heroes: number[] = Array(7).fill(1).map((v, i) => i);

const HeroList: FC = () => {
  return (
    <div>
      { heroes.map((caseId: number) => <div key={caseId}><Link to={`/hero/${caseId}`}>CASE {`${caseId + 1}`}</Link></div>) }
    </div>
  )
}

export default HeroList;
