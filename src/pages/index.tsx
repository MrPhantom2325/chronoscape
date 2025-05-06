import { useEffect, useState } from 'react';
import HoverZone from '../components/HoverZone';
import DragLens from '../components/DragLens';
import RiddleZone from '../components/RiddleZone';
import TextChallenge from '../components/TextChallenge';
import ResetButton from '../components/ResetButton';
import { useGameState } from '../utils/gameState';
import { REGIONS, HOVER_ZONES, RIDDLE_ZONES, LENS_ZONES } from '../utils/constants';
import styles from '../styles/Home.module.css';

// Helper functions for session storage
const getDiscoveredPlanets = (): string[] => {
  try {
    return JSON.parse(sessionStorage.getItem('discoveredPlanets') || '[]');
  } catch (error) {
    console.error('Error parsing discoveredPlanets:', error);
    return [];
  }
};

export default function Home() {
  const { litRegions, lightUpRegion, isGameComplete, lensType, unlockUVLens, allRegionsLit } = useGameState();
  const [showTextChallenge, setShowTextChallenge] = useState(false);
  const [showNextButton, setShowNextButton] = useState(false);
  const [finalMessage, setFinalMessage] = useState('');
  const [discoveredPlanets, setDiscoveredPlanets] = useState<string[]>([]);
  const [solvedRiddles, setSolvedRiddles] = useState<string[]>([]);

  // Track mouse position for lens
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  // Initialize session storage if needed
  useEffect(() => {
    // Make sure session storage is initialized
    if (!sessionStorage.getItem('hoveredSequence')) {
      sessionStorage.setItem('hoveredSequence', JSON.stringify([]));
    }
    if (!sessionStorage.getItem('discoveredPlanets')) {
      sessionStorage.setItem('discoveredPlanets', JSON.stringify([]));
    }
    if (!sessionStorage.getItem('solvedRiddles')) {
      sessionStorage.setItem('solvedRiddles', JSON.stringify([]));
    }
  }, []);

  // Monitor discovered planets from session storage
  useEffect(() => {
    const interval = setInterval(() => {
      const planets = getDiscoveredPlanets();
      setDiscoveredPlanets(planets);
      
      // Also get solved riddles
      try {
        const riddles = JSON.parse(sessionStorage.getItem('solvedRiddles') || '[]');
        setSolvedRiddles(riddles);
      } catch (error) {
        console.error('Error parsing solvedRiddles:', error);
      }
      
      // Debug log to see what's in session storage
      console.log('Discovered planets in session storage:', planets);
    }, 300);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePos({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // Check for stage progress
  useEffect(() => {
    // Show text challenge when all riddles are solved or 7 regions are lit
    if ((solvedRiddles.length >= 3 || litRegions.length >= 7) && !showTextChallenge) {
      setShowTextChallenge(true);
    }
    
    // Automatically unlock UV lens when 5 planets are discovered
    // if (discoveredPlanets.length >= 5 && !lensType.includes('uv')) {
    //   console.log('Unlocking UV lens based on discovered planets count');
    //   unlockUVLens();
    // }
  }, [discoveredPlanets, lensType, unlockUVLens, litRegions, showTextChallenge, solvedRiddles]);

  const handleChallengeComplete = () => {
    setFinalMessage("You've unlocked the secrets of the Chronoscape. The cosmic threads of time are now visible to you.");
    setShowNextButton(true);
  };
  
  const handleRiddleSolved = (regionId: string, riddleId: string) => {
    // Light up the region
    lightUpRegion(regionId);
    
    // Add to solved riddles
    const updatedSolvedRiddles = [...solvedRiddles, riddleId];
    setSolvedRiddles(updatedSolvedRiddles);
    
    // Update session storage
    sessionStorage.setItem('solvedRiddles', JSON.stringify(updatedSolvedRiddles));
    
    // Check if all riddles are solved
    if (updatedSolvedRiddles.length >= RIDDLE_ZONES.length && !showTextChallenge) {
      setShowTextChallenge(true);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.gameArea} style={{
        background: allRegionsLit ? 'url(/starfield-bg.jpg)' : 'black',
        transition: 'background 2s ease-in-out'
      }}>
        {/* Reset Button */}
        <ResetButton className={styles.resetButtonPosition} />
        
        {/* Debug info - remove in production */}
        <div style={{ position: 'absolute', top: '10px', left: '10px', color: 'white', zIndex: 1000 }}>
          Discovered Planets: {discoveredPlanets.length}
          <br />
          Planets: {discoveredPlanets.join(', ')}
          <br />
          Solved Riddles: {solvedRiddles.length}
        </div>
        
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
            onComplete={(regionId) => lightUpRegion(regionId)}
          />
        ))}
        
        {/* Render riddle zones - each with specific planet requirements */}
        {RIDDLE_ZONES.map(zone => (
          <RiddleZone
            key={zone.id}
            id={zone.id}
            x={zone.x}
            y={zone.y}
            width={zone.width}
            height={zone.height}
            riddle={zone.riddle}
            answer={zone.answer}
            region={zone.region}
            requiredPlanets={zone.requiredPlanets}
            onComplete={(regionId) => handleRiddleSolved(regionId, zone.id)}
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
// import ResetButton from '../components/ResetButton';
// import { useGameState } from '../utils/gameState';
// import { REGIONS, HOVER_ZONES, INK_ZONES, LENS_ZONES } from '../utils/constants';
// import styles from '../styles/Home.module.css';

// // Helper functions for session storage
// const getDiscoveredPlanets = (): string[] => {
//   try {
//     return JSON.parse(sessionStorage.getItem('discoveredPlanets') || '[]');
//   } catch (error) {
//     console.error('Error parsing discoveredPlanets:', error);
//     return [];
//   }
// };

// export default function Home() {
//   const { litRegions, lightUpRegion, isGameComplete, lensType, unlockUVLens, allRegionsLit } = useGameState();
//   const [showTextChallenge, setShowTextChallenge] = useState(false);
//   const [showNextButton, setShowNextButton] = useState(false);
//   const [finalMessage, setFinalMessage] = useState('');
//   const [discoveredPlanets, setDiscoveredPlanets] = useState<string[]>([]);

//   // Track mouse position for lens
//   const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

//   // Initialize session storage if needed
//   useEffect(() => {
//     // Make sure session storage is initialized
//     if (!sessionStorage.getItem('hoveredSequence')) {
//       sessionStorage.setItem('hoveredSequence', JSON.stringify([]));
//     }
//     if (!sessionStorage.getItem('discoveredPlanets')) {
//       sessionStorage.setItem('discoveredPlanets', JSON.stringify([]));
//     }
//   }, []);

//   // Monitor discovered planets from session storage
//   useEffect(() => {
//     const interval = setInterval(() => {
//       const planets = getDiscoveredPlanets();
//       setDiscoveredPlanets(planets);
      
//       // Debug log to see what's in session storage
//       console.log('Discovered planets in session storage:', planets);
//     }, 300);

//     return () => clearInterval(interval);
//   }, []);

//   useEffect(() => {
//     const handleMouseMove = (e: MouseEvent) => {
//       setMousePos({ x: e.clientX, y: e.clientY });
//     };

//     window.addEventListener('mousemove', handleMouseMove);
//     return () => window.removeEventListener('mousemove', handleMouseMove);
//   }, []);

//   // Check for stage progress
//   useEffect(() => {
//     // Show text challenge after 7 regions are lit
//     if (litRegions.length >= 7 && !showTextChallenge) {
//       setShowTextChallenge(true);
//     }
//   }, [discoveredPlanets, lensType, unlockUVLens, litRegions, showTextChallenge]);

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
//         {/* Reset Button */}
//         <ResetButton className={styles.resetButtonPosition} />
        
//         {/* Debug info - remove in production */}
//         <div style={{ position: 'absolute', top: '10px', left: '10px', color: 'white', zIndex: 1000 }}>
//           Discovered Planets: {discoveredPlanets.length}
//           <br />
//           Planets: {discoveredPlanets.join(', ')}
//         </div>
        
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
        
//         {/* Render ink zones - each with specific planet requirements */}
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
//             requiredPlanets={zone.requiredPlanets}
//             onComplete={(regionId) => lightUpRegion(regionId)}
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

// // import { useEffect, useState } from 'react';
// // import HoverZone from '../components/HoverZone';
// // import DragLens from '../components/DragLens';
// // import InkZone from '../components/InkZone';
// // import TextChallenge from '../components/TextChallenge';
// // import { useGameState } from '../utils/gameState';
// // import { REGIONS, HOVER_ZONES, INK_ZONES, LENS_ZONES } from '../utils/constants';
// // import styles from '../styles/Home.module.css';

// // // Helper functions for session storage
// // const getDiscoveredPlanets = (): string[] => {
// //   try {
// //     return JSON.parse(sessionStorage.getItem('discoveredPlanets') || '[]');
// //   } catch (error) {
// //     console.error('Error parsing discoveredPlanets:', error);
// //     return [];
// //   }
// // };

// // export default function Home() {
// //   const { litRegions, lightUpRegion, isGameComplete, lensType, unlockUVLens, allRegionsLit } = useGameState();
// //   const [showTextChallenge, setShowTextChallenge] = useState(false);
// //   const [showNextButton, setShowNextButton] = useState(false);
// //   const [finalMessage, setFinalMessage] = useState('');
// //   const [discoveredPlanets, setDiscoveredPlanets] = useState<string[]>([]);

// //   // Track mouse position for lens
// //   const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

// //   // Initialize session storage if needed
// //   useEffect(() => {
// //     // Make sure session storage is initialized
// //     if (!sessionStorage.getItem('hoveredSequence')) {
// //       sessionStorage.setItem('hoveredSequence', JSON.stringify([]));
// //     }
// //     if (!sessionStorage.getItem('discoveredPlanets')) {
// //       sessionStorage.setItem('discoveredPlanets', JSON.stringify([]));
// //     }
// //   }, []);

// //   // Monitor discovered planets from session storage
// //   useEffect(() => {
// //     const interval = setInterval(() => {
// //       const planets = getDiscoveredPlanets();
// //       setDiscoveredPlanets(planets);
      
// //       // Debug log to see what's in session storage
// //       console.log('Discovered planets in session storage:', planets);
// //     }, 300);

// //     return () => clearInterval(interval);
// //   }, []);

// //   useEffect(() => {
// //     const handleMouseMove = (e: MouseEvent) => {
// //       setMousePos({ x: e.clientX, y: e.clientY });
// //     };

// //     window.addEventListener('mousemove', handleMouseMove);
// //     return () => window.removeEventListener('mousemove', handleMouseMove);
// //   }, []);

// //   // Check for stage progress
// //   useEffect(() => {
// //     // Automatically unlock UV lens when 5 planets are discovered
// //     // if (discoveredPlanets.length >= 5 && !lensType.includes('uv')) {
// //     //   console.log('Unlocking UV lens based on discovered planets count');
// //     //   unlockUVLens();
// //     // }
    
// //     // Show text challenge after 7 regions are lit
// //     if (litRegions.length >= 7 && !showTextChallenge) {
// //       setShowTextChallenge(true);
// //     }
// //   }, [discoveredPlanets, lensType, unlockUVLens, litRegions, showTextChallenge]);

// //   const handleChallengeComplete = () => {
// //     setFinalMessage("You've unlocked the secrets of the Chronoscape. The cosmic threads of time are now visible to you.");
// //     setShowNextButton(true);
// //   };

// //   return (
// //     <div className={styles.container}>
// //       <div className={styles.gameArea} style={{
// //         background: allRegionsLit ? 'url(/starfield-bg.jpg)' : 'black',
// //         transition: 'background 2s ease-in-out'
// //       }}>
// //         {/* Debug info - remove in production */}
// //         <div style={{ position: 'absolute', top: '10px', left: '10px', color: 'white', zIndex: 1000 }}>
// //           Discovered Planets: {discoveredPlanets.length}
// //           <br />
// //           Planets: {discoveredPlanets.join(', ')}
// //         </div>
        
// //         {/* Render all regions */}
// //         {REGIONS.map(region => (
// //           <div 
// //             key={region.id} 
// //             className={`${styles.region} ${litRegions.includes(region.id) ? styles.litRegion : ''}`}
// //             style={{
// //               left: `${region.x}%`,
// //               top: `${region.y}%`,
// //               width: `${region.width}%`,
// //               height: `${region.height}%`,
// //             }}
// //           />
// //         ))}
        
// //         {/* Render hover zones */}
// //         {HOVER_ZONES.map(zone => (
// //           <HoverZone
// //             key={zone.id}
// //             id={zone.id}
// //             x={zone.x}
// //             y={zone.y}
// //             width={zone.width}
// //             height={zone.height}
// //             tooltip={zone.tooltip}
// //             sequence={zone.sequence}
// //             region={zone.region}
// //             onComplete={(regionId) => lightUpRegion(regionId)}
// //           />
// //         ))}
        
// //         {/* Render ink zones - each with specific planet requirements */}
// //         {INK_ZONES.map(zone => (
// //           <InkZone
// //             key={zone.id}
// //             id={zone.id}
// //             x={zone.x}
// //             y={zone.y}
// //             width={zone.width}
// //             height={zone.height}
// //             message={zone.message}
// //             region={zone.region}
// //             requiredPlanets={zone.requiredPlanets}
// //             onComplete={(regionId) => lightUpRegion(regionId)}
// //           />
// //         ))}
        
// //         {/* Draggable Lens Component */}
// //         <DragLens 
// //           x={mousePos.x} 
// //           y={mousePos.y} 
// //           lensType={lensType}
// //           onUncover={(regionId) => lightUpRegion(regionId)}
// //         />
        
// //         {/* Text challenge */}
// //         {showTextChallenge && (
// //           <TextChallenge 
// //             onComplete={handleChallengeComplete}
// //             className={styles.textChallenge}
// //           />
// //         )}
        
// //         {/* Final message and next button */}
// //         {finalMessage && (
// //           <div className={styles.finalMessage}>
// //             <p>{finalMessage}</p>
// //             {showNextButton && (
// //               <button className={styles.nextButton}>
// //                 Continue the Journey
// //               </button>
// //             )}
// //           </div>
// //         )}
// //       </div>
// //     </div>
// //   );
// // }

// // // import { useEffect, useState } from 'react';
// // // import HoverZone from '../components/HoverZone';
// // // import DragLens from '../components/DragLens';
// // // import InkZone from '../components/InkZone';
// // // import TextChallenge from '../components/TextChallenge';
// // // import { useGameState } from '../utils/gameState';
// // // import { REGIONS, HOVER_ZONES, INK_ZONES } from '../utils/constants';
// // // import styles from '../styles/Home.module.css';

// // // // Helper functions for session storage
// // // const getRegisteredRegions = (): string[] => {
// // //   try {
// // //     return JSON.parse(sessionStorage.getItem('registeredRegions') || '[]');
// // //   } catch (error) {
// // //     console.error('Error parsing registeredRegions:', error);
// // //     return [];
// // //   }
// // // };

// // // export default function Home() {
// // //   const { litRegions, lightUpRegion, isGameComplete, lensType, unlockUVLens, allRegionsLit } = useGameState();
// // //   const [showTextChallenge, setShowTextChallenge] = useState(false);
// // //   const [showNextButton, setShowNextButton] = useState(false);
// // //   const [finalMessage, setFinalMessage] = useState('');
// // //   const [registeredRegions, setRegisteredRegions] = useState<string[]>([]);
// // //   const [inkZonesActive, setInkZonesActive] = useState(false);

// // //   // Track mouse position for lens
// // //   const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

// // //   // Track hovered sequence in state
// // //   const [hoveredSequence, setHoveredSequence] = useState<string[]>([]);

// // //   // Initialize session storage if needed
// // //   useEffect(() => {
// // //     // Make sure session storage is initialized
// // //     if (!sessionStorage.getItem('hoveredSequence')) {
// // //       sessionStorage.setItem('hoveredSequence', JSON.stringify([]));
// // //     }
// // //     if (!sessionStorage.getItem('registeredRegions')) {
// // //       sessionStorage.setItem('registeredRegions', JSON.stringify([]));
// // //     }
// // //   }, []);

// // //   // Monitor registered regions from session storage
// // //   useEffect(() => {
// // //     const interval = setInterval(() => {
// // //       const regions = getRegisteredRegions();
// // //       setRegisteredRegions(regions);
      
// // //       // Debug log to see what's in session storage
// // //       console.log('Registered regions in session storage:', regions);
      
// // //       // Activate ink zones when 3 or more regions are registered
// // //       if (regions.length >= 3 && !inkZonesActive) {
// // //         console.log('Activating ink zones!');
// // //         setInkZonesActive(true);
// // //       }
// // //     }, 300);

// // //     return () => clearInterval(interval);
// // //   }, [inkZonesActive]);

// // //   useEffect(() => {
// // //     const handleMouseMove = (e: MouseEvent) => {
// // //       setMousePos({ x: e.clientX, y: e.clientY });
// // //     };

// // //     window.addEventListener('mousemove', handleMouseMove);
// // //     return () => window.removeEventListener('mousemove', handleMouseMove);
// // //   }, []);

// // //   // Check for stage progress
// // //   useEffect(() => {
// // //     // Automatically unlock UV lens when 3 hover regions are found
// // //     if (registeredRegions.length >= 3 && !lensType.includes('uv')) {
// // //       console.log('Unlocking UV lens based on registered regions count');
// // //       unlockUVLens();
// // //     }
    
// // //     // Show text challenge after 4 regions are lit
// // //     if (litRegions.length >= 4 && !showTextChallenge) {
// // //       setShowTextChallenge(true);
// // //     }
// // //   }, [registeredRegions, lensType, unlockUVLens, litRegions, showTextChallenge]);

// // //   const handleChallengeComplete = () => {
// // //     setFinalMessage("You've unlocked the secrets of the Chronoscape. The cosmic threads of time are now visible to you.");
// // //     setShowNextButton(true);
// // //   };

// // //   return (
// // //     <div className={styles.container}>
// // //       <div className={styles.gameArea} style={{
// // //         background: allRegionsLit ? 'url(/starfield-bg.jpg)' : 'black',
// // //         transition: 'background 2s ease-in-out'
// // //       }}>
// // //         {/* Debug info - remove in production */}
// // //         <div style={{ position: 'absolute', top: '10px', left: '10px', color: 'white', zIndex: 1000 }}>
// // //           Registered Regions: {registeredRegions.length}
// // //           <br />
// // //           Ink Zones Active: {inkZonesActive ? 'Yes' : 'No'}
// // //         </div>
        
// // //         {/* Render all regions */}
// // //         {REGIONS.map(region => (
// // //           <div 
// // //             key={region.id} 
// // //             className={`${styles.region} ${litRegions.includes(region.id) ? styles.litRegion : ''}`}
// // //             style={{
// // //               left: `${region.x}%`,
// // //               top: `${region.y}%`,
// // //               width: `${region.width}%`,
// // //               height: `${region.height}%`,
// // //             }}
// // //           />
// // //         ))}
        
// // //         {/* Render hover zones */}
// // //         {HOVER_ZONES.map(zone => (
// // //         <HoverZone
// // //           key={zone.id}
// // //           id={zone.id}
// // //           x={zone.x}
// // //           y={zone.y}
// // //           width={zone.width}
// // //           height={zone.height}
// // //           tooltip={zone.tooltip}
// // //           sequence={zone.sequence}
// // //           region={zone.region}
// // //           onComplete={(regionId) => {
// // //             lightUpRegion(regionId);
            
// // //             // Retrieve existing registered regions from session storage
// // //             const currentRegions = getRegisteredRegions();

// // //             // Add the new region if not already present
// // //             if (!currentRegions.includes(regionId)) {
// // //               const updatedRegions = [...currentRegions, regionId];
// // //               sessionStorage.setItem('registeredRegions', JSON.stringify(updatedRegions));
// // //               setRegisteredRegions(updatedRegions); // Update state
// // //             }
// // //           }}
// // //         />
// // //       ))}

// // //         {/* {HOVER_ZONES.map(zone => (
// // //           <HoverZone
// // //             key={zone.id}
// // //             id={zone.id}
// // //             x={zone.x}
// // //             y={zone.y}
// // //             width={zone.width}
// // //             height={zone.height}
// // //             tooltip={zone.tooltip}
// // //             sequence={zone.sequence}
// // //             region={zone.region}
// // //             onComplete={(regionId) => {
// // //               lightUpRegion(regionId);
// // //               setHoveredSequence(prev => [...prev, zone.id]);
// // //             }}
// // //           />
// // //         ))} */}
        
// // //         {/* Render ink zones - active when 3 hover regions are found */}
// // //         {INK_ZONES.map(zone => (
// // //           <InkZone
// // //             key={zone.id}
// // //             id={zone.id}
// // //             x={zone.x}
// // //             y={zone.y}
// // //             width={zone.width}
// // //             height={zone.height}
// // //             message={zone.message}
// // //             region={zone.region}
// // //             onComplete={(regionId) => lightUpRegion(regionId)}
// // //             active={inkZonesActive || registeredRegions.length >= 3}
// // //           />
// // //         ))}
        
// // //         {/* Draggable Lens Component */}
// // //         <DragLens 
// // //           x={mousePos.x} 
// // //           y={mousePos.y} 
// // //           lensType={lensType}
// // //           onUncover={(regionId) => lightUpRegion(regionId)}
// // //         />
        
// // //         {/* Text challenge */}
// // //         {showTextChallenge && (
// // //           <TextChallenge 
// // //             onComplete={handleChallengeComplete}
// // //             className={styles.textChallenge}
// // //           />
// // //         )}
        
// // //         {/* Final message and next button */}
// // //         {finalMessage && (
// // //           <div className={styles.finalMessage}>
// // //             <p>{finalMessage}</p>
// // //             {showNextButton && (
// // //               <button className={styles.nextButton}>
// // //                 Continue the Journey
// // //               </button>
// // //             )}
// // //           </div>
// // //         )}
// // //       </div>
// // //     </div>
// // //   );
// // // }


// // // import { useEffect, useState } from 'react';
// // // import HoverZone from '../components/HoverZone';
// // // import DragLens from '../components/DragLens';
// // // import InkZone from '../components/InkZone';
// // // import TextChallenge from '../components/TextChallenge';
// // // import { useGameState } from '../utils/gameState';
// // // import { REGIONS, HOVER_ZONES, INK_ZONES } from '../utils/constants';
// // // import styles from '../styles/Home.module.css';

// // // export default function Home() {
// // //   const { litRegions, lightUpRegion, isGameComplete, lensType, unlockUVLens, allRegionsLit } = useGameState();
// // //   const [showTextChallenge, setShowTextChallenge] = useState(false);
// // //   const [showNextButton, setShowNextButton] = useState(false);
// // //   const [finalMessage, setFinalMessage] = useState('');
  
// // //   // Track mouse position for lens
// // //   const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  
// // //   useEffect(() => {
// // //     const handleMouseMove = (e: MouseEvent) => {
// // //       setMousePos({ x: e.clientX, y: e.clientY });
// // //     };
    
// // //     window.addEventListener('mousemove', handleMouseMove);
// // //     return () => window.removeEventListener('mousemove', handleMouseMove);
// // //   }, []);
  
// // //   // Check for stage progress
// // //   useEffect(() => {
// // //     // Stage 2 begins after 3 hover zones are found
// // //     const hoveredRegions = HOVER_ZONES.filter(zone => 
// // //       litRegions.includes(zone.region));

// // //     // Unlock UV lens after 3 ink zones are revealed
// // //     if (hoveredRegions.length >= 3 && !lensType.includes('uv')) {
// // //       unlockUVLens();
// // //     }
    
// // //     // Show text challenge after 4 regions are lit
// // //     if (litRegions.length >= 4 && !showTextChallenge) {
// // //       setShowTextChallenge(true);
// // //     }
// // //   }, [litRegions, lensType, unlockUVLens, showTextChallenge]);
  
// // //   const handleChallengeComplete = () => {
// // //     setFinalMessage("You've unlocked the secrets of the Chronoscape. The cosmic threads of time are now visible to you.");
// // //     setShowNextButton(true);
// // //   };
  
// // //   return (
// // //     <div className={styles.container}>
// // //       <div className={styles.gameArea} style={{
// // //         background: allRegionsLit ? 'url(/starfield-bg.jpg)' : 'black',
// // //         transition: 'background 2s ease-in-out'
// // //       }}>
// // //         {/* Render all regions */}
// // //         {REGIONS.map(region => (
// // //           <div 
// // //             key={region.id} 
// // //             className={`${styles.region} ${litRegions.includes(region.id) ? styles.litRegion : ''}`}
// // //             style={{
// // //               left: `${region.x}%`,
// // //               top: `${region.y}%`,
// // //               width: `${region.width}%`,
// // //               height: `${region.height}%`,
// // //             }}
// // //           />
// // //         ))}
        
// // //         {/* Render hover zones */}
// // //         {HOVER_ZONES.map(zone => (
// // //           <HoverZone
// // //             key={zone.id}
// // //             id={zone.id}
// // //             x={zone.x}
// // //             y={zone.y}
// // //             width={zone.width}
// // //             height={zone.height}
// // //             tooltip={zone.tooltip}
// // //             sequence={zone.sequence}
// // //             region={zone.region}
// // //             onComplete={(regionId) => lightUpRegion(regionId)}
// // //           />
// // //         ))}
        
// // //         {/* Render ink zones - only active after 2 hover zones */}
// // //         {INK_ZONES.map(zone => (
// // //           <InkZone
// // //             key={zone.id}
// // //             id={zone.id}
// // //             x={zone.x}
// // //             y={zone.y}
// // //             width={zone.width}
// // //             height={zone.height}
// // //             message={zone.message}
// // //             region={zone.region}
// // //             //hoverDuration={zone.hoverDuration}
// // //             onComplete={(regionId) => lightUpRegion(regionId)}
// // //             //active={true}
// // //             active={litRegions.filter(r => 
// // //               HOVER_ZONES.some(hz => hz.region === r)
// // //             ).length >= 2}
// // //           />
// // //         ))}
        
// // //         {/* Draggable Lens Component */}
// // //         <DragLens 
// // //           x={mousePos.x} 
// // //           y={mousePos.y} 
// // //           lensType={lensType}
// // //           onUncover={(regionId) => lightUpRegion(regionId)}
// // //         />
        
// // //         {/* Text challenge */}
// // //         {showTextChallenge && (
// // //           <TextChallenge 
// // //             onComplete={handleChallengeComplete}
// // //             className={styles.textChallenge}
// // //           />
// // //         )}
        
// // //         {/* Final message and next button */}
// // //         {finalMessage && (
// // //           <div className={styles.finalMessage}>
// // //             <p>{finalMessage}</p>
// // //             {showNextButton && (
// // //               <button className={styles.nextButton}>
// // //                 Continue the Journey
// // //               </button>
// // //             )}
// // //           </div>
// // //         )}
// // //       </div>
// // //     </div>
// // //   );
// // // }