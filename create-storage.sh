#!/bin/bash

BLOB_ACCOUNT=$1
LOCATION=$2
RES_GROUP=$3

# Create Storage Account
az storage account create \
    -n $BLOB_ACCOUNT \
    -l $LOCATION  \
    -g $RES_GROUP \
    --sku Standard_LRS  \
    --kind blobstorage  \
    --access-tier hot

# create Blob Storage 
BLOB_KEY=$(az storage account keys list -g $RES_GROUP -n $BLOB_ACCOUNT --query '[0].value' --output tsv)

az storage container create \
    -n images \
    --account-name $BLOB_ACCOUNT \
    --account-key $BLOB_KEY \
    --public-access container