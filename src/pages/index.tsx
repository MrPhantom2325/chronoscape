import { useEffect, useState } from 'react';
import HoverZone from '../components/HoverZone';
import DragLens from '../components/DragLens';
import InkZone from '../components/InkZone';
import TextChallenge from '../components/TextChallenge';
import { useGameState } from '../utils/gameState';
import { REGIONS, HOVER_ZONES, INK_ZONES } from '../utils/constants';
import styles from '../styles/Home.module.css';

import { register } from '../components/HoverZone';
useEffect(() => { console.log('Regions Hovered Upon:', register);}, []);


export default function Home() {
  const { litRegions, lightUpRegion, isGameComplete, lensType, unlockUVLens, allRegionsLit } = useGameState();
  const [showTextChallenge, setShowTextChallenge] = useState(false);
  const [showNextButton, setShowNextButton] = useState(false);
  const [finalMessage, setFinalMessage] = useState('');
  
  // Track mouse position for lens
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  
  // Track hovered sequence in state
  const [hoveredSequence, setHoveredSequence] = useState<string[]>([]);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePos({ x: e.clientX, y: e.clientY });
    };
    
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);
  
  // Check for stage progress
  useEffect(() => {
    // Stage 2 begins after 3 hover zones are found
    const hoveredRegions = HOVER_ZONES.filter(zone => 
      litRegions.includes(zone.region));

    // Store the length of the hovered sequence
    const hoveredSequenceLength = hoveredSequence.length;

    // Unlock UV lens after 3 ink zones are revealed
    if (hoveredRegions.length >= 3 && !lensType.includes('uv')) {
      unlockUVLens();
    }
    
    // Show text challenge after 4 regions are lit
    if (litRegions.length >= 4 && !showTextChallenge) {
      setShowTextChallenge(true);
    }

    // You can now use hoveredSequenceLength as needed
    console.log('Hovered Sequence Length:', hoveredSequenceLength);
  }, [litRegions, hoveredSequence, lensType, unlockUVLens, showTextChallenge]);

  const handleChallengeComplete = () => {
    setFinalMessage("You've unlocked the secrets of the Chronoscape. The cosmic threads of time are now visible to you.");
    setShowNextButton(true);
  };
  
  return (
    <div className={styles.container}>
      <div className={styles.gameArea} style={{
        background: allRegionsLit ? 'url(/starfield-bg.jpg)' : 'black',
        transition: 'background 2s ease-in-out'
      }}>
        {/* Render all regions */}
        {REGIONS.map(region => (
          <div 
            key={region.id} 
            className={`${styles.region} ${litRegions.includes(region.id) ? styles.litRegion : ''}`}
            style={{
              left: `${region.x}%`,
              top: `${region.y}%`,
              width: `${region.width}%`,
              height: `${region.height}%`,
            }}
          />
        ))}
        
        {/* Render hover zones */}
        {HOVER_ZONES.map(zone => (
          <HoverZone
            key={zone.id}
            id={zone.id}
            x={zone.x}
            y={zone.y}
            width={zone.width}
            height={zone.height}
            tooltip={zone.tooltip}
            sequence={zone.sequence}
            region={zone.region}
            onComplete={(regionId) => {
              lightUpRegion(regionId);
              // Update hovered sequence
              setHoveredSequence(prev => [...prev, zone.id]);
            }}
          />
        ))}
        
        {/* Render ink zones - only active after hovered sequence length is greater than 5 */}
        {INK_ZONES.map(zone => (
          <InkZone
            key={zone.id}
            id={zone.id}
            x={zone.x}
            y={zone.y}
            width={zone.width}
            height={zone.height}
            message={zone.message}
            region={zone.region}
            onComplete={(regionId) => lightUpRegion(regionId)}
            active={register.length > 3} // Active if register length is more than 3
  
            //active={true}
            //active={hoveredSequence.length > 1}  /* Active condition based on hovered sequence length */
          />
        ))}
        
        {/* Draggable Lens Component */}
        <DragLens 
          x={mousePos.x} 
          y={mousePos.y} 
          lensType={lensType}
          onUncover={(regionId) => lightUpRegion(regionId)}
        />
        
        {/* Text challenge */}
        {showTextChallenge && (
          <TextChallenge 
            onComplete={handleChallengeComplete}
            className={styles.textChallenge}
          />
        )}
        
        {/* Final message and next button */}
        {finalMessage && (
          <div className={styles.finalMessage}>
            <p>{finalMessage}</p>
            {showNextButton && (
              <button className={styles.nextButton}>
                Continue the Journey
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}


// import { useEffect, useState } from 'react';
// import HoverZone from '../components/HoverZone';
// import DragLens from '../components/DragLens';
// import InkZone from '../components/InkZone';
// import TextChallenge from '../components/TextChallenge';
// import { useGameState } from '../utils/gameState';
// import { REGIONS, HOVER_ZONES, INK_ZONES } from '../utils/constants';
// import styles from '../styles/Home.module.css';

// export default function Home() {
//   const { litRegions, lightUpRegion, isGameComplete, lensType, unlockUVLens, allRegionsLit } = useGameState();
//   const [showTextChallenge, setShowTextChallenge] = useState(false);
//   const [showNextButton, setShowNextButton] = useState(false);
//   const [finalMessage, setFinalMessage] = useState('');
  
//   // Track mouse position for lens
//   const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  
//   useEffect(() => {
//     const handleMouseMove = (e: MouseEvent) => {
//       setMousePos({ x: e.clientX, y: e.clientY });
//     };
    
//     window.addEventListener('mousemove', handleMouseMove);
//     return () => window.removeEventListener('mousemove', handleMouseMove);
//   }, []);
  
//   // Check for stage progress
//   useEffect(() => {
//     // Stage 2 begins after 3 hover zones are found
//     const hoveredRegions = HOVER_ZONES.filter(zone => 
//       litRegions.includes(zone.region));

//     // Unlock UV lens after 3 ink zones are revealed
//     if (hoveredRegions.length >= 3 && !lensType.includes('uv')) {
//       unlockUVLens();
//     }
    
//     // Show text challenge after 4 regions are lit
//     if (litRegions.length >= 4 && !showTextChallenge) {
//       setShowTextChallenge(true);
//     }
//   }, [litRegions, lensType, unlockUVLens, showTextChallenge]);
  
//   const handleChallengeComplete = () => {
//     setFinalMessage("You've unlocked the secrets of the Chronoscape. The cosmic threads of time are now visible to you.");
//     setShowNextButton(true);
//   };
  
//   return (
//     <div className={styles.container}>
//       <div className={styles.gameArea} style={{
//         background: allRegionsLit ? 'url(/starfield-bg.jpg)' : 'black',
//         transition: 'background 2s ease-in-out'
//       }}>
//         {/* Render all regions */}
//         {REGIONS.map(region => (
//           <div 
//             key={region.id} 
//             className={`${styles.region} ${litRegions.includes(region.id) ? styles.litRegion : ''}`}
//             style={{
//               left: `${region.x}%`,
//               top: `${region.y}%`,
//               width: `${region.width}%`,
//               height: `${region.height}%`,
//             }}
//           />
//         ))}
        
//         {/* Render hover zones */}
//         {HOVER_ZONES.map(zone => (
//           <HoverZone
//             key={zone.id}
//             id={zone.id}
//             x={zone.x}
//             y={zone.y}
//             width={zone.width}
//             height={zone.height}
//             tooltip={zone.tooltip}
//             sequence={zone.sequence}
//             region={zone.region}
//             onComplete={(regionId) => lightUpRegion(regionId)}
//           />
//         ))}
        
//         {/* Render ink zones - only active after 2 hover zones */}
//         {INK_ZONES.map(zone => (
//           <InkZone
//             key={zone.id}
//             id={zone.id}
//             x={zone.x}
//             y={zone.y}
//             width={zone.width}
//             height={zone.height}
//             message={zone.message}
//             region={zone.region}
//             //hoverDuration={zone.hoverDuration}
//             onComplete={(regionId) => lightUpRegion(regionId)}
//             //active={true}
//             active={litRegions.filter(r => 
//               HOVER_ZONES.some(hz => hz.region === r)
//             ).length >= 2}
//           />
//         ))}
        
//         {/* Draggable Lens Component */}
//         <DragLens 
//           x={mousePos.x} 
//           y={mousePos.y} 
//           lensType={lensType}
//           onUncover={(regionId) => lightUpRegion(regionId)}
//         />
        
//         {/* Text challenge */}
//         {showTextChallenge && (
//           <TextChallenge 
//             onComplete={handleChallengeComplete}
//             className={styles.textChallenge}
//           />
//         )}
        
//         {/* Final message and next button */}
//         {finalMessage && (
//           <div className={styles.finalMessage}>
//             <p>{finalMessage}</p>
//             {showNextButton && (
//               <button className={styles.nextButton}>
//                 Continue the Journey
//               </button>
//             )}
//           </div>
//         )}
//       </div>
//     </div>
//   );
// }