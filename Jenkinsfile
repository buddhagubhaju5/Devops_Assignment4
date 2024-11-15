pipeline {
    agent any

   tools {
        nodejs 'nodejs'
    }

    environment {
        SCANNER_HOME = tool 'SonarQube'

        NODEJS_HOME = tool name: 'nodejs'
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
                    sh 'npm install'
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
    
        // Step 5: Wait for SonarQube quality gate results; aborts pipeline if gate fails
        stage('Quality Gate') {
            steps {
                script {
                    sh '''#!/bin/bash
                    curl http://172.17.0.1:9000/api/server/version
                    '''


                    sleep(time: 30, unit: 'SECONDS')
                    def qualityGate = waitForQualityGate()
                    if (qualityGate.status == 'IN_PROGRESS') {
                        sleep(time: 30, unit: 'SECONDS')
                        error "Quality Gate is in progress. Trying again..."
                    }

                    if (qualityGate.status != 'OK') {
                        error "Quality Gate failed: ${qualityGate.status}"
                    }
                    else {
                        echo "Quality Gate passed: ${qualityGate.status}"
                    }
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
        
        // Step 7: deploy to Nexus
        stage('Publish to Nexus') {
            steps {
                withCredentials([file(credentialsId: 'NexusNPMCredentials', variable: 'npmrc')]) {
                    echo 'Publishing to Nexus...'
                    sh "npm publish --userconfig ${npmrc} --loglevel verbose"
                }
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
