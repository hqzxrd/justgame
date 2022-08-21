`use strict`;
import { Vector2, RAD2DEG, DEG2RAD } from "./index.js";

let progress = document.querySelector(`.progress`);
const cv = document.getElementById("canvas");
cv.width = 1200;
cv.height = 800;
const ct = cv.getContext("2d");
let GG = new Image();
GG.src = `assets/GG1.png`;
let tier1enemy = new Image();
tier1enemy.src = `assets/tier1enemy.png`;
let tier2enemy = new Image();
tier2enemy.src = `assets/tier2enemy.png`;
let tier1Boss = new Image();
tier1Boss.src = `assets/tier1boss.png`;
let orb1 = new Image();
orb1.src = `assets/orb1.png`;
let orb2 = new Image();
orb2.src = `assets/orb2.png`;
let orb3 = new Image();
orb3.src = `assets/orb3.png`;
let orb4 = new Image();
orb4.src = `assets/orb4.png`;
let orb5 = new Image();
orb5.src = `assets/orb5.png`;
progress.value = 5;
let bg = new Image();
bg.src = `assets/bg.jpg`;
let bulletArr = [];
let enemiesArr = [];
let bulletType;
let score = 0;
let reduceCD = 1;

////////////////////////////////////////////CLASS
progress.value = 10;
class render {
  constructor() {
    this.camera.pos = new Vector2(
      unitPlayer.pos.x - 600,
      unitPlayer.pos.y - 400
    );
  }
  render() {}
}

class Player {
  constructor(unit, x, y, speed, W, H) {
    this.unit = unit;
    this.pos = new Vector2(x, y);
    this.speed = speed;
    this.W = W;
    this.H = H;
    this.shiftY = this.H / 2;
    this.shiftX = this.W / 2;
    this.moveUp = false;
    this.moveDown = false;
    this.moveLeft = false;
    this.moveRight = false;
    this.shooting = false;
    this.vel = new Vector2(0, 0);
    this.weapon = [
      new pistol(),
      new shotgun(),
      // new flowShot(),
      new circleShot(),
      // new shieldSpinnerShot(),
      // new flowTele(),
    ];
    this.curSlot = 0;
    this.mouseX = 0;
    this.mouseY = 0;
    this.HP = 3;
    this.ATK = 1;
    this.ATKSPD = 1;
  }
  drawPlayer() {
    ct.drawImage(
      this.unit,
      // this.pos.x - this.shiftX + 10,
      // this.pos.y - this.shiftY + 15,
      600 - this.shiftX + 10,
      400 - this.shiftY + 15,
      this.W,
      this.H
    );
  }
  shot() {
    let curTime = new Date();
    if (
      this.shooting &&
      curTime - this.weapon[this.curSlot].lastShotTime >
        this.weapon[this.curSlot].CD
    ) {
      shot(
        this,
        local2Global(new Vector2(this.mouseX, this.mouseY)),
        this.weapon[this.curSlot].type
      );
      this.weapon[this.curSlot].lastShotTime = curTime;
    }
  }
  refreshWeaponCD() {
    for (let i = 0; i < this.weapon.length; i++) {
      this.weapon[i].refreshCD();
      var cd = document.querySelector(`.cd${i + 1}`);
      if (this.weapon[i].curCD == 0) {
        cd.style.display = `none`;
      } else {
        cd.innerHTML = Math.ceil(this.weapon[i].curCD / 100) / 10;
        cd.style.display = `block`;
      }
    }
  }
  checkOutOfBounds(vec) {
    if (vec.x < 600 || vec.y < 400 || vec.x > 3000 || vec.y > 2000) {
      return true;
    } else {
      return false;
    }
  }
}

