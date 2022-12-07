import * as React from 'react';
import {Canvas} from '@react-three/fiber';

import styles from './FullscreenEffectContainer.module.scss';

export interface Props {
  children: React.ReactNode;
}

export default function FullscreenEffectContainer({children}: Props) {
  return (
    <div className={styles.container}>
      <div className={styles.effectContainer}>
        <Canvas orthographic>{children}</Canvas>
      </div>
    </div>
  );
}
