# AEM Site Theme Builder

This repository contains scripts for building a Site Theme, ensuring compatibility with the requirements of AEM Site Templates.  Recommended way of integration is to install Theme Builder as a npm dependency of the Site Template Theme. This way `aem-site-theme-builder` commands can be used in NPM scripts. Good example of such integration can be found in [Basic Site Template](https://github.com/gabrielwalt/aem-sites-template-basic/blob/master/site.theme/package.json).

## Installation

```
cd <your-site-theme>
npm install @adobe/aem-site-theme-builder --save-dev
```

## Usage

### Live Preview

The live preview will proxy a site running on AEM Cloud (author) to localhost and replace requests made to the Site Theme with your locally compiled version of the Site Theme.

```
npx aem-site-theme-builder live
```

The URLs to a Site Theme can be provided via `.env` described in [environment variables](#environment-variables). In order to inject your locally compiled theme, the [location of compiled site theme](#expected-location-of-compiled-site-theme) must match.

### Theme Deployment

1. Compile your theme and make the artifact available on Github. AEM Cloud will try to access `https://api.github.com/repos/%GIT_ORG%/%GIT_REPO%/actions/artifacts/%GIT_ARTIFACT_ID%/zip` in order to download the theme.
1. Execute `npx aem-site-theme-builder deploy` in order to update the reference on AEM Cloud. 

## API

### Environment Variables

Theme builder scripts are based on the environment variables you will provide. These variables are used to be able to properly provide live preview and deploy functionalities of the AEM Site Theme Builder. Here is the list of required ones:
```
URL=<AEM Cloud url to your site>
AEM_USER=<username for AEM Cloud>
AEM_PASS=<password for AEM Cloud>
GIT_ORG=<github organization name>
GIT_REPO=<github repository name>
GIT_ARTIFACT_ID=<github artifactid>
GIT_TOKEN=<github token>
SITE=<your AEM Cloud site name>
AEM_SITE_PROXY_PORT=<localhost proxy server port>
```

Recommended way is to use / create `.env` file within your theme project repository. 

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

## Contributing

Contributions are welcomed! Read the [Contributing Guide](https://git.corp.adobe.com/ref-squad/aem-site-theme-builder/blob/master/CONTRIBUTING.md) for more information.

## Licensing

This project is licensed under the MIT License. See [LICENSE](https://git.corp.adobe.com/ref-squad/aem-site-theme-builder/blob/master/LICENSE.md) for more information.
