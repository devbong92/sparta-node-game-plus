import { createPingPacket } from '../../utils/notification/game.notification.js';

class User {
  constructor(id, socket) {
    this.id = id;
    this.socket = socket;
    // 좌표
    this.x = 0;
    this.y = 0;
    //
    this.sequence = 0;
    this.lastUpdateTime = Date.now();
    this.latency = 0; // 레이턴시 초기값 세팅은 선택 [*]
  }

  updatePosition(x, y) {
    this.x = x;
    this.y = y;
    this.lastUpdateTime = Date.now();
  }

  getNextSequence() {
    return ++this.sequence;
  }

  // ping을 보내는 메서드
  ping() {
    const now = Date.now();
    // console.log(`[${this.id}] ping`);

    this.socket.write(createPingPacket(now));
  }

  // 라운드 트립 레이턴시, 클라에서 반환
  handlePong(data) {
    const now = Date.now();
    this.latency = (now - data.timestamp) / 2; // 왕복이니까 반으로 나눔

    console.log(`Received pong from user ${this.id} at ${now} with latency ${this.latency}ms`);
  }

  calculatePosition(latency) {
    const timeDiff = latency / 1000; // 초 단위
    const speed = 1; // 속력은 1로 고정함, 원래는 게임 데이터 테이블에 저장되어있음.
    const distance = speed * timeDiff; // 거속시 공식

    return {
      x: this.x + distance,
      y: this.y,
    };
  }
}

export default User;
