#!/usr/bin/env node

const inquirer = require("inquirer");
const { exec } = require("child_process");
const { readFile } = require("fs/promises");
const { writeFileSync } = require("fs");
const os = require("os");
const pogitConfigData = require(`${__dirname}/.pogitconfig.json`);

let localRepoName = null;
if (process.argv[4]) {
  localRepoName = process.argv[4];
}

const hostRegex = /(?<=Host\s)[\w.-]+/g;

function main() {
  const keyword = process.argv[2];

  switch (keyword) {
    case "clone":
      clone();
      break;
    case "reset":
      resetConfigFile();
      break;

    default:
      console.log("command not found");
      break;
  }
}

async function emailSetup(chosenHost) {
  console.log("No email found for chosen alias. Initiating one time setup.");
  const { email } = await inquirer.prompt([
    {
      type: "input",
      name: "email",
      message: `Please input an email for ${chosenHost}:`,
    },
  ]);
  const { username } = await inquirer.prompt([
    {
      type: "input",
      name: "username",
      message: `Please input an github username for ${chosenHost} (exactly as it appears on github):`,
    },
  ]);
  pogitConfigData[chosenHost] = {
    email,
    username,
  };
  writeFileSync(
    `${__dirname}/.pogitconfig.json`,
    JSON.stringify(pogitConfigData),
    (err) => {
      if (err) {
        console.log("Error writing file", err);
      } else {
        console.log("Successfully added new user email data.");
      }
    }
  );
}

function clone() {
  let chosenHost = "";

  readFile(`${os.homedir()}/.ssh/config`)
    .then((configInfo) => {
      const sshConfig = configInfo.toString();
      const hosts = sshConfig.match(hostRegex) || [];
      if (hosts.length === 0) {
        console.log("No hosts found in the SSH configuration.");
        return;
      }
      const repoUrl = process.argv[3].match(/github\.com\/(.*)/s)[1];
      if (!localRepoName) {
        localRepoName = repoUrl.match(/[^\/]+$/)[0];
      }
      const usernames = hosts.map((host) => {
        return host.match(/github\.com-(.+)/)[1];
      });

      inquirer
        .prompt([
          {
            type: "list",
            name: "selectedHost",
            message: "Please choose a github alias:",
            choices: hosts,
          },
        ])
        .then(async (answers) => {
          console.log("You selected:", answers.selectedHost);
          chosenHost = answers.selectedHost;
          if (!(chosenHost in pogitConfigData)) {
            await emailSetup(chosenHost);
          }
          const cloneCommand = `git clone git@${chosenHost}:${repoUrl}.git ${localRepoName}`;
          return cloneCommand;
        })
        .then((cloneCommand) => {
          return exec(cloneCommand, (error, stdout, stderr) => {
            if (error) {
              console.error(`exec error: ${error}`);
              return;
            }
            // console.log(`stdout: ${stdout}`);
            console.error(`${stderr}`);
            exec(
              `cd ${localRepoName} && git config user.name '${pogitConfigData[chosenHost].username}' && git config user.email '${pogitConfigData[chosenHost].email}'`,
              (error, stdout, stderr) => {
                if (error) {
                  console.error(`exec error: ${error}`);
                  return;
                }
                // console.log(`stdout: ${stdout}`);
                // console.error(`stderr: ${stderr}`);
              }
            );
          });
        })
        .catch((error) => {
          if (error.isTtyError) {
            console.log(
              "Prompt couldn't be rendered in the current environment"
            );
          } else {
            console.error("An error occurred:", error);
          }
        });
    })
    .catch((error) => {
      console.error("Failed to read SSH config file:", error);
    });
}

async function resetConfigFile() {
  try {
    await writeFile(configFilePath, JSON.stringify({}), "utf8");
    console.log("Config file has been reset to empty.");
  } catch (error) {
    console.error("An error occurred while resetting the config file:", error);
  }
}

main();
