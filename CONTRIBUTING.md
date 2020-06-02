# Contributing

## Getting Started

> Please note that this project is released with a [Contributor Code of Conduct](./CODE_OF_CONDUCT.md). By participating in this project you agree to abide by its terms.

First, create a fork of the [open-wc/open-wc](https://github.com/modernweb-dev/web) repo by hitting the `fork` button on the GitHub page.

Next, clone our repository onto your computer with this command (replacing YOUR_USERNAME with your actual GitHub username)

```sh
git clone git@github.com:modernweb-dev/web.git
```

Once cloning is complete, change directory to the repo.

```sh
cd web
```

Now add your fork as a remote

```sh
git remote add fork git@github.com:<YOUR_NAME>/web.git
```

Create a new local branch

```sh
git checkout -b my-awesome-fix
```

## Preparing Your Local Environment for Development

Now that you have cloned the repository, ensure you have [yarn](https://classic.yarnpkg.com/lang/en/) installed run the following commands to set up the development environment.

```sh
yarn
```

This will download and install all packages needed.

## Making Your Changes

Make your changes to the project. Commits are linted using precommit hooks, meaning that any code that raises linting error cannot be committed. In order to help avoid that, we recommend using an IDE or editor with an eslint plugin in order to streamline the development process. Plugins are available for all the popular editors. For more information see [ESLint Integrations](https://eslint.org/docs/user-guide/integrations)

## Create a Changeset

If you made changes for which you want to trigger a release, you need to create a changeset.
This documents your intent to release, and allows you to specify a message that will be put into the changelog(s) of the package(s).

[More information on changesets](https://github.com/atlassian/changesets)

Run

```sh
yarn changeset
```

And use the menu to select for which packages you need a release, and then select what kind of release. For the release type, we follow [Semantic Versioning](https://semver.org/), so please take a look if you're unfamiliar.

In short:

- A documentation change or similar chore usually does not require a release
- A bugfix requires a patch
- A new feature (feat) requires a minor
- A breaking change requires a major

Exceptions:

- For alpha (<1.0.0), bugfixes and feats are both patches, and breaking changes are allowed as minors.
- For release-candidate and other special cases, other rules may follow.

## Committing Your Changes

Open WC uses [commitlint](https://github.com/marionebl/commitlint) to standardize commit messages in the project. Commit messages must follow the [conventional commit format](https://www.conventionalcommits.org/en/v1.0.0-beta.2/)
Open WC uses package name as scope. So for example if you fix a _terrible bug_ in the package `@web/test-runner`, the commit message should look like this:

```sh
fix(test-runner): fix terrible bug
```

## Create a Pull Request

Now it's time to push your branch that contains your committed changes to your fork.

```sh
git push -u fork my-awesome-fix
```

After a successful push, if you visit your fork on GitHub, you should see a button that will allow you to create a Pull Request from your forked branch, to our master branch.
