# AEM Site Theme Builder

This repository contains scripts for building a Site Theme, ensuring compatibility to the requirements of AEM Site Templates.

## Installation

```
cd your site-theme
npm install @adobe/aem-site-theme-builder --save-dev
```

## Usage

### Live Preview

The live preview will proxy a Site running on AEM Cloud (Author) to localhost and replace requests made to the Site Theme with your locally compiled version of the Site Theme.

```
npx aem-site-theme-builder live
```

The URLs to a Site Theme can be optionally provided via `--config config.proxy.js`. In order to inject your locally compiled theme, the [location of compiled site theme](#expected-location-of-compiled-site-theme) must match.

### Theme Deployment

1. Compile your theme and make the artifact available on Github. AEM Cloud will try to access `https://api.github.com/repos /%GIT_ORG%/%GIT_REPO%/actions/artifacts/%GIT_ARTIFACT_ID%/zip` in order to download the theme.
1. Execute `npx aem-site-theme-builder deploy` in order to update the reference on AEM Cloud. 

## Expected location of compiled Site Theme

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
