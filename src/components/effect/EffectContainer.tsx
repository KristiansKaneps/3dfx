import * as React from 'react';
import Link from 'next/link';
import {Canvas} from '@react-three/fiber';
import {type Url} from 'url';

import styles from './EffectContainer.module.scss';

export interface Props {
  title?: string;
  href?: Url | string;
  children: React.ReactNode;
}

export default function EffectContainer({title, href = '/', children}: Props) {
  return (
    <Link className={styles.container} href={href}>
      <h1 className={styles.title}>{title}</h1>
      <div className={styles.effectContainer}>
        <Canvas orthographic>{children}</Canvas>
      </div>
    </Link>
  );
}
