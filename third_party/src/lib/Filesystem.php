<?php

/**
 * Simple wrapper class for common filesystem tasks like reading and writing
 * files. When things go wrong, this class throws detailed exceptions with
 * good information about what didn't work.
 *
 * Filesystem will resolve relative paths against PWD from the environment.
 * When Filesystem is unable to complete an operation, it throws a
 * FilesystemException.
 *
 * @task directory   Directories
 * @task file        Files
 * @task path        Paths
 * @task exec        Executables
 * @task assert      Assertions
 */
final class Filesystem extends Phobject {

    /* -(  Files  )-------------------------------------------------------------- */

    /**
     * Read a file in a manner similar to file_get_contents(), but throw detailed
     * exceptions on failure.
     *
     * @param string $path File path to read. This file must exist and be readable,
     *                     or an exception will be thrown.
     * @return string Contents of the specified file.
     *
     * @task   file
     */
    public static function readFile($path) {
        $path = self::resolvePath($path);

        self::assertExists($path);
        self::assertIsFile($path);
        self::assertReadable($path);

        $data = @file_get_contents($path);
        if ($data === false) {
            throw new FilesystemException(
                $path,
                pht("Failed to read file '%s'.", $path));
        }

        return $data;
    }

    /**
     * Make assertions about the state of path in preparation for
     * writeFile() and writeFileIfChanged().
     */
    private static function assertWritableFile($path) {
        $path = self::resolvePath($path);
        $dir = dirname($path);

        self::assertExists($dir);
        self::assertIsDirectory($dir);

        // File either needs to not exist and have a writable parent, or be
        // writable itself.
        $exists = true;
        try {
            self::assertNotExists($path);
            $exists = false;
        } catch (Exception $ex) {
            self::assertWritable($path);
        }

        if (!$exists) {
            self::assertWritable($dir);
        }
    }

    /**
     * Write a file in a manner similar to file_put_contents(), but throw
     * detailed exceptions on failure. If the file already exists, it will be
     * overwritten.
     *
     * @param  string  File path to write. This file must be writable and its
     *                 parent directory must exist.
     * @param  string  Data to write.
     *
     * @task   file
     */
    public static function writeFile($path, $data) {
        self::assertWritableFile($path);

        if (@file_put_contents($path, $data) === false) {
            throw new FilesystemException(
                $path,
                pht("Failed to write file '%s'.", $path));
        }
    }

    /**
     * Write a file in a manner similar to `file_put_contents()`, but only touch
     * the file if the contents are different, and throw detailed exceptions on
     * failure.
     *
     * As this function is used in build steps to update code, if we write a new
     * file, we do so by writing to a temporary file and moving it into place.
     * This allows a concurrently reading process to see a consistent view of the
     * file without needing locking; any given read of the file is guaranteed to
     * be self-consistent and not see partial file contents.
     *
     * @param string file path to write
     * @param string data to write
     *
     * @return boolean indicating whether the file was changed by this function.
     */
    public static function writeFileIfChanged($path, $data) {
        if (file_exists($path)) {
            $current = self::readFile($path);
            if ($current === $data) {
                return false;
            }
        }
        self::assertWritableFile($path);

        // Create the temporary file alongside the intended destination,
        // as this ensures that the rename() will be atomic (on the same fs)
        $dir = dirname($path);
        $temp = tempnam($dir, 'GEN');
        if (!$temp) {
            throw new FilesystemException(
                $dir,
                pht('Unable to create temporary file in %s.', $dir));
        }
        try {
            self::writeFile($temp, $data);
            // tempnam will always restrict ownership to us, broaden
            // it so that these files respect the actual umask
            self::changePermissions($temp, 0666 & ~umask());
            // This will appear atomic to concurrent readers
            $ok = rename($temp, $path);
            if (!$ok) {
                throw new FilesystemException(
                    $path,
                    pht('Unable to move %s to %s.', $temp, $path));
            }
        } catch (Exception $e) {
            // Make best effort to remove temp file
            unlink($temp);
            throw $e;
        }
        return true;
    }

    /**
     * Remove a file or directory.
     *
     * @param  string    File to a path or directory to remove.
     * @return void
     *
     * @task   file
     */
    public static function remove($path) {
        if (!strlen($path)) {
            // Avoid removing PWD.
            throw new Exception(
                pht(
                    'No path provided to %s.',
                    __FUNCTION__.'()'));
        }

        $path = self::resolvePath($path);

        if (!file_exists($path)) {
            return;
        }

        self::executeRemovePath($path);
    }

