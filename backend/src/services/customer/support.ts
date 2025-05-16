export const createCustomerCode = (latestID: number): string => {
  const incrementedNumber = latestID + 1;
  return `CTM${incrementedNumber.toString().padStart(3, "0")}`;
};