class enemy {
  constructor(unit, x, y, speed, W, H) {
    this.unit = unit;
    this.pos = new Vector2(x, y);
    this.speed = speed;
    this.W = W;
    this.H = H;
    this.shiftY = this.H / 2;
    this.shiftX = this.W / 2;
    this.vel = new Vector2(0, 0);
    this.HP = 3;
    this.dmg = 1;
    this.getScore = 1;
  }
  drawEnemy() {
    ct.drawImage(
      this.unit,
      global2Local(this.pos).x - this.shiftX + 30,
      global2Local(this.pos).y - this.shiftY + 25,
      this.W,
      this.H
    );
  }
}

class weapon {
  constructor() {
    this.type = 0;
    this.CD = 0;
    this.lastShotTime = new Date();
    this.curCD = 0;
  }
  refreshCD() {
    this.curCD = this.CD - (new Date().getTime() - this.lastShotTime);
    if (this.curCD < 0) {
      this.curCD = 0;
    }
  }
}

class pistol extends weapon {
  constructor() {
    super();
    this.type = 1;
    this.CD = 300 * reduceCD;
  }
}

class shotgun extends weapon {
  constructor() {
    super();
    this.type = 2;
    this.CD = 600 * reduceCD;
  }
}

class circleShot extends weapon {
  constructor() {
    super();
    this.type = 3;
    this.CD = 60000 * reduceCD;
  }
}

class shieldSpinnerShot extends weapon {
  constructor() {
    super();
    this.type = 4;
    this.CD = 12000 * reduceCD;
    this.caseBonus = 4;
  }
}

class flowShot extends weapon {
  constructor() {
    super();
    this.type = 5;
    this.CD = 10 * reduceCD;
    this.caseBonus = 5;
  }
}

class flowTele extends weapon {
  constructor() {
    super();
    this.type = 6;
    this.CD = 8000 * reduceCD;
  }
}

class defaultBullet {
  constructor(x, y, angle) {
    this.pos = new Vector2(x, y);
    this.speed = 10;
    this.angle = angle;
    this.vel = new Vector2(this.speed, 0).rotateTo(angle);
    this.H = 10;
    this.W = 10;
    this.initialPos = new Vector2(x, y);
    this.bulletRange = 600;
    this.bulletSprite = orb1;
    this.color = `black`;
    this.size = 5;
    this.dmg = 0;
  }

  drawBullet() {
    ct.drawImage(
      this.bulletSprite,
      global2Local(this.pos).x,
      global2Local(this.pos).y,
      this.size,
      this.size
    );
  }
  moveBullet() {
    this.pos.add(this.vel);
  }

  recalculate(speed) {
    this.speed = speed;
    this.vel = new Vector2(this.speed, 0).rotateTo(this.angle);
  }

  checkRange() {
    if (Vector2.dist(this.pos, this.initialPos) > this.bulletRange) {
      return true;
    } else {
      return false;
    }
  }
}

class bullet extends defaultBullet {
  constructor(x, y, angle, dmg) {
    super(x, y, angle);
    this.bulletRange = 600;
    this.speed = 9 + unitPlayer.ATKSPD;
    this.vel = new Vector2(this.speed, 0).rotateTo(this.angle);
    this.bulletSprite = orb1;
    this.size = 50;
    this.dmg = this.dmg + unitPlayer.ATK;
  }
}

class shotgunBullet extends defaultBullet {
  constructor(x, y, angle, dmg) {
    super(x, y, angle);
    this.bulletRange = 300;
    this.speed = 14 + unitPlayer.ATKSPD;
    this.vel = new Vector2(this.speed, 0).rotateTo(this.angle);
    this.bulletSprite = orb2;
    this.size = 25;
    this.dmg = this.dmg + unitPlayer.ATK;
  }
}

class circleShotBullet extends defaultBullet {
  constructor(x, y, angle) {
    super(x, y, angle);
    this.bulletRange = 1000;
    this.speed = 1 + unitPlayer.ATKSPD;
    this.vel = new Vector2(this.speed, 0).rotateTo(this.angle);
    this.bulletSprite = orb3;
    this.size = 20;
    this.dmg = this.dmg + unitPlayer.ATK;
  }
}

