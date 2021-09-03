import React, { FC } from 'react';
import { Link } from 'react-router-dom';

export interface Hero {
  name: string;
  id: number;
  localized_name: string;
}

export const HEROES: Hero[] = [
  {
    "name": "antimage",
    "id": 1,
    "localized_name": "Anti-Mage"
  },
  {
    "name": "axe",
    "id": 2,
    "localized_name": "Axe"
  },
  {
    "name": "bane",
    "id": 3,
    "localized_name": "Bane"
  },
  {
    "name": "bloodseeker",
    "id": 4,
    "localized_name": "Bloodseeker"
  },
  {
    "name": "crystal_maiden",
    "id": 5,
    "localized_name": "Crystal Maiden"
  },
  {
    "name": "drow_ranger",
    "id": 6,
    "localized_name": "Drow Ranger"
  },
  {
    "name": "earthshaker",
    "id": 7,
    "localized_name": "Earthshaker"
  },
  {
    "name": "juggernaut",
    "id": 8,
    "localized_name": "Juggernaut"
  },
  {
    "name": "mirana",
    "id": 9,
    "localized_name": "Mirana"
  },
]

const HeroList: FC = () => {
  return (
    <div>
      { HEROES.map((hero) => <div key={hero.id}><Link to={`/hero/${hero.id}`}>{hero.localized_name}</Link></div>) }
    </div>
  )
}

export default HeroList;
