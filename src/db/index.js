import { flights } from "./data.json";

class FlightsDB {
  #flights = [];

  constructor() {
    this.#flights = flights;
  }

  #isError() {
    return ((Math.random() * 100) | 0) > 40;
  }

  getAllFlights() {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(this.#flights);
      }, 1000);
    });
  }

  saveFlightDetails(id, data) {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const isError = this.#isError();
        if (isError) return reject(false);
        let flight = this.#flights.find((flight) => flight.id === id);
        flight = { ...flight, ...data };
        resolve(flight);
      }, 2000);
    });
  }

  deleteFlight(index) {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const isError = this.#isError();
        if (isError) return reject(false);
        this.#flights.splice(index, 1);
        resolve(true);
      }, 2000);
    });
  }
}

export const flightDB = new FlightsDB();
