import * as React from 'react';
import {useEffect, useRef, useState} from 'react';
import {
  BufferAttribute,
  Euler,
  Mesh,
  PlaneGeometry,
  Quaternion,
  ShaderMaterial,
  Texture,
  Vector2,
  Vector3,
} from 'three';
import * as THREE from 'three';
import {ThreeElements, useFrame} from '@react-three/fiber';
import {PerspectiveCamera} from '@react-three/drei';
import {createNoise3D} from 'simplex-noise';

import VertexShader from './shaders/vertex.vsh';
import FragmentShader from './shaders/fragment.fsh';
import LightNormalMap from './images/bump_normal_map.png';

export default function SecondEffect() {
  const cameraRef = useRef<THREE.PerspectiveCamera>(null!);
  const [camera] = useState(() => {
    const q = new Quaternion().setFromEuler(new Euler(-Math.PI / 64, 0, 0));
    const pos = new Vector3(0, 1, 2);
    return {q, pos};
  });

  return (
    <>
      <color attach='background' args={['#000']} />
      <PerspectiveCamera
        ref={cameraRef}
        makeDefault
        position={camera.pos}
        quaternion={camera.q}
      />
      <Plane cameraPosition={camera.pos} position={[0, 0, 0]} />
    </>
  );
}

const createNoise = createNoise3D();

type PlaneProps = ThreeElements['mesh'] & {
  cameraPosition: Vector3;
  width?: number;
  depth?: number;
  scale?: number;
};

function Plane({
  cameraPosition,
  width = 180,
  depth = 1000,
  scale = 0.1,
  ...props
}: PlaneProps) {
  const mesh = useRef<Mesh>(null!);
  const ref = useRef<PlaneGeometry>(null);
  const materialRef = useRef<ShaderMaterial>(null);

  const uv = useRef(new Vector2()).current;
  const pos = useRef(new Vector3()).current;

  const lightNormalMapTexture = useRef<Texture>();
  useEffect(() => {
    const texture = new THREE.TextureLoader().load(LightNormalMap.src);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(1, 1);
    lightNormalMapTexture.current = texture;
    return () => {
      lightNormalMapTexture.current?.dispose();
    };
  }, []);

  useFrame(({clock}) => {
    if (ref.current === null || materialRef.current == null) return;

    const t = clock.getElapsedTime();
    const s = t * 0.1;

    materialRef.current.uniforms.eyePos.value = cameraPosition;
    materialRef.current.uniforms.time.value = t;
    materialRef.current.uniforms.lightNormalMap.value =
      lightNormalMapTexture.current;
    materialRef.current.uniforms.travel.value = t * 0.1;

    const attrLength = ref.current.attributes.position.count;
    for (let i = 0; i < attrLength; i++) {
      uv.fromBufferAttribute(ref.current.attributes.uv as BufferAttribute, i);

      const f = (0.5 - uv.x) * (0.5 - uv.x);
      const yMask = 2 * f;

      const h = (createNoise(uv.x * 4, uv.y * 4 + s, 0) + 1) * width * yMask;
      ref.current.attributes.position.setZ(i, h);
    }
    ref.current.computeVertexNormals();
    ref.current.attributes.position.needsUpdate = true;
  });

  // useHelper(mesh, VertexNormalsHelper, 0.1, 0x0000ff);

  return (
    <>
      <mesh position={[0, 10, -100]}>
        <circleGeometry args={[1, 32]} />
      </mesh>
      <mesh
        ref={mesh}
        rotation={[-Math.PI / 2, 0, 0]}
        scale={[scale, scale, scale]}
        receiveShadow
        frustumCulled
        {...props}
      >
        <planeGeometry ref={ref} args={[width, depth, width, depth]} />
        <shaderMaterial
          ref={materialRef}
          uniforms={THREE.UniformsUtils.merge([
            THREE.UniformsLib['lights'],
            {
              eyePos: {value: new Vector3(0, 0, 0)},
              time: {value: 0},
              travel: {value: 0},
              width: {value: width},
              depth: {value: depth},
              directionalLight: {
                value: {
                  color: new Vector3(1, 0.9, 1),
                  ambientIntensity: 0.05,
                  direction: new Vector3(0, -1, -2).normalize(),
                  diffuseIntensity: 0.25,
                },
              },
              material: {
                value: {
                  specularIntensity: 0.5,
                  specularPower: 48.0,
                },
              },
              pointLight: {
                value: {
                  color: new Vector3(1, 0.9, 1),
                  ambientIntensity: 0.05,
                  diffuseIntensity: 0.1,
                  position: new Vector3(0, 10, -100),
                  attenuation: {
                    constant: 1,
                    linear: 0.1,
                    exp: 0.01,
                  },
                },
              },
              lightNormalMap: {value: lightNormalMapTexture.current},
            },
          ])}
          vertexShader={VertexShader}
          fragmentShader={FragmentShader}
          depthTest
          depthFunc={THREE.LessEqualDepth}
          side={THREE.DoubleSide}
        />
      </mesh>
    </>
  );
}
