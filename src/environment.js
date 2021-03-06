import _ from "lodash";
import ip from "ip";

const electron = window.require('electron');
export const remote = electron.remote;
export const clipboard = electron.clipboard;
export const dialog = remote.dialog;
export const shell = electron.shell;

// normal import won't work for electron app, so special process here
export const fs = remote.require('fs');
export const os = remote.require('os');
export const ping = remote.require('ping');
export const node_ssh = remote.require('node-ssh');
export const tmp = remote.require('tmp');
export const path = remote.require('path');

tmp.setGracefulCleanup();

// env related
const {process} = remote;
const electron_start_url = process.env.ELECTRON_START_URL;
export const executableDir = process.env.PORTABLE_EXECUTABLE_DIR || './output';
export const isDev = !!electron_start_url;        // we are in dev mode env ELECTRON_START_URL is set

// ca files
export let caCertFile = `${executableDir}/ca.crt`;
export let serverCertFile = `${executableDir}/server.crt`;
export let serverPrivateKeyFile = `${executableDir}/server.key`;
export let dhPemFile = `${executableDir}/dh.pem`;
export const changeKeyfilesPath = (keyFilesDir) => {
  caCertFile = `${keyFilesDir}/ca.crt`;
  serverCertFile = `${keyFilesDir}/server.crt`;
  serverPrivateKeyFile = `${keyFilesDir}/server.key`;
  dhPemFile = `${keyFilesDir}/dh.pem`;
};

// network address
const interfaces = os.networkInterfaces();
const privateAddresses = [];
const publicAddresses = [];
_.forEach(interfaces, (addresses, interfaceName) => {
  const noneInternalAddresses = addresses.filter(address => address.family === 'IPv4' && !address.internal);

  noneInternalAddresses.forEach(address => {
    if (address.internal) return;
    if (ip.isPrivate(address.address)) {
      privateAddresses.push({interfaceName, ...address});
    } else {
      publicAddresses.push({interfaceName, ...address});
    }

  });
});

console.log('****publicAddresses', publicAddresses);
console.log('****privateAddresses', privateAddresses);

const privateAddress = privateAddresses.length > 0 && privateAddresses[0].address;
export const internalNetwork = isDev ? (privateAddress ? ip.mask(privateAddress, '255.255.255.0'): '192.168.1.0') : '';

export const routerInternalIP = ip.or(internalNetwork, '0.0.0.1');

export const publicAddress = publicAddresses.length > 0 ? publicAddresses[0].address :  '';