    /**
     * Rename a file or directory.
     *
     * @param string    Old path.
     * @param string    New path.
     *
     * @task file
     */
    public static function rename($old, $new) {
        $old = self::resolvePath($old);
        $new = self::resolvePath($new);

        self::assertExists($old);

        $ok = rename($old, $new);
        if (!$ok) {
            throw new FilesystemException(
                $new,
                pht("Failed to rename '%s' to '%s'!", $old, $new));
        }
    }

    /**
     * Internal. Recursively remove a file or an entire directory. Implements
     * the core function of @{method:remove} in a way that works on Windows.
     *
     * @param  string    File to a path or directory to remove.
     * @return void
     *
     * @task file
     */
    private static function executeRemovePath($path) {
        if (is_dir($path) && !is_link($path)) {
            foreach (self::listDirectory($path, true) as $child) {
                self::executeRemovePath($path.DIRECTORY_SEPARATOR.$child);
            }
            $ok = rmdir($path);
            if (!$ok) {
                throw new FilesystemException(
                    $path,
                    pht("Failed to remove directory '%s'!", $path));
            }
        } else {
            $ok = unlink($path);
            if (!$ok) {
                throw new FilesystemException(
                    $path,
                    pht("Failed to remove file '%s'!", $path));
            }
        }
    }

    /**
     * Change the permissions of a file or directory.
     *
     * @param  string    Path to the file or directory.
     * @param  int       Permission umask. Note that umask is in octal, so you
     *                   should specify it as, e.g., `0777', not `777'.
     * @return void
     *
     * @task   file
     */
    public static function changePermissions($path, $umask) {
        $path = self::resolvePath($path);

        self::assertExists($path);

        if (!@chmod($path, $umask)) {
            $readable_umask = sprintf('%04o', $umask);
            throw new FilesystemException(
                $path,
                pht("Failed to chmod '%s' to '%s'.", $path, $readable_umask));
        }
    }

    /**
     * Get the last modified time of a file
     *
     * @param string Path to file
     * @return Time last modified
     *
     * @task file
     */
    public static function getModifiedTime($path) {
        $path = self::resolvePath($path);
        self::assertExists($path);
        self::assertIsFile($path);
        self::assertReadable($path);

        $modified_time = @filemtime($path);

        if ($modified_time === false) {
            throw new FilesystemException(
                $path,
                pht('Failed to read modified time for %s.', $path));
        }

        return $modified_time;
    }

    /**
     * Read random bytes from /dev/urandom or equivalent. See also
     * @{method:readRandomCharacters}.
     *
     * @param   int     Number of bytes to read.
     * @return  string  Random bytestring of the provided length.
     *
     * @task file
     */
    public static function readRandomBytes($number_of_bytes) {
        $number_of_bytes = (int)$number_of_bytes;
        if ($number_of_bytes < 1) {
            throw new Exception(pht('You must generate at least 1 byte of entropy.'));
        }

        // Try to use `openssl_random_pseudo_bytes()` if it's available. This source
        // is the most widely available source, and works on Windows/Linux/OSX/etc.

        if (function_exists('openssl_random_pseudo_bytes')) {
            $strong = true;
            $data = openssl_random_pseudo_bytes($number_of_bytes, $strong);

            if (!$strong) {
                // NOTE: This indicates we're using a weak random source. This is
                // probably OK, but maybe we should be more strict here.
            }

            if ($data === false) {
                throw new Exception(
                    pht(
                        '%s failed to generate entropy!',
                        'openssl_random_pseudo_bytes()'));
            }

            if (strlen($data) != $number_of_bytes) {
                throw new Exception(
                    pht(
                        '%s returned an unexpected number of bytes (got %s, expected %s)!',
                        'openssl_random_pseudo_bytes()',
                        new PhutilNumber(strlen($data)),
                        new PhutilNumber($number_of_bytes)));
            }

            return $data;
        }


        // Try to use `/dev/urandom` if it's available. This is usually available
        // on non-Windows systems, but some PHP config (open_basedir) and chrooting
        // may limit our access to it.

        $urandom = @fopen('/dev/urandom', 'rb');
        if ($urandom) {
            $data = @fread($urandom, $number_of_bytes);
            @fclose($urandom);
            if (strlen($data) != $number_of_bytes) {
                throw new FilesystemException(
                    '/dev/urandom',
                    pht('Failed to read random bytes!'));
            }
            return $data;
        }

        // (We might be able to try to generate entropy here from a weaker source
        // if neither of the above sources panned out, see some discussion in
        // T4153.)

        // We've failed to find any valid entropy source. Try to fail in the most
        // useful way we can, based on the platform.

        if (phutil_is_windows()) {
            throw new Exception(
                pht(
                    '%s requires the PHP OpenSSL extension to be installed and enabled '.
                    'to access an entropy source. On Windows, this extension is usually '.
                    'installed but not enabled by default. Enable it in your "s".',
                    __METHOD__.'()',
                    'php.ini'));
        }

        throw new Exception(
            pht(
                '%s requires the PHP OpenSSL extension or access to "%s". Install or '.
                'enable the OpenSSL extension, or make sure "%s" is accessible.',
                __METHOD__.'()',
                '/dev/urandom',
                '/dev/urandom'));
    }


