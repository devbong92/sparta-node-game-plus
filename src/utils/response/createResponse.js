import { config } from '../../config/config.js';
import { PACKET_TYPE } from '../../constants/header.js';
import { getProtoMessages } from '../../init/loadProtos.js';
import { getNextSequence } from '../../session/user.session.js';

export const createResponse = (handlerId, responseCode, data = null, userId) => {
  //
  const protoMessages = getProtoMessages();
  const Response = protoMessages.response.Response;

  const responsePayload = {
    handlerId,
    responseCode,
    timestamp: Date.now(),
    data: data ? Buffer.from(JSON.stringify(data)) : null,
    sequence: userId ? getNextSequence(userId) : 0,
  };

  // finish() 꼭 써줘야함
  const buffer = Response.encode(responsePayload).finish();

  const packetLength = Buffer.alloc(config.packet.totalLength);
  // 모든 길이를 더해줌
  packetLength.writeUint32BE(
    buffer.length + config.packet.totalLength + config.packet.typeLength,
    0,
  );

  const packetType = Buffer.alloc(config.packet.typeLength);
  packetType.writeUint8(PACKET_TYPE.NORMAL, 0);

  return Buffer.concat([packetLength, packetType, buffer]);
};
