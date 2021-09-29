#!/bin/bash
for (( c=1; c<=30; c++ ))
do
  aws cognito-idp admin-create-user --user-pool-id us-west-2_ZGlUWMaRf --username franco+$c@icanotes.com
  aws cognito-idp admin-set-user-password --user-pool-id us-west-2_ZGlUWMaRf --username franco+$c@icanotes.com --password ?Aws_Amplify21! --permanent
done