class shieldSpinnerBullet extends defaultBullet {
  constructor(x, y, angle) {
    super(x, y, angle);
    this.degPerFrame = 5;
    this.bulletSprite = orb4;
    this.size = 25;
    this.dmg = this.dmg + unitPlayer.ATK;
    this.dist = 75;
    this.bulletRange = 1000;
  }
  moveBullet() {
    this.angle = this.angle * RAD2DEG;
    this.angle += this.degPerFrame;
    this.angle %= 360;
    this.angle = this.angle * DEG2RAD;
    let vectorTemp = new Vector2(this.dist, 0).rotateTo(this.angle);
    this.pos.set(vectorTemp.add(unitPlayer.pos));
    this.initialPos.set(unitPlayer.pos);
  }
}

class flowBullet extends defaultBullet {
  constructor(x, y, angle) {
    super(x, y, angle);
    this.bulletRange = 120;
    this.speed = 2 + unitPlayer.ATKSPD;
    this.vel = new Vector2(this.speed, 0).rotateTo(this.angle);
    this.bulletSprite = orb5;
    this.size = 20;
    this.dmg = this.dmg + unitPlayer.ATK * 0.05;
  }
}

class flowTeleport extends defaultBullet {
  constructor(x, y, angle) {
    super(x, y, angle);
    this.bulletRange = 350;
    this.speed = 9 + unitPlayer.ATKSPD;
    this.vel = new Vector2(this.speed, 0).rotateTo(this.angle);
    this.bulletSprite = GG;
    this.size = 100;
    this.dmg = this.dmg + unitPlayer.ATK;
    this.bulletType = 1;
  }
}
progress.value = 20;
let unitPlayer = new Player(GG, 1900, 1200, 2, 100, 100);
////////////////////////////////////////////EVENT

window.addEventListener(`keydown`, function (e) {
  if (e.code == `KeyW`) {
    unitPlayer.moveUp = true;
  }
  if (e.code == `KeyS`) {
    unitPlayer.moveDown = true;
  }
  if (e.code == `KeyA`) {
    unitPlayer.moveLeft = true;
  }
  if (e.code == `KeyD`) {
    unitPlayer.moveRight = true;
  }
});

window.addEventListener(`keyup`, function (e) {
  if (e.code == `KeyW`) {
    unitPlayer.moveUp = false;
  }
  if (e.code == `KeyS`) {
    unitPlayer.moveDown = false;
  }
  if (e.code == `KeyA`) {
    unitPlayer.moveLeft = false;
  }
  if (e.code == `KeyD`) {
    unitPlayer.moveRight = false;
  }
});

let specialBulletIcon = document.querySelector(`#specialBullet2`);

function showSpecialBullet() {
  specialBulletIcon.style.display = `block`;
}

function hideSpecialBullet() {
  specialBulletIcon.style.display = `none`;
}

let bulletButton = document.querySelectorAll(`.bullet`);

function interfaceWeaponSelect(n = 0) {
  bulletButton.forEach((item) => {
    item.classList.remove(`interface-weapon-nonselect`);
  });
  bulletButton[n].classList.add(`interface-weapon-select`);
}
interfaceWeaponSelect();

function interfaceWeaponNonSelect() {
  bulletButton.forEach((item) => {
    item.classList.remove(`interface-weapon-select`);
  });
}

