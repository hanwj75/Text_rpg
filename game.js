import chalk from "chalk";
import readlineSync from "readline-sync";
import figlet from "figlet";
import { start } from "./server.js";

//플레이어 클래스
class Player {
  constructor() {
    this.maxHp = 100; //최대 체력
    this.hp = this.maxHp; //현재 체력
    this.attackDmg = 10;
    this.heal = 30;
    this.run = 0;
    this.shield = 0;
    this.double = 0;
    this.turnCount = 0; //마지막 결과화면 랭킹을 위한 턴수
  }
  //플레이어가 피격시 데미지
  userHitDmg(dmg) {
    this.hp -= dmg;
    if (this.hp < 0) {
      this.hp = 0; // 체력이 음수가 되지 않도록 방지
    }
  }

  attack(monster) {
    // 플레이어의 공격
    monster.monsterHitDmg(this.attackDmg);
  }
  //플레이어의 체력회복
  selfHeal(healing) {
    this.hp += healing;
  }
  //스테이지 클리어시 유저 체력+공격력+힐량 증가
  userLevelUp(stages) {
    this.hp += stages * 100;
    this.heal = stages * 30;
    this.attackDmg = 100 * stages;
  }

  //플레이어가 방패를 들었을때 막을 확률
  rerollShield() {
    const randomShield = Math.floor(Math.random() * 5) + 1;
    this.shield = randomShield;
    return this.shield;
  }
  //도망가기를 선택하였을경우 1/2확률로 도망가짐
  runAway() {
    const randomRun = Math.floor(Math.random() * 2) + 1;
    this.run = randomRun;

    return this.run;
  }
  //연속공격 선택할 경우의 확률
  doubleAttack() {
    const randomAttack = Math.floor(Math.random() * 3) + 1;
    this.double = randomAttack;

    return;
  }
}
//몬스터 클래스
class Monster {
  constructor(stages) {
    this.maxHp = 100 * stages; //최대 체력
    this.hp = this.maxHp; //현재 체력
    this.attackDmg = 20 * stages; //공격력
    this.stopTime = 0;
  }
  //몬스터가 피격시 데미지
  monsterHitDmg(dmg) {
    this.hp -= dmg;
  }
  attack(user) {
    // 몬스터의 공격
    user.userHitDmg(this.attackDmg);
    //몬스터가 연막을맞을시 행동
    if (this.stopTime > 0) {
      this.stopTime--; // 행동을 멈추고 턴 수 감소
      return;
    }
  }
}
//스테이지 / 플레이어 / 몬스터 정보창
function displayStatus(stage, player, monster) {
  console.log(
    chalk.magentaBright(`\n              （￣︶￣）↗ Status↖ (￣︶￣）`)
  );
  console.log(
    chalk.cyanBright(`| Stage: ${stage} |`) +
      chalk.yellowBright(
        `| Player: HP:${player.hp} DMG:${player.attackDmg} |`
      ) +
      chalk.redBright(`| Monster: ${monster.hp} DMG:${monster.attackDmg} |`)
  );
  console.log(chalk.magentaBright(`(/≧▽≦)/  \n`));
}

