# pogit

pogit was created to make using git with two accounts on the same mac much easier.

pogit simplifies managing the use of git with multiple GitHub accounts on the same machine, specifically tailored for macOS users.

It enables seamless switching between GitHub accounts for cloning and managing repositories without the hassle of manually adjusting SSH configurations, and local git configs.

## Usage

- Install globally by cloning, and running `npm install -g` when with the cwd set as the repo, then use below commands

- `pogit clone <github repo url> <?file path>` **URL must be HTTPS,** _file path is optional._
  - This command will ask you to choose a GitHub account, by accessing your configured SSH profiles.
  - example use `pogit clone https://github.com/Slyose/pogit`

- `pogit reset`
  - This will clear all local username and email data - use if you've made an error inputting any details.

## Uninstallation

- Run `npm uninstall pogit -g` to uninstall the package.

## Setup

This repo will eventually be able to guide one through the setup process for multiple GitHub accounts on one PC, but for now, you must manually configure SSH profiles via the steps described in [this guide](https://www.linkedin.com/pulse/multiple-github-accounts-same-mac-hesham-osama) (or similar).

## To-do

- [ ] Implement SSH URL Support for `clone` command

  - e.g., _pogit clone git@github.com:Slyose/pogit.git_
    - would have to change *git@github.com* to use the appropriate SSH profile instead of _generic github.com_

- [ ] Automate SSH Profile Configuration: implement `pogit configure` command to allow a user to configure multiple SSH profiles from scratch.

- [ ] `pogit set remote` to change the URL of a repo AND the local config details to whichever GitHub profile they want.

- [ ] Implement support for non-standardized HostNames e.g., _'Host googlymoogly'_.

- [ ] General clean up, more consistent use of async/await over promises, more modularisation, & graceful error handling
