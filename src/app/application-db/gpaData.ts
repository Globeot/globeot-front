//gpa -> 백분위 환산 함수
export const gpaToPercentile: Record<string, number> = {};

for (let i = 0; i <= 430; i++) {
  const gpaStr = (i / 100).toFixed(2);
  let val = 0;

  if (i >= 400) {
    val = 72 + ((i - 70) * 28) / 360;
  } else if (i >= 370) {
    val = 69 + ((i - 70) * 31) / 360;
  } else if (i >= 330) {
    val = 66 + ((i - 70) * 34) / 360;
  } else if (i >= 300) {
    val = 65 + ((i - 70) * 35) / 360;
  } else if (i >= 270) {
    val = 64 + ((i - 70) * 36) / 360;
  } else {
    val = 63 + ((i - 70) * 37) / 360;
  }

  const percentile = Math.round(val * 10) / 10;
  gpaToPercentile[gpaStr] = percentile;
}
