#!/usr/bin/env node

const { spawnSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Parameters
let region = '';
let bucket = '';
let stack = '';
let appName = '';

function usage() {
  console.log(
    `Usage: deploy.js -r <region> -a <app-name> -s <stack-name> -b <bucket>`
  );
  console.log(`  -r, --region       Deployment region, required`);
  console.log(
    `  -a, --app-name     Application name (e.g. MyClassroom), required`
  );
  console.log(
    `  -s, --stack-name   CloudFormation stack name (e.g. <your-name>-myclassroom-1), required`
  );
  console.log(
    `  -b, --s3-bucket    Globally unique S3 bucket prefix for deployment (e.g. <your-name>-myclassroom-1), required`
  );
  console.log('');
  console.log('Optional:');
  console.log(`  -h, --help         Show help and exit`);
}

function ensureBucket(bucketName, isWebsite) {
  const s3Api = spawnSync('aws', [
    's3api',
    'head-bucket',
    '--bucket',
    `${bucketName}`,
    '--region',
    `${region}`
  ]);
  if (s3Api.status !== 0) {
    console.log(`Creating S3 bucket ${bucketName}`);
    const s3 = spawnSync('aws', [
      's3',
      'mb',
      `s3://${bucketName}`,
      '--region',
      `${region}`
    ]);
    if (s3.status !== 0) {
      console.log(`Failed to create bucket: ${JSON.stringify(s3)}`);
      console.log((s3.stderr || s3.stdout).toString());
      process.exit(s3.status);
    }
    if (isWebsite) {
      const s3Website = spawnSync('aws', [
        's3',
        'website',
        `s3://${bucketName}`,
        '--index-document',
        `index.html`,
        '--error-document',
        'error.html'
      ]);
      if (s3Website.status !== 0) {
        console.log(`Failed to create bucket: ${JSON.stringify(s3Website)}`);
        console.log((s3Website.stderr || s3Website.stdout).toString());
        process.exit(s3Website.status);
      }
    }
  }
}

function getArgOrExit(i, args) {
  if (i >= args.length) {
    console.log('Too few arguments');
    usage();
    process.exit(1);
  }
  return args[i].trim();
}

function parseArgs() {
  const args = process.argv.slice(2);
  let i = 0;
  while (i < args.length) {
    switch (args[i]) {
      case '-h':
      case '--help':
        usage();
        process.exit(0);
        break;
      case '-r':
      case '--region':
        region = getArgOrExit(++i, args);
        break;
      case '-b':
      case '--s3-bucket':
        bucket = getArgOrExit(++i, args);
        break;
      case '-a':
      case '--app-name':
        appName = getArgOrExit(++i, args).replace(/[\W_]+/g, '');
        break;
      case '-s':
      case '--stack-name':
        stack = getArgOrExit(++i, args);
        break;
      default:
        console.log(`Invalid argument ${args[i]}`);
        usage();
        process.exit(1);
    }
    ++i;
  }
  if (!stack || !appName || !bucket || !region) {
    console.log('Missing required parameters');
    usage();
    process.exit(1);
  }
}

function spawnOrFail(command, args, options) {
  options = {
    ...options,
    shell: true
  };
  console.log(`--> ${command} ${args.join(' ')}`);
  const cmd = spawnSync(command, args, options);
  if (cmd.error) {
    console.log(`Command ${command} failed with ${cmd.error.code}`);
    process.exit(255);
  }
  const output = cmd.stdout.toString();
  console.log(output);
  if (cmd.status !== 0) {
    console.log(
      `Command ${command} failed with exit code ${cmd.status} signal ${cmd.signal}`
    );
    console.log(cmd.stderr.toString());
    process.exit(cmd.status);
  }
  return output;
}

function spawnAndIgnoreResult(command, args, options) {
  console.log(`--> ${command} ${args.join(' ')}`);
  spawnSync(command, args, options);
}

function appHtml(appName) {
  return `../browser/dist/${appName}.html`;
}

function setupCloud9() {}

function ensureTools() {
  spawnOrFail('aws', ['--version']);
  spawnOrFail('sam', ['--version']);
  spawnOrFail('npm', ['install', '-g', 'yarn']);
}

function main() {
  parseArgs();
  ensureTools();

  const rootDir = `${__dirname}/..`;

  process.chdir(rootDir);

  spawnOrFail('script/cloud9-resize.sh', []);

  process.chdir(`${rootDir}/serverless`);

  if (!fs.existsSync('build')) {
    fs.mkdirSync('build');
  }

  console.log(`Using region ${region}, bucket ${bucket}, stack ${stack}`);
  ensureBucket(bucket, false);
  ensureBucket(`${bucket}-releases`, true);

  const cssStyle = fs.readFileSync(`${rootDir}/resources/download.css`, 'utf8');
  fs.writeFileSync(
    'src/index.html',
    `
<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<title>Download ${appName}</title>
<style>
${cssStyle}
</style>
</head>
<body>
<article class="markdown-body">
<h3>Download ${appName}</h3>
<ul>
<li><a href="https://${bucket}-releases.s3.amazonaws.com/mac/${appName}.zip">${appName} for macOS (ZIP)</a></li>
<li><a href="https://${bucket}-releases.s3.amazonaws.com/win/${appName}.zip">${appName} for Windows (ZIP)</a></li>
</ul>
</article>
</body>
</html>
  `
  );

  const packageJson = JSON.parse(
    fs.readFileSync(`${rootDir}/package.json`, 'utf8')
  );
  packageJson.productName = appName;
  packageJson.build.productName = appName;
  packageJson.build.appId = `com.amazonaws.services.chime.sdk.classroom.demo.${appName}`;
  fs.writeFileSync(
    `${rootDir}/package.json`,
    JSON.stringify(packageJson, null, 2)
  );

  let mainDevTs = fs.readFileSync(`${rootDir}/app/main.dev.ts`, 'utf8');
  mainDevTs = mainDevTs.replace(/setTitle.*?[;]/g, `setTitle('${appName}');`);
  fs.writeFileSync(`${rootDir}/app/main.dev.ts`, mainDevTs);

  let appHtml = fs.readFileSync(`${rootDir}/app/app.html`, 'utf8');
  appHtml = appHtml.replace(
    /[<]title[>].*?[<][/]title[>]/g,
    `<title>${appName}</title>`
  );
  fs.writeFileSync(`${rootDir}/app/app.html`, appHtml);

  spawnOrFail('sam', [
    'package',
    '--s3-bucket',
    `${bucket}`,
    `--output-template-file`,
    `build/packaged.yaml`,
    '--region',
    `${region}`
  ]);
  console.log('Deploying serverless application');
  spawnOrFail('sam', [
    'deploy',
    '--template-file',
    './build/packaged.yaml',
    '--stack-name',
    `${stack}`,
    '--capabilities',
    'CAPABILITY_IAM',
    '--region',
    `${region}`
  ]);
  const endpoint = spawnOrFail('aws', [
    'cloudformation',
    'describe-stacks',
    '--stack-name',
    `${stack}`,
    '--query',
    'Stacks[0].Outputs[0].OutputValue',
    '--output',
    'text',
    '--region',
    `${region}`
  ]).trim();
  const messagingWssUrl = spawnOrFail('aws', [
    'cloudformation',
    'describe-stacks',
    '--stack-name',
    `${stack}`,
    '--query',
    'Stacks[0].Outputs[1].OutputValue',
    '--output',
    'text',
    '--region',
    `${region}`
  ]).trim();
  console.log(`Endpoint: ${endpoint}`);
  console.log(`Messaging WSS URL: ${messagingWssUrl}`);

  process.chdir(rootDir);

  fs.writeFileSync(
    'app/utils/getBaseUrl.ts',
    `
export default function getBaseUrl() {return '${endpoint}';}
`
  );

  fs.writeFileSync(
    'app/utils/getMessagingWssUrl.ts',
    `
export default function getMessagingWssUrl() {return '${messagingWssUrl}';}
`
  );

  spawnOrFail('yarn', []);

  console.log('... packaging (this may take a while) ...');
  spawnAndIgnoreResult('yarn', ['package-mac']);
  spawnAndIgnoreResult('yarn', ['package-win']);
  spawnOrFail('rm', ['-rf', `release/${appName}`]);
  spawnOrFail('mv', ['release/win-unpacked', `release/${appName}`]);
  process.chdir(`${rootDir}/release`);
  spawnOrFail('zip', ['-r', `${appName}-win.zip`, appName]);
  process.chdir(rootDir);

  console.log('... uploading Mac installer (this may take a while) ...');
  spawnOrFail('aws', [
    's3',
    'cp',
    '--acl',
    'public-read',
    `release/${appName}.zip`,
    `s3://${bucket}-releases/mac/${appName}.zip`
  ]);

  console.log('... uploading Windows installer (this may take a while) ...');
  spawnOrFail('aws', [
    's3',
    'cp',
    '--acl',
    'public-read',
    `release/${appName}-win.zip`,
    `s3://${bucket}-releases/win/${appName}.zip`
  ]);

  console.log('=============================================================');
  console.log('');
  console.log('Link to download application:');
  console.log(endpoint);
  console.log('');
  console.log('=============================================================');
}

main();
