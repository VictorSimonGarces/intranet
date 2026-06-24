pipeline {
    agent any

    tools {
        nodejs 'node-20'
    }

    environment {
        CI = 'true'
        PLAYWRIGHT_BROWSERS_PATH = "C:\\Users\\vsimongarces\\AppData\\Local\\ms-playwright"
    }

    stages {

        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Install Dependencies') {
            steps {
                bat 'npm ci'
                bat 'npx playwright install chromium'
            }
        }

        stage('Tests en Paralelo') {
            parallel {

                stage('Shard 1/3') {
                    steps {
                        bat 'npx playwright test --shard=1/3'
                    }
                }

                stage('Shard 2/3') {
                    steps {
                        bat 'npx playwright test --shard=2/3'
                    }
                }

                stage('Shard 3/3') {
                    steps {
                        bat 'npx playwright test --shard=3/3'
                    }
                }

            }
        }

    }

    post {
        always {
            junit allowEmptyResults: true, testResults: 'test-results/*.xml'
        }
        success {
            echo 'Todos los tests han pasado'
        }
        failure {
            echo 'Hay tests fallidos - revisar reporte'
        }
    }
}