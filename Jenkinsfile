pipeline {
    agent any

   tools {
        nodejs 'NodeJS 18.20.5'
    }

    environment {
        SCANNER_HOME = tool 'SonarQube Scanner 6.2.1.4610'

        NODEJS_HOME = tool name: 'NodeJS 18.20.5'
        PATH = "${NODEJS_HOME}/bin:${env.PATH}"

        NEXUS_VERSION = "nexus3"
        NEXUS_PROTOCOL = "http"
        NEXUS_CREDENTIALS_ID = 'NexusNPMCredentials'
        NEXUS_AUTH_CREDENTIALS_ID = 'NexusAuthCredentials'

        SONAR_HOST_URL = "http://172.31.208.1:9000"

        GIT_REPO_URL = 'https://github.com/buddhagubhaju5/Devops_Assignment4.git'
        GIT_CREDENTIALS = 'github-credentials' // GitHub credentials ID in Jenkins

    }
    
    stages {
        // Step 1: Checkout code from GitHub repository
        stage('Checkout') {
            steps {
                echo 'Cloning GitHub repository...'
                checkout([$class: 'GitSCM', branches: [[name: '*/master']], 
                    userRemoteConfigs: [[url: "${GIT_REPO_URL}", credentialsId: "${GIT_CREDENTIALS}"]]])
            }
        }

        // Step 2: Install project dependencies using npm
        stage('Install Dependencies') {
            steps {
                withCredentials([file(credentialsId: 'NexusNPMCredentials', variable: 'npmrc')]) {
                    echo 'Building...'
                    sh "npm install --userconfig $npmrc --registry http://172.17.0.1:8081/repository/devops-exercise4-proxy/ --loglevel verbose"
                }
            }
        }

        // Step 3: Build the application (e.g., using npm or webpack)
        stage('Build') {
            steps {
                withCredentials([file(credentialsId: 'NexusNPMCredentials', variable: 'npmrc')]) {
                    echo 'Building...'
                    sh "npm run build --userconfig $npmrc --registry http://172.31.208.1:8081/repository/npm-proxy/ --loglevel verbose"
                }
            }
        }

        // Step 4: Run SonarQube analysis on the code for quality checks
        stage('SonarQube Analysis') {
            steps {
                script {
                    withSonarQubeEnv() {
                        sh """${SCANNER_HOME}/bin/sonar-scanner \
                        -Dsonar.sources=. \
                        -Dsonar.host.url=http://172.31.208.1:9000 \
                        -Dsonar.token=squ_74ff488ed13a82159d6dde8f616c4d091f9341a3 \
                        -Dsonar.exclusions=**/node_modules/** \
                        -Dsonar.projectKey=DevOps-Exercise-4"""
                    }
                }
            }
        }
        
        // Step 2: Install project dependencies using npm
        stage('Install Dependencies') {
            steps {
                echo 'Installing dependencies...'
                sh  'npm install'
            }
        }
        
        // Step 3: Build the application (e.g., using npm or webpack)
        stage('Build') {
            steps {
                echo 'Building the application...'
                sh  'npm run build' // Replace with specific build command if different
            }
        }
        
        // Step 4: Run SonarQube analysis on the code for quality checks
        stage('SonarQube Analysis') {
            steps {
                script {
                    withSonarQubeEnv('SonarQube') {
                        sh """${SCANNER_HOME}/bin/sonar-scanner -Dsonar.host.url=http://localhost:9000/ \
                        -Dsonar.token=squ_74ff488ed13a82159d6dde8f616c4d091f9341a3 \
                        -Dsonar.projectName="devassign4" \
                        -Dsonar.exclusions=**/node_modules/** \
                        -Dsonar.projectKey=devassign4"""
                    }
                }
            }
        }
        
        // Step 5: Wait for SonarQube quality gate results; aborts pipeline if gate fails
        stage('Quality Gate') {
            steps {
                echo 'Waiting for SonarQube quality gate results...'
                timeout(time: 5, unit: 'MINUTES') {
                    waitForQualityGate abortPipeline: true
                }
            }
        }
        
        // Step 6: Archive the built artifact in Jenkins for easy access
        stage('Archive Artifact') {
            steps {
                echo 'Archiving the built artifact...'
                archiveArtifacts artifacts: 'path/to/build-directory/**/*', allowEmptyArchive: true
            }
        }
        
        // Step 7: Package the application as a tar.gz file for deployment
        stage('Package') {
            steps {
                echo 'Packaging the application...'
                sh 'tar -czf myapp-${APP_VERSION}.tar.gz -C path/to/build-directory .' // Adjust the path as needed
            }
        }
        
        // Step 8: Deploy the packaged artifact to Nexus repository
        stage('Deploy to Nexus') {
            steps {
                echo 'Deploying to Nexus...'
                nexusArtifactUploader artifacts: [[artifactId: 'myapp', 
                                                  classifier: '', 
                                                  file: "myapp-${APP_VERSION}.tar.gz", 
                                                  type: 'gz']], 
                                     credentialsId: NEXUS_CREDENTIALS, 
                                     groupId: 'com.example', 
                                     nexusUrl: "${NEXUS_URL}", 
                                     nexusVersion: 'nexus3', 
                                     protocol: 'http', 
                                     repository: "${NEXUS_REPOSITORY}", 
                                     version: "${APP_VERSION}"
            }
        }
    }
    
    post {
        // Cleanup step to delete the packaged artifact from Jenkins workspace
        always {
            echo 'Cleaning up...'
            sh 'rm -f myapp-*.tar.gz'
        }
        success {
            echo 'Pipeline succeeded!'
        }
        failure {
            echo 'Pipeline failed.'
        }
    }
}
