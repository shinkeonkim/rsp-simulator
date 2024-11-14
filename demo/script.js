const canvas = document.getElementById("canvas");
let elements = [];
let interval;
let speed = 10; // 기본 갱신 속도

const LABEL_BY_TYPE = {
  scissors: "가위",
  rock: "바위",
  paper: "보",
};

const ELEMENT_RADIUS = 25;

// 카운터 요소 참조
const scissorsCounter = document.getElementById("scissorsCounter");
const rockCounter = document.getElementById("rockCounter");
const paperCounter = document.getElementById("paperCounter");

class RSP {
  constructor(type, x, y) {
    this.type = type;
    this.x = x;
    this.y = y;
    this.setSpeed(); // 타입에 따른 속도 설정
    this.element = document.createElement("div");
    this.element.classList.add("element", this.type);
    canvas.appendChild(this.element);
    this.updatePosition();
  }

  // 요소의 타입에 맞는 속도 설정
  setSpeed() {
    if (this.type === "scissors") {
      this.speed = scissorsSpeed;
    } else if (this.type === "rock") {
      this.speed = rockSpeed;
    } else if (this.type === "paper") {
      this.speed = paperSpeed;
    }
    this.vx = Math.random() > 0.5 ? this.speed : -this.speed;
    this.vy = Math.random() > 0.5 ? this.speed : -this.speed;
  }

  updatePosition() {
    this.element.style.left = `${this.x}px`;
    this.element.style.top = `${this.y}px`;
  }

  moveToward(target) {
    const dx = target.x - this.x;
    const dy = target.y - this.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (distance > 0) {
      this.vx = (dx / distance) * this.speed;
      this.vy = (dy / distance) * this.speed;
    }
  }

  moveAway(target) {
    const dx = this.x - target.x;
    const dy = this.y - target.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (distance > 0) {
      this.vx = (dx / distance) * this.speed;
      this.vy = (dy / distance) * this.speed;
    }
  }

  reflectOnWall() {
    if (this.x <= 0) {
      this.x = 0;
      this.vx = Math.abs(this.vx);
    }
    if (this.x >= canvas.clientWidth - ELEMENT_RADIUS * 2) {
      this.x = canvas.clientWidth - ELEMENT_RADIUS * 2;
      this.vx = -Math.abs(this.vx);
    }
    if (this.y <= 0) {
      this.y = 0;
      this.vy = Math.abs(this.vy);
    }
    if (this.y >= canvas.clientHeight - ELEMENT_RADIUS * 2) {
      this.y = canvas.clientHeight - ELEMENT_RADIUS * 2;
      this.vy = -Math.abs(this.vy);
    }
  }

  avoidCollision(other) {
    const dx = other.x - this.x;
    const dy = other.y - this.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    const minDistance = ELEMENT_RADIUS * 2;

    if (distance < minDistance) {
      const angle = Math.atan2(dy, dx);
      const overlap = minDistance - distance;

      // 각 요소의 위치를 충돌 거리만큼 이동하여 겹침 방지
      this.x -= Math.cos(angle) * (overlap / 2);
      this.y -= Math.sin(angle) * (overlap / 2);
      other.x += Math.cos(angle) * (overlap / 2);
      other.y += Math.sin(angle) * (overlap / 2);

      // 충돌 반작용으로 방향 변경
      this.vx = -this.vx;
      this.vy = -this.vy;
      other.vx = -other.vx;
      other.vy = -other.vy;
    }
  }

  updatePositionWithMovement() {
    this.x += this.vx;
    this.y += this.vy;
    this.reflectOnWall();
    this.updatePosition();
  }

  checkCollision(target) {
    const dx = target.x - this.x;
    const dy = target.y - this.y;
    return Math.sqrt(dx * dx + dy * dy) < ELEMENT_RADIUS * 2;
  }

  resolveCollision(target) {
    const rules = {
      scissors: "paper",
      rock: "scissors",
      paper: "rock",
    };

    if (rules[this.type] === target.type) {
      target.type = this.type;
      target.setSpeed(); // 타입에 맞는 속도로 변경
      target.element.className = `element ${this.type}`;
      updateCounters(); // 변환 후 카운터 업데이트
    }
  }
}

