'use client';

import * as React from 'react';

import styles from './FullscreenShowcase.module.scss';

export interface Props {
  children: React.ReactNode;
}

export default function FullscreenShowcase({children}: Props) {
  return (
    <div className={styles.container}>
      <div className={styles.main}>{children}</div>
    </div>
  );
}
