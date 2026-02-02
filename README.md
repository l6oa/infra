# @l6oa/infra

infra is a command-line tool for managing cloud infrastructure based on reusable templates.

## Add as a global command

Add the following line to your `.bashrc` or equivalent:

```bash
alias infra='npx @l6oa/infra'
```

Restart your terminal and check that the command is working:
```bash
infra --version
infra help
```

## Use in a CD pipeline

Your pipeline must run on a Node.js image and define the following environment variables:

- `AWS_ACCESS_KEY_ID`
- `AWS_SECRET_ACCESS_KEY`
- `AWS_SESSION_TOKEN` (optional)
- `INFRA_TFSTATES_BUCKET_NAME` Name of the bucket where to store the Terraform states
- `INFRA_TFSTATES_BUCKET_REGION` Region of the bucket where to store the Terraform states

Install Terraform:

```bash
TF_VERSION=1.9.8
ARCH=linux_amd64

wget https://releases.hashicorp.com/terraform/${TF_VERSION}/terraform_${TF_VERSION}_${ARCH}.zip
unzip terraform_${TF_VERSION}_${ARCH}.zip
mv terraform /usr/local/bin/
chmod +x /usr/local/bin/terraform
```

Run:

```bash
npx @l6oa/infra <args>
```
