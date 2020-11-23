# AEM Site Theme Builder

This repository contains scripts for building a Site Theme, ensuring compatibility with the requirements of AEM Site Templates. The recommended way of integrating the Theme Builder is to install it as an npm dependency of the Site Template Theme. This way `aem-site-theme-builder` commands can be used in NPM scripts. Example of such integration can be found in [Basic Site Template](https://github.com/gabrielwalt/aem-sites-template-basic/blob/master/site.theme/package.json).

## Installation

```
cd <your-site-theme>
npm install @adobe/aem-site-theme-builder --save-dev
```

## Usage

### Live Preview

The live preview will proxy a site running on AEM as a Cloud Service (author) to localhost and replace requests made to the Site Theme with your locally compiled version of the Site Theme.

```
npx aem-site-theme-builder live
```

The URLs to a Site Theme can be provided via `.env` described in [environment variables](#environment-variables). In order to inject your locally compiled theme, the [location of compiled site theme](#expected-location-of-compiled-site-theme) must match.

### Theme Deployment

1. Compile your theme and make the artifact available on GitHub. AEM as a Cloud Service will try to access `https://api.github.com/repos/%GIT_ORG%/%GIT_REPO%/actions/artifacts/%GIT_ARTIFACT_ID%/zip` in order to download the theme.
1. Execute `npx aem-site-theme-builder deploy` in order to update the reference on AEM as a Cloud Service.

## API

### Environment Variables

Theme Builder scripts are based on the environment variables you provide. These variables are used to properly provide live preview and deploy functionality of the AEM Site Theme Builder. Here is the list of required variables:

```
URL=<AEM as a Cloud Serivce url to your site>
GIT_ORG=<github organization name>
GIT_REPO=<github repository name>
GIT_ARTIFACT_ID=<github artifact ID>
GIT_TOKEN=<github token>
SITE=<your AEM as a Cloud Service site name>
AEM_SITE_PROXY_PORT=<localhost proxy server port>
```

Recommended way to define site variables is to use / create `.env` file within your theme project repository.

### Expected Location of Compiled Site Theme

You're free to use any build tools of your choice. The only contract with the Site Theme Builder is that the compiled artifact shall be provided as follows:

```
dist/
    css/
        theme.css
    js/
        theme.js
    resources/
        a-font.font
        an-image.png
```

## Release and publish

Run the "Release and publish" GitHub workflow and provide the semantic version you're about to release.

## Contributing

Contributions are welcomed! Read the [Contributing Guide](.github/CONTRIBUTING.md) for more information.

## Licensing

This project is licensed under the MIT License. See [LICENSE](LICENSE.md) for more information.
