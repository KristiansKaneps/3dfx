'use client';

import * as React from 'react';

import EffectContainer from '@components/effect/EffectContainer';

import FirstEffect from '@effects/FirstEffect';
import SecondEffect from '@effects/SecondEffect';
import ThirdEffect from '@effects/ThirdEffect';

import styles from './Showcase.module.scss';

export default function Showcase() {
  return (
    <div className={styles.container}>
      <div className={styles.main}>
        <EffectContainer title='First' href='/effect/first'>
          <FirstEffect />
        </EffectContainer>
        <EffectContainer title='Second' href='/effect/second'>
          <SecondEffect />
        </EffectContainer>
        <EffectContainer title='Third' href='/effect/third'>
          <ThirdEffect />
        </EffectContainer>
      </div>
    </div>
  );
}
