# Amazon Chime SDK Classroom Demo

This demo shows how to use the Amazon Chime SDK to build an online classroom in Electron and React. This demo will ship two packages to the end user, one for windows and another one for mac.

<img src="resources/readme-hero.jpg" width="640" alt="Amazon Chime SDK Classroom Demo">

## Installation

To package this demo, there are two options available. The first option is to package the demo via Cloud9 and the second option is to package from the local machine.

The two options are very similar in their internal working. On a high level the following steps are performed in the packaging of the demo:

1. CLI arguments are parsed and the installation of prerequisites is verified. `yarn` is installed globally in the environment.
2. For installation option 1, Cloud9 volume size might be increased.
3. S3 buckets are created.
4. `sam` packages the application.
5. `sam` deploys the application.
6. The output of the AWS cloudformation stack is retrieved.
7. Using `electron-builder` mac application is packaged.
8. Using `electron-builder` windows application is packaged.
9. Generated packages are copied from local workspace / cloud9 environment to S3 buckets.

At the end of the script run, a link to download the packaged demos will be displayed. Now, the teacher and the students can use that link to download the classroom application on their machine.

### Option 1: Deploy via AWS Cloud9

#### Prerequisites

- Log into your AWS account with an IAM role that has the **AdministratorAccess** policy.
- Use the **us-east-1 (N. Virginia)** region of your AWS account.

#### Create an AWS Cloud9 environment

1. Go to the [AWS Cloud9 Dashboard](https://us-east-1.console.aws.amazon.com/cloud9/home?region=us-east-1).
2. Press the **Create environment** button or go [here](https://us-east-1.console.aws.amazon.com/cloud9/home/create).
3. For the Name enter `<unique environment name>` and press the **Next step** button.
4. For **Environment Settings** use the defaults and press the **Next step** button.
5. Review the **Environment name and settings** and press the **Create environment** button.
6. Wait for the environment to start.

#### Run the deployment script

Once the Cloud9 environment starts, run the following commands in the Terminal pane at the bottom of the window to download the application repository:

```
git clone https://github.com/aws-samples/amazon-chime-sdk-classroom-demo.git
cd amazon-chime-sdk-classroom-demo
npm i
```

Now in the same Terminal pane, run the following command to deploy, package, and create a distribution for your application. Note this will take about 15 minutes.

```bash
script/deploy.js -r <region> -a <app name> -s <unique stack name> -b <unique bucket name>
```

At the end of the script you will see a URL to a download page. Save this link.

### Option 2: Deploy from your local machine

> Note: Deployment from MacOS has been verified. Local deployment from Windows might require some additional setup. Please refer to the additional resources.

#### Prerequisites

To deploy the classroom demo you will need:

- Node 14 or higher
- npm 6.11 or higher

And install `aws` and `sam` command line tools:

- [Install the AWS CLI](https://docs.aws.amazon.com/cli/latest/userguide/install-cliv1.html)
- [Install the AWS SAM CLI](https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/serverless-sam-cli-install.html)

First deploy the stack:

```bash
git clone https://github.com/aws-samples/amazon-chime-sdk-classroom-demo.git
cd amazon-chime-sdk-classroom-demo
npm i
script/deploy.js -r <region> -a <app name> -s <unique stack name> -b <unique bucket name>
```

At the end of the script you will see a URL to a download page. Save this link. To run the application locally in Electron run:

```bash
yarn dev
```

Before pushing your commit, ensure that the application works okay in production mode.

```bash
yarn cross-env DEBUG_PROD=true yarn start
```

## Additional Resources

- Amazon Chime SDK Classroom demo uses electron builder to ship the application for Windows and MacOS. Refer to multi platform build documentation as it is a great resource to help debug packaging failures: [Electron Multi Platform Build](https://www.electron.build/multi-platform-build)

## Troubleshooting

### I get "The application ... can't be opened" when opening the app

The default zipping tool on MacOS Catalina may incorrectly unzip the package. Download an alternative (such as "The Unarchiver"), and unzip the package by right clicking and selecting "Open as". You may also need to adjust your security & privacy settings if you get an "unidentified developer" message.

### resize2fs: Bad magic number in super-block while trying to open /dev/xvda1

You might get this error from the `cloud9-resize.sh` script if you are using Cloud9 to deploy. This error is thrown by the deploy script but the volume size is successfully updated. A consecutive run of the deploy script should pass successfully.
