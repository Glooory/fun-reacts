import React, { FC, useCallback, useEffect, useRef, useState } from 'react';
import { useHistory, useParams } from 'react-router-dom';
import { Hero, HEROES } from './HeroList';

const HeroDetail: FC = () => {
  const history = useHistory();
  const { heroId } = useParams<{ heroId: string }>();

  const heroRef = useRef<Hero>();
  const unblockRef = useRef<() => void>(() => {});
  const [shouldBlock, setShouldBlock] = useState(false);
  const [heroName, setHeroName] = useState('');

  const onHeroNameInputChange = useCallback((e) => {
    const newName = e.target.value;
    setHeroName(newName);

    if (heroRef && heroRef.current?.localized_name === newName) {
      if (shouldBlock) {
        setShouldBlock(false);
      }
    } else {
      if (!shouldBlock) {
        setShouldBlock(true);
      }
    }
  }, []);

  useEffect(() => {
    const currHero = HEROES.find(hero => String(hero.id) === heroId);
    if (currHero) {
      heroRef.current = currHero;
      setHeroName(currHero.localized_name);
    }
  }, [heroId]);

  useEffect(() => {
    if (!shouldBlock) return;
    // @ts-ignore
    unblockRef.current = history.block(({ retry }) => {
      const block = !confirm('Are you sure to leave?');

      if (!block) {
        if (unblockRef.current) {
          unblockRef.current();
        }
        retry();
      }

      return block;
    });
  }, [history, shouldBlock]);

  return (
    <div>
      <button onClick={history.goBack}>Back</button>
      <p>Hero Detail</p>
      <div>
        <span>Name:</span>
        <input value={heroName} onChange={onHeroNameInputChange} />
      </div>
    </div>
  )
}

export default HeroDetail;