let curSlot = 0;
window.addEventListener(`keydown`, function (e) {
  if (e.code == `Digit1`) {
    hideSpecialBullet();
    unitPlayer.curSlot = 0;
    curSlot = unitPlayer.curSlot;
    interfaceWeaponNonSelect();
    interfaceWeaponSelect(unitPlayer.curSlot);
  }
  if (e.code == `Digit2`) {
    if (unitPlayer.weapon[1].type === 5) {
      showSpecialBullet();
    }
    unitPlayer.curSlot = 1;
    curSlot = unitPlayer.curSlot;

    interfaceWeaponNonSelect();
    interfaceWeaponSelect(unitPlayer.curSlot);
  }
  if (e.code == `Space`) {
    if (unitPlayer.weapon[2].curCD > 0) {
      unitPlayer.curSlot = curSlot;
      unitPlayer.shooting = false;
    } else {
      unitPlayer.shooting = true;
      unitPlayer.curSlot = 2;
    }
    interfaceWeaponNonSelect();
    interfaceWeaponSelect(3);
  }
  if (e.code == `ShiftLeft`) {
    unitPlayer.curSlot = 1;
    if (curSlot === 1) {
      if (unitPlayer.weapon[3].curCD > 0) {
        unitPlayer.curSlot = curSlot;
        unitPlayer.shooting = false;
        unitPlayer.curSlot = 1;
      } else {
        unitPlayer.shooting = true;
        unitPlayer.curSlot = 3;
      }
      interfaceWeaponNonSelect();
      interfaceWeaponSelect(2);
    } else {
    }
  }
});

window.addEventListener(`keyup`, function (e) {
  if (e.code == `Space`) {
    if (unitPlayer.weapon[2].curCD > 1) {
      unitPlayer.curSlot = curSlot;
    } else {
      unitPlayer.curSlot = 2;
      unitPlayer.shooting = false;
    }
    interfaceWeaponNonSelect();
  }
  if (e.code == `ShiftLeft`) {
    if (curSlot === 1) {
      if (unitPlayer.weapon[1].curCD > 1) {
        unitPlayer.shooting = false;
        unitPlayer.curSlot = curSlot;
      } else {
        unitPlayer.curSlot = 1;
        unitPlayer.shooting = false;
      }
      interfaceWeaponNonSelect();
    }
  }
});

window.addEventListener(`mousemove`, function (e) {
  unitPlayer.mouseX = e.clientX - cv.getBoundingClientRect().left;
  unitPlayer.mouseY = e.clientY - cv.getBoundingClientRect().top;
});

window.addEventListener(`mousedown`, function (e) {
  unitPlayer.shooting = true;
});

window.addEventListener(`mouseup`, function (e) {
  unitPlayer.shooting = false;
});
let angleAim;
////////////////////////////////////////////FUNC
function shot(unit, targetPos, weaponType) {
  switch (weaponType) {
    case 1:
      bulletType = weaponType;
      angleAim = targetPos.sub(unit.pos).angle;
      angleAim += (Math.random() * 14 - 7) * DEG2RAD;
      bulletArr.push(new bullet(unit.pos.x - 25, unit.pos.y - 25, angleAim));
      break;
    case 2:
      bulletType = weaponType;
      targetPos.sub(unit.pos);
      bulletArr.push(
        new shotgunBullet(unit.pos.x, unit.pos.y, targetPos.angle)
      );
      bulletArr.push(
        new shotgunBullet(unit.pos.x, unit.pos.y, targetPos.angle + 0.3)
      );
      bulletArr.push(
        new shotgunBullet(unit.pos.x, unit.pos.y, targetPos.angle - 0.3)
      );
      break;
    case 3:
      bulletType = weaponType;
      targetPos.sub(unit.pos);
      for (let i = 0.3; i < 50; i += 0.3) {
        bulletArr.push(
          new circleShotBullet(unit.pos.x, unit.pos.y, targetPos.angle)
        );
        bulletArr.push(
          new circleShotBullet(unit.pos.x, unit.pos.y, targetPos.angle + i)
        );
        bulletArr.push(
          new circleShotBullet(unit.pos.x, unit.pos.y, targetPos.angle - i)
        );
      }
      break;
    case 4:
      bulletType = weaponType;
      let vectorTemp;
      let bullets = 4;
      for (let i = 0; i < 360; i += 360 / bullets) {
        vectorTemp = new Vector2(30, 0)
          .add(unitPlayer.pos)
          .rotateTo(i * DEG2RAD);
        bulletArr.push(
          new shieldSpinnerBullet(vectorTemp.x, vectorTemp.y, i * DEG2RAD)
        );
      }
      break;
    case 5:
      bulletType = weaponType;
      angleAim = targetPos.sub(unit.pos).angle;
      angleAim += (Math.random() * 1 - 0.5) * DEG2RAD;
      bulletArr.push(new flowBullet(unit.pos.x, unit.pos.y, angleAim));
      break;
    case 6:
      bulletType = weaponType;
      angleAim = targetPos.sub(unit.pos).angle;
      angleAim += Math.random() * 1 * DEG2RAD;
      for (let i = 0; i < 50; i++) {
        bulletArr.push(new flowTeleport(unit.pos.x, unit.pos.y, angleAim));
      }

      break;
    default:
      throw `Wrong weapon type`;
  }
}