    /**
     * Read random alphanumeric characters from /dev/urandom or equivalent. This
     * method operates like @{method:readRandomBytes} but produces alphanumeric
     * output (a-z, 0-9) so it's appropriate for use in URIs and other contexts
     * where it needs to be human readable.
     *
     * @param   int     Number of characters to read.
     * @return  string  Random character string of the provided length.
     *
     * @task file
     */
    public static function readRandomCharacters($number_of_characters) {

        // NOTE: To produce the character string, we generate a random byte string
        // of the same length, select the high 5 bits from each byte, and
        // map that to 32 alphanumeric characters. This could be improved (we
        // could improve entropy per character with base-62, and some entropy
        // sources might be less entropic if we discard the low bits) but for
        // reasonable cases where we have a good entropy source and are just
        // generating some kind of human-readable secret this should be more than
        // sufficient and is vastly simpler than trying to do bit fiddling.

        $map = array_merge(range('a', 'z'), range('2', '7'));

        $result = '';
        $bytes = self::readRandomBytes($number_of_characters);
        for ($ii = 0; $ii < $number_of_characters; $ii++) {
            $result .= $map[ord($bytes[$ii]) >> 3];
        }

        return $result;
    }


    /* -(  Directories  )-------------------------------------------------------- */


    /**
     * Create a directory in a manner similar to mkdir(), but throw detailed
     * exceptions on failure.
     *
     * @param  string    Path to directory. The parent directory must exist and
     *                   be writable.
     * @param  int       Permission umask. Note that umask is in octal, so you
     *                   should specify it as, e.g., `0777', not `777'.
     * @param  boolean   Recursively create directories. Default to false.
     * @return string    Path to the created directory.
     *
     * @task   directory
     */
    public static function createDirectory(
        $path,
        $umask = 0755,
        $recursive = false) {

        $path = self::resolvePath($path);

        if (is_dir($path)) {
            if ($umask) {
                self::changePermissions($path, $umask);
            }
            return $path;
        }

        $dir = dirname($path);
        if ($recursive && !file_exists($dir)) {
            // Note: We could do this with the recursive third parameter of mkdir(),
            // but then we loose the helpful FilesystemExceptions we normally get.
            self::createDirectory($dir, $umask, true);
        }

        self::assertIsDirectory($dir);
        self::assertExists($dir);
        self::assertWritable($dir);
        self::assertNotExists($path);

        if (!mkdir($path, $umask)) {
            throw new FilesystemException(
                $path,
                pht("Failed to create directory '%s'.", $path));
        }

        // Need to change permissions explicitly because mkdir does something
        // slightly different. mkdir(2) man page:
        // 'The parameter mode specifies the permissions to use. It is modified by
        // the process's umask in the usual way: the permissions of the created
        // directory are (mode & ~umask & 0777)."'
        if ($umask) {
            self::changePermissions($path, $umask);
        }

        return $path;
    }


