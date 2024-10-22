import pools from '../db/database.js';
import { testAllConnections } from '../utils/db/testConnection.js';
import { loadGameAssets } from './assets.js';
import { loadProtos } from './loadProtos.js';

const initServer = async () => {
  //
  try {
    await loadGameAssets();
    await loadProtos();

    // db test
    await testAllConnections(pools);
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
};

export default initServer;
