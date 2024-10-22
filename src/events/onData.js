import { config } from '../config/config.js';
import { PACKET_TYPE } from '../constants/header.js';
import { getHandlerById } from '../handlers/index.js';
import { getProtoMessages } from '../init/loadProtos.js';
import { getUserById, getUserBySocket } from '../session/user.session.js';
import CustomError from '../utils/error/customError.js';
import { ErrorCodes } from '../utils/error/errorCodes.js';
import { handleError } from '../utils/error/errorHandler.js';
import { packetParser } from '../utils/parser/packetParser.js';

export const onData = (socket) => async (data) => {
  console.log('onData ===>>> ');

  // * 자기자신과 새로들어온 버퍼와 합침
  socket.buffer = Buffer.concat([socket.buffer, data]);

  const totalHeaderLength = config.packet.totalLength + config.packet.typeLength;

  while (socket.buffer.length >= totalHeaderLength) {
    //
    const length = socket.buffer.readUInt32BE(0);
    const packetType = socket.buffer.readUInt8(config.packet.totalLength);

    if (socket.buffer.length >= length) {
      console.log(`length: ${length}, packetType: ${packetType}`);

      // slice === subarray
      const packet = socket.buffer.subarray(totalHeaderLength, length);
      socket.buffer = socket.buffer.subarray(length);

      console.log(`packet: ${packet}`);

      try {
        switch (packetType) {
          case PACKET_TYPE.PING: {
            // const user 중복사용을 위한 scope 지정
            const protoMessages = getProtoMessages();
            const Ping = protoMessages.common.Ping;
            const pingMessage = Ping.decode(packet);
            const user = getUserBySocket(socket);
            if (!user) {
              throw new CustomError(ErrorCodes.USER_NOT_FOUND, '유저를 찾을 수 없습니다.');
            }
            user.handlePong(pingMessage);

            break;
          }
          case PACKET_TYPE.NORMAL:
            const { handlerId, userId, payload, sequence } = packetParser(packet);

            const user = getUserById(userId);
            console.log('[onData] user =>>> ', user);
            if (user && user.sequence !== sequence) {
              console.error(`잘못된 호출값입니다.`);
              throw new CustomError(ErrorCodes.INVALID_SEQUENCE, `잘못된 호출값입니다.`);
            }

            const handler = getHandlerById(handlerId);

            await handler({ socket, userId, payload });

            console.log('[ packet Parser ] ======================= ');
            console.log(`handlerId: ${handlerId}`);
            console.log(`userId: ${userId}`);
            console.log(`payload: ${payload}`);
            console.log(`sequence: ${sequence}`);
            break;
        }
      } catch (e) {
        // 에러 핸들러 적용
        handleError(socket, e);
      }
    } else {
      // 아직 전체 패킷이 도착하지 않았음.
      break;
    }
  }
};
