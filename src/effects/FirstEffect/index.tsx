import * as React from 'react';
import {type ComponentProps, useEffect, useMemo, useRef, useState} from 'react';
import {Euler, InstancedMesh, Quaternion, Vector3} from 'three';
import * as THREE from 'three';
import {ThreeElements, useFrame} from '@react-three/fiber';
import {PerspectiveCamera, Points} from '@react-three/drei';
import {misc, random} from 'maath';
import {createNoise3D} from 'simplex-noise';

export default function FirstEffect() {
  const cameraRef = useRef<THREE.PerspectiveCamera>(null!);
  const [camera] = useState(() => {
    const q = new Quaternion().setFromEuler(new Euler(-Math.PI / 64, 0, 0));
    const pos = new Vector3(0, 1, 1);
    return {q, pos};
  });

  return (
    <>
      <color attach='background' args={['#020300']} />
      <PerspectiveCamera
        ref={cameraRef}
        makeDefault
        position={camera.pos}
        quaternion={camera.q}
      />
      <ambientLight />
      <pointLight position={[0, 10, 10]} />
      {/*<Box position={[-1.2, 0, -45]} />*/}
      {/*<Box position={[1.2, 0, -45]} />*/}
      {/*<PointCloud position={[0, 0, 0]} />*/}
      <PlaneCloud position={[0, 0, 0]} />
    </>
  );
}

const createNoise = createNoise3D();

type PlaneCloudProps = Omit<ThreeElements['instancedMesh'], 'args'> & {
  radius?: number;
  gap?: number;
  width?: number;
  height?: number;
  depth?: number;
  scale?: number;
};

function PlaneCloud({
  radius = 0.01,
  gap = 8,
  width = 40,
  height = 1,
  depth = 80,
  scale = 1,
  ...props
}: PlaneCloudProps) {
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

  const temp = useRef(new THREE.Object3D()).current;
  useEffect(() => {
    if (ref.current === null) return;
    // Set positions
    for (let ix = 0; ix < width; ix++) {
      let x = misc.remap(ix, ixyzMaps[0][0], ixyzMaps[0][1]);
      for (let iz = 0; iz < depth; iz++) {
        let z = misc.remap(iz, ixyzMaps[2][0], ixyzMaps[2][1]);
        for (let iy = 0; iy < height; iy++) {
          let y = misc.remap(iy, ixyzMaps[1][0], ixyzMaps[1][1]);

          const yMask = Math.pow(Math.abs(width / 2 - ix), 1.5);

          y += (createNoise(ix, iz, 0) + 1) * yMask;

          temp.position.set(x, y, z).multiplyScalar(radius);
          temp.updateMatrix();

          const i = ix + (iy + iz * height) * width;
          ref.current.setMatrixAt(i, temp.matrix);
        }
      }
    }
    // Update the instance
    ref.current.instanceMatrix.needsUpdate = true;
  }, [temp, count, dim, ixyzMaps, radius, width, height, depth]);

  useFrame(({clock}) => {
    if (ref.current === null) return;
    const et = clock.getElapsedTime();

    for (let ix = 0; ix < width; ix++) {
      let x = misc.remap(ix, ixyzMaps[0][0], ixyzMaps[0][1]);
      for (let iz = 0; iz < depth; iz++) {
        let z = misc.remap(iz, ixyzMaps[2][0], ixyzMaps[2][1]);
        for (let iy = 0; iy < height; iy++) {
          let y = misc.remap(iy, ixyzMaps[1][0], ixyzMaps[1][1]);

          const yMask = Math.pow(Math.abs(width / 2 - ix), 1.5);

          y += (createNoise(ix, iz, et * 0.1) + 1) * yMask;

          temp.position.set(x, y, z).multiplyScalar(radius);
          temp.updateMatrix();

          const i = ix + (iy + iz * height) * width;
          ref.current.setMatrixAt(i, temp.matrix);
        }
      }
    }

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
      <meshLambertMaterial color='#ADFE00' side={THREE.DoubleSide} />
    </instancedMesh>
  );
}

const rotationAxis = new Vector3(0, 1, 0).normalize();
const q = new Quaternion();

function PointCloud(props: ComponentProps<typeof Points>) {
  const pointsRef = useRef<THREE.Points>(null!);
  const [{box, sphere, final}] = useState(() => {
    const box = random.inBox(new Float32Array(100_000), {sides: [15, 1, 5]});
    const sphere = random.inSphere(box.slice(0), {radius: 0.75});
    const final = box.slice(0) as Float32Array; // final buffer that will be used for the points mesh

    return {box, sphere, final};
  });

  useFrame(({clock}) => {
    const et = clock.getElapsedTime();

    // buffer.rotate(box, {
    //   q: q.setFromAxisAngle(rotationAxis, dt * Math.PI * 2),
    // });
    //
    // final.set(box);
  });

  return (
    <Points positions={final} stride={3} ref={pointsRef} {...props}>
      <pointsMaterial size={0.01} color='#ADFE00' />
    </Points>
  );
}

function Box(props: ThreeElements['mesh']) {
  const ref = useRef<THREE.Mesh>(null!);
  const [hovered, hover] = useState(false);
  const [clicked, click] = useState(false);
  useFrame((state, delta) => (ref.current.rotation.x += 0.01));
  return (
    <mesh
      {...props}
      ref={ref}
      scale={clicked ? 1.5 : 1}
      onClick={(event) => click(!clicked)}
      onPointerOver={(event) => hover(true)}
      onPointerOut={(event) => hover(false)}
    >
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial color={hovered ? 'hotpink' : 'orange'} />
    </mesh>
  );
}
