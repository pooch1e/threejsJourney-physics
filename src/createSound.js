const hitSound = new Audio('/sounds/hit.mp3');
export const createSound = (collision) => {
  const impactStrength = collision.contact.getImpactVelocityAlongNormal();

  if (impactStrength > 1.5) {
    hitSound.volume = Math.random();
    hitSound.currentTime = 0;
    hitSound.play();
  }
};
