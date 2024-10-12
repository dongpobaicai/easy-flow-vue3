export const getUUID = () => {
  return Math.random().toString(36).substr(3, 10);
};
