import * as React from 'react';
import {Canvas} from '@react-three/fiber';

import styles from './EffectContainer.module.scss';

export interface Props {
  title?: string;
  children: React.ReactNode;
}

export default function EffectContainer({title, children}: Props) {
  return (
    <div className={styles.container}>
      <h1 className={styles.title}>{title}</h1>
      <div className={styles.effectContainer}>
        <Canvas orthographic>{children}</Canvas>
      </div>
    </div>
  );
}