const battle = async (stage, player, monster) => {
  let logs = [];
  //플레이어와 몬스터의 모든 행동 로직
  while (player.hp > 0 && monster.hp > 0) {
    console.clear();
    displayStatus(stage, player, monster);
    const userShield = player.rerollShield();
    const userRunWaye = player.runAway();
    const doubleAtt = player.doubleAttack();
    logs.forEach((log) => console.log(log));
    //선택지
    console.log(
      chalk.green(
        `\n1.${chalk.red(
          "공격한다"
        )} 2.연막탄을 던진다0~3. 3.회복한다(${player.heal}+) 4.방어한다(60%) 5.도망간다(50%) 6.연속공격(33%)`
      )
    );
    const choice = readlineSync.question("당신은");

    // 플레이어의 선택에 따라 다음 행동 처리
    //1~5까지의 선택지를 입력할시 선택한 숫자에따라 작동함
    //선택지 외의 값을 입력할경우 경고문을 띄워줌
    if (choice <= 6 && choice !== "") {
      logs.push(chalk.green(`${choice}를 선택하셨습니다!`));
      player.turnCount++;
    } else {
      logs.push(chalk.red("당신이 하지 못하는 선택입니다!"));
    }

    //각 번호를 선택시 할 행동 정의
    //플레이어 행동 로직

    switch (choice) {
      case "1":
        logs.push(
          chalk.yellow(
            `당신이 몬스터에게${player.attackDmg}의 피해를 입힙니다.`
          )
        );
        monster.monsterHitDmg(player.attackDmg);

        break;
      //플레이어가 2번의 선택지를 고르면 0~2의 랜덤한 값을가진 연막탄을 던짐
      case "2":
        const randomStop = Math.floor(Math.random() * 4);
        monster.stopTime = randomStop;
        logs.push(
          chalk.yellow(
            `연기가 몬스터의 시야를 가립니다 ${randomStop}턴 동안 몬스터의 행동이 멈춥니다!`
          )
        );
        break;
      //플레어가 3번의 선택지를 고르면 체력을 회복한다.
      case "3":
        logs.push(
          chalk.yellow(`당신이${player.heal}만큼의 체력을 회복합니다!`)
        );
        player.selfHeal(player.heal);
        break;
      case "4":
        if (player.shield >= 3 && player.shield <= 5) {
          logs.push(
            chalk.yellow(`(${player.shield}!) 당신이 방패를 들어올립니다!`)
          );
        } else {
          logs.push(chalk.yellow(`(${player.shield}!) 방패가 파괴되었습니다!`));
        }
        break;
      case "5":
        if (player.run === 1 && stage >= 1) {
          logs.push(
            chalk.yellow(`(${player.run}!) 당신은 꼴사납게 도망칩니다!`)
          );
          player.hp = stage * 100;
          player.attackDmg = stage * 20;
        } else {
          logs.push(
            chalk.yellow(`(${player.run}!) 당신은 도망에 실패했습니다..`)
          );
        }
        break;
      case "6":
        if (player.double === 1) {
          logs.push(chalk.yellow(`${player.double}! 연속공격에 성공했습니다!`));
          logs.push(chalk.yellow(`${player.attackDmg}의 피해를 입힙니다.`));
          logs.push(chalk.yellow(`${player.attackDmg}의 피해를 입힙니다.`));
          monster.monsterHitDmg(player.attackDmg * 2);
        } else if (player.double === 2) {
          logs.push(chalk.yellow(`${player.double}! 연속공격에 성공했습니다!`));
          logs.push(chalk.yellow(`${player.attackDmg}의 피해를 입힙니다.`));
          logs.push(chalk.yellow(`${player.attackDmg}의 피해를 입힙니다.`));
          logs.push(chalk.yellow(`${player.attackDmg}의 피해를 입힙니다.`));

          monster.monsterHitDmg(player.attackDmg * 3);
        } else {
          logs.push(chalk.red(`${player.double}! 공격에 실패했습니다!`));
        }
        break;
    }
    //몬스터 행동 로직
    if (monster.hp > 0) {
      if (monster.stopTime > 0) {
        //연막탄이 유지되는동안 몬스터가 행동을 멈춤
        //턴이 지날떄마다 연막탄의 남은 턴수를 알려주고 1씩 빠짐
        logs.push(
          chalk.red(
            `몬스터가 당신을 찾고있습니다.(${monster.stopTime - 1}턴 남음)`
          )
        );
        monster.stopTime--;
      } else {
        switch (choice) {
          case "1":
            logs.push(
              chalk.red(
                `몬스터가 공격합니다! ${monster.attackDmg}의 피해를 받습니다.`
              )
            );
            player.userHitDmg(monster.attackDmg);

            break;
          case "2":
            if (monster.stopTime === 0) {
              logs.push(
                chalk.red(
                  `몬스터가 연막을 뚫고 당신을 공격합니다! ${monster.attackDmg}의 피해를 받습니다!`
                )
              );
              player.userHitDmg(monster.attackDmg);
            }
            break;
          case "3":
            logs.push(
              chalk.red(
                `몬스터가 공격합니다! ${monster.attackDmg}의 피해를 받습니다.`
              )
            );
            player.userHitDmg(monster.attackDmg);
            break;
          case "4":
            if (player.shield >= 3 && player.shield <= 5) {
              logs.push(chalk.red(` 몬스터가 공격이 막혀 당황합니다!`));
            } else {
              logs.push(
                chalk.red(
                  `몬스터의 공격이 방패를 파괴합니다!${monster.attackDmg}의 피해를 받습니다!`
                )
              );
              player.userHitDmg(monster.attackDmg);
            }
            break;
          case "5":
            if (player.run === 1) {
              logs.push(chalk.red(`몬스터가 당신을 비웃습니다...`));
              monster.hp = stage * 100;
              monster.attackDmg = stage * 20;
            } else {
              logs.push(
                chalk.red(
                  `몬스터가 도망가는 당신에게 ${monster.attackDmg}피해를 입힙니다`
                )
              );
              player.userHitDmg(monster.attackDmg);
            }

            break;
          case "6":
            if (player.double === 1) {
              logs.push(chalk.red(`몬스터가 막대한 피해를 입습니다!`));
            } else if (player.double === 2) {
              logs.push(chalk.red(`몬스터가 절대한 피해를 입습니다!`));
            } else {
              logs.push(
                chalk.red(
                  `몬스터가 당신에게 ${monster.attackDmg * 3}의 절대한 피해를 입힙니다! `
                )
              );
              player.userHitDmg(monster.attackDmg * 3);
            }
            break;
        }
      }
    }

    //플레이어가 몬스터를 죽일 경우 레벨업
    if (monster.hp <= 0) {
      stage++;
      player.userLevelUp(stage);
    }
  }
};

