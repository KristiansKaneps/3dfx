'use client';

import FullscreenShowcase from '@modules/FullscreenShowcase';
import React from 'react';
import FullscreenEffectContainer from '@components/effect/FullscreenEffectContainer';
import SecondEffect from '@effects/SecondEffect';

export default function Page() {
  return (
    <FullscreenShowcase>
      <FullscreenEffectContainer>
        <SecondEffect />
      </FullscreenEffectContainer>
    </FullscreenShowcase>
  );
}