function moveBullets() {
  let i = 0;
  let temp = [];
  while (i < bulletArr.length) {
    if (bulletArr[i].checkRange()) {
      if (
        bulletArr[i].bulletType === 1 &&
        unitPlayer.curSlot === 1 &&
        !unitPlayer.checkOutOfBounds(bulletArr[i].pos)
      ) {
        unitPlayer.pos = bulletArr[i].pos;
      }
      delete bulletArr[i];
    } else {
      bulletArr[i].moveBullet();
      bulletArr[i].drawBullet();
      temp.push(bulletArr[i]);
    }
    i++;
  }
  bulletArr = temp;
}

function playerMove() {
  unitPlayer.vel.mult(0);
  if (unitPlayer.moveUp) {
    unitPlayer.vel.y = -1;
  }
  if (unitPlayer.moveDown) {
    unitPlayer.vel.y = 1;
  }
  if (unitPlayer.moveLeft) {
    unitPlayer.vel.x = -1;
  }
  if (unitPlayer.moveRight) {
    unitPlayer.vel.x = 1;
  }
  unitPlayer.vel.normalize();
  unitPlayer.vel.mult(unitPlayer.speed);
  let temp = new Vector2(0, 0).set(unitPlayer.pos).add(unitPlayer.vel);
  if (!unitPlayer.checkOutOfBounds(temp)) {
    unitPlayer.pos.set(temp);
  }
}

function drawBackground() {
  let temp = new Vector2(unitPlayer.pos.x - 600, unitPlayer.pos.y - 400);
  if (bulletType === undefined) {
    ct.save();
    ct.globalAlpha = 0.6;
    ct.drawImage(bg, -temp.x, -temp.y, 3600, 2400);
    ct.restore();
  }
  if (bulletType === 1) {
    ct.save();
    ct.globalAlpha = 0.4;
    ct.drawImage(bg, -temp.x, -temp.y, 3600, 2400);
    ct.restore();
  }
  if (bulletType === 2) {
    ct.save();
    ct.globalAlpha = 0.9;
    ct.drawImage(bg, -temp.x, -temp.y, 3600, 2400);
    ct.restore();
  }
  if (bulletType === 3) {
    ct.save();
    ct.globalAlpha = 0.5;
    ct.drawImage(bg, -temp.x, -temp.y, 3600, 2400);
    ct.restore();
  }
  if (bulletType === 4) {
    ct.save();
    ct.globalAlpha = 0.5;
    ct.drawImage(bg, -temp.x, -temp.y, 3600, 2400);
    ct.restore();
  }
  if (bulletType === 5) {
    ct.save();
    ct.globalAlpha = 0.4;
    ct.drawImage(bg, -temp.x, -temp.y, 3600, 2400);
    ct.restore();
  }
  if (bulletType === 6) {
    ct.save();
    ct.globalAlpha = 0.4;
    ct.drawImage(bg, -temp.x, -temp.y, 3600, 2400);
    ct.restore();
  }
}

function global2Local(vec) {
  let temp = new Vector2(0, 0)
    .set(vec)
    .sub(new Vector2(unitPlayer.pos.x - 600, unitPlayer.pos.y - 400));
  return temp;
}

function local2Global(vec) {
  let temp = new Vector2(unitPlayer.pos.x - 600, unitPlayer.pos.y - 400).add(
    vec
  );
  return temp;
}

