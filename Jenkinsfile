pipeline {
    agent any
    
    tools {
        nodejs('NodeJS')
    }

    environment {
        NODEJS_HOME = tool name: 'NodeJS' // Assumes NodeJS is configured in Jenkins tools
        PATH = "${NODEJS_HOME}/bin:${env.PATH}"
        GIT_REPO_URL = 'https://github.com/buddhagubhaju5/Devops_Assignment4.git'
        NEXUS_URL = 'http://localhost:8081'
        NEXUS_REPOSITORY = 'devops_assignment4'
        NEXUS_CREDENTIALS = 'nexus_credentials' // Nexus credentials ID in Jenkins
        SONARQUBE_TOKEN = 'Sonarqube-Token' // SonarQube token ID in Jenkins
        GIT_CREDENTIALS = 'github-credentials' // GitHub credentials ID in Jenkins
        APP_VERSION = '1.0.0' // Version of the application; can be set dynamically if needed
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
                echo 'Running SonarQube analysis...'
                withCredentials([string(credentialsId: SONARQUBE_TOKEN, variable: 'SONAR_TOKEN')]) {
                    sh """
                    sonar-scanner \
                        -Dsonar.projectKey=Devops_Assignment4 \
                        -Dsonar.sources=. \
                        -Dsonar.host.url=http://localhost:9000 \
                        -Dsonar.login=$SONAR_TOKEN
                    """
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
