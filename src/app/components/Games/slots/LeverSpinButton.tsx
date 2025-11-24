import React, { useState } from 'react';
import './LeverSpinButton.scss';

interface LeverSpinButtonProps {
  disabled: boolean;
  onSpin: () => void;
}

const LeverSpinButton: React.FC<LeverSpinButtonProps> = ({ disabled, onSpin }) => {
  const [animating, setAnimating] = useState(false);

  const handleClick = () => {
    if (disabled || animating) return;

    setAnimating(true);

    setTimeout(() => {
      setAnimating(false);
      onSpin();
    }, 600);
  };

  return (
    <div className="lever-container" onClick={handleClick}>
      <div className={`lever-base ${disabled ? "disabled" : ""}`}>
        <div className={`lever-stick ${animating ? "pulling" : ""}`}>
          <div className="lever-ball" />
        </div>
      </div>
    </div>
  );
};

export default LeverSpinButton;
