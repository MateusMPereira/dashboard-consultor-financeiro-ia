const primaryColors = ["#FF6384", "#36A2EB", "#FFCE56"];
const secondaryColors = ["#4BC0C0", "#9966FF", "#FF9F40"];

const availableColors = [...primaryColors, ...secondaryColors];

// Fisher-Yates shuffle algorithm
function shuffle(array: string[]) {
  let currentIndex = array.length,
    randomIndex;

  while (currentIndex !== 0) {
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;

    [array[currentIndex], array[randomIndex]] = [
      array[randomIndex],
      array[currentIndex],
    ];
  }

  return array;
}

export function getShuffledColors() {
  return shuffle([...availableColors]);
}