    /**
     * Create a temporary directory and return the path to it. You are
     * responsible for removing it (e.g., with Filesystem::remove())
     * when you are done with it.
     *
     * @param  string    Optional directory prefix.
     * @param  int       Permissions to create the directory with. By default,
     *                   these permissions are very restrictive (0700).
     * @return string    Path to newly created temporary directory.
     *
     * @task   directory
     */
    public static function createTemporaryDirectory($prefix = '', $umask = 0700) {
        $prefix = preg_replace('/[^A-Z0-9._-]+/i', '', $prefix);

        $tmp = sys_get_temp_dir();
        if (!$tmp) {
            throw new FilesystemException(
                $tmp,
                pht('Unable to determine system temporary directory.'));
        }

        $base = $tmp.DIRECTORY_SEPARATOR.$prefix;

        $tries = 3;
        do {
            $dir = $base.substr(base_convert(md5(mt_rand()), 16, 36), 0, 16);
            try {
                self::createDirectory($dir, $umask);
                break;
            } catch (FilesystemException $ex) {
                // Ignore.
            }
        } while (--$tries);

        if (!$tries) {
            $df = disk_free_space($tmp);
            if ($df !== false && $df < 1024 * 1024) {
                throw new FilesystemException(
                    $dir,
                    pht('Failed to create a temporary directory: the disk is full.'));
            }

            throw new FilesystemException(
                $dir,
                pht("Failed to create a temporary directory in '%s'.", $tmp));
        }

        return $dir;
    }


    /**
     * List files in a directory.
     *
     * @param  string    Path, absolute or relative to PWD.
     * @param  bool      If false, exclude files beginning with a ".".
     *
     * @return array     List of files and directories in the specified
     *                   directory, excluding `.' and `..'.
     *
     * @task   directory
     */
    public static function listDirectory($path, $include_hidden = true) {
        $path = self::resolvePath($path);

        self::assertExists($path);
        self::assertIsDirectory($path);
        self::assertReadable($path);

        $list = @scandir($path);
        if ($list === false) {
            throw new FilesystemException(
                $path,
                pht("Unable to list contents of directory '%s'.", $path));
        }

        foreach ($list as $k => $v) {
            if ($v == '.' || $v == '..' || (!$include_hidden && $v[0] == '.')) {
                unset($list[$k]);
            }
        }

        return array_values($list);
    }


    /* -(  Paths  )-------------------------------------------------------------- */


    /**
     * Checks if a path is specified as an absolute path.
     *
     * @param  string
     * @return bool
     */
    public static function isAbsolutePath($path) {
        if (phutil_is_windows()) {
            return (bool)preg_match('/^[A-Za-z]+:/', $path);
        } else {
            return !strncmp($path, DIRECTORY_SEPARATOR, 1);
        }
    }

    /**
     * Canonicalize a path by resolving it relative to some directory (by
     * default PWD), following parent symlinks and removing artifacts. If the
     * path is itself a symlink it is left unresolved.
     *
     * @param  string $path Path, absolute or relative to PWD.
     * @return string Canonical, absolute path.
     *
     * @task   path
     */
    public static function resolvePath($path, $relative_to = null) {
        $is_absolute = self::isAbsolutePath($path);

        if (!$is_absolute) {
            if (!$relative_to) {
                $relative_to = getcwd();
            }
            $path = $relative_to.DIRECTORY_SEPARATOR.$path;
        }

        if (is_link($path)) {
            $parent_realpath = realpath(dirname($path));
            if ($parent_realpath !== false) {
                return $parent_realpath.DIRECTORY_SEPARATOR.basename($path);
            }
        }

        $realpath = realpath($path);
        if ($realpath !== false) {
            return $realpath;
        }


        // This won't work if the file doesn't exist or is on an unreadable mount
        // or something crazy like that. Try to resolve a parent so we at least
        // cover the nonexistent file case.
        $parts = explode(DIRECTORY_SEPARATOR, trim($path, DIRECTORY_SEPARATOR));
        while (end($parts) !== false) {
            array_pop($parts);
            if (phutil_is_windows()) {
                $attempt = implode(DIRECTORY_SEPARATOR, $parts);
            } else {
                $attempt = DIRECTORY_SEPARATOR.implode(DIRECTORY_SEPARATOR, $parts);
            }
            $realpath = realpath($attempt);
            if ($realpath !== false) {
                $path = $realpath.substr($path, strlen($attempt));
                break;
            }
        }

        return $path;
    }


