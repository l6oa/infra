# @l6oa/infra

## Install as a global command

Add the following lines to your `.bashrc`:

```bash
export NPM_AUTH_TOKEN='<NPM token>'
alias infra='corepack yarn@4.3.1 dlx --quiet @l6oa/infra'
```

Add a file named `.yarnrc.yml` in your home folder containing the following:

```yml
npmAuthToken: ${NPM_AUTH_TOKEN:-}
```

Restart your terminal and check that the command is working:
```bash
infra --version
infra help
```

## Use in Bitbucket pipelines

Add the same `.yarnrc.yml` file from the previous step at the root of your repository.

Define the following environment variables:

- `NPM_AUTH_TOKEN`
- `INFRA_TFSTATES_BUCKET_NAME` Name of the bucket where to store the Terraform states
- `INFRA_TFSTATES_BUCKET_REGION` Region of the bucket where to store the Terraform states
- `AWS_ACCESS_KEY_ID`
- `AWS_SECRET_ACCESS_KEY`
- `AWS_SESSION_TOKEN` (optional)

Add the following step to your `bitbucket-pipelines.yml`:

```yml
  name: Deploy
  image: node:20
  services:
    - docker
  script:
    # https://developer.hashicorp.com/terraform/tutorials/aws-get-started/install-cli
    - apt-get update
    - apt-get install gnupg software-properties-common -y
    - 'wget -O- https://apt.releases.hashicorp.com/gpg |
       gpg --dearmor |
       tee /usr/share/keyrings/hashicorp-archive-keyring.gpg'
    - 'echo "deb [signed-by=/usr/share/keyrings/hashicorp-archive-keyring.gpg]
       https://apt.releases.hashicorp.com $(lsb_release -cs) main" |
       tee /etc/apt/sources.list.d/hashicorp.list'
    - apt update
    - apt-get install terraform
    - corepack enable
    - corepack yarn@3.2.1 dlx -q @l6oa/infra deploy <environment>
```
