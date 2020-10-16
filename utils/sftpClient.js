const SftpWatcher = require("../js/service");                            

class SftpClient {
  constructor() {
    this.con = new SftpWatcher({
      host: process.env.SFTP_HOST,
      port: process.env.SFTP_PORT,
      username: process.env.SFTP_USERNAME,
      password: process.env.SFTP_PASSWORD,
      path : process.env.SFTP_PATH
    });
  }
}

module.exports = SftpClient