/**
 * Development environment settings
 *
 * This file can include shared settings for a development team,
 * such as API keys or remote database passwords.  If you're using
 * a version control solution for your Sails app, this file will
 * be committed to your repository unless you add it to your .gitignore
 * file.  If your repository will be publicly viewable, don't add
 * any private information to this file!
 *
 */

module.exports = {
  SMTP: {
    email: 'support@vcancy.com',
    password: 'Mvp2019('
  },
  // fileUploadPath: 'C:\\xampp\\htdocs\\Vcancy\\login\\images\\'
  fileUploadPath: process.env.FILE_UPLOAD_PATH || '/var/www/html/login/uploads/'
  /***************************************************************************
   * Set the default database connection for models in the development       *
   * environment (see config/connections.js and config/models.js )           *
   ***************************************************************************/

  // models: {
  //   connection: 'someMongodbServer'
  // }

};
