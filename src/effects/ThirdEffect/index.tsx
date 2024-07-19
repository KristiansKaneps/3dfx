import * as React from 'react';
import {useMemo, useRef, useState} from 'react';
import {misc} from 'maath';
import {
  BufferAttribute,
  Euler,
  InstancedMesh,
  Mesh,
  PlaneGeometry,
  Quaternion,
  ShaderMaterial,
  Texture,
  Vector2,
  Vector3,
} from 'three';
import * as THREE from 'three';
import {ThreeElements, useFrame, useThree} from '@react-three/fiber';
import {PerspectiveCamera} from '@react-three/drei';
import {createNoise3D} from 'simplex-noise';

import LightNormalMap from './images/bump_normal_map.png';

export default function ThirdEffect() {
  const cameraRef = useRef<THREE.PerspectiveCamera>(null!);
  const [camera] = useState(() => {
    const q = new Quaternion().setFromEuler(new Euler(-Math.PI / 2, 0, 0));
    const pos = new Vector3(0, 30, -10);
    return {q, pos};
  });

  return (
    <>
      <color attach='background' args={['#151221']} />
      <PerspectiveCamera
        ref={cameraRef}
        makeDefault
        position={camera.pos}
        quaternion={camera.q}
      />
      <ambientLight />
      <pointLight position={[0, 10, 10]} />
      <Plane cameraRef={cameraRef} position={[0, 0, 0]} />
    </>
  );
}

const createNoise = createNoise3D();

type PlaneProps = ThreeElements['instancedMesh'] & {
  radius?: number;
  gap?: number;
  width?: number;
  height?: number;
  depth?: number;
  scale?: number;
  cameraRef: React.MutableRefObject<THREE.PerspectiveCamera>;
};

function Plane({
  radius = 0.1,
  gap = 4,
  width = 160,
  height = 1,
  depth = 80,
  scale = 1,
  cameraRef,
  ...props
}: PlaneProps) {
  const ts = useThree();

  const ref = useRef<InstancedMesh>(null);

  const count = useMemo(() => width * height * depth, [width, height, depth]);

  const dim = useMemo(
    () => [
      width * scale * (gap + 1),
      height * scale * (gap + 1),
      depth * scale * (gap + 1),
    ],
    [width, height, depth, scale, gap],
  );

  const ixyzMaps = useMemo(
    () => [
      [
        [0, Math.max(1, width - 1)],
        [-dim[0] / 2, dim[0] / 2],
      ],
      [
        [0, Math.max(1, height - 1)],
        [-dim[1] / 2, dim[1] / 2],
      ],
      [
        [0, Math.max(1, depth - 1)],
        [-dim[2], 0],
      ],
    ],
    [dim, width, height, depth],
  );

  // const defaultColorGradient = useRef([new THREE.Color(0x3A6DFF), new THREE.Color(0x5247ff), new THREE.Color(0x6130FF)]).current;
  const defaultColorGradient = useRef([new THREE.Color(0x0000ff), new THREE.Color(0x00ff00), new THREE.Color(0xff0000)]).current;
  const temp = useRef(new THREE.Object3D()).current;

  const instanceHoverTime = useRef(
    {} as {
      [instanceId: number]: number;
    },
  );

  useFrame(({clock, mouse}) => {
    if (ref.current === null) return;
    const et = clock.getElapsedTime();

    for (let i = 0; i < count; i++) {
      const hoverTime = instanceHoverTime.current[i] || 0;
      const dt = et - hoverTime;

      const widthGroup = Math.ceil(width / 3);
      const colorIndex = (i % width) / 3 < widthGroup ? 0 : ((i % width) / 3 < widthGroup * 2 ? 1 : 2);
      const alpha = (i % widthGroup) / widthGroup;
      const defaultColor = defaultColorGradient[colorIndex].lerp(defaultColorGradient[Math.min(colorIndex + 1, 2)], alpha);

      let color = new THREE.Color(0x151221);
      color = color.lerp(defaultColor, Math.min(dt, 1));
      ref.current.setColorAt(i, color);
    }

    if (cameraRef.current) {
      const camera = cameraRef.current;
      ts.raycaster.setFromCamera(mouse, camera);

      const intersection = ts.raycaster.intersectObject(ref.current);

      if (intersection.length > 0) {
        const instanceId = intersection[0].instanceId;
        if (instanceId !== undefined) {
          const i = instanceId;
          instanceHoverTime.current[i] = et;

          const widthGroup = Math.ceil(width / 3);
          const colorIndex = (i % width) / 3 < widthGroup ? 0 : ((i % width) / 3 < widthGroup * 2 ? 1 : 2);
          const alpha = (instanceId % widthGroup) / widthGroup;
          const defaultColor = defaultColorGradient[colorIndex].lerp(defaultColorGradient[Math.min(colorIndex + 1, 2)], alpha);

          ref.current.setColorAt(instanceId, defaultColor);
          const left = instanceId - 1;
          const right = instanceId + 1;
          const up = instanceId - width;
          const down = instanceId + width;
          if (left > 0 && left % width !== width - 1) {
            instanceHoverTime.current[left] = et;
            ref.current.setColorAt(left, defaultColor);
          }
          if (right < count && right % width !== 0) {
            instanceHoverTime.current[right] = et;
            ref.current.setColorAt(right, defaultColor);
          }
          if (up > 0) {
            instanceHoverTime.current[up] = et;
            ref.current.setColorAt(up, defaultColor);
          }
          if (down < count) {
            instanceHoverTime.current[down] = et;
            ref.current.setColorAt(down, defaultColor);
          }
        }
      }
    }

    for (let ix = 0; ix < width; ix++) {
      let x = misc.remap(ix, ixyzMaps[0][0], ixyzMaps[0][1]);
      for (let iz = 0; iz < depth; iz++) {
        let z = misc.remap(iz, ixyzMaps[2][0], ixyzMaps[2][1]);
        for (let iy = 0; iy < height; iy++) {
          let y = misc.remap(iy, ixyzMaps[1][0], ixyzMaps[1][1]);

          const yMask = Math.pow(Math.abs(width / 2 - ix), 1.5);

          // y += (createNoise(ix, iz, et * 0.1) + 1) * yMask;

          temp.position.set(x, y, z).multiplyScalar(0.05);
          temp.updateMatrix();

          const i = ix + (iy + iz * height) * width;
          ref.current.setMatrixAt(i, temp.matrix);
        }
      }
    }

    if (ref.current.instanceColor) ref.current.instanceColor.needsUpdate = true;
    ref.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh
      ref={ref}
      scale={[1, 1, 1]}
      args={[undefined, undefined, count]}
      {...props}
    >
      <sphereGeometry args={[radius, 18, 18]} />
      {/*<meshLambertMaterial side={THREE.DoubleSide} />*/}
    </instancedMesh>
  );
}
