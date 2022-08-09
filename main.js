`use strict`;
import { Vector2, RAD2DEG, DEG2RAD } from "./index.js";

const cv = document.getElementById("canvas");
cv.width = 1200;
cv.height = 800;
const ct = cv.getContext("2d");
let GG = new Image();
GG.src = `assets/GG1.png`;
let enGG = new Image();
enGG.src = `assets/enemy.png`;
let orb1 = new Image();
orb1.src = `assets/orb1.png`;
let bulletArr = [];
let enemiesArr = [];
let bulletType;
let score = 0;

////////////////////////////////////////////CLASS

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
    this.weapon = [new pistol(), new shotgun(), new circleShot()];
    this.curSlot = 0;
    this.mouseX = 0;
    this.mouseY = 0;
    this.HP = 3;
    this.dmg = 1;
  }
  drawPlayer() {
    ct.drawImage(
      this.unit,
      this.pos.x - this.shiftX,
      this.pos.y - this.shiftY,
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
        new Vector2(this.mouseX, this.mouseY),
        this.weapon[this.curSlot].type
      );
      this.weapon[this.curSlot].lastShotTime = curTime;
    }
  }
  refreshWeaponCD() {
    for (let i = 0; i < this.weapon.length; i++) {
      this.weapon[i].refreshCD();
      let cd1 = document.querySelector(`.cd${i + 1}`);
      if (this.weapon[i].curCD == 0) {
        cd1.style.display = `none`;
      } else {
        cd1.innerHTML = Math.ceil(this.weapon[i].curCD / 100) / 10;
        cd1.style.display = `block`;
      }
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
    this.HP = 2;
    this.dmg = 1;
  }
  drawEnemy() {
    ct.drawImage(
      this.unit,
      this.pos.x - this.shiftX,
      this.pos.y - this.shiftY,
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
    this.CD = 300;
  }
}

class shotgun extends weapon {
  constructor() {
    super();
    this.type = 2;
    this.CD = 600;
  }
}

class circleShot extends weapon {
  constructor() {
    super();
    this.type = 3;
    this.CD = 100000;
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
    this.abobus = 100;
  }

  drawBullet() {
    ct.drawImage(
      this.bulletSprite,
      this.pos.x,
      this.pos.y,
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
  constructor(x, y, angle) {
    super(x, y, angle);
    this.bulletRange = 600;
    this.speed = 10;
    this.vel = new Vector2(this.speed, 0).rotateTo(this.angle);
    this.bulletSprite = orb1;
    this.size = 50;
  }
}

class shotgunBullet extends defaultBullet {
  constructor(x, y, angle) {
    super(x, y, angle);
    this.bulletRange = 300;
    this.speed = 15;
    this.vel = new Vector2(this.speed, 0).rotateTo(this.angle);
    this.bulletSprite = orb1;
    this.size = 25;
  }
}

class circleShotBullet extends defaultBullet {
  constructor(x, y, angle) {
    super(x, y, angle);
    this.bulletRange = 1000;
    this.speed = 2;
    this.vel = new Vector2(this.speed, 0).rotateTo(this.angle);
    this.bulletSprite = orb1;
    this.size = 50;
  }
}

let unitPlayer = new Player(GG, 550, 400, 3, 100, 100);
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

let bullet1Icon = document.querySelector(`#bullet1`);
let bullet2Icon = document.querySelector(`#bullet2`);
let bullet3Icon = document.querySelector(`#bullet3`);

window.addEventListener(`keydown`, function (e) {
  if (e.code == `Digit1`) {
    unitPlayer.curSlot = 0;
    bullet1Icon.style.border = `2px solid violet`;
    bullet1Icon.style.transform = `scale(1.2)`;
    bullet2Icon.style.border = `2px solid black`;
    bullet2Icon.style.transform = `scale(1.0)`;
  }
  if (e.code == `Digit2`) {
    unitPlayer.curSlot = 1;
    bullet2Icon.style.border = `2px solid violet`;
    bullet2Icon.style.transform = `scale(1.2)`;
    bullet1Icon.style.border = `2px solid black`;
    bullet1Icon.style.transform = `scale(1)`;
  }
  if (e.code == `Space`) {
    unitPlayer.shooting = true;
    unitPlayer.curSlot = 2;
    bullet3Icon.style.border = `2px solid violet`;
    bullet3Icon.style.transform = `scale(1.2)`;
  }
});

window.addEventListener(`keyup`, function (e) {
  if (e.code == `Space`) {
    unitPlayer.shooting = false;
    unitPlayer.curSlot = 2;
    bullet3Icon.style.border = `2px solid black`;
    bullet3Icon.style.transform = `scale(1)`;
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
      angleAim += (Math.random() * 10 - 5) * DEG2RAD;
      console.log(angleAim);
      bulletArr.push(new bullet(unit.pos.x, unit.pos.y, angleAim));

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
      for (let i = 0.3; i < 100; i += 0.3) {
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
    default:
      throw `Wrong weapon type`;
  }
}

function moveBullets() {
  let i = 0;
  let temp = [];
  while (i < bulletArr.length) {
    if (bulletArr[i].checkRange()) {
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
  unitPlayer.pos.add(unitPlayer.vel);
}

function drawBackground() {
  if (bulletType === undefined) {
    ct.save();
    ct.fillStyle = `rgba(255, 255, 255, 0.3)`;
    ct.fillRect(0, 0, cv.width, cv.height);
    ct.restore();
  }
  if (bulletType === 1) {
    ct.save();
    ct.fillStyle = `rgba(255, 255, 255, 0.3)`;
    ct.fillRect(0, 0, cv.width, cv.height);
    ct.restore();
  }
  if (bulletType === 2) {
    ct.save();
    ct.fillStyle = `rgba(255, 255, 255, 0.9)`;
    ct.fillRect(0, 0, cv.width, cv.height);
    ct.restore();
  }
  if (bulletType === 3) {
    ct.save();
    ct.fillStyle = `rgba(139, 0, 0, 0.2)`;
    ct.fillRect(0, 0, cv.width, cv.height);
    ct.restore();
  }
}

let lastSpawnTime = 0;
let interval = 1000;
function spawnTimeEnemies() {
  let curTime = new Date();

  if (curTime - lastSpawnTime >= interval) {
    if (interval > 300) {
      interval -= Math.ceil(0.01 * interval);
    }
    lastSpawnTime = curTime;
    spawnEnemies();
  }
}

function spawnEnemies() {
  let vecCenter = new Vector2(cv.width / 2, cv.height / 2);
  let vecEnemy = new Vector2(cv.width / 2 + 100, 0);
  vecEnemy.rotateTo(Math.random() * 360 * DEG2RAD);
  vecEnemy.add(vecCenter);
  let newEnemy = new enemy(enGG, vecEnemy.x, vecEnemy.y, 1, 100, 100);
  newEnemy.vel.set(unitPlayer.pos);
  newEnemy.vel.sub(newEnemy.pos).normalize().mult(newEnemy.speed);
  enemiesArr.push(newEnemy);
}

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
      if (vec.mag < 40) {
        enemiesArr.splice(enemyCount, 1);
        bulletArr.splice(bulletCount, 1);
        score++;
        document.querySelector(`#scoreNum`).innerHTML = score;
        f = true;
        break;
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

function gameloop() {
  if (unitPlayer.HP <= 0) {
    alert(`Ви сдохли`);
    location.reload();
  } else {
    window.requestAnimationFrame(gameloop);
    drawBackground();
    playerMove();
    unitPlayer.drawPlayer();
    unitPlayer.shot();
    unitPlayer.refreshWeaponCD();
    moveBullets();
    spawnTimeEnemies();
    enemyMove();
    killEnemy();
    checkHitPlayer();
  }
}

let startGame = document.querySelector(`.buttonPlay`);

startGame.onclick = function start() {
  document.querySelector(`.hello`).style.display = `none`;
  let bgVideo = document.querySelector(`.bgvideo`);
  bgVideo.remove();
  gameloop();
};
