'use client';

import FullscreenShowcase from '@modules/FullscreenShowcase';
import React from 'react';
import FullscreenEffectContainer from '@components/effect/FullscreenEffectContainer';
import ThirdEffect from '@effects/ThirdEffect';

export default function Page() {
  return (
    <FullscreenShowcase>
      <FullscreenEffectContainer>
        <ThirdEffect />
      </FullscreenEffectContainer>
    </FullscreenShowcase>
  );
}
