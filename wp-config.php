<?php
/**
 * The base configuration for WordPress
 *
 * The wp-config.php creation script uses this file during the
 * installation. You don't have to use the web site, you can
 * copy this file to "wp-config.php" and fill in the values.
 *
 * This file contains the following configurations:
 *
 * * MySQL settings
 * * Secret keys
 * * Database table prefix
 * * ABSPATH
 *
 * @link https://codex.wordpress.org/Editing_wp-config.php
 *
 * @package WordPress
 */

// ** MySQL settings - You can get this info from your web host ** //
/** The name of the database for WordPress */
define('DB_NAME', 'vcancyca_wp452');

/** MySQL database username */
define('DB_USER', 'vcancyca_wp452');

/** MySQL database password */
define('DB_PASSWORD', 'pSB[(S823F');

/** MySQL hostname */
define('DB_HOST', 'localhost');

/** Database Charset to use in creating database tables. */
define('DB_CHARSET', 'utf8');

/** The Database Collate type. Don't change this if in doubt. */
define('DB_COLLATE', '');

/**#@+
 * Authentication Unique Keys and Salts.
 *
 * Change these to different unique phrases!
 * You can generate these using the {@link https://api.wordpress.org/secret-key/1.1/salt/ WordPress.org secret-key service}
 * You can change these at any point in time to invalidate all existing cookies. This will force all users to have to log in again.
 *
 * @since 2.6.0
 */
define('AUTH_KEY',         'pcjuttierwpdtprrjmraplq5hkwealyf5cmz4a3qolfwu54cstblgfz7znjplkje');
define('SECURE_AUTH_KEY',  'd2nwm3nkigdkyp5ivgtngpv8xuwuiz7x2cvhfzwav2iztdbfwzso7mtcuishkfp3');
define('LOGGED_IN_KEY',    '8mmoskgaxkeyqy6itzaaj8dlcbnhat5ovtmk8rl91mnuxxhnvvdvju9bemlveqvh');
define('NONCE_KEY',        '8qs7wlumzoisc5nmhwmr8xm6iuhnsjhaffuqrikido0cbcd9d00fxkwhbprkyxoy');
define('AUTH_SALT',        'ldidoyqieqwlemftnsvutqfwovypk9mhjqpplpafm1rq0if065nhmnkankyxb8un');
define('SECURE_AUTH_SALT', 'jen2crxthmq6rcshe0cf3835r7idz4k0d1jls3hyfosk6fltaepxyaaatocoyb4x');
define('LOGGED_IN_SALT',   'rw5bhdg2soukmjljrgnqawx5wgxferrxz07qukv5kom5bnmsc5qbmui1040iuckr');
define('NONCE_SALT',       'j48icm1qd7qnz8riyx9rvfwj4qbylm2xk93evbsmiyfdit9rqna9et3t0ry2zpas');

/**#@-*/

/**
 * WordPress Database Table prefix.
 *
 * You can have multiple installations in one database if you give each
 * a unique prefix. Only numbers, letters, and underscores please!
 */
$table_prefix  = 'wpf4_';

/**
 * For developers: WordPress debugging mode.
 *
 * Change this to true to enable the display of notices during development.
 * It is strongly recommended that plugin and theme developers use WP_DEBUG
 * in their development environments.
 *
 * For information on other constants that can be used for debugging,
 * visit the Codex.
 *
 * @link https://codex.wordpress.org/Debugging_in_WordPress
 */
define('WP_DEBUG', false);

/* That's all, stop editing! Happy blogging. */

/** Absolute path to the WordPress directory. */
if ( !defined('ABSPATH') )
	define('ABSPATH', dirname(__FILE__) . '/');

/** Sets up WordPress vars and included files. */
require_once(ABSPATH . 'wp-settings.php');
