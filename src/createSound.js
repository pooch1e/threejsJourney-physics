const hitSound = new Audio('/sounds/hit.mp3');
export const createSound = (collision) => {
  console.log(collision.contact.getImpactVelocityAlongNormal());
  hitSound.currentTime = 0;
  hitSound.play();
};