let lastSpawnTimeT1 = 0,
  intervalT1 = 1000,
  maxReachedT1 = false;
function spawnTimeEnemiesT1() {
  let curTime = new Date();

  if (curTime - lastSpawnTimeT1 >= intervalT1) {
    if (intervalT1 > 200 && !maxReachedT1) {
      intervalT1 -= Math.ceil(0.01 * intervalT1);
    } else {
      maxReachedT1 = true;
    }
    if (maxReachedT1) {
      intervalT1 += Math.ceil(0.002 * intervalT1);
    }
    lastSpawnTimeT1 = curTime;
    spawnEnemiesT1();
  }
}

let lastSpawnTimeT2 = 0,
  intervalT2 = 1500,
  maxReachedT2 = false;
function spawnTimeEnemiesT2() {
  let curTime = new Date();

  if (curTime - lastSpawnTimeT2 >= intervalT2 && maxReachedT1) {
    if (intervalT2 > 200 && !maxReachedT2) {
      intervalT2 -= Math.ceil(0.01 * intervalT2);
    } else {
      maxReachedT2 = true;
    }
    if (maxReachedT2) {
      intervalT2 += Math.ceil(0.01 * intervalT2);
    }
    lastSpawnTimeT2 = curTime;
    spawnEnemiesT2();
  }
}

function spawnEnemiesT1() {
  let vecCenter = local2Global(new Vector2(cv.width / 2, cv.height / 2));
  let vecEnemy = new Vector2(cv.width / 2 + 100, 0);
  vecEnemy.rotateTo(Math.random() * 360 * DEG2RAD);
  vecEnemy.add(vecCenter);
  let newEnemy = new enemy(tier1enemy, vecEnemy.x, vecEnemy.y, 0.8, 100, 100);
  newEnemy.vel.set(unitPlayer.pos);
  newEnemy.vel.sub(newEnemy.pos).normalize().mult(newEnemy.speed);
  enemiesArr.push(newEnemy);
}

function spawnEnemiesT2() {
  let vecCenter = local2Global(new Vector2(cv.width / 2, cv.height / 2));
  let vecEnemy = new Vector2(cv.width / 2 + 100, 0);
  vecEnemy.rotateTo(Math.random() * 360 * DEG2RAD);
  vecEnemy.add(vecCenter);
  let newEnemy2 = new enemy(tier2enemy, vecEnemy.x, vecEnemy.y, 5, 100, 100);
  newEnemy2.HP = 1;
  newEnemy2.getScore = 5;
  newEnemy2.vel.set(unitPlayer.pos);
  newEnemy2.vel.sub(newEnemy2.pos).normalize().mult(newEnemy2.speed);
  enemiesArr.push(newEnemy2);
}
progress.value = 50;
//////////////////////////////////////////////BOSS

//////////////////////////////////////////////BOSS
function enemyMove() {
  for (let i = 0; i < enemiesArr.length; i++) {
    enemiesArr[i].vel.set(unitPlayer.pos);
    enemiesArr[i].vel
      .sub(enemiesArr[i].pos)
      .normalize()
      .mult(enemiesArr[i].speed);
    enemiesArr[i].pos.add(enemiesArr[i].vel);
    enemiesArr[i].drawEnemy();
  }
}

function killEnemy() {
  let vec = new Vector2();
  let bulletCount = 0;
  let enemyCount = 0;
  let f = false;
  while (enemyCount < enemiesArr.length) {
    bulletCount = 0;
    while (bulletCount < bulletArr.length) {
      vec.set(enemiesArr[enemyCount].pos).sub(bulletArr[bulletCount].pos);
      if (vec.mag < 50) {
        enemiesArr[enemyCount].HP -= bulletArr[bulletCount].dmg;
        bulletArr.splice(bulletCount, 1);
        if (enemiesArr[enemyCount].HP <= 0) {
          score += enemiesArr[enemyCount].getScore;
          enemiesArr.splice(enemyCount, 1);
          document.querySelector(`#scoreNum`).innerHTML = score;
          f = true;
          break;
        }
      } else {
        bulletCount++;
        f = false;
      }
    }
    if (bulletArr.length == 0) {
      break;
    }
    if (f == false) {
      enemyCount++;
    }
  }
}

