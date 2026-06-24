pipeline {
    agent any

    tools {
        nodejs 'Node-20'
    }

    environment {
        CI = 'true'
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
                bat 'npx playwright install --with-deps'
            }
        }

        stage('Tests en Paralelo') {
            parallel {

                stage('Shard 1/3') {
                    steps {
                        bat 'npx playwright test --shard=1/3 --reporter=junit,html'
                    }
                }

                stage('Shard 2/3') {
                    steps {
                        bat 'npx playwright test --shard=2/3 --reporter=junit,html'
                    }
                }

                stage('Shard 3/3') {
                    steps {
                        bat 'npx playwright test --shard=3/3 --reporter=junit,html'
                    }
                }

            }
        }

    }

    post {
        always {
            junit 'test-results/*.xml'

            publishHTML([
                allowMissing: false,
                alwaysLinkToLastBuild: true,
                keepAll: true,
                reportDir: 'playwright-report',
                reportFiles: 'index.html',
                reportName: 'Playwright Report'
            ])
        }

        success {
            echo 'Todos los tests han pasado'
        }

        failure {
            echo 'Hay tests fallidos - revisar reporte'
        }
    }
}