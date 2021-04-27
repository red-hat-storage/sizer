# ODF Sizing Tool

This repository contains the source code of the ODF 4 Sizing Tool.
The tool is hosted on https://sizer.ocs.ninja and pushes to main automatically update this site.

This tool is been kept up to date by [Brent Compton's](mailto:bcompton@redhat.com) team and is designed in a rolling release. Thus the website always refers to the latest ODF version.

## Using the source code

### Requirements

The requirements are managed with yarn. If you do not have yarn yet, please [install it on your platform](https://classic.yarnpkg.com/en/docs/install/#debian-stable).

Afterwards all dependencies can be installed via `yarn install` from within the root of this repository.

### Building the code

If you want to build the code in a one-off way, you can do so with `yarn build`. This will create the lib folder with the static site.

### Developing with the code

To develop it is handy to use the `yarn dev` feature that will automatically rebuild the code when there are changes to the source code.
Running `yarn dev` will spawn a server on http://localhost:9001 that you can visit to see the site with your code changes. When the code is rebuild, the browser will automatically refresh the site for you.
