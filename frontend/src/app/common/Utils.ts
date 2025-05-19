import { Status } from "../constants/enums";

export const getStatusEnumValue = (status: string) => {  // can move to a common place
  return Status[status as keyof typeof Status];
};

export const getStatusEnumColor = (status: string) => {
  switch (status) {
    case 'ACT':
      return 'default';
    case 'INA':
      return 'destructive';
    default:
      return 'outline';
  }
}