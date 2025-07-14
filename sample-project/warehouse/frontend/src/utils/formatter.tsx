export const numberToFixed = (num: number, decimalPlaces: number): string => {
  let fixed = num.toFixed(decimalPlaces);
  return fixed.replace(/\.?0+$/, '');
}