// 각 요소 타입의 개수를 캔버스에 배치하는 함수
function spawnElements(type, count) {
  for (let i = 0; i < count; i++) {
    const x = Math.random() * (canvas.clientWidth - ELEMENT_RADIUS * 2);
    const y = Math.random() * (canvas.clientHeight - ELEMENT_RADIUS * 2);
    elements.push(new RSP(type, x, y));
  }
}

// 남은 요소 개수를 업데이트
function updateCounters() {
  const scissorsCount = elements.filter((el) => el.type === "scissors").length;
  const rockCount = elements.filter((el) => el.type === "rock").length;
  const paperCount = elements.filter((el) => el.type === "paper").length;

  scissorsCounter.textContent = `가위: ${scissorsCount}`;
  rockCounter.textContent = `바위: ${rockCount}`;
  paperCounter.textContent = `보: ${paperCount}`;
}

// 요소 초기화 및 생성
function initializeElements() {
  elements.forEach((element) => element.element.remove());
  elements = [];

  // 각 요소 속도 설정
  scissorsSpeed =
    parseFloat(document.getElementById("scissorsSpeed").value) || 2;
  rockSpeed = parseFloat(document.getElementById("rockSpeed").value) || 2;
  paperSpeed = parseFloat(document.getElementById("paperSpeed").value) || 2;

  const scissorsCount =
    parseInt(document.getElementById("scissorsCount").value) || 20;
  const rockCount = parseInt(document.getElementById("rockCount").value) || 20;
  const paperCount =
    parseInt(document.getElementById("paperCount").value) || 20;

  spawnElements("scissors", scissorsCount);
  spawnElements("rock", rockCount);
  spawnElements("paper", paperCount);
  updateCounters(); // 초기 카운터 업데이트
}

// 시뮬레이션 종료 조건 확인
function checkForWinner() {
  const firstType = elements[0].type;
  const allSameType = elements.every((element) => element.type === firstType);

  if (allSameType) {
    stopSimulation();
    alert(`${LABEL_BY_TYPE[firstType]}가 승리했습니다!`);
  }
}
// 시뮬레이션 업데이트 함수
function updateSimulation() {
  checkForWinner();

  elements.forEach((element) => {
    let closestEnemy = null;
    let minDistance = Infinity;
    let closestPredator = null;

    // 각 요소에 대해 천적과 포식자를 찾음
    elements.forEach((other) => {
      if (other === element) return;

      const rules = {
        scissors: "paper",
        rock: "scissors",
        paper: "rock",
      };

      if (rules[element.type] === other.type) {
        const dx = other.x - element.x;
        const dy = other.y - element.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        if (distance < minDistance) {
          minDistance = distance;
          closestEnemy = other;
        }
      }

      const predatorRules = {
        paper: "scissors",
        scissors: "rock",
        rock: "paper",
      };

      if (predatorRules[element.type] === other.type) {
        const distanceToPredator = Math.sqrt(
          Math.pow(other.x - element.x, 2) + Math.pow(other.y - element.y, 2)
        );
        if (!closestPredator || distanceToPredator < minDistance) {
          closestPredator = other;
        }
      }
    });

    // 1. 천적과의 충돌 시, 우선적으로 잡아먹는 동작을 수행
    if (closestEnemy && element.checkCollision(closestEnemy)) {
      element.resolveCollision(closestEnemy);
    } else if (closestEnemy) {
      // 2. 잡아먹을 수 있는 요소가 가까이 있을 때는 해당 요소를 쫓아감
      element.moveToward(closestEnemy);
    } else if (closestPredator) {
      // 3. 포식자가 가까이 있으면 도망감
      element.moveAway(closestPredator);
    }

    // 4. 다른 요소와의 충돌 회피 동작 수행
    elements.forEach((other) => {
      if (element !== other) {
        element.avoidCollision(other);
      }
    });

    // 업데이트된 위치를 적용
    element.updatePositionWithMovement();
  });
}

// 시뮬레이션 시작 함수
function startSimulation() {
  stopSimulation();
  initializeElements();

  speed = parseInt(document.getElementById("speed").value) || 10;
  interval = setInterval(updateSimulation, speed);
}

// 시뮬레이션 중지 함수
function stopSimulation() {
  clearInterval(interval);
}
