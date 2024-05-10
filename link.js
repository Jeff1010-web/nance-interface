const fs = require('fs');
const path = require('path');

// Define an object that maps module names to their paths
const localLibraries = {
  "@nance/nance-editor": "../nance-sdk/packages/editor",
  "@nance/nance-sdk": "../nance-sdk/packages/core",
};

// Function to find the module path
function findLocalLibraryPath(moduleName) {
  return localLibraries[moduleName];
}

// Function to remove the symbolic link if it already exists
function removeExistingSymlink(linkPath) {
  try {
    const stats = fs.lstatSync(linkPath);
    if (stats.isSymbolicLink()) {
      fs.unlinkSync(linkPath);
      console.log(`Removed existing symlink: ${linkPath}`);
    }
  } catch (err) {
    // If the file doesn't exist or there's an error, it's safe to ignore
  }
}

// Function to create the symbolic link
function createSymlink(module) {
  let localLibraryPath = findLocalLibraryPath(module);
  // turn local path into an absolute path
  localLibraryPath = localLibraryPath ? path.resolve(__dirname, localLibraryPath) : null;
  if (!localLibraryPath) {
    console.error(`Module "${module}" not found in the specified paths.`);
    return;
  }
  console.log(`Module path: ${localLibraryPath}`);
  if (!localLibraryPath) {
    console.error(`Module "${module}" not found in the specified paths.`);
    return;
  }

  const nodeModulesPath = path.join(process.cwd(), 'node_modules');
  const thisNodeModulesDirPath = path.join(nodeModulesPath, module);

  // rename the existing local node_module to <node_module>.bak
  try {
    fs.renameSync(thisNodeModulesDirPath, `${thisNodeModulesDirPath}.bak`);
    console.log(`Renamed existing node_module to ${module}.bak`);
  } catch (err) {
    console.error(`Error renaming existing node_module: ${err.message}`);
  }

  try {
    fs.symlinkSync(localLibraryPath, thisNodeModulesDirPath, "dir");
    console.log(`Symlink created: ${thisNodeModulesDirPath} -> ${localLibraryPath}`);
  } catch (err) {
    console.error(`Error creating symlink: ${err.message}`);
  }
}

// Function to remove the symlink and reinstall the module from npm
function restoreOriginalModule(moduleName) {
  const nodeModulesPath = path.join(process.cwd(), 'node_modules');
  const linkPath = path.join(nodeModulesPath, moduleName);

  // Remove the existing symlink if it exists
  removeExistingSymlink(linkPath);

  try {
    // Restore the original module by renaming the .bak directory back to the original name
    fs.renameSync(`${linkPath}.bak`, linkPath);
    console.log(`Module "${moduleName}" restored from .bak`);
  } catch (err) {
    console.error(`Error reinstalling module: ${err.message}`);
  }
}

// Main function
function main() {
  const args = process.argv.slice(2);
  if (args.length !== 2) {
    console.error('Usage: node symlink <module-name> [create|remove]');
    return;
  }

  const moduleName = args[0];
  const action = args[1];

  if (action === 'create') {
    createSymlink(moduleName);
  } else if (action === 'remove') {
    restoreOriginalModule(moduleName);
  } else {
    console.error('Invalid action. Use "create" or "remove".');
  }
}

main();
