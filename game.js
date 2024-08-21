import chalk from "chalk";
import readlineSync from "readline-sync";

class Player {
  constructor() {
    this.maxHp = 100; //최대 체력
    this.hp = this.maxHp; //현재 체력
    this.attackDmg = 20;
    this.heal = 30;
    this.stageClear = 50;
  }
  //플레이어가 피격시 데미지
  userHitDmg(dmg) {
    this.hp -= dmg;
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
  userLevelUp(stage) {
    this.maxHp += 100;
    this.hp = this.maxHp;
    this.heal += 10;
    this.attackDmg += stage * 10;
  }
  clearHp(next) {
    this.hp += next;
  }
}

class Monster {
  constructor() {
    this.maxHp = 100; //최대 체력
    this.hp = this.maxHp; //현재 체력
    this.attackDmg = 20; //공격력
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
  //스테이지 클리어시 몬스터 체력+ 데미지+
  monsterLevelUp(stage) {
    this.maxHp += 110;
    this.hp = this.maxHp;
    this.attackDmg += stage * 10;
  }
}

function displayStatus(stage, player, monster) {
  console.log(
    chalk.magentaBright(
      `\n====================== Current Status ========================`
    )
  );
  console.log(
    chalk.cyanBright(`|| Stage: ${stage} |`) +
      chalk.yellowBright(
        `| Player: HP:${player.hp} DMG:${player.attackDmg} |`
      ) +
      chalk.redBright(`| Monster: ${monster.hp} DMG:${monster.attackDmg} ||`)
  );
  console.log(
    chalk.magentaBright(
      `==============================================================\n`
    )
  );
}

const battle = async (stage, player, monster) => {
  let logs = [];

  while (player.hp > 0) {
    console.clear();
    displayStatus(stage, player, monster);

    logs.forEach((log) => console.log(log));

    console.log(
      chalk.green(
        `\n1. 공격한다 2.연막탄을 던진다. 3.회복한다 4.방어한다 5.도망간다`
      )
    );
    const choice = readlineSync.question("당신은");

    // 플레이어의 선택에 따라 다음 행동 처리
    //1~5까지의 선택지를 입력할시 선택한 숫자에따라 작동함
    //선택지 외의 값을 입력할경우 경고문을 띄워줌
    if (choice <= 5 && choice !== "") {
      logs.push(chalk.green(`${choice}를 선택하셨습니다!`));
    } else {
      logs.push(chalk.red("당신이 하지 못하는 선택입니다!"));
    }

    //각 번호를 선택시 할 행동 정의
    //플레이어 행동 정의
    switch (choice) {
      case "1":
        logs.push(
          chalk.yellow(
            `당신이 몬스터에게${player.attackDmg}의 피해를 입힙니다.`
          )
        );
        monster.monsterHitDmg(player.attackDmg);
        if (monster.hp < 0) {
          stage++;
          player.userLevelUp(stage);
        }
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
        logs.push(chalk.yellow(`당신이 방패를 들어올립니다!`));
        break;
      case "5":
        logs.push(chalk.yellow(`당신이 이기지못할 상대에게서 도망칩니다!`));
        player.hp = player.maxHp;
        monster.hp = monster.maxHp;

        break;
    }
    //몬스터 행동 정의

    if (monster.stopTime >= 1) {
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
          logs.push(chalk.red(`몬스터가 공격이 실패하자 당황합니다!`));

          break;
        case "5":
          logs.push(chalk.red(`몬스터가 당신을 비웃습니다...`));

          break;
      }
    }
  }
};

export async function startGame() {
  console.clear();
  const player = new Player();
  let stage = 1;

  while (stage <= 10) {
    const monster = new Monster();
    await battle(stage, player, monster);

    // 스테이지 클리어 및 게임 종료 조건
    if (monster.maxHp <= 0) {
      console.log(`${stage}스테이지를 클리어 했습니다!`);
      //스테이지 클리어시 플레이어 레벨업
      player.userLevelUp(stage);
      stage++;
      //스테이지 클리어시 몬스터 재생성
      monster = new Monster();
      monster.monsterLevelUp(stage);
    } else if (player.hp < 1) {
      console.log("당신은 죽었습니다...");
      break;
    }
  }
}
