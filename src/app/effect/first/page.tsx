'use client';

import FullscreenShowcase from '@modules/FullscreenShowcase';
import React from 'react';
import FullscreenEffectContainer from '@components/effect/FullscreenEffectContainer';
import FirstEffect from '@effects/FirstEffect';

export default function Page() {
  return (
    <FullscreenShowcase>
      <FullscreenEffectContainer>
        <FirstEffect />
      </FullscreenEffectContainer>
    </FullscreenShowcase>
  );
}