let lastHitTime = 0;
function checkHitTime(i) {
  let curTime = new Date();
  let interval = 500;
  if (curTime - lastHitTime >= interval) {
    lastHitTime = curTime;
    unitPlayer.HP -= enemiesArr[i].dmg;
    getHitAnim(`-${enemiesArr[i].dmg}`);
  }
}

function checkHitPlayer() {
  let vec = new Vector2();
  for (let i = 0; i < enemiesArr.length; i++) {
    document.querySelector(`#HPnum`).innerHTML = unitPlayer.HP;
    vec.set(unitPlayer.pos).sub(enemiesArr[i].pos);
    if (vec.mag < 50) {
      checkHitTime(i);
    }
  }
}

let scoreBoneses = [
  10, 25, 50, 75, 100, 150, 175, 200, 240, 300, 350, 400, 450, 500, 600, 700,
  800, 900, 1000, 1100, 1200, 1300, 1400, 1500,
];

let bonusLock = true;
function checkBonus() {
  if (score >= scoreBoneses[0]) {
    bonusLock = false;
    getbonus.style.display = `flex`;
    pauseMode = true;
    for (let i = 0; i < buttons.length; i++) {
      getBonus(getRandomInt(111), i);
    }
  }
}

function deleteBonus() {
  if (score >= scoreBoneses[0]) {
    scoreBoneses.splice(0, 1);
    bonusLock = true;
    pauseMode = false;
    getbonus.style.display = `none`;
  }
}

let bonusButton1 = document.querySelector(`#getBonusButton1`),
  bonusButton2 = document.querySelector(`#getBonusButton2`),
  bonusButton3 = document.querySelector(`#getBonusButton3`),
  buttons = [bonusButton1, bonusButton2, bonusButton3],
  getbonus = document.querySelector(`.getBonus`);

function getRandomInt(max) {
  return Math.floor(Math.random() * max);
}

let stack = 0;
function getBonus(numBonus, n) {
  if (numBonus < 30) {
    numBonus = 0;
  } else if (numBonus >= 30 && numBonus <= 50) {
    numBonus = 1;
  } else if (numBonus >= 51 && numBonus <= 70) {
    numBonus = 2;
  } else if (numBonus >= 71 && numBonus <= 80) {
    numBonus = 3;
  } else if (numBonus >= 81 && numBonus <= 90) {
    numBonus = 4;
  } else if (numBonus >= 91 && numBonus <= 100) {
    numBonus = 5;
  } else if (numBonus >= 101 && numBonus <= 110) {
    numBonus = 6;
  }
  if (unitPlayer.weapon[2].caseBonus == numBonus) {
    getBonus(getRandomInt(111), n);
    return;
  }
  if (unitPlayer.weapon[1].caseBonus == numBonus) {
    getBonus(getRandomInt(111), n);
    return;
  }
  if (reduceCD == 0.8 && numBonus == 6) {
    getBonus(getRandomInt(111), n);
    return;
  }
  switch (numBonus) {
    case 0:
      buttons[n].innerHTML = `HP + 1`;
      buttons[n].onclick = function () {
        unitPlayer.HP = unitPlayer.HP + 1;
        deleteBonus();
      };
      break;
    case 1:
      buttons[n].innerHTML = `ATK + 1`;
      buttons[n].onclick = function () {
        unitPlayer.ATK = unitPlayer.ATK + 1;
        deleteBonus();
      };
      break;
    case 2:
      buttons[n].innerHTML = `ATKSPD + 1`;
      buttons[n].onclick = function () {
        unitPlayer.ATKSPD = unitPlayer.ATKSPD + 1;
        deleteBonus();
      };
      break;
    case 3:
      buttons[n].innerHTML = `SPD + 0.3`;
      buttons[n].onclick = function () {
        unitPlayer.speed = unitPlayer.speed + 0.3;
        deleteBonus();
      };
      break;
    case 4:
      buttons[n].innerHTML = `Shield Spinner [Space]`;
      buttons[n].onclick = function () {
        unitPlayer.weapon[2] = new shieldSpinnerShot();
        deleteBonus();
      };
      break;
    case 5:
      buttons[n].innerHTML = `Flow Teleport [2]`;
      buttons[n].onclick = function () {
        unitPlayer.weapon[1] = new flowShot();
        unitPlayer.weapon[3] = new flowTele();
        deleteBonus();
      };
      break;
    case 6:
      stack = stack + 1;
      buttons[n].innerHTML = `Reduce 10% CD (${stack}/2)`;
      buttons[n].onclick = function () {
        reduceCD = reduceCD - 0.1;
        console.log(reduceCD);
        for (let i = 0; i < unitPlayer.weapon.length; i++) {
          unitPlayer.weapon[i].CD = unitPlayer.weapon[i].CD * reduceCD;
        }
        deleteBonus();
      };
      break;
  }
}

