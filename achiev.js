import chalk from "chalk";
import readlineSync from "readline-sync";

import { start } from "./server.js";

export function achievList() {
  console.clear();
  console.log(chalk.cyan("=== 업적 목록 ==="));

  //업적 목록
  const achievements = [
    "첫 몬스터 처치 성공!",
    "100마리의 몬스터 처치",
    "10스테이지 클리어!",
    "40턴 안에 클리어",
  ];

  achievements.forEach((achiev, index) => {
    console.log(chalk.yellow(`${index + 1}. ${achiev}`));
  });

  console.log(
    chalk.gray("업적 목록을 보신 후, 엔터를 눌러 로비로 돌아가세요.")
  );
  readlineSync.question(); //엔터를 누를 때까지 대기

  start();
}
