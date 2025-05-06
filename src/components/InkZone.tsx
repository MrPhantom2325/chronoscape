


import { useState } from 'react';
import styles from '../styles/Home.module.css';

interface InkZoneProps {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  message: string;
  region: string;
  onComplete: (regionId: string) => void;
  active: boolean;
}

const InkZone: React.FC<InkZoneProps> = ({
  id,
  x,
  y,
  width,
  height,
  message,
  region,
  onComplete,
  active
}) => {
  const [isRevealed, setIsRevealed] = useState(false);

  // Handle immediate reveal on hover
  const handleMouseEnter = () => {
    if (!isRevealed && active) {
      setIsRevealed(true);
      onComplete(region);
    }
  };

  // Only make the zone interactive if it's active
  const pointerEvents = active ? 'auto' : 'none';

  return (
    <div
      className={styles.inkZone}
      style={{
        left: `${x}%`,
        top: `${y}%`,
        width: `${width}%`,
        height: `${height}%`,
        pointerEvents,
      }}
      onMouseEnter={handleMouseEnter}
    >
      <div
        className={`${styles.inkMessage} ${isRevealed ? styles.inkRevealed : ''}`}
      >
        {message}
      </div>
    </div>
  );
};

export default InkZone;
