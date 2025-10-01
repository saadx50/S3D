
export enum Gender {
  MALE = 'Male',
  FEMALE = 'Female',
}

export type OutfitOptions = {
  [key in Gender]: string[];
};
