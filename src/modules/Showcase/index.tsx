'use client';

import * as React from 'react';

import EffectContainer from '@components/effect/EffectContainer';

import FirstEffect from '@effects/FirstEffect';
import SecondEffect from '@effects/SecondEffect';

import styles from './Showcase.module.scss';

export default function Showcase() {
  return (
    <div className={styles.container}>
      <div className={styles.main}>
        <EffectContainer title='First'>
          <FirstEffect />
        </EffectContainer>
        <EffectContainer title='Second'>
          <SecondEffect />
        </EffectContainer>
      </div>
    </div>
  );
}
