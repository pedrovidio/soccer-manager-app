class NoopWebSocket {
  constructor() {
    throw new Error('Native WebSocket is required for Supabase Realtime in React Native.');
  }
}

module.exports = NoopWebSocket;
module.exports.default = NoopWebSocket;
