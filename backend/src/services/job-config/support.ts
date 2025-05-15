export const createJobCode = (latestID: number): string => {
  const incrementedNumber = latestID + 1;
  return `JB${incrementedNumber.toString().padStart(3, "0")}`;
};
