import { OrbitControls } from '@react-three/drei';


function Globe() {

}

function StormGlobe()
{
    
    return (
        <>
            <mesh>
                <sphereGeometry args={[1,64,64]} />
                <meshPhongMaterial />
            </mesh>
            <ambientLight intensity={0.1} />
            <directionalLight position={[0, 0, 5]} color="blue"/>
            <OrbitControls />
        </>
    )
}


export default StormGlobe;