console.log(bonusButton3.classList[1]);
let pauseMode = false;
window.addEventListener(`keydown`, function (e) {
  if (e.code == `Escape` && bonusLock === true) {
    pauseMode = !pauseMode;
  }
});

function pause() {
  if (pauseMode) {
    window.requestAnimationFrame(pause);
  } else {
    window.requestAnimationFrame(gameloop);
  }
}

function stats() {
  document.querySelector(`#HPnum`).innerHTML = unitPlayer.HP;
  document.querySelector(`#ATKnum`).innerHTML = unitPlayer.ATK;
  document.querySelector(`#ATKSPDnum`).innerHTML = unitPlayer.ATKSPD;
  document.querySelector(`#SPDnum`).innerHTML = unitPlayer.speed;
}
let getHit = document.querySelector(`.getHit`);
function getHitAnim(dmg) {
  getHit.textContent = `${dmg}`;
  getHit.classList.add(`show`);
  getHit.classList.add(`getHitAnim1`);
  function removeHitAnim() {
    getHit.classList.remove(`show`);
    getHit.classList.remove(`getHitAnim1`);
  }
  setTimeout(removeHitAnim, 200);
}

let HP = document.querySelector(`.HPWrapper`),
  filterLowHP = document.querySelector(`.filter_lowHP`);
filterLowHP.classList.add(`hide`);
function checkStats() {
  if (unitPlayer.HP >= 2) {
    HP.classList.remove(`lowHP`);
    HP.classList.add(`highHP`);
    filterLowHP.classList.remove(`show`);
    filterLowHP.classList.add(`hide`);
  }
  if (unitPlayer.HP < 2) {
    HP.classList.remove(`highHP`);
    HP.classList.add(`lowHP`);
    filterLowHP.classList.remove(`hide`);
    filterLowHP.classList.add(`show`);
  }
}
function gameloop() {
  if (unitPlayer.HP <= 0) {
    alert(`Потрачено`);
    location.reload();
  } else if (!pauseMode) {
    window.requestAnimationFrame(gameloop);
    checkBonus();
    stats();
    checkStats();
    drawBackground();
    playerMove();
    unitPlayer.drawPlayer();
    unitPlayer.shot();
    unitPlayer.refreshWeaponCD();
    moveBullets();
    spawnTimeEnemiesT1();
    spawnTimeEnemiesT2();
    enemyMove();
    killEnemy();
    checkHitPlayer();
  } else {
    window.requestAnimationFrame(pause);
  }
}
progress.value = 90;
let startGame = document.querySelector(`.buttonPlay`);

function startgame() {
  progress.value = 100;
  startGame.onclick = function start() {
    document.querySelector(`.hello`).style.display = `none`;
    let bgVideo = document.querySelector(`.bgvideo`);
    bgVideo.remove();
    gameloop();
  };
}

bg.onload = startgame;

progress.value = 90;
