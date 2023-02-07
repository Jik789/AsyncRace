interface ICar {
  name: string;
  color: string;
  id?: number;
}

interface IPaginationGarage {
  maxPage: number,
  currentPage: number
}

interface ISpeed {
  velocity: number;
  distance: number;
}

interface IWinner {
  id: number;
  wins: number;
  time: number;
  car?: ICar;
}

export { ICar, IPaginationGarage, ISpeed, IWinner }
