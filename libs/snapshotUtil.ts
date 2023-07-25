

// map indexed choice number to choice string
export function mapChoiceIndex (type: string | undefined, choices: string[] | undefined, choice: number | number[] | { [key: string]: number } | undefined) {
  if (!type || !choices || !choice) return choice;

  if (['approval', 'ranked-choice'].includes(type)) {
    // choice = [1,2,3]
    const choiceArr = choice as number[];
    return choiceArr.map((c: number) => choices[c-1]);
  } else if (['quadratic', 'weighted'].includes(type)) {
    // choice = {"1": 1, "2": 2, "3": 3}
    const choiceObj = choice as { [key: string]: number };
    const mapped: {[key: string]: number} = {};
    Object.entries(choiceObj).map(([key, value]) => {
      mapped[choices[parseInt(key)-1]] = value;
    });
    return mapped;
  } else {
    // choice = 1
    return choices[(choice as number)-1];
  }
}

export function processChoices(type: string | undefined, choice: any): string | string[] {
  if (!choice || !type) return '';

  if(type == 'approval') {
    return choice as string[];
  } else if (type == 'ranked-choice') {
    const arr = choice as string[];
    return arr.map((v, i) => `(${i+1}th) ${v}`);
  } else if (type == 'quadratic' || type == 'weighted') {
    const obj = choice as { [key: string]: number };
    const totalUnits = Object.values(obj).reduce((a, b) => a + b, 0);
    return Object.entries(obj).map(([key, value]) => `${Math.round(value/totalUnits*100)}% for ${key}`);
  } else {
    return choice as string;
  }
}