import { ICar, ISpeed, IWinner } from '../typingTS/_interfaces';
import { GARAGE, ENGINE, WINNERS } from '../utils/const'

async function getCarsList(): Promise<ICar[]> {
  const res: Response = await fetch(GARAGE);
  return await res.json();
}

async function getCar(id: string): Promise<ICar> {
  const response = await fetch(`${GARAGE}/${id}`);
  return response.json();
}

async function createCar(data: ICar): Promise<ICar> {
  const car = await fetch(GARAGE, {
    method: 'POST',
    body: JSON.stringify(data),
    headers: {
        'Content-Type': 'application/json',
    }
  });

  return car.json();
}

async function deleteCar(id: string): Promise<void> {
  await fetch(`${GARAGE}/${id}`, {
      method: 'DELETE',
  });
}

async function updateCar(id: string, carData: ICar): Promise<ICar> {
  const car = await fetch(`${GARAGE}/${id}`, {
    method: 'PUT',
    body: JSON.stringify(carData),
    headers: {
      'Content-Type': 'application/json',
    }
  });
  return car.json();
}

async function startEngine(id: string): Promise<ISpeed> {
  const speed = await fetch(`${ENGINE}?id=${id}&status=started`, {
    method: 'PATCH',
  });
  return speed.json();
}

async function stopEngine(id: string): Promise<ISpeed> {
  const speed = await fetch(`${ENGINE}?id=${id}&status=stopped`, {
    method: 'PATCH',
  });
  return speed.json();
}

async function checkCar(id: string): Promise<{ success: boolean }> {
  const data = await fetch(`${ENGINE}?id=${id}&status=drive`, {
      method: 'PATCH',
  }).catch();

  if (data.status === 200) {
    return { success: true }
  } else {
    return { success: false }
  }
}

async function getWinners(): Promise<IWinner[]> {
  const allCarsFetch = await fetch(GARAGE);
  const winCarsFetch = await fetch(WINNERS);

  const allCars = await allCarsFetch.json();
  const winCars = await winCarsFetch.json();

  // Создадим новый массив объектов победителей
  const result = allCars.map((item:ICar) => {
    if (!winCars) return {};

    for (let i = 0; i < winCars.length; i++) {
      if (item.id === winCars[i].id) {
        return { ...winCars[i], car:{...item} }
      }
    }
    return {};
  }).filter(((item:IWinner) => item.car));

  return result
}


async function createWinner(data: IWinner): Promise<IWinner> {
  const car = await fetch(`${WINNERS}`, {
    method: 'POST',
    body: JSON.stringify(data),
    headers: {
        'Content-Type': 'application/json',
    },
  });
  return car.json();
}

async function getWinner(id: string): Promise<IWinner> {
  const car = await fetch(`${WINNERS}/${id}`)
  return car.json();
}


export async function updateWinner(id: string, item: IWinner): Promise<IWinner> {
  const car = await fetch(`${WINNERS}/${id}`, {
    method: 'PUT',
    body: JSON.stringify(item),
    headers: {
      'Content-Type': 'application/json',
    },
  });
  return car.json()
}

async function saveWinner(winId: string, winTime: number): Promise<void> {
  const data = await getWinners();

  if (data.some((item) => item.id === Number(winId))) {
      const winner = await getWinner(winId);
      winner.wins++;
      winner.time = winner.time < winTime ? winner.time : winTime;
      await updateWinner(winId, winner);
  } else {
      await createWinner({ id: Number(winId), wins: 1, time: winTime });
  }
}

async function deleteWinner(delId: string): Promise<void | IWinner> {
  const data = await getWinners();

  if (data.some((item) => item.id === Number(delId))) {
    const deleteCar = await fetch(`${WINNERS}/${delId}`, {
      method: 'DELETE',
    });
    return deleteCar.json();
  } return
}

export { getCarsList, getCar, createCar, deleteCar, updateCar, startEngine, stopEngine, checkCar, getWinners, createWinner, saveWinner, deleteWinner };
