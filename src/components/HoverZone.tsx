import { useState, useEffect } from 'react';
import styles from '../styles/Home.module.css';

interface HoverZoneProps {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  tooltip: string;
  sequence: number;
  region: string;
  onComplete: (regionId: string) => void;
}

// Track the global sequence state
let hoveredSequence: string[] = [];
export const register: string[] = []; // Exported array to store all hovered regions

const HoverZone: React.FC<HoverZoneProps> = ({
  id,
  x,
  y,
  width,
  height,
  tooltip,
  sequence,
  region,
  onComplete
}) => {
  const [isHovered, setIsHovered] = useState(false);
  
  // Handle hover sequence tracking
  const handleMouseEnter = () => {
    setIsHovered(true);

    // Clear sequence if hovering out of order
    if (hoveredSequence.length > 0 && hoveredSequence[hoveredSequence.length - 1] !== id) {
      const lastHoveredId = hoveredSequence[hoveredSequence.length - 1];
      const lastHoveredSequence = parseInt(lastHoveredId.split('-')[1] || '0');
      
      if (sequence !== lastHoveredSequence + 1) {
        hoveredSequence = [id];
        return;
      }
    }

    // Add to sequence
    if (!hoveredSequence.includes(id)) {
      hoveredSequence.push(id);
      
      // Add region to the register array if not already present
      if (!register.includes(region)) {
        register.push(region);
      }

      // Check if this completes a sequence
      const idsInSameRegion = hoveredSequence.filter(hid => 
        hid.startsWith(region.split('-')[0])
      );
      
      // If we have a complete sequence for this region
      if (idsInSameRegion.length >= 2) {
        onComplete(region);
        // Reset sequence after completion
        hoveredSequence = [];
      }
    }
  };
  
  const handleMouseLeave = () => {
    setIsHovered(false);
  };
  
  return (
    <div
      className={styles.hoverZone}
      style={{
        left: `${x}%`,
        top: `${y}%`,
        width: `${width}%`,
        height: `${height}%`,
      }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div className={styles.tooltip}>
        {tooltip}
      </div>
    </div>
  );
};

export default HoverZone;



// import { useState, useEffect } from 'react';
// import styles from '../styles/Home.module.css';

// interface HoverZoneProps {
//   id: string;
//   x: number;
//   y: number;
//   width: number;
//   height: number;
//   tooltip: string;
//   sequence: number;
//   region: string;
//   onComplete: (regionId: string) => void;
// }

// // Track the global sequence state
// let hoveredSequence: string[] = [];

// const HoverZone: React.FC<HoverZoneProps> = ({
//   id,
//   x,
//   y,
//   width,
//   height,
//   tooltip,
//   sequence,
//   region,
//   onComplete
// }) => {
//   const [isHovered, setIsHovered] = useState(false);
  
//   // Handle hover sequence tracking
//   const handleMouseEnter = () => {
//     setIsHovered(true);
    
//     // Clear sequence if hovering out of order
//     if (hoveredSequence.length > 0 && hoveredSequence[hoveredSequence.length - 1] !== id) {
//       const lastHoveredId = hoveredSequence[hoveredSequence.length - 1];
//       const lastHoveredSequence = parseInt(lastHoveredId.split('-')[1] || '0');
      
//       if (sequence !== lastHoveredSequence + 1) {
//         hoveredSequence = [id];
//         return;
//       }
//     }
    
//     // Add to sequence
//     if (!hoveredSequence.includes(id)) {
//       hoveredSequence.push(id);
      
//       // Check if this completes a sequence
//       const idsInSameRegion = hoveredSequence.filter(hid => 
//         hid.startsWith(region.split('-')[0])
//       );
      
//       // If we have a complete sequence for this region
//       if (idsInSameRegion.length >= 2) {
//         onComplete(region);
//         // Reset sequence after completion
//         hoveredSequence = [];
//       }
//     }
//   };
  
//   const handleMouseLeave = () => {
//     setIsHovered(false);
//   };
  
//   return (
//     <div
//       className={styles.hoverZone}
//       style={{
//         left: `${x}%`,
//         top: `${y}%`,
//         width: `${width}%`,
//         height: `${height}%`,
//       }}
//       onMouseEnter={handleMouseEnter}
//       onMouseLeave={handleMouseLeave}
//     >
//       <div className={styles.tooltip}>
//         {tooltip}
//       </div>
//     </div>
//   );
// };

// export default HoverZone;