    /**
     * Convert a canonical path to its most human-readable format. It is
     * guaranteed that you can use resolvePath() to restore a path to its
     * canonical format.
     *
     * @param  string    Path, absolute or relative to PWD.
     * @param  string    Optionally, working directory to make files readable
     *                   relative to.
     * @return string    Human-readable path.
     *
     * @task   path
     */
    public static function readablePath($path, $pwd = null) {
        if ($pwd === null) {
            $pwd = getcwd();
        }

        foreach (array($pwd, self::resolvePath($pwd)) as $parent) {
            $parent = rtrim($parent, DIRECTORY_SEPARATOR).DIRECTORY_SEPARATOR;
            $len = strlen($parent);
            if (!strncmp($parent, $path, $len)) {
                $path = substr($path, $len);
                return $path;
            }
        }

        return $path;
    }

    /**
     * Determine whether or not a path exists in the filesystem. This differs from
     * file_exists() in that it returns true for symlinks. This method does not
     * attempt to resolve paths before testing them.
     *
     * @param   string  Test for the existence of this path.
     * @return  bool    True if the path exists in the filesystem.
     * @task    path
     */
    public static function pathExists($path) {
        return file_exists($path) || is_link($path);
    }


    /**
     * Determine if an executable binary (like `git` or `svn`) exists within
     * the configured `$PATH`.
     *
     * @param   string  Binary name, like `'git'` or `'svn'`.
     * @return  bool    True if the binary exists and is executable.
     * @task    exec
     */
    public static function binaryExists($binary) {
        return self::resolveBinary($binary) !== null;
    }


    /**
     * Determine if two paths are equivalent by resolving symlinks. This is
     * different from resolving both paths and comparing them because
     * resolvePath() only resolves symlinks in parent directories, not the
     * path itself.
     *
     * @param string First path to test for equivalence.
     * @param string Second path to test for equivalence.
     * @return bool  True if both paths are equivalent, i.e. reference the same
     *               entity in the filesystem.
     * @task path
     */
    public static function pathsAreEquivalent($u, $v) {
        $u = self::resolvePath($u);
        $v = self::resolvePath($v);

        $real_u = realpath($u);
        $real_v = realpath($v);

        if ($real_u) {
            $u = $real_u;
        }
        if ($real_v) {
            $v = $real_v;
        }
        return ($u == $v);
    }


    /* -(  Assert  )------------------------------------------------------------- */


    /**
     * Assert that something (e.g., a file, directory, or symlink) exists at a
     * specified location.
     *
     * @param  string    Assert that this path exists.
     * @return void
     *
     * @task   assert
     */
    public static function assertExists($path) {
        if (!self::pathExists($path)) {
            throw new FilesystemException(
                $path,
                pht("File system entity '%s' does not exist.", $path));
        }
    }


    /**
     * Assert that nothing exists at a specified location.
     *
     * @param  string    Assert that this path does not exist.
     * @return void
     *
     * @task   assert
     */
    public static function assertNotExists($path) {
        if (file_exists($path) || is_link($path)) {
            throw new FilesystemException(
                $path,
                pht("Path '%s' already exists!", $path));
        }
    }


    /**
     * Assert that a path represents a file, strictly (i.e., not a directory).
     *
     * @param  string    Assert that this path is a file.
     * @return void
     *
     * @task   assert
     */
    public static function assertIsFile($path) {
        if (!is_file($path)) {
            throw new FilesystemException(
                $path,
                pht("Requested path '%s' is not a file.", $path));
        }
    }


    /**
     * Assert that a path represents a directory, strictly (i.e., not a file).
     *
     * @param  string    Assert that this path is a directory.
     * @return void
     *
     * @task   assert
     */
    public static function assertIsDirectory($path) {
        if (!is_dir($path)) {
            throw new FilesystemException(
                $path,
                pht("Requested path '%s' is not a directory.", $path));
        }
    }


    /**
     * Assert that a file or directory exists and is writable.
     *
     * @param  string    Assert that this path is writable.
     * @return void
     *
     * @task   assert
     */
    public static function assertWritable($path) {
        if (!is_writable($path)) {
            throw new FilesystemException(
                $path,
                pht("Requested path '%s' is not writable.", $path));
        }
    }


    /**
     * Assert that a file or directory exists and is readable.
     *
     * @param  string    Assert that this path is readable.
     * @return void
     *
     * @task   assert
     */
    public static function assertReadable($path) {
        if (!is_readable($path)) {
            throw new FilesystemException(
                $path,
                pht("Path '%s' is not readable.", $path));
        }
    }

}