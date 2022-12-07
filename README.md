# Automatic Foley Machine

## Table of contents

- [Installation](https://github.com/KevinKroell/avprg-project#installation)  
  - [Node server](https://github.com/KevinKroell/avprg-project#node-server)
    - [Installing Node.js](https://github.com/KevinKroell/avprg-project#installing-nodejs)
    - [*Optional:* Installing NVM](https://github.com/KevinKroell/avprg-project#optional-installing-nvm-node-version-manager)
    - [Using NVM](https://github.com/KevinKroell/avprg-project#using-nvm)
    - [Installing dependencies](https://github.com/KevinKroell/avprg-project#installing-dependencies)
  - [Python server](https://github.com/KevinKroell/avprg-project#python-server)
  - [Decrypt API-Token](https://github.com/KevinKroell/avprg-project#decrypt-api-token) 
    - [Setup git-secret](https://github.com/KevinKroell/avprg-project#setup-git-secret)
    - [(Re)-Encrypt Files](https://github.com/KevinKroell/avprg-project#re-encrypt-files)
- [Run locally](https://github.com/KevinKroell/avprg-project#run-locally)
  - [Start Node server](https://github.com/KevinKroell/avprg-project#start-node-server)
  - [Start Python server](https://github.com/KevinKroell/avprg-project#start-python-server)
- [API Reference](https://github.com/KevinKroell/avprg-project#api-reference)
  - [Send video to Python server](https://github.com/KevinKroell/avprg-project#send-video-to-python-server)
- [Authors](https://github.com/KevinKroell/avprg-project#authors)


## Installation

Clone the project

```bash
  git clone https://github.com/KevinKroell/avprg-project
```

### Node server
#### **Node.js**
The web server is running on **[Node.js](https://nodejs.org/) version 18.12.1 LTS** (requires at least v18.0.0), using its experimental fetch API.  

#### *Optional:* Installing NVM (Node Version Manager)
To organize node installations, it is recommended to use a node version manager like [NVM (Windows)](https://github.com/coreybutler/nvm-windows/releases) or [NVM (Linux/Mac)](https://github.com/nvm-sh/nvm/releases).  
⚠️ It is recommended to uninstall Node.js if it is already installed to avoid conflicts.

On Windows, just download the latest installer provided on the link above and follow the process.  
On Linux/Mac use your terminal to run the installer and follow the process as [described here](https://github.com/nvm-sh/nvm#installing-and-updating):
```sh
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.2/install.sh | bash

# or (depending on what you are using)

wget -qO- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.2/install.sh | bash

# make sure you are installing the desired version vA.B.C
```

> Running either of the above commands downloads a script and runs it. The script clones the nvm repository to \~/.nvm, and attempts to add the source lines from the snippet below to the correct profile file (\~/.bash_profile, \~/.zshrc, \~/.profile, or \~/.bashrc).

```sh
export NVM_DIR="$([ -z "${XDG_CONFIG_HOME-}" ] && printf %s "${HOME}/.nvm" || printf %s "${XDG_CONFIG_HOME}/nvm")"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh" # This loads nvm
```

After installing nvm on Windows, Linux oder MacOS, you can check the installation with `nvm -v`, which should return the version installed:

#### Using NVM

To install a Node.js version:
```sh
nvm install v18.12.1
# or for the latest
nvm install latest
```
For setting a version as default (Linux/MacOS), use:

```sh
nvm alias default vA.B.C
```

For switching to a specific version, use:
```sh
nvm use vA.B.C
# or
nvm use latest
# or 
nvm use lts
```

Check selected Node version with `nvm current`.

⚠️ **Global npm modules**
> Please note that any global npm modules you may have installed are not shared between the various versions of node.js you have installed. Additionally, some npm modules may not be supported in the version of node you're using, so be aware of your environment as you work.  

(e.g. Nodemon: supported, but needs to be installed again for active version)
#### Installing dependencies
Following dependencies are currently existing in this project:
- Express
- Express Fileupload
- FFProbe
- FFProbe-Static

To install them, follow these two steps:

1. Change into node.js project directory
```sh
  cd ./node_server
```
2. Install dependencies with npm

```sh
  npm install
```

### Python server
```
tbd
```

### Decrypt API-Token
The API-Token used to communicate with the [freesound.org API](https://freesound.org/docs/api/) has been encrypted with [git-secret](https://git-secret.io/), to prevent it from being available to anybody having access to this repository.  
___
⚠️If you don't want to use the integrated API-Token, you can skip this step and just insert your own `secret.js` located here: `./node_server/secret.js`  
⚠️Contents of that file should be:
```js
const freesoundToken = 'your-api-token-from-freesound';
module.exports = { freesoundToken };
```
___   


#### Setup git-secret
In order to decrypt the needed files and use the implemented token you need to install *git-secret*, which requires some additional steps:  
1. Install [git](https://git-scm.com/)
2. Install [gpg](https://www.gnupg.org/) (Linux/Mac)
- Follow [this guide](https://www.devdungeon.com/content/gpg-tutorial#install_gpg) for instructions depending on your OS
3. Install [git-secret (Installation Guide)](https://git-secret.io/installation)
    - Windows Machines require additional unix tools, easiest installed using [Windows Subsystem for Linux ](https://learn.microsoft.com/en-us/windows/wsl/install) on Win10/Win11 (e.g. `wsl --install -d Ubuntu`)  
    - After installing WSL, start the Linux Subsystem and install additional packages by running the command `sudo apt-get install gnupg make man git gawk file`  
    - In your subsystem proceed with the [manual installation](https://git-secret.io/installation#manual-installation):  
      `git clone https://github.com/sobolevn/git-secret.git git-secret`  
      `cd git-secret && make build`  
      `sudo PREFIX="/usr/local" make install`
4. Generate a RSA key-pair: `gpg --gen-key`
5. Export your public key with `gpg --armor --export you@email.com > public_key.txt`
6. Send public key to someone who already has access (On WSL you can reach your Windows Files at `/mnt/`. For example change directory to your C: Drive `cd /mnt/c`)
    - This person needs to import that key with `gpg --import public_key.txt`
    - Add the new person to the secrets repo: `git secret tell you@email.com` (email address associated with their public key)
    - Remove other user's public key from personal keyring with `gpg --delete keys you@email.com`
7. Wait for the protected files to be re-encrypted by a person who already has access, since you can't read these files yet
8. If your access has granted, you now can decrypt the protected files with `git secret reveal`  

#### **(Re)-Encrypt Files**  
In order to re-encrypt files, for example when needing to add a user, you shoudl run the following commands:
```sh
git secret reveal; git secret hide -d
# the -d option deletes the unencrypted file after re-encrypting it
```

If you want to add new files for encryption, you can add these by running `git secret add <filenames...>`.
This will also add entries to the `.gitignore` preventing unencrypted files being pushed to the repo.  
Then use `git secret hide` to encrypt these added files.  
**Now it is safe to commit your changes.**

## Run Locally

### Start Node server
Change into node directory
```sh
  cd ./node_server
```

Start the server

```sh
  npm start
```

### Start Python server
```
uvicorn main:app --reload
```

## API Reference

#### Send video to Python server

```http
  POST /video
```

| Required Type | Description |
| :------------ | :---------- |
| `json`        | **Required**. Information about video to be processed. |

```
  {
      "video_name" : funnycats.mp4
  }
```
## Authors

[@KevinKroell](https://github.com/KevinKroell)  
[@SirMightyMo](https://github.com/SirMightyMo)  
[@LeanderWernst](https://github.com/LeanderWernst)