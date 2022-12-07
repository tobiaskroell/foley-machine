
# Automatic Foley Machine
    
## Installation

Clone the project

```bash
  git clone https://github.com/KevinKroell/avprg-project
```

### Node server
#### **Installing Node.js**
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
#### **Installing dependencies**
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

#### Send video to python server

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

- [@KevinKroell](https://github.com/KevinKroell)
- [@SirMightyMo](https://github.com/SirMightyMo)
- [@LeanderWernst](https://github.com/LeanderWernst)
