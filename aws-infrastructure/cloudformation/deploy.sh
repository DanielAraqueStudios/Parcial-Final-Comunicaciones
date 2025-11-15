#!/bin/bash
# Script de despliegue AWS CloudFormation

set -e

PROJECT_NAME="agricultura-iot"
REGION="us-east-1"
STACK_NAME="${PROJECT_NAME}-stack"

echo "🚀 Desplegando infraestructura AWS IoT..."

# Validar template
echo "✓ Validando template CloudFormation..."
aws cloudformation validate-template \
  --template-body file://iot-infrastructure.yaml \
  --region $REGION

# Desplegar stack
echo "✓ Creando stack..."
aws cloudformation create-stack \
  --stack-name $STACK_NAME \
  --template-body file://iot-infrastructure.yaml \
  --parameters \
      ParameterKey=ProjectName,ParameterValue=$PROJECT_NAME \
      ParameterKey=Environment,ParameterValue=production \
  --capabilities CAPABILITY_IAM \
  --region $REGION

# Esperar creación
echo "⏳ Esperando creación de stack (esto puede tomar 15-20 minutos)..."
aws cloudformation wait stack-create-complete \
  --stack-name $STACK_NAME \
  --region $REGION

# Obtener outputs
echo "✓ Stack creado exitosamente!"
echo ""
echo "📊 Información del deployment:"
aws cloudformation describe-stacks \
  --stack-name $STACK_NAME \
  --region $REGION \
  --query 'Stacks[0].Outputs' \
  --output table

echo ""
echo "✅ Deployment completo!"
