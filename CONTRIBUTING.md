# Contributing

## Getting Started

> This project adheres to the Contributor Covenant [code of conduct](./CODE_OF_CONDUCT.md). By participating in this project, you agree to abide by its terms.

First, create a fork of the [modernweb-dev/web](https://github.com/modernweb-dev/web) repository by hitting the `fork` button on the GitHub page.

Next, clone your fork onto your computer (replacing YOUR_USERNAME with your actual GitHub username).

```sh
git clone git@github.com:YOUR_USERNAME/web.git
```

Once cloning is complete, change directory to the repository and add the Modern Web project as a remote.

```sh
cd web
git remote add upstream git@github.com:modernweb-dev/web.git
```

## Preparing Your Local Environment for Development

Now that you have cloned the repository, ensure you have [yarn](https://classic.yarnpkg.com/lang/en/) installed, then run the following command to set up the development environment.

```sh
yarn install
```

This will download and install all packages needed.

## Making Your Changes

First, update your fork with the latest code from upstream, then create a new branch for your work.

```sh
git checkout master
git pull upstream master --rebase
git checkout -b my-awesome-fix
```

### Linting

Commits are linted using precommit hooks, meaning that any code that raises a linting error cannot be committed. In order to help avoid that, we recommend using an IDE or editor with an ESLint plugin in order to streamline the development process. Plugins are available for all the popular editors. For more information see [ESLint Integrations](https://eslint.org/docs/user-guide/integrations)

### Running Tests

To run the tests of a package, it's recommended to `cd` into the package directory and then using `yarn test` to run them. This way you're only running tests of that specific package.

### Adding New Packages

For all projects, the tsconfig/jsconfig configuration files are auto-generated. You need to add an entry to the [./workspace-packages.mjs](./workspace-packages.mjs) to let it generate a config for you. After adding an entry, run `yarn update-package-configs` to generate the files for you.

### Creating a Changeset

If you made changes for which you want to trigger a release, you need to create a changeset.
This documents your intent to release and allows you to specify a message that will be put into the changelog(s) of the package(s).

[More information on changesets](https://github.com/atlassian/changesets)

To create a changeset, run:

```sh
yarn changeset
```

Use the menu to select for which packages you need a release, and then select what kind of release. For the release type, we follow [Semantic Versioning](https://semver.org/), so please take a look if you're unfamiliar.

In short:

- A documentation change or similar chore usually does not require a release
- A bugfix requires a patch
- A new feature (feat) requires a minor
- A breaking change requires a major

Exceptions:

- For alpha (<1.0.0), bugfixes and feats are both patches, and breaking changes are allowed as minors.
- For release-candidate and other special cases, other rules may follow.

## Committing Your Changes

Commit messages must follow the [conventional commit format](https://www.conventionalcommits.org/en/v1.0.0/).
Modern Web uses the package name as the scope. So for example if you fix a _terrible bug_ in the package `@web/test-runner`, the commit message should look like this:

```sh
fix(test-runner): fix terrible bug
```

## Create a Pull Request

After you commit your changes, it's time to push your branch.

```sh
git push -u origin my-awesome-fix
```

After a successful push, visit your fork on GitHub. You should see a button that will allow you to create a pull request.