export async function startGame() {
  console.clear();
  const player = new Player();
  let stage = 1;

  while (stage <= 10) {
    const monster = new Monster(stage);
    await battle(stage, player, monster);

    if (monster.hp <= 0) {
      stage++;
    }
    //게임 클리어 혹은 종료 조건
    if (player.hp <= 0) {
      console.clear();
      console.log(chalk.red("당신은 죽었습니다!"));
      break;
    }
    if (stage > 10) {
      console.clear();
      console.log(chalk.blue("축하합니다! 모든 스테이지를 클리어 하셨습니다!"));
      console.log(
        chalk.red(
          figlet.textSync("C L E A R !", {
            font: "Standard",
            horizontalLayout: "default",
            verticalLayout: "default",
          })
        )
      );
      console.log();

      console.log(chalk.blue("랭킹"));
      console.log();
      console.log(chalk.red("1ST"));
      displayStatus(
        stage - 1,
        player,
        monster,
        console.log(chalk.red`Total Choices${player.turnCount}`)
      );
      console.log(chalk.blue("2ND"));
      displayStatus(
        stage - 1,
        player,
        monster,
        console.log(chalk.blue`Total Choices${player.turnCount + 10}`)
      );
      console.log(chalk.green("3RD"));
      displayStatus(
        stage - 1,
        player,
        monster,
        console.log(chalk.green`Total Choices${player.turnCount + 15}`)
      );
      console.log();
      console.log(chalk.black("처음으로 돌아가시겠습니까?"));
      console.log(chalk.black("yes를 입력하면 처음으로 돌아갑니다."));
      console.log(chalk.black("종료하시려면 Enter 를 눌러주세요"));
      if (readlineSync.question() === "yes") {
        start();
      } else {
        break;
      }
    }
  }
}
