import chalk from "chalk";
import figlet from "figlet";
import readlineSync from "readline-sync";
import { startGame } from "./game.js";
import { achievList } from "./achieve.js";

// 로비 화면을 출력하는 함수
function displayLobby() {
  console.clear();

  // 타이틀 텍스트
  console.log(
    chalk.cyan(
      figlet.textSync("A D R _ R P G", {
        font: "Standard",
        horizontalLayout: "default",
        verticalLayout: "default",
      })
    )
  );

  // 상단 경계선
  const line = chalk.magentaBright("╰(*°▽°*)╯".repeat(6));
  console.log(line);

  // 게임 이름
  console.log(
    chalk.yellowBright.bold(
      "Attack Defense Run away ADR RPG가 당신을 환영합니다! "
    )
  );

  // 설명 텍스트
  console.log();
  console.log(chalk.green("당신의 선택지 입니다."));
  console.log();

  // 옵션들
  console.log(chalk.blue("1.") + chalk.white(" 새로운 게임 시작"));
  console.log(chalk.blue("2.") + chalk.white(" 업적 확인하기"));
  console.log(chalk.blue("3.") + chalk.red(" 종료"));

  // 하단 경계선
  console.log(line);

  // 하단 설명
  console.log(chalk.gray("1-3 사이의 수를 입력한 뒤 엔터를 누르세요."));
}

// 유저 입력을 받아 처리하는 함수
function handleUserInput() {
  const choice = readlineSync.question("당신의 선택: ");

  switch (choice) {
    case "1":
      console.log(chalk.green("게임을 시작합니다."));
      // 여기에서 새로운 게임 시작 로직을 구현
      startGame();
      break;
    case "2":
      console.log(chalk.yellow("업적 목록을 불러옵니다"));
      // 업적 확인하기 로직을 구현
      achievList();
      break;
    case "3":
      console.log(chalk.red("게임을 종료합니다."));
      // 게임 종료 로직을 구현
      process.exit(0); // 게임 종료
      break;
    default:
      console.log(chalk.red("1~3까지의 숫자만 유효합니다."));
      handleUserInput(); // 유효하지 않은 입력일 경우 다시 입력 받음
  }
}

// 게임 시작 함수
export function start() {
  displayLobby();
  handleUserInput();
}

// 게임 실행
start();
