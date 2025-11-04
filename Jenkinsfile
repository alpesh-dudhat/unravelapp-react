pipeline {
  agent any

  environment {
    NETLIFY_AUTH_TOKEN = credentials('nfp_vNsYBYBLLyRXtohMkt7j4e9hF2zFZcxAc308')
    NETLIFY_SITE_ID = '8359c03e-7f05-4bfd-ba33-8906b3b613d5'
  }

  stages {
    stage('Checkout') {
      steps {
        git 'https://github.com/your/repo.git'
      }
    }
    stage('Install') {
      steps {
        sh 'npm install'
      }
    }
    stage('Build') {
      steps {
        sh 'npm run build'
      }
    }
    stage('Deploy to Netlify') {
      steps {
        sh '''
        npx netlify deploy --dir=build --site=$NETLIFY_SITE_ID --auth=$NETLIFY_AUTH_TOKEN --prod
        '''
      }
    }
  }
}
