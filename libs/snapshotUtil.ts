

// map indexed choice number to choice string
export function mapChoiceIndex (type: string, choices: string[], choice: any) {
    if (!choices) return choice;

    if (['approval', 'ranked-choice'].includes(type)) {
      // choice = [1,2,3]
      const choiceArr = choice as number[];
      return choiceArr.map((c: number) => choices[c-1]);
    } else if (['quadratic', 'weighted'].includes(type)) {
      // choice = {"1": 1, "2": 2, "3": 3}
      const choiceObj = choice as { [key: string]: number };
      const mapped = {};
      Object.entries(choiceObj).map(([key, value]) => {
        mapped[choices[parseInt(key)-1]] = value;
      });
      return mapped;
    } else {
      // choice = 1
      return choices[choice-1];
    }
  }

export function formatChoices(type: string, choice: any): string {
  let ret: string;

  if (!choice || !type) return '';

  if(type == 'approval') {
      const arr = choice as string[];
      ret = arr.join(', ');
  } else if (type == 'ranked-choice') {
      const arr = choice as string[];
      ret = arr.map((v, i) => `(${i+1}th) ${v}`).join(', ');
  } else if (type == 'quadratic' || type == 'weighted') {
      const obj = choice as { [key: string]: number };
      const totalUnits = Object.values(obj).reduce((a, b) => a + b, 0);
      ret = Object.entries(obj).map(([key, value]) => `${Math.round(value/totalUnits*100)}% for ${key}`).join(', ');
  } else {
      const str = choice as string;
      ret = str;
  }

  return ret